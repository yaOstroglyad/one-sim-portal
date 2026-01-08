/**
 * PageSubHeaderComponent
 *
 * Sticky page subheader slot component for filters and controls.
 * On desktop: shows full filter controls.
 * On mobile: shows filter button that opens drawer.
 *
 * @example
 * ```html
 * <os-page-sub-header [zones]="layoutService.subheader()" />
 * ```
 */

import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { SlotZones } from '@shared/models';
import { LanguageService } from '../../services/ui';

@Component({
  selector: 'os-page-sub-header',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <div class="os-page-sub-header" [class.os-page-sub-header--rtl]="languageService.isRtl()">
      <!-- Desktop: full filters / Mobile: filter button -->
      <div class="os-page-sub-header__start">
        <!-- Desktop filters -->
        <div class="os-page-sub-header__filters">
          @for (item of zones().start ?? []; track item.component) {
            <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
          }
        </div>
        <!-- Mobile filter button -->
        <div class="os-page-sub-header__mobile-trigger">
          <ng-content select="[mobileFilter]"></ng-content>
        </div>
      </div>

      <!-- End zone (shared for both) -->
      <div class="os-page-sub-header__end">
        @for (item of zones().end ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>
    </div>
  `,
  styleUrl: './page-sub-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSubHeaderComponent {
  protected readonly languageService = inject(LanguageService);

  readonly zones = input<SlotZones>({});
}
