import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { SearchResult, GroupedSearchResults } from '../../../models/search';
import { CommandPaletteItemComponent } from '../command-palette-item/command-palette-item.component';

@Component({
  standalone: true,
  selector: 'os-search-dropdown',
  imports: [
    TranslatePipe,
    CommandPaletteItemComponent,
  ],
  templateUrl: './search-dropdown.component.html',
  styleUrl: './search-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-search-dropdown',
    '[class.os-search-dropdown--open]': 'isOpen()',
  },
})
export class SearchDropdownComponent {
  /** Grouped search results */
  readonly results = input.required<GroupedSearchResults>();

  /** Loading state */
  readonly isLoading = input<boolean>(false);

  /** Current search query */
  readonly query = input<string>('');

  /** Whether dropdown is open */
  readonly isOpen = input<boolean>(false);

  /** Currently selected index (for keyboard navigation) */
  readonly selectedIndex = input<number>(0);

  /** Emitted when an item is selected */
  readonly selectItem = output<SearchResult>();

  /** Emitted when dropdown should close */
  readonly close = output<void>();

  /** Flat list of all results for keyboard navigation */
  readonly flatResults = computed(() => {
    const grouped = this.results();
    return [...grouped.navigation, ...grouped.actions, ...grouped.backend];
  });

  /** Selected item based on index */
  readonly selectedItem = computed(() => {
    const results = this.flatResults();
    const index = this.selectedIndex();
    return results[index] ?? null;
  });

  /** Check if has any results */
  readonly hasResults = computed(() => this.flatResults().length > 0);

  protected onItemSelect(item: SearchResult): void {
    this.selectItem.emit(item);
  }

  protected isItemSelected(item: SearchResult): boolean {
    return this.selectedItem()?.id === item.id;
  }

  protected trackByItemId(_index: number, item: SearchResult): string {
    return item.id;
  }
}
