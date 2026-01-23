import { TemplateRef } from '@angular/core';

/**
 * Represents a single action item for responsive actions component
 */
export interface OsActionItem {
  /** Unique identifier for the action */
  id: string;

  /** Icon name (CoreUI icon) */
  icon: string;

  /** Translation key for label (shown in menu, tooltip on buttons) */
  label: string;

  /** Callback function when action is triggered */
  action?: () => void;

  /** Whether this is a primary action (always shown as button) */
  primary?: boolean;

  /** Button color variant */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

  /** Whether the action is disabled */
  disabled?: boolean;

  /** Custom template to render instead of default button (for complex controls) */
  template?: TemplateRef<unknown>;

  /** Reference to a component instance with openMenu() method */
  menuTriggerRef?: { openMenu: () => void };

  /** Show divider after this item in menu */
  divider?: boolean;
}

/**
 * Configuration for responsive actions component
 */
export interface OsResponsiveActionsConfig {
  /** Icon for the "more" menu button on mobile */
  moreIcon?: string;

  /** Label for the "more" menu button (for accessibility) */
  moreLabel?: string;

  /** Menu position */
  menuPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
