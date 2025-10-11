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

export interface BrandConfig {
  full: {
    src: string;
    height: number;
    alt: string;
  };
  narrow: {
    src: string;
    width: number;
    alt: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}