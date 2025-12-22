import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type BadgeColor = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary';

/**
 * Reusable status badge component with icon support.
 * Automatically maps boolean status to appropriate color/icon.
 *
 * @example
 * ```html
 * <!-- Auto mode: maps active boolean to success/danger -->
 * <app-status-badge [active]="product.active"></app-status-badge>
 *
 * <!-- Manual mode: explicit color and text -->
 * <app-status-badge color="warning" text="Pending" icon="schedule"></app-status-badge>
 * ```
 */
@Component({
  standalone: true,
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  /** Active status (auto-maps to success/danger) */
  readonly active = input<boolean | null>(null);

  /** Override color (manual mode) */
  readonly color = input<BadgeColor | null>(null);

  /** Override text (manual mode) */
  readonly text = input<string>('');

  /** Override icon (manual mode) */
  readonly icon = input<string>('');

  /** Active text when using auto mode */
  readonly activeText = input<string>('Active');

  /** Inactive text when using auto mode */
  readonly inactiveText = input<string>('Inactive');

  /** Computed badge color */
  readonly badgeColor = computed<BadgeColor>(() => {
    if (this.color()) {
      return this.color()!;
    }
    return this.active() ? 'success' : 'danger';
  });

  /** Computed badge text */
  readonly badgeText = computed<string>(() => {
    if (this.text()) {
      return this.text();
    }
    return this.active() ? this.activeText() : this.inactiveText();
  });

  /** Computed badge icon */
  readonly badgeIcon = computed<string>(() => {
    if (this.icon()) {
      return this.icon();
    }
    return this.active() ? 'check_circle' : 'cancel';
  });
}
