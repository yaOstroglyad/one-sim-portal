/**
 * PageHeaderComponent
 *
 * Sticky page header slot component that renders dynamic content in three zones.
 * Adapts to mobile viewports with reduced padding and touch-friendly targets.
 *
 * @example
 * ```html
 * <os-page-header [zones]="layoutService.header()" />
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
  selector: 'os-page-header',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <div class="os-page-header" [class.os-page-header--rtl]="languageService.isRtl()">
      <div class="os-page-header__start">
        @for (item of zones().start ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>

      @if (zones().center?.length) {
        <div class="os-page-header__center">
          @for (item of zones().center; track item.component) {
            <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
          }
        </div>
      }

      <div class="os-page-header__end">
        @for (item of zones().end ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>
    </div>
  `,
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  protected readonly languageService = inject(LanguageService);

  readonly zones = input<SlotZones>({});
}
