/**
 * Position of the dropdown panel relative to the trigger
 */
export type OsDropdownPosition =
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right'
  | 'auto';  // Auto-detect best position (future enhancement)

/**
 * Configuration for dropdown component
 */
export interface OsDropdownConfig {
  position?: OsDropdownPosition;
  width?: string;
  offset?: number;
  showBackdrop?: boolean;
  closeOnClickOutside?: boolean;
}
