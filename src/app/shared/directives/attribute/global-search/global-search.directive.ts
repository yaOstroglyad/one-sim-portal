import { Directive, HostListener, inject } from '@angular/core';
import { SearchIndexService } from '../../../services/search';

/**
 * Global Search Directive
 *
 * Listens for Cmd+K (Mac) or Ctrl+K (Windows/Linux) keyboard shortcut
 * and opens the command palette.
 *
 * Apply to the root component or document body.
 *
 * @example
 * ```html
 * <div osGlobalSearch>
 *   <!-- app content -->
 * </div>
 * ```
 */
@Directive({
  standalone: true,
  selector: '[osGlobalSearch]',
})
export class GlobalSearchDirective {
  private searchService = inject(SearchIndexService);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    const isCmdOrCtrl = event.metaKey || event.ctrlKey;
    const isK = event.key === 'k' || event.key === 'K';

    if (isCmdOrCtrl && isK) {
      event.preventDefault();
      event.stopPropagation();

      if (this.searchService.isOpen()) {
        this.searchService.closePalette();
      } else {
        this.searchService.openPalette();
      }
    }
  }
}
