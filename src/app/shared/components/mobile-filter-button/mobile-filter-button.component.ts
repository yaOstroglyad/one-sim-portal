/**
 * MobileFilterButtonComponent
 *
 * Button that opens the filter drawer on mobile.
 * Displays badge with active filter count.
 *
 * @example
 * ```html
 * <os-mobile-filter-button />
 * ```
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective } from '@coreui/icons-angular';
import { PageLayoutService } from '../../services/ui';

@Component({
  selector: 'os-mobile-filter-button',
  standalone: true,
  imports: [TranslateModule, IconDirective],
  template: `
    <button
      type="button"
      class="os-mobile-filter-btn"
      (click)="openDrawer()">
      <svg cIcon name="cilFilter" width="18" height="18"></svg>
      <span class="os-mobile-filter-btn__label">{{ 'common.filters' | translate }}</span>
      @if (filterCount() > 0) {
        <span class="os-mobile-filter-btn__badge">{{ filterCount() }}</span>
      }
    </button>
  `,
  styleUrl: './mobile-filter-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterButtonComponent {
  private readonly layout = inject(PageLayoutService);

  readonly filterCount = computed(() => this.layout.activeFilterCount());

  openDrawer(): void {
    this.layout.openFilterDrawer();
  }
}
