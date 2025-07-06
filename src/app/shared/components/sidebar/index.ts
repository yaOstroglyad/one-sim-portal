/**
 * Sidebar Component Exports
 * 
 * Public API for the sidebar component system
 * Exports all standalone components and types
 */

// Export main standalone component
export { SidebarComponent } from './sidebar.component';

// Export sub-components (these will be created as standalone too)
// export { SidebarHeaderComponent } from './sidebar-header.component';
// export { SidebarBodyComponent } from './sidebar-body.component';
// export { SidebarFooterComponent } from './sidebar-footer.component';
// export { SidebarSectionComponent } from './sidebar-section.component';
// export { SidebarItemComponent } from './sidebar-item.component';
// export { SidebarLabelComponent } from './sidebar-label.component';

// Export all types and interfaces
export {
  // Configuration types
  SidebarConfig,
  SidebarData,
  SidebarEvents,
  SidebarAccessibility,
  SidebarAnimationConfig,
  SidebarBreakpoints,
  SidebarTheme,
  
  // State and variant types
  SidebarState,
  SidebarVariant,
  SidebarPosition,
  SidebarCollapseBehavior,
  
  // Component configuration types
  SidebarHeader,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarBadge,
  SidebarAction,
  
  // Default configurations
  DEFAULT_SIDEBAR_CONFIG,
  DEFAULT_SIDEBAR_BREAKPOINTS,
  DEFAULT_SIDEBAR_ANIMATION,
  DEFAULT_SIDEBAR_ACCESSIBILITY
} from './sidebar.types';