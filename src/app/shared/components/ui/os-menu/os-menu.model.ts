import { OsDropdownPosition } from '../os-dropdown/os-dropdown.model';

/**
 * Menu item interface
 */
export interface OsMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string;

  /**
   * Display label for the menu item
   */
  label: string;

  /**
   * Optional icon name (used with app-icon component)
   */
  icon?: string;

  /**
   * Optional badge content (number or text)
   */
  badge?: string | number;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Mark item as dangerous/destructive (red color)
   */
  danger?: boolean;

  /**
   * Mark item as active/selected
   */
  active?: boolean;

  /**
   * Show divider after this item
   */
  divider?: boolean;

  /**
   * Click handler for the item
   */
  action?: () => void;

  /**
   * Optional custom CSS class
   */
  cssClass?: string;
}

/**
 * Menu section interface (for structured menus)
 */
export interface OsMenuSection {
  /**
   * Optional section title/header
   */
  title?: string;

  /**
   * Items in this section
   */
  items: OsMenuItem[];
}

/**
 * Menu position type (reuses dropdown positions)
 */
export type OsMenuPosition = OsDropdownPosition;

/**
 * Configuration for menu component
 */
export interface OsMenuConfig {
  /**
   * Menu position relative to trigger
   */
  position?: OsMenuPosition;

  /**
   * Minimum width of menu
   */
  width?: string;

  /**
   * Whether to close menu when an item is clicked
   */
  closeOnSelect?: boolean;

  /**
   * Menu items (flat structure)
   */
  items?: OsMenuItem[];

  /**
   * Menu sections (structured with headers)
   */
  sections?: OsMenuSection[];
}
