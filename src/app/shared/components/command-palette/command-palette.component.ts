import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { TranslatePipe } from '@ngx-translate/core';

import { SearchResult } from '../../models/search';
import { SearchIndexService } from '../../services/search';
import { CommandPaletteItemComponent } from './command-palette-item/command-palette-item.component';

@Component({
  standalone: true,
  selector: 'os-command-palette',
  imports: [
    FormsModule,
    IconDirective,
    TranslatePipe,
    CommandPaletteItemComponent,
  ],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-command-palette',
    '[class.os-command-palette--open]': 'searchService.isOpen()',
  },
})
export class CommandPaletteComponent {
  protected readonly searchService = inject(SearchIndexService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  /** Reference to search input */
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Reference to content container for scroll management */
  readonly contentContainer = viewChild<ElementRef<HTMLElement>>('contentContainer');

  /** Currently selected index */
  readonly selectedIndex = signal(0);

  /** Flat list of all results for keyboard navigation */
  readonly flatResults = computed(() => this.searchService.flatResults());

  /** Selected item based on index */
  readonly selectedItem = computed(() => {
    const results = this.flatResults();
    const index = this.selectedIndex();
    return results[index] ?? null;
  });

  /** Grouped results for display */
  readonly groupedResults = computed(() => this.searchService.groupedResults());

  /** Check if has any results */
  readonly hasResults = computed(() => this.searchService.hasResults());

  /** Check if is loading */
  readonly isLoading = computed(() => this.searchService.isLoading());

  /** Current query */
  readonly query = computed(() => this.searchService.query());

  /** Recent items */
  readonly recentItems = computed(() => this.searchService.recentItems());

  /** Show recent items when no query */
  readonly showRecent = computed(() => !this.query() && this.recentItems().length > 0);

  constructor() {
    // Focus input when palette opens
    effect(() => {
      if (this.searchService.isOpen()) {
        afterNextRender(() => {
          this.searchInput()?.nativeElement.focus();
        }, { injector: this.injector });
      }
    });

    // Reset selection when results change
    effect(() => {
      this.flatResults();
      this.selectedIndex.set(0);
    });

    // Scroll selected item into view
    effect(() => {
      const index = this.selectedIndex();
      afterNextRender(() => {
        this.scrollToSelected(index);
      }, { injector: this.injector });
    });
  }

  /** Scroll to make the selected item visible */
  private scrollToSelected(index: number): void {
    const container = this.elementRef.nativeElement.querySelector('.os-command-palette__content');
    if (!container) return;

    const items = container.querySelectorAll('os-command-palette-item');
    const selectedItem = items[index] as HTMLElement;

    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.searchService.isOpen()) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveSelection(1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.moveSelection(-1);
        break;

      case 'Enter':
        event.preventDefault();
        this.navigateToSelected();
        break;

      case 'Escape':
        event.preventDefault();
        this.searchService.closePalette();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.searchService.isOpen()) {
      return;
    }

    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.searchService.closePalette();
    }
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchService.search(input.value);
  }

  protected onItemSelect(item: SearchResult): void {
    this.searchService.navigateTo(item);
  }

  protected onBackdropClick(): void {
    this.searchService.closePalette();
  }

  protected isItemSelected(item: SearchResult): boolean {
    return this.selectedItem()?.id === item.id;
  }

  protected trackByItemId(_index: number, item: SearchResult): string {
    return item.id;
  }

  private moveSelection(delta: number): void {
    const results = this.flatResults();
    if (results.length === 0) {
      return;
    }

    const currentIndex = this.selectedIndex();
    let newIndex = currentIndex + delta;

    // Wrap around
    if (newIndex < 0) {
      newIndex = results.length - 1;
    } else if (newIndex >= results.length) {
      newIndex = 0;
    }

    this.selectedIndex.set(newIndex);
  }

  private navigateToSelected(): void {
    const selected = this.selectedItem();
    if (selected) {
      this.searchService.navigateTo(selected);
    }
  }
}
