/**
 * FilterDrawerComponent
 *
 * Mobile filter drawer that slides in from the right.
 * Renders filter components from subheader.start and provides
 * Apply/Clear actions.
 *
 * @example
 * ```html
 * <!-- In layout template -->
 * <os-filter-drawer />
 * ```
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective } from '@coreui/icons-angular';
import { ButtonDirective } from '@coreui/angular';
import { PageLayoutService } from '../../services/ui';

@Component({
  selector: 'os-filter-drawer',
  standalone: true,
  imports: [
    NgComponentOutlet,
    TranslateModule,
    IconDirective,
    ButtonDirective,
  ],
  template: `
    @if (isOpen()) {
      <div class="os-filter-drawer">
        <div
          class="os-filter-drawer__backdrop"
          (click)="close()"
          role="presentation">
        </div>

        <div
          class="os-filter-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-drawer-title">

          <header class="os-filter-drawer__header">
            <h3 id="filter-drawer-title">{{ 'common.filters' | translate }}</h3>
            <button
              type="button"
              class="os-filter-drawer__close"
              (click)="close()"
              [attr.aria-label]="'common.close' | translate">
              <svg cIcon name="cilX" width="20" height="20"></svg>
            </button>
          </header>

          <div class="os-filter-drawer__content">
            @for (item of filterComponents(); track item.component) {
              <div class="os-filter-drawer__item">
                <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
              </div>
            }

            @if (filterComponents().length === 0) {
              <div class="os-filter-drawer__empty">
                {{ 'common.noFilters' | translate }}
              </div>
            }
          </div>

          <footer class="os-filter-drawer__footer">
            <button
              cButton
              color="secondary"
              variant="outline"
              (click)="clearFilters()">
              {{ 'common.clearAll' | translate }}
            </button>
            <button
              cButton
              color="primary"
              (click)="applyFilters()">
              {{ 'common.apply' | translate }}
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styleUrl: './filter-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDrawerComponent {
  private readonly layout = inject(PageLayoutService);

  readonly filterComponents = computed(() => this.layout.subheader().start ?? []);
  readonly isOpen = computed(() => this.layout.isFilterDrawerOpen());

  constructor() {
    // Lock body scroll when drawer is open
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // Close on ESC key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.layout.closeFilterDrawer();
  }

  applyFilters(): void {
    this.layout.emitFilterApply();
  }

  clearFilters(): void {
    this.layout.emitFilterClear();
  }
}
