import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' |
  'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'zinc';
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
  @Input() subtle = false; // Tailwind-style subtle variant with background opacity and colored text
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
    
    if (this.subtle) {
      classes.push('os-badge--subtle');
    }
    
    // Add text color class based on background brightness
    if (!this.outline && !this.subtle) {
      classes.push(`os-badge--text-${this.getTextColorVariant()}`);
    }
    
    if (this.customClass) {
      classes.push(this.customClass);
    }
    
    return classes.join(' ');
  }

  private getTextColorVariant(): 'light' | 'dark' {
    // Colors that need dark text for optimal contrast (based on Tailwind's approach)
    const lightBackgrounds: BadgeVariant[] = [
      'yellow',   // Very bright yellow
      'light',    // Light gray
      'lime',     // Bright green
      'amber'     // Bright orange-yellow
    ];
    
    // Semi-bright colors that could benefit from dark text
    const mediumBrightBackgrounds: BadgeVariant[] = [
      // These are on the edge but generally still work better with white text
      // Could be customized based on specific color values
    ];
    
    if (lightBackgrounds.includes(this.variant)) {
      return 'dark';
    }
    
    if (mediumBrightBackgrounds.includes(this.variant)) {
      return 'dark';
    }
    
    // All other colors (primary, secondary, success, danger, warning, info, dark, 
    // red, orange, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, 
    // fuchsia, pink, rose, zinc) use light/white text
    return 'light';
  }
}