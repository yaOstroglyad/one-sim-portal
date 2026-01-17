import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  OnDestroy,
  ElementRef,
  DestroyRef,
  effect,
  afterNextRender,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, filter, skip } from 'rxjs/operators';

import { DocsDataService } from '../../services';
import { DocsStateService } from '../../services';
import { TocSection } from '../../models';
import { parseMarkdownToSegments, ContentSegment, generateHeadingId } from '../../utils/markdown.util';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { DiagramBlockComponent } from '../diagram-block/diagram-block.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

/**
 * Rendered segment for template
 */
type RenderedSegment =
  | { type: 'html'; safeHtml: SafeHtml }
  | { type: 'code'; code: string; language: string }
  | { type: 'diagram'; code: string };

/**
 * Documentation content component
 * Renders markdown content for a specific category
 * Extracts TOC sections and implements scroll spy
 */
@Component({
  selector: 'os-docs-content',
  standalone: true,
  imports: [CodeBlockComponent, DiagramBlockComponent, EmptyStateComponent],
  templateUrl: './docs-content.component.html',
  styleUrl: './docs-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsContentComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly docsDataService = inject(DocsDataService);
  private readonly docsStateService = inject(DocsStateService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private intersectionObserver: IntersectionObserver | null = null;
  private scrollHandler: (() => void) | null = null;
  private scrollContainer: Element | null = null;

  // Route param as signal
  private readonly documentId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('categoryId') ?? 'public-api'))
  );

  // Current document from service
  readonly document = computed(() => {
    const id = this.documentId();
    if (!id) return null;
    return this.docsDataService.getDocumentById(id) ?? null;
  });

  // Check if document has empty content
  readonly isEmptyContent = computed(() => {
    const doc = this.document();
    if (!doc) return false;
    return !doc.content || doc.content.trim().length === 0;
  });

  // Rendered content segments
  readonly renderedSegments = computed((): RenderedSegment[] => {
    const doc = this.document();
    if (!doc) return [];
    return this.parseContent(doc.content);
  });

  // TOC sections extracted from markdown headings
  readonly tocSections = computed((): TocSection[] => {
    const doc = this.document();
    if (!doc) return [];
    return this.extractTocSections(doc.content);
  });

  constructor() {
    // Clear fragment on page refresh - always start at document top
    const initialFragment = this.route.snapshot.fragment;
    if (initialFragment) {
      afterNextRender(() => {
        this.router.navigate([], {
          relativeTo: this.route,
          fragment: undefined,
          replaceUrl: true
        });
      });
    }

    // Sync TOC sections to state service when they change
    effect(() => {
      const sections = this.tocSections();
      if (sections.length > 0) {
        this.docsStateService.setTocSections(sections);
      }
    });

    // Setup scroll spy after first render
    afterNextRender(() => {
      this.setupScrollSpy();
    });

    // Listen to fragment changes for deep linking from search
    // Skip initial emission - only respond to in-app navigation
    this.route.fragment.pipe(
      skip(1), // Skip initial value (handled above or not present)
      filter((fragment): fragment is string => !!fragment),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(fragment => {
      this.scrollToSectionWithPause(fragment);
    });
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    if (this.scrollContainer && this.scrollHandler) {
      this.scrollContainer.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /**
   * Scroll to section with scroll spy pause (used by fragment navigation)
   */
  private scrollToSectionWithPause(sectionId: string): void {
    this.docsStateService.pauseScrollSpy(800);
    this.scrollToSection(sectionId);
    this.docsStateService.setActiveSection(sectionId);
  }

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Parse markdown content to rendered segments
   */
  private parseContent(content: string): RenderedSegment[] {
    const segments = parseMarkdownToSegments(content);

    return segments.map((segment: ContentSegment): RenderedSegment => {
      if (segment.type === 'code') {
        return {
          type: 'code',
          code: segment.code,
          language: segment.language
        };
      }
      if (segment.type === 'diagram') {
        return {
          type: 'diagram',
          code: segment.code
        };
      }
      return {
        type: 'html',
        safeHtml: this.sanitizer.bypassSecurityTrustHtml(segment.content)
      };
    });
  }

  /**
   * Extract TOC sections from markdown headings
   */
  private extractTocSections(content: string): TocSection[] {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const sections: TocSection[] = [];
    const idCounts = new Map<string, number>();
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const baseId = generateHeadingId(title);

      // Handle duplicate IDs by appending a counter
      const count = idCounts.get(baseId) || 0;
      const id = count > 0 ? `${baseId}-${count}` : baseId;
      idCounts.set(baseId, count + 1);

      sections.push({ id, title, level });
    }

    return sections;
  }

  /**
   * Setup Intersection Observer for scroll spy
   */
  private setupScrollSpy(): void {
    this.intersectionObserver?.disconnect();

    const scrollContainer = document.querySelector('.layout__main');
    if (!scrollContainer) return;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      if (!this.docsStateService.shouldUpdateScrollSpy()) return;

      for (const entry of entries) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId && this.docsStateService.activeSection() !== sectionId) {
            this.docsStateService.setActiveSection(sectionId);
          }
          break;
        }
      }
    }, options);

    const container = this.elementRef.nativeElement as HTMLElement;
    const headings = container.querySelectorAll('h1[id], h2[id], h3[id]');
    headings.forEach(heading => this.intersectionObserver?.observe(heading));

    this.scrollContainer = scrollContainer;
    this.scrollHandler = this.handleScroll.bind(this);
    scrollContainer.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /**
   * Handle scroll event for bottom-of-page detection
   */
  private handleScroll(): void {
    if (!this.docsStateService.shouldUpdateScrollSpy()) return;
    if (!this.scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isAtBottom) {
      const container = this.elementRef.nativeElement as HTMLElement;
      const headings = container.querySelectorAll('h1[id], h2[id], h3[id]');
      const lastHeading = headings[headings.length - 1];

      if (lastHeading?.id && this.docsStateService.activeSection() !== lastHeading.id) {
        this.docsStateService.setActiveSection(lastHeading.id);
      }
    }
  }
}
