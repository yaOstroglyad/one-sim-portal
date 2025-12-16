import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed
} from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

/**
 * User Avatar Component
 *
 * Displays a user avatar with fallback support and customizable appearance.
 * Fully signals-based implementation.
 *
 * Features:
 * - Multiple sizes (sm, md, lg, xl)
 * - Multiple shapes (circle, rounded, square)
 * - Cascading fallback: src → fallbackSrc → initials
 * - Clickable with disabled state
 * - Interactive hover effects
 * - Dark theme support
 *
 * @example
 * ```html
 * <app-user-avatar
 *   [src]="userAvatar()"
 *   [alt]="userName()"
 *   [initials]="userInitials()"
 *   size="md"
 *   variant="circle"
 *   (click)="onUserAvatarClick($event)">
 * </app-user-avatar>
 * ```
 */
@Component({
  standalone: true,
  selector: 'app-user-avatar',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="user-avatar"
      [class]="avatarClasses()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (click)="handleClick($event)">
      @if (hasValidSrc() && !showFallback()) {
        <img
          class="user-avatar__image"
          [src]="src()"
          [alt]="alt()"
          (error)="onImageError($event)">
      }
      @if (!hasValidSrc() || showFallback()) {
        <div class="user-avatar__fallback">
          {{ initials() }}
        </div>
      }
    </button>
  `,
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
  /**
   * Image source URL
   */
  readonly src = input<string>('');

  /**
   * Image alt text
   */
  readonly alt = input<string>('User avatar');

  /**
   * Accessibility label
   */
  readonly ariaLabel = input<string>('User avatar');

  /**
   * Avatar size
   */
  readonly size = input<AvatarSize>('md');

  /**
   * Avatar shape variant
   */
  readonly variant = input<AvatarVariant>('circle');

  /**
   * Disabled state
   */
  readonly disabled = input<boolean>(false);

  /**
   * Whether avatar is clickable
   */
  readonly clickable = input<boolean>(true);

  /**
   * User initials for text fallback
   */
  readonly initials = input<string>('');

  /**
   * Fallback image source
   */
  readonly fallbackSrc = input<string>('./assets/img/avatars/default.jpg');

  /**
   * Click event
   */
  readonly click = output<Event>();

  /**
   * Image error event
   */
  readonly imageError = output<Event>();

  /**
   * Track if fallback should be shown
   */
  readonly showFallback = signal(false);

  /**
   * Check if src is valid (not empty/null/undefined)
   */
  readonly hasValidSrc = computed(() => {
    const srcValue = this.src();
    return srcValue !== null && srcValue !== undefined && srcValue.trim() !== '';
  });

  /**
   * Computed CSS classes based on inputs
   */
  readonly avatarClasses = computed(() => {
    const classes = [
      `user-avatar--${this.size()}`,
      `user-avatar--${this.variant()}`
    ];

    if (this.clickable() && !this.disabled()) {
      classes.push('user-avatar--clickable');
    }

    if (this.disabled()) {
      classes.push('user-avatar--disabled');
    }

    return classes.join(' ');
  });

  /**
   * Handle click event
   */
  handleClick(event: Event): void {
    if (!this.disabled() && this.clickable()) {
      this.click.emit(event);
    }
  }

  /**
   * Handle image error with cascading fallback
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;

    if (this.fallbackSrc() && target.src !== this.fallbackSrc()) {
      target.src = this.fallbackSrc();
    } else {
      this.showFallback.set(true);
    }

    this.imageError.emit(event);
  }
}