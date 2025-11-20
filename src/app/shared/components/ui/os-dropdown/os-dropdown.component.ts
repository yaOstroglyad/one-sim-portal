import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  HostListener,
  ElementRef,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsDropdownPosition } from './os-dropdown.model';

/**
 * OS Dropdown Component
 *
 * Generic dropdown/popover component for positioning any content relative to a trigger element.
 * Provides backdrop, positioning, and open/close management.
 *
 * Features:
 * - Multiple positioning options (top/bottom, left/right)
 * - Backdrop with click-outside-to-close
 * - Keyboard support (Escape to close)
 * - Fully signals-based
 * - Content projection for maximum flexibility
 *
 * @example
 * ```html
 * <os-dropdown
 *   [isOpen]="isOpen()"
 *   position="bottom-right"
 *   (closed)="onClose()">
 *
 *   <button dropdownTrigger (click)="toggleDropdown()">
 *     Open Dropdown
 *   </button>
 *
 *   <div dropdownContent>
 *     <!-- Any custom content -->
 *   </div>
 * </os-dropdown>
 * ```
 */
@Component({
  selector: 'os-dropdown',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './os-dropdown.component.html',
  styleUrls: ['./os-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsDropdownComponent {
  /**
   * Whether the dropdown is open
   */
  readonly isOpen = input<boolean>(false);

  /**
   * Position of the dropdown panel relative to trigger
   */
  readonly position = input<OsDropdownPosition>('bottom-right');

  /**
   * Minimum width of the dropdown panel
   */
  readonly width = input<string>('auto');

  /**
   * Offset from the trigger element in pixels
   */
  readonly offset = input<number>(8);

  /**
   * Whether to show backdrop overlay
   */
  readonly showBackdrop = input<boolean>(true);

  /**
   * Whether to close dropdown when clicking outside
   */
  readonly closeOnClickOutside = input<boolean>(true);

  /**
   * Emitted when dropdown is opened
   */
  readonly opened = output<void>();

  /**
   * Emitted when dropdown should be closed
   */
  readonly closed = output<void>();

  /**
   * Reference to trigger element
   */
  readonly triggerElement = viewChild<ElementRef>('trigger');

  /**
   * Reference to panel element
   */
  readonly panelElement = viewChild<ElementRef>('panel');

  /**
   * Internal state tracking if dropdown is open
   */
  readonly isOpenState = signal(false);

  /**
   * Computed CSS classes for the panel based on position
   */
  readonly panelClasses = computed(() => {
    const classes = ['os-dropdown__panel'];
    classes.push(`os-dropdown__panel--${this.position()}`);
    return classes.join(' ');
  });

  /**
   * Computed inline styles for the panel
   */
  readonly panelStyles = computed(() => {
    return {
      'min-width': this.width()
    };
  });

  constructor() {
    // Sync external isOpen input with internal state
    effect(() => {
      const open = this.isOpen();
      if (open !== this.isOpenState()) {
        this.isOpenState.set(open);
        if (open) {
          this.opened.emit();
        }
      }
    });
  }

  /**
   * Handle Escape key to close dropdown
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpenState()) {
      event.preventDefault();
      this.close();
    }
  }

  /**
   * Handle backdrop click to close dropdown
   */
  onBackdropClick(): void {
    if (this.closeOnClickOutside()) {
      this.close();
    }
  }

  /**
   * Close the dropdown
   */
  close(): void {
    this.isOpenState.set(false);
    this.closed.emit();
  }
}
