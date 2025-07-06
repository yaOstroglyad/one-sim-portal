import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { BadgeVariant } from '../badge/badge.component';

// Tailwind-inspired card variants
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'gradient' | 'glassmorphism';
export type CardSize = 'small' | 'medium' | 'large';
export type CardRadius = 'none' | 'small' | 'medium' | 'large' | 'xl';

@Component({
  selector: 'os-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  
  // Prevent title attribute from being set on host element
  @HostBinding('attr.title') get hostTitle() { return null; }
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'medium';
  @Input() radius: CardRadius = 'medium';
  @Input() interactive = false;
  @Input() selected = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() showHeader = true;
  @Input() showActions = false;
  @Input() noPadding = false;
  @Input() borderColor?: BadgeVariant; // Use same color system as badges
  @Input() shadowColor?: BadgeVariant; // Custom shadow color
  @Input() customClass?: string;

  get cardClasses(): string[] {
    const classes = ['os-card'];
    
    classes.push(`os-card--${this.variant}`);
    classes.push(`os-card--${this.size}`);
    classes.push(`os-card--radius-${this.radius}`);
    
    if (this.interactive) {
      classes.push('os-card--interactive');
    }
    
    if (this.selected) {
      classes.push('os-card--selected');
    }
    
    if (this.disabled) {
      classes.push('os-card--disabled');
    }
    
    if (this.loading) {
      classes.push('os-card--loading');
    }
    
    if (this.noPadding) {
      classes.push('os-card--no-padding');
    }
    
    if (this.borderColor) {
      classes.push(`os-card--border-${this.borderColor}`);
    }
    
    if (this.shadowColor) {
      classes.push(`os-card--shadow-${this.shadowColor}`);
    }
    
    if (this.customClass) {
      classes.push(this.customClass);
    }
    
    return classes;
  }

  get shouldShowHeader(): boolean {
    return this.showHeader && (!!this.title || !!this.subtitle);
  }
}