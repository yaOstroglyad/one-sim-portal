/**
 * Context Menu Item Model
 *
 * Defines a single action in the context menu.
 */
export interface ContextMenuItem {
  /**
   * Unique identifier for the action
   */
  id: string;

  /**
   * Display label (supports translation keys)
   */
  label: string;

  /**
   * Material icon name (optional)
   */
  icon?: string;

  /**
   * Callback function to execute when item is clicked
   */
  action: () => void;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Show divider after this item
   */
  divider?: boolean;

  /**
   * Custom CSS class for styling
   */
  cssClass?: string;
}

/**
 * Contextual Text Configuration
 */
export interface ContextualTextConfig {
  /**
   * Text to display
   */
  text: string;

  /**
   * Context menu items (actions)
   */
  actions: ContextMenuItem[];

  /**
   * Show visual indicator that text is interactive
   * Default: true
   */
  showInteractiveIndicator?: boolean;

  /**
   * CSS class for the text wrapper
   */
  textClass?: string;

  /**
   * Tooltip text (optional)
   */
  tooltip?: string;
}
