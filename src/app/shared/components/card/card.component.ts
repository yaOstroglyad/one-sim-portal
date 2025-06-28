import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive' | 'notification';
export type CardSize = 'small' | 'medium' | 'large';

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
  @Input() interactive = false;
  @Input() selected = false;
  @Input() disabled = false;
  @Input() showHeader = true;
  @Input() showActions = false;
  @Input() customClass?: string;

  get cardClasses(): string[] {
    const classes = ['os-card'];
    
    classes.push(`os-card--${this.variant}`);
    classes.push(`os-card--${this.size}`);
    
    if (this.interactive) {
      classes.push('os-card--interactive');
    }
    
    if (this.selected) {
      classes.push('os-card--selected');
    }
    
    if (this.disabled) {
      classes.push('os-card--disabled');
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