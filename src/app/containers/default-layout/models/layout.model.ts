export interface LayoutConfig {
  sidebarCollapsed: boolean;
  darkTheme: boolean;
  rtlDirection: boolean;
}

export interface NavItem {
  name: string;
  url?: string;
  iconComponent?: { name: string };
  permissions?: string[];
  featureToggle?: string;
  children?: NavItem[];
  divider?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

/**
 * Logo configuration with optional dark theme variant.
 * If darkSrc is not provided, src is used for both themes
 * with CSS filter applied in dark mode.
 */
export interface LogoConfig {
  src: string;
  darkSrc?: string; // Optional: separate logo for dark theme
  alt: string;
}

export interface BrandConfigFull extends LogoConfig {
  height: number;
}

export interface BrandConfigNarrow extends LogoConfig {
  width: number;
}

export interface BrandConfig {
  full: BrandConfigFull;
  narrow: BrandConfigNarrow;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}