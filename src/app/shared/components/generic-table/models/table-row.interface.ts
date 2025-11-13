/**
 * Generic interface for table row data
 * Extend this interface in your specific models for better type safety
 */
export interface TableRow {
  id?: string | number;
  [key: string]: any;
}

/**
 * Interface for page change event
 */
export interface PageChangeEvent {
  page: number;
  size: number;
  isServerSide?: boolean;
}

/**
 * Interface for sort change event
 */
export interface SortChangeEvent {
  column: string;
  direction: 'asc' | 'desc';
}
