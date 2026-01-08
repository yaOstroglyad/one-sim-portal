/**
 * PageTitleComponent
 *
 * Simple page title component for use in page header slots.
 * Shows translated title text with appropriate styling.
 *
 * @example
 * ```typescript
 * this.layout.header.set({
 *   start: [
 *     { component: PageTitleComponent, inputs: { title: 'customers.title' } }
 *   ]
 * });
 * ```
 */

import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'os-page-title',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <h1 class="os-page-title">{{ title() | translate }}</h1>
  `,
  styles: [`
    @use "sass:map";
    @use "../../../../scss/variables" as vars;

    .os-page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--layout-content-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 767px) {
        font-size: 20px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
  readonly title = input.required<string>();
}
