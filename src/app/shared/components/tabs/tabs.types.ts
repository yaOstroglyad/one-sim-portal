export interface TabConfig {
  id: string;
  label: string;
  disabled?: boolean;
  badge?: string | number;
  icon?: string;
  closable?: boolean;
  tooltip?: string;
  disabledReason?: string;
}

export interface TabChangeEvent {
  index: number;
  tab: TabConfig;
  previousIndex: number;
}

export interface TabCloseEvent {
  index: number;
  tab: TabConfig;
}

export type TabPosition = 'top' | 'bottom' | 'left' | 'right';
export type TabSize = 'small' | 'medium' | 'large';
export type TabVariant = 'default' | 'pills' | 'underline' | 'card';