/**
 * Sidebar Component TypeScript Interfaces
 * 
 * Comprehensive type definitions for the sidebar component system
 * based on Tailwind Catalyst design patterns
 */

export type SidebarVariant = 'default' | 'compact' | 'minimal' | 'floating';
export type SidebarPosition = 'left' | 'right';
export type SidebarCollapseBehavior = 'overlay' | 'push' | 'slide';
export type SidebarState = 'open' | 'closed' | 'collapsed';

export interface SidebarConfig {
  /** Sidebar visual variant */
  variant?: SidebarVariant;
  
  /** Position of sidebar */
  position?: SidebarPosition;
  
  /** Collapse behavior on mobile */
  collapseBehavior?: SidebarCollapseBehavior;
  
  /** Initial state */
  initialState?: SidebarState;
  
  /** Enable responsive behavior */
  responsive?: boolean;
  
  /** Enable RTL support */
  rtl?: boolean;
  
  /** Theme variant */
  theme?: 'light' | 'dark' | 'auto';
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Z-index for overlay */
  zIndex?: number;
  
  /** Backdrop opacity for mobile overlay */
  backdropOpacity?: number;
  
  /** Enable backdrop click to close */
  backdropCloseable?: boolean;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Show backdrop on mobile */
  showBackdrop?: boolean;
  
  /** Sidebar width when expanded */
  expandedWidth?: string;
  
  /** Sidebar width when collapsed */
  collapsedWidth?: string;
  
  /** Breakpoint for responsive behavior */
  breakpoint?: string;
}

export interface SidebarItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Router link or external URL */
  href?: string;
  
  /** Angular router link */
  routerLink?: string | any[];
  
  /** Icon name (supports CoreUI icons, Material icons, or custom) */
  icon?: string;
  
  /** Icon type identifier */
  iconType?: 'coreui' | 'material' | 'custom';
  
  /** Badge configuration */
  badge?: SidebarBadge;
  
  /** Item is active */
  active?: boolean;
  
  /** Item is disabled */
  disabled?: boolean;
  
  /** Child items for nested navigation */
  children?: SidebarItem[];
  
  /** Item is expanded (for nested items) */
  expanded?: boolean;
  
  /** Click handler */
  onClick?: (item: SidebarItem) => void;
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Permissions required to show item */
  permissions?: string[];
  
  /** Tooltip text */
  tooltip?: string;
  
  /** External link target */
  target?: '_blank' | '_self' | '_parent' | '_top';
  
  /** Exact route matching */
  exactMatch?: boolean;
  
  /** Item metadata */
  meta?: any;
}

export interface SidebarBadge {
  /** Badge text */
  text: string;
  
  /** Badge color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  
  /** Badge style */
  style?: 'default' | 'outline' | 'subtle';
  
  /** Position of badge */
  position?: 'end' | 'start' | 'top' | 'bottom';
  
  /** Custom CSS classes */
  customClasses?: string;
}

export interface SidebarSection {
  /** Section identifier */
  id: string;
  
  /** Section title/label */
  title?: string;
  
  /** Section is collapsible */
  collapsible?: boolean;
  
  /** Section is expanded */
  expanded?: boolean;
  
  /** Section items */
  items: SidebarItem[];
  
  /** Section icon */
  icon?: string;
  
  /** Section is divider */
  divider?: boolean;
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Permissions required to show section */
  permissions?: string[];
}

export interface SidebarHeader {
  /** Header title */
  title?: string;
  
  /** Show title (if false, title won't be displayed) */
  showTitle?: boolean;
  
  /** Header subtitle */
  subtitle?: string;
  
  /** Brand logo URL */
  logoUrl?: string;
  
  /** Brand logo alt text */
  logoAlt?: string;
  
  /** Brand name */
  brandName?: string;
  
  /** Show close button */
  showCloseButton?: boolean;
  
  /** Header actions */
  actions?: SidebarAction[];
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Header click handler */
  onClick?: () => void;
}

export interface SidebarFooter {
  /** Footer content */
  content?: string;
  
  /** Footer actions */
  actions?: SidebarAction[];
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Show divider above footer */
  showDivider?: boolean;
}

export interface SidebarAction {
  /** Action identifier */
  id: string;
  
  /** Action label */
  label: string;
  
  /** Action icon */
  icon?: string;
  
  /** Action click handler */
  onClick: () => void;
  
  /** Action is disabled */
  disabled?: boolean;
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Action tooltip */
  tooltip?: string;
}

// SidebarUserInfo removed - user info should be passed as projected content

export interface SidebarLabel {
  /** Label text */
  text: string;
  
  /** Label type */
  type?: 'section' | 'divider' | 'group';
  
  /** Label icon */
  icon?: string;
  
  /** Custom CSS classes */
  customClasses?: string;
  
  /** Label is collapsible */
  collapsible?: boolean;
  
  /** Label is expanded */
  expanded?: boolean;
  
  /** Click handler */
  onClick?: () => void;
}

export interface SidebarEvents {
  /** Sidebar state changed */
  stateChanged?: (state: SidebarState) => void;
  
  /** Item clicked */
  itemClicked?: (item: SidebarItem) => void;
  
  /** Section expanded/collapsed */
  sectionToggled?: (section: SidebarSection) => void;
  
  /** Sidebar opened */
  opened?: () => void;
  
  /** Sidebar closed */
  closed?: () => void;
  
  /** Sidebar collapsed */
  collapsed?: () => void;
  
  /** Backdrop clicked */
  backdropClicked?: () => void;
}

export interface SidebarBreakpoints {
  /** Mobile breakpoint */
  mobile: string;
  
  /** Tablet breakpoint */
  tablet: string;
  
  /** Desktop breakpoint */
  desktop: string;
  
  /** Large desktop breakpoint */
  largeDesktop: string;
}

export interface SidebarAnimationConfig {
  /** Animation duration */
  duration: number;
  
  /** Animation easing */
  easing: string;
  
  /** Animation delay */
  delay: number;
  
  /** Disable animations */
  disabled: boolean;
}

export interface SidebarAccessibility {
  /** ARIA label for sidebar */
  ariaLabel?: string;
  
  /** ARIA labelledby for sidebar */
  ariaLabelledBy?: string;
  
  /** ARIA describedby for sidebar */
  ariaDescribedBy?: string;
  
  /** Role for sidebar */
  role?: string;
  
  /** Tab index for sidebar */
  tabIndex?: number;
  
  /** Focus trap enabled */
  focusTrap?: boolean;
  
  /** Auto focus on open */
  autoFocus?: boolean;
  
  /** Return focus on close */
  returnFocus?: boolean;
}

export interface SidebarTheme {
  /** Background color */
  backgroundColor?: string;
  
  /** Text color */
  textColor?: string;
  
  /** Active item color */
  activeColor?: string;
  
  /** Hover color */
  hoverColor?: string;
  
  /** Border color */
  borderColor?: string;
  
  /** Shadow configuration */
  shadow?: string;
  
  /** Custom CSS variables */
  customCss?: { [key: string]: string };
}

export interface SidebarData {
  /** Sidebar header configuration */
  header?: SidebarHeader;
  
  /** Sidebar sections */
  sections: SidebarSection[];
  
  /** Sidebar footer configuration */
  footer?: SidebarFooter;
  
  /** Sidebar metadata */
  meta?: any;
}

// Default configurations
export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  variant: 'default',
  position: 'left',
  collapseBehavior: 'overlay',
  initialState: 'closed',
  responsive: true,
  rtl: false,
  theme: 'auto',
  zIndex: 1000,
  backdropOpacity: 0.5,
  backdropCloseable: true,
  animationDuration: 300,
  showBackdrop: true,
  expandedWidth: '280px',
  collapsedWidth: '64px',
  breakpoint: '768px'
};

export const DEFAULT_SIDEBAR_BREAKPOINTS: SidebarBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1200px'
};

export const DEFAULT_SIDEBAR_ANIMATION: SidebarAnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  delay: 0,
  disabled: false
};

export const DEFAULT_SIDEBAR_ACCESSIBILITY: SidebarAccessibility = {
  ariaLabel: 'Navigation sidebar',
  role: 'navigation',
  tabIndex: -1,
  focusTrap: true,
  autoFocus: true,
  returnFocus: true
};