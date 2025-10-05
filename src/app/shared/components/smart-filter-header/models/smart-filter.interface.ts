// Base mapper interface for type safety
// Constants for value mapper types
export const VALUE_MAPPER_TYPES = {
  FUNCTION: 'function',
  STATIC: 'static',
  OBSERVABLE: 'observable'
} as const;

export type ValueMapperType = typeof VALUE_MAPPER_TYPES[keyof typeof VALUE_MAPPER_TYPES];

interface BaseValueMapper {
  type: ValueMapperType;
}

// Function-based mapper for simple transformations
export interface FunctionValueMapper extends BaseValueMapper {
  type: typeof VALUE_MAPPER_TYPES.FUNCTION;
  mapper: (value: any, services?: SmartFilterServices) => string | Promise<string>;
}

// Static dictionary for predefined mappings
export interface StaticValueMapper extends BaseValueMapper {
  type: typeof VALUE_MAPPER_TYPES.STATIC;
  mappings: Record<string | number, string>;
  fallback?: string; // Fallback value for unmapped keys
}

// Observable-based mapper for backend data (form-generator pattern)
export interface ObservableValueMapper extends BaseValueMapper {
  type: typeof VALUE_MAPPER_TYPES.OBSERVABLE;
  serviceKey: string; // Service key in services object
  methodName: string; // Service method name
  valueField: string; // Field to extract display value
  keyField?: string; // Field to match against (defaults to 'id')
  cacheKey?: string; // Optional cache key for performance
}

// Union type for all supported mappers
export type SmartFilterValueMapper = FunctionValueMapper | StaticValueMapper | ObservableValueMapper;

// Services container interface
export interface SmartFilterServices {
  [key: string]: any;
}

// Chip configuration interface
export interface ChipDisplayConfig {
  removable?: boolean; // Whether chip can be removed (default: true)
  color?: string; // Chip color theme
  priority?: number; // Display priority (lower = higher priority)
  tooltip?: string | TooltipGenerator; // Static or dynamic tooltip
}

// Tooltip generator function type
export type TooltipGenerator = (value: any, displayValue: string) => string;

// Filter field configuration (similar to form-generator FieldConfig)
export interface FilterFieldConfig {
  key: string; // Form field key
  label: string; // Display label for filter
  
  // Value mapping configuration
  valueMapper?: SmartFilterValueMapper;
  
  // Default behavior
  defaultValue?: any;
  alwaysActive?: boolean; // Cannot be removed
  required?: boolean; // Must have a value
  hidden?: boolean; // Participates in filtering but not displayed as chip
  
  // Visual configuration
  chipConfig?: ChipDisplayConfig;
}

// Global settings for smart filter behavior
export interface SmartFilterGlobalSettings {
  autoApply?: boolean; // Auto-apply filters on change
  persistFilters?: boolean; // Save filters to localStorage
  storageKey?: string; // localStorage key
  resetToDefaults?: boolean; // Reset to default values instead of clearing
  cacheTTL?: number; // Cache time-to-live in milliseconds (default: 5 minutes)
  debounceTime?: number; // Debounce time for form changes in milliseconds (default: 700)
}

// Main smart filter configuration
export interface SmartFilterConfig {
  // Display behavior
  threshold: number; // Filter count threshold for advanced mode
  maxVisibleChips: number; // Max chips before overflow
  
  // Filter definitions
  fields: FilterFieldConfig[];
  
  // Service dependencies (form-generator pattern)
  services?: SmartFilterServices;
  
  // Global configuration
  globalSettings?: SmartFilterGlobalSettings;
}

export interface FilterChip {
  key: string;
  label: string;
  value: any;
  displayValue: string; // Человекочитаемое значение
  config?: FilterFieldConfig; // Ссылка на конфигурацию фильтра
  removable: boolean; // Можно ли удалить чип
  color: string; // Цвет чипа
  tooltip?: string; // Подсказка для чипа
  priority: number; // Приоритет отображения
}

export interface SmartFilterState {
  mode: 'simple' | 'advanced';
  showFilterPanel: boolean;
  activeFilters: FilterChip[];
  filterCount: number;
}

export const DEFAULT_SMART_FILTER_CONFIG: SmartFilterConfig = {
  threshold: 3,
  maxVisibleChips: 2,
  fields: [],
  globalSettings: {
    autoApply: true,
    persistFilters: false,
    resetToDefaults: true,
    cacheTTL: 300000 // 5 minutes
  }
};