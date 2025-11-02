/**
 * Shared pagination models for API responses
 * Used across all feature modules for consistent pagination handling
 */

/**
 * Page request parameters for paginated API calls
 */
export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}

/**
 * Standard paginated response structure from Spring Data REST APIs
 * All fields are optional to support different API response formats
 */
export interface PageResponse<T> {
  /** Array of content items for current page */
  content: T[];
  /** Total number of elements across all pages */
  totalElements: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page size */
  size: number;
  /** Current page number (0-indexed) */
  number: number;
  /** Number of elements in current page */
  numberOfElements?: number;
  /** Whether this is the first page */
  first: boolean;
  /** Whether this is the last page */
  last: boolean;
  /** Whether the page is empty */
  empty?: boolean;
  /** Sort information */
  sort?: SortInfo;
  /** Pageable information */
  pageable?: PageableInfo;
}

/**
 * Sort metadata
 */
export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * Pageable metadata from Spring Data
 */
export interface PageableInfo {
  offset: number;
  sort: SortInfo;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}
