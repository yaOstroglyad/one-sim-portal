import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import { NavItem, BrandConfig } from '../../../containers/default-layout/models';
import { LayoutService } from '../../../containers/default-layout/services';
import { SidebarComponent } from '../../../containers/default-layout/components';
import {
  LanguageService,
  CommandPaletteComponent,
  GlobalSearchDirective,
  PublicHeaderComponent,
  ActiveThemeService,
  SearchIndexService,
} from '@shared';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DocsDataService } from '../services';
import { DocsSearchProvider } from '../services';
import { DocsStateService } from '../services';
import { DocsTocComponent } from '../components/docs-toc/docs-toc.component';

// Default brand config
const DEFAULT_LOGO_URL = 'assets/img/brand/1esim-logo.png';
const DEFAULT_FAVICON_URL = 'assets/img/brand/1esim-logo-small.png';


@Component({
  standalone: true,
  selector: 'os-docs-layout',
  imports: [
    RouterModule,
    SidebarComponent,
    PublicHeaderComponent,
    CommandPaletteComponent,
    GlobalSearchDirective,
    LoaderComponent,
    EmptyStateComponent,
    DocsTocComponent,
  ],
  providers: [
    DocsDataService,
    DocsSearchProvider,
    DocsStateService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-layout.component.html',
  styleUrl: './docs-layout.component.scss'
})
export class DocsLayoutComponent implements OnInit, OnDestroy {
  private readonly activeThemeService = inject(ActiveThemeService);
  private readonly searchIndexService = inject(SearchIndexService);
  private readonly docsSearchProvider = inject(DocsSearchProvider);
  readonly layoutService = inject(LayoutService);
  readonly languageService = inject(LanguageService);
  readonly docsDataService = inject(DocsDataService);
  readonly docsStateService = inject(DocsStateService);

  // Convert observables to signals
  private readonly layoutConfig$ = toSignal(this.layoutService.getLayoutConfig(), {
    initialValue: { sidebarCollapsed: false, darkTheme: false, rtlDirection: false }
  });

  private readonly themeConfig$ = toSignal(this.activeThemeService.getConfig$());

  // Computed values from signals
  readonly layoutConfig = this.layoutConfig$;

  readonly brandConfig = computed((): BrandConfig => {
    const config = this.themeConfig$();
    return {
      full: {
        src: config?.logoUrl || DEFAULT_LOGO_URL,
        height: config?.height || 47,
        alt: 'API Docs'
      },
      narrow: {
        src: config?.faviconUrl || DEFAULT_FAVICON_URL,
        width: 35,
        alt: 'API Docs'
      }
    };
  });

  // Generate navigation from documentation documents (left sidebar)
  readonly navItems = computed((): NavItem[] => {
    const documents = this.docsDataService.documents();
    if (documents.length === 0) return [];

    return documents.map(doc => ({
      name: doc.title,
      url: `/docs/${doc.id}`,
      iconComponent: { name: 'cil-file' },
    }));
  });

  // Mobile sidebar state
  readonly isMobileSidebarOpen = this.layoutService.isMobileSidebarOpen;

  // Loading and error state
  readonly isLoading = this.docsDataService.isLoading;
  readonly error = this.docsDataService.error;

  // TOC state from shared service (right sidebar)
  readonly tocSections = this.docsStateService.tocSections;
  readonly activeSection = this.docsStateService.activeSection;

  ngOnInit(): void {
    // Disable default providers on docs (no auth, not relevant)
    this.searchIndexService.disableProvider('backend');
    this.searchIndexService.disableProvider('client');

    // Register docs search provider for global search
    this.searchIndexService.registerProvider(this.docsSearchProvider);

    // Load documentation
    this.loadDocumentation();
  }

  private loadDocumentation(): void {
    this.docsDataService.getDocumentation().subscribe();
  }

  closeMobileSidebar(): void {
    this.layoutService.closeMobileSidebar();
  }

  /**
   * Handle TOC section click - scroll to section
   */
  onTocSectionClick(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Immediately set active section (don't wait for scroll spy)
    this.docsStateService.setActiveSection(sectionId);

    // Pause scroll spy during programmatic scroll to prevent flickering
    this.docsStateService.pauseScrollSpy(800);

    // Find the scroll container (.layout__main)
    const scrollContainer = document.querySelector('.layout__main');
    if (!scrollContainer) {
      // Fallback to default scrollIntoView
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Calculate scroll position with offset for header
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const containerPosition = scrollContainer.getBoundingClientRect().top;
    const currentScroll = scrollContainer.scrollTop;

    const targetScroll = currentScroll + (elementPosition - containerPosition) - headerOffset;

    scrollContainer.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }

  ngOnDestroy(): void {
    // Unregister docs search provider
    this.searchIndexService.unregisterProvider(this.docsSearchProvider.name);

    // Re-enable default providers
    this.searchIndexService.enableProvider('backend');
    this.searchIndexService.enableProvider('client');
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (this.isMobileSidebarOpen()) {
      event.preventDefault();
      this.closeMobileSidebar();
    }
  }
}
