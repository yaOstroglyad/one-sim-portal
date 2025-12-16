import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  HostListener,
  signal,
  computed,
  ElementRef,
  QueryList,
  viewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OsDropdownComponent, DropdownTriggerDirective, DropdownContentDirective } from '@shared/components/ui/os-dropdown';
import { IconComponent } from '@shared/components/icon';
import { OsMenuItem, OsMenuSection, OsMenuPosition } from './os-menu.model';

/**
 * OS Menu Component
 *
 * Specialized menu component for displaying actions/commands.
 * Built on top of os-dropdown with menu-specific features:
 * - Keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - ARIA attributes for accessibility
 * - Support for items and sections
 * - Icons, badges, dividers
 * - Active, disabled, danger states
 *
 * @example
 * ```html
 * <!-- Simple menu -->
 * <os-menu
 *   [isOpen]="isMenuOpen()"
 *   [items]="menuItems"
 *   (closed)="onClose()"
 *   (itemClick)="onItemClick($event)">
 *   <button menuTrigger>Actions</button>
 * </os-menu>
 *
 * <!-- Structured menu with sections -->
 * <os-menu
 *   [isOpen]="isMenuOpen()"
 *   [sections]="menuSections">
 *   <app-user-avatar menuTrigger [src]="avatar()"></app-user-avatar>
 * </os-menu>
 * ```
 */
@Component({
  standalone: true,
  selector: 'os-menu',
  imports: [
    CommonModule,
    TranslateModule,
    OsDropdownComponent,
    DropdownContentDirective,
    IconComponent
  ],
  templateUrl: './os-menu.component.html',
  styleUrls: ['./os-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsMenuComponent {
  /**
   * Whether the menu is open
   */
  readonly isOpen = input<boolean>(false);

  /**
   * Position of the menu relative to trigger
   */
  readonly position = input<OsMenuPosition>('bottom-right');

  /**
   * Minimum width of the menu
   */
  readonly width = input<string>('280px');

  /**
   * Flat list of menu items
   */
  readonly items = input<OsMenuItem[]>();

  /**
   * Structured menu with sections
   */
  readonly sections = input<OsMenuSection[]>();

  /**
   * Whether to close menu when an item is clicked
   */
  readonly closeOnSelect = input<boolean>(true);

  /**
   * Emitted when menu should be closed
   */
  readonly closed = output<void>();

  /**
   * Emitted when a menu item is clicked
   */
  readonly itemClick = output<OsMenuItem>();

  /**
   * Reference to all menu item buttons
   */
  readonly menuItemButtons = viewChildren<ElementRef>('menuItem');

  /**
   * Currently focused item index
   */
  readonly focusedIndex = signal<number>(-1);

  /**
   * Flattened list of all menu items (for keyboard navigation)
   */
  readonly allItems = computed(() => {
    const items = this.items();
    const sections = this.sections();

    if (items) {
      return items;
    }

    if (sections) {
      return sections.flatMap(section => section.items);
    }

    return [];
  });

  /**
   * Count of non-disabled items
   */
  readonly enabledItemsCount = computed(() => {
    return this.allItems().filter(item => !item.disabled).length;
  });

  /**
   * Handle menu item click
   */
  onItemClick(item: OsMenuItem, event: Event): void {
    event.stopPropagation();

    if (item.disabled) {
      return;
    }

    // Execute item action
    if (item.action) {
      item.action();
    }

    // Emit event
    this.itemClick.emit(item);

    // Close menu if configured
    if (this.closeOnSelect()) {
      this.closed.emit();
    }
  }

  /**
   * Handle keyboard navigation
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      return;
    }

    const items = this.allItems();
    const currentIndex = this.focusedIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(currentIndex, items);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(currentIndex, items);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < items.length) {
          const item = items[currentIndex];
          if (!item.disabled) {
            this.onItemClick(item, event);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.closed.emit();
        break;

      case 'Home':
        event.preventDefault();
        this.focusFirstItem(items);
        break;

      case 'End':
        event.preventDefault();
        this.focusLastItem(items);
        break;
    }
  }

  /**
   * Focus next non-disabled item
   */
  private focusNextItem(currentIndex: number, items: OsMenuItem[]): void {
    let nextIndex = currentIndex + 1;

    // Wrap around to beginning
    if (nextIndex >= items.length) {
      nextIndex = 0;
    }

    // Skip disabled items
    while (items[nextIndex]?.disabled && nextIndex !== currentIndex) {
      nextIndex++;
      if (nextIndex >= items.length) {
        nextIndex = 0;
      }
    }

    if (!items[nextIndex]?.disabled) {
      this.focusedIndex.set(nextIndex);
      this.focusItemAtIndex(nextIndex);
    }
  }

  /**
   * Focus previous non-disabled item
   */
  private focusPreviousItem(currentIndex: number, items: OsMenuItem[]): void {
    let prevIndex = currentIndex - 1;

    // Wrap around to end
    if (prevIndex < 0) {
      prevIndex = items.length - 1;
    }

    // Skip disabled items
    while (items[prevIndex]?.disabled && prevIndex !== currentIndex) {
      prevIndex--;
      if (prevIndex < 0) {
        prevIndex = items.length - 1;
      }
    }

    if (!items[prevIndex]?.disabled) {
      this.focusedIndex.set(prevIndex);
      this.focusItemAtIndex(prevIndex);
    }
  }

  /**
   * Focus first non-disabled item
   */
  private focusFirstItem(items: OsMenuItem[]): void {
    const firstEnabledIndex = items.findIndex(item => !item.disabled);
    if (firstEnabledIndex !== -1) {
      this.focusedIndex.set(firstEnabledIndex);
      this.focusItemAtIndex(firstEnabledIndex);
    }
  }

  /**
   * Focus last non-disabled item
   */
  private focusLastItem(items: OsMenuItem[]): void {
    const lastEnabledIndex = items.reverse().findIndex(item => !item.disabled);
    if (lastEnabledIndex !== -1) {
      const actualIndex = items.length - 1 - lastEnabledIndex;
      this.focusedIndex.set(actualIndex);
      this.focusItemAtIndex(actualIndex);
    }
  }

  /**
   * Focus item element at specific index
   */
  private focusItemAtIndex(index: number): void {
    const buttons = this.menuItemButtons();
    if (buttons && buttons[index]) {
      buttons[index].nativeElement.focus();
    }
  }

  /**
   * Track by function for items
   */
  trackByItemId(index: number, item: OsMenuItem): string {
    return item.id;
  }

  /**
   * Track by function for sections
   */
  trackBySectionTitle(index: number, section: OsMenuSection): string {
    return section.title || `section-${index}`;
  }
}
