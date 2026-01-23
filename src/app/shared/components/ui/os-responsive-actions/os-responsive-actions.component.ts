import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OsMenuComponent } from '../os-menu/os-menu.component';
import { OsMenuSection } from '../os-menu/os-menu.model';
import { OsActionItem, OsResponsiveActionsConfig } from './os-responsive-actions.model';

/**
 * Responsive Actions Component
 *
 * Renders action buttons that adapt to screen size:
 * - Desktop: All actions shown as buttons
 * - Mobile: Primary actions as buttons, secondary actions in a "more" menu
 *
 * @example
 * ```html
 * <os-responsive-actions [actions]="actions()" />
 * ```
 *
 * ```typescript
 * actions = signal<OsActionItem[]>([
 *   { id: 'add', icon: 'cilPlus', label: 'common.add', action: () => this.add(), primary: true, color: 'primary' },
 *   { id: 'refresh', icon: 'cilReload', label: 'common.refresh', action: () => this.refresh() },
 *   { id: 'columns', icon: 'cilColumns', label: 'columnControl.title', menuTriggerRef: this.columnControl }
 * ]);
 * ```
 */
@Component({
  standalone: true,
  selector: 'os-responsive-actions',
  imports: [
    CommonModule,
    ButtonDirective,
    IconDirective,
    TranslateModule,
    MatTooltipModule,
    OsMenuComponent
  ],
  templateUrl: './os-responsive-actions.component.html',
  styleUrls: ['./os-responsive-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsResponsiveActionsComponent {
  /** All action items */
  readonly actions = input.required<OsActionItem[]>();

  /** Configuration options */
  readonly config = input<OsResponsiveActionsConfig>({});

  /** Mobile menu open state */
  readonly menuOpen = signal(false);

  /** Primary actions (always shown as buttons) */
  readonly primaryActions = computed(() =>
    this.actions().filter(a => a.primary)
  );

  /** Secondary actions (shown in menu on mobile) */
  readonly secondaryActions = computed(() =>
    this.actions().filter(a => !a.primary)
  );

  /** Menu sections for mobile "more" menu */
  readonly menuSections = computed<OsMenuSection[]>(() => [{
    items: this.secondaryActions().map(action => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      disabled: action.disabled,
      divider: action.divider,
      action: () => this.executeAction(action)
    }))
  }]);

  /** Icon for more button */
  readonly moreIcon = computed(() =>
    this.config().moreIcon ?? 'cilOptions'
  );

  /** Menu position */
  readonly menuPosition = computed(() =>
    this.config().menuPosition ?? 'bottom-right'
  );

  /** Execute an action (callback or menu trigger) */
  executeAction(action: OsActionItem): void {
    if (action.disabled) return;

    if (action.menuTriggerRef?.openMenu) {
      action.menuTriggerRef.openMenu();
    } else if (action.action) {
      action.action();
    }
  }

  /** Toggle mobile menu */
  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  /** Close mobile menu */
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
