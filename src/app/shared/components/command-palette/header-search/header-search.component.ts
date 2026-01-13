import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationStart } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { SearchResult } from '@models';
import { SearchIndexService } from '@shared/services/search';
import { SearchDropdownComponent } from '../search-dropdown';

@Component({
  standalone: true,
  selector: 'os-header-search',
  imports: [
    FormsModule,
    IconDirective,
    TranslatePipe,
    SearchDropdownComponent,
  ],
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-header-search',
  },
})
export class HeaderSearchComponent {
  protected readonly searchService = inject(SearchIndexService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** Reference to search input */
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Whether input is focused */
  readonly isFocused = signal(false);

  /** Whether dropdown is open */
  readonly isDropdownOpen = signal(false);

  /** Currently selected index for keyboard navigation */
  readonly selectedIndex = signal(0);

  /** Current query value */
  readonly query = computed(() => this.searchService.query());

  /** Grouped results */
  readonly groupedResults = computed(() => this.searchService.groupedResults());

  /** Flat results for navigation */
  readonly flatResults = computed(() => this.searchService.flatResults());

  /** Is loading */
  readonly isLoading = computed(() => this.searchService.isLoading());

  /** Has results */
  readonly hasResults = computed(() => this.searchService.hasResults());

  /** Should show dropdown (has query and focused) */
  readonly shouldShowDropdown = computed(() => {
    return this.isFocused() && this.query().length > 0;
  });

  constructor() {
    // Reset selection when results change
    effect(() => {
      this.flatResults();
      this.selectedIndex.set(0);
    });

    // Sync dropdown open state with focus and query
    effect(() => {
      this.isDropdownOpen.set(this.shouldShowDropdown());
    });

    // Scroll selected item into view
    effect(() => {
      const index = this.selectedIndex();
      afterNextRender(() => {
        this.scrollToSelected(index);
      }, { injector: this.injector });
    });

    // Close dropdown on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.isDropdownOpen()) {
        this.closeDropdown();
      }
    });
  }

  /** Scroll to make the selected item visible in dropdown */
  private scrollToSelected(index: number): void {
    const dropdown = this.elementRef.nativeElement.querySelector('os-search-dropdown');
    if (!dropdown) return;

    const items = dropdown.querySelectorAll('os-command-palette-item');
    const selectedItem = items[index] as HTMLElement;

    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isDropdownOpen()) {
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
        this.closeDropdown();
        this.searchInput()?.nativeElement.blur();
        break;

      case 'Tab':
        // Close dropdown on Tab (allow default behavior)
        this.closeDropdown();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen()) {
      return;
    }

    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.closeDropdown();
    }
  }

  protected onInputFocus(): void {
    this.isFocused.set(true);
  }

  protected onInputBlur(): void {
    // Note: Click outside is handled by onDocumentClick
    // Only close if not clicking inside the component
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Ensure focused state is true when typing (handles edge case after navigation)
    if (!this.isFocused()) {
      this.isFocused.set(true);
    }
    this.searchService.search(input.value);
  }

  protected onClearClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchService.search('');
    this.searchInput()?.nativeElement.focus();
  }

  protected onItemSelect(item: SearchResult): void {
    this.searchService.navigateTo(item);
    this.closeDropdown();
  }

  protected onDropdownClose(): void {
    this.closeDropdown();
  }

  /** Mobile: open overlay instead of dropdown */
  protected onMobileSearchClick(): void {
    this.searchService.openPalette();
  }

  private closeDropdown(): void {
    this.isFocused.set(false);
    this.isDropdownOpen.set(false);
    this.searchService.search('');
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
    const results = this.flatResults();
    const index = this.selectedIndex();
    const selected = results[index];

    if (selected) {
      this.searchService.navigateTo(selected);
      this.closeDropdown();
    }
  }
}
