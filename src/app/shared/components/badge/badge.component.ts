import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeShape = 'rounded' | 'pill' | 'square';

@Component({
  selector: 'os-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
  `,
  host: {
    '[class]': 'badgeClasses',
    '[attr.aria-label]': 'ariaLabel'
  },
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'medium';
  @Input() shape: BadgeShape = 'rounded';
  @Input() outline = false;
  @Input() customClass?: string;
  @Input() ariaLabel?: string;

  get badgeClasses(): string {
    const classes = ['os-badge'];
    
    classes.push(`os-badge--${this.variant}`);
    classes.push(`os-badge--${this.size}`);
    classes.push(`os-badge--${this.shape}`);
    
    if (this.outline) {
      classes.push('os-badge--outline');
    }
    
    if (this.customClass) {
      classes.push(this.customClass);
    }
    
    return classes.join(' ');
  }
}