import { Injectable, signal, linkedSignal } from '@angular/core';

import { TocSection } from '../models';

/**
 * Shared state service for documentation module
 * Manages TOC sections, active section, and scroll spy state
 *
 * Uses linkedSignal for activeSection - automatically resets to first section
 * when tocSections changes (e.g., navigating to different document)
 */
@Injectable()
export class DocsStateService {
  // TOC sections from current document
  private readonly _tocSections = signal<TocSection[]>([]);
  readonly tocSections = this._tocSections.asReadonly();

  // Active section - linkedSignal that resets when tocSections changes
  readonly activeSection = linkedSignal<TocSection[], string | null>({
    source: this._tocSections,
    computation: (sections) => sections[0]?.id ?? null
  });

  // Scroll spy pause state
  private readonly _isScrolling = signal(false);
  readonly isScrolling = this._isScrolling.asReadonly();

  private scrollingTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Set TOC sections for current document
   */
  setTocSections(sections: TocSection[]): void {
    this._tocSections.set(sections);
  }

  /**
   * Set active section (from scroll spy or TOC click)
   */
  setActiveSection(sectionId: string | null): void {
    this.activeSection.set(sectionId);
  }

  /**
   * Pause scroll spy updates during programmatic scroll
   * Prevents flickering when clicking TOC items
   */
  pauseScrollSpy(duration = 800): void {
    this._isScrolling.set(true);

    if (this.scrollingTimeout) {
      clearTimeout(this.scrollingTimeout);
    }

    this.scrollingTimeout = setTimeout(() => {
      this._isScrolling.set(false);
    }, duration);
  }

  /**
   * Check if scroll spy should update (not paused)
   */
  shouldUpdateScrollSpy(): boolean {
    return !this._isScrolling();
  }
}
