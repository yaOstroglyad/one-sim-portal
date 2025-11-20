import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OsMenuComponent, OsMenuItem } from '../ui/os-menu';
import { ContextMenuItem } from './contextual-text.model';

/**
 * Contextual Text Component
 *
 * Displays text with a context menu of actions.
 * Useful for displaying values (like ICCID, email, ID) with quick actions (copy, search, etc.)
 *
 * @example
 * ```html
 * <app-contextual-text
 *   [text]="iccid"
 *   [actions]="iccidActions"
 *   [tooltip]="'Click for actions'">
 * </app-contextual-text>
 * ```
 */
@Component({
  selector: 'app-contextual-text',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    OsMenuComponent
  ],
  templateUrl: './contextual-text.component.html',
  styleUrls: ['./contextual-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextualTextComponent {
  /**
   * Text to display
   */
  readonly text = input.required<string>();

  /**
   * Context menu actions
   */
  readonly actions = input.required<ContextMenuItem[]>();

  /**
   * Tooltip text
   */
  readonly tooltip = input<string>('');

  /**
   * Track if menu is currently open
   */
  readonly isMenuOpen = signal(false);

  /**
   * Convert ContextMenuItem to OsMenuItem
   */
  readonly menuItems = computed<OsMenuItem[]>(() => {
    return this.actions().map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      divider: item.divider,
      cssClass: item.cssClass,
      action: item.action
    }));
  });

  /**
   * Toggle menu open/closed
   */
  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  /**
   * Close menu
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
