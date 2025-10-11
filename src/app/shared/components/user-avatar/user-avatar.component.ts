import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="user-avatar"
      [class]="avatarClasses"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
      (click)="handleClick($event)"
      (error)="onImageError($event)">
      <img
        class="user-avatar__image"
        [src]="src"
        [alt]="alt"
        (error)="onImageError($event)">
      <div class="user-avatar__fallback" *ngIf="showFallback">
        {{ initials }}
      </div>
    </button>
  `,
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() src: string = '';
  @Input() alt: string = 'User avatar';
  @Input() ariaLabel: string = 'User avatar';
  @Input() size: AvatarSize = 'md';
  @Input() variant: AvatarVariant = 'circle';
  @Input() disabled: boolean = false;
  @Input() clickable: boolean = true;
  @Input() initials: string = '';
  @Input() fallbackSrc: string = './assets/img/avatars/default.jpg';
  
  @Output() click = new EventEmitter<Event>();
  @Output() imageError = new EventEmitter<Event>();

  showFallback = false;

  get avatarClasses(): string {
    const classes = [
      `user-avatar--${this.size}`,
      `user-avatar--${this.variant}`
    ];
    
    if (this.clickable && !this.disabled) {
      classes.push('user-avatar--clickable');
    }
    
    if (this.disabled) {
      classes.push('user-avatar--disabled');
    }
    
    return classes.join(' ');
  }

  handleClick(event: Event): void {
    if (!this.disabled && this.clickable) {
      this.click.emit(event);
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    
    if (this.fallbackSrc && target.src !== this.fallbackSrc) {
      target.src = this.fallbackSrc;
    } else {
      this.showFallback = true;
    }
    
    this.imageError.emit(event);
  }
}