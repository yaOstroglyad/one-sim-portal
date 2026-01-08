import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { TranslatePipe } from '@ngx-translate/core';

import { SearchIndexService } from '../../../services/search';

/**
 * Search Trigger Component
 *
 * A button that opens the command palette when clicked.
 * Can be placed anywhere in the application (header, sidebar, etc.)
 *
 * @example
 * ```html
 * <os-search-trigger />
 * ```
 */
@Component({
  standalone: true,
  selector: 'os-search-trigger',
  imports: [IconDirective, TranslatePipe],
  templateUrl: './search-trigger.component.html',
  styleUrl: './search-trigger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-search-trigger',
  },
})
export class SearchTriggerComponent {
  private searchService = inject(SearchIndexService);

  protected openPalette(): void {
    this.searchService.openPalette();
  }
}
