import { Type } from '@angular/core';

export interface FeatureMeta {
  key: string;
  title: string;
  icon?: string;
  roles?: string[];
  order?: number;
}

export interface FeatureEntry {
  meta: FeatureMeta;
  load: () => Promise<Type<unknown>>;
}

export type DockedState = 'left' | 'right' | 'floating';

export interface FlyoutPosition {
  x: number;
  y: number;
}

export interface FlyoutDimensions {
  width: number;
  height?: number;
}

export interface FlyoutBreakpointConfig {
  desktop: FlyoutDimensions;
  tablet: FlyoutDimensions;
  mobile: FlyoutDimensions;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResizeConfig {
  min: number;
  max: number;
  snaps: number[];
  defaultWidth: number;
}

// New models for dynamic FAB configuration

export interface FabMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: 'route' | 'component' | 'callback' | 'external';
  target?: string; // route path, component loader, callback function name, or external URL
  badge?: number | string;
  order: number;
  roles?: string[];
}

export interface FabButtonConfig {
  id: string;
  label: string;
  title?: string; // Title for flyout header (translation key)
  icon: string;
  order: number;
  roles?: string[];
  hasMenu: boolean;
  menuItems?: FabMenuItem[];
  action?: 'toggle-menu' | 'route' | 'component' | 'callback' | 'external';
  target?: string;
}

export interface FabConfiguration {
  buttons: FabButtonConfig[];
  position: 'center' | 'left' | 'right';
  theme: 'light' | 'dark' | 'auto';
}

export interface FabState {
  activeButtonId: string | null;
  isMenuOpen: boolean;
  openMenuButtonId: string | null;
}

export interface FlyoutOpenConfig {
  featureKey?: string;
  params?: unknown;
  title?: string;
}