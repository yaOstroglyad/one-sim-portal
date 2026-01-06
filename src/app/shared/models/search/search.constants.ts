/**
 * Search Constants
 *
 * Const type definitions for global search functionality.
 * Uses `as const` pattern for type-safe string literals.
 */

/**
 * Types of searchable items (client-side navigation)
 */
export const SEARCH_ITEM_TYPES = {
  NAVIGATION: 'navigation',
  ACTION: 'action',
} as const;

/**
 * Sources where a match was found
 */
export const MATCH_SOURCES = {
  LABEL: 'label',
  KEYWORD: 'keyword',
  URL: 'url',
} as const;

/**
 * Origin of search results (for merged results)
 */
export const RESULT_SOURCES = {
  CLIENT: 'client',
  BACKEND: 'backend',
} as const;

/**
 * Backend entity types (for future API integration)
 */
export const BACKEND_ENTITY_TYPES = {
  CUSTOMER: 'customer',
  ORDER: 'order',
  PRODUCT: 'product',
  TICKET: 'ticket',
  PROVIDER: 'provider',
} as const;

/**
 * Search configuration defaults
 */
export const SEARCH_CONFIG = {
  /** Minimum characters required before searching */
  MIN_QUERY_LENGTH: 1,
  /** Debounce time for search input */
  DEBOUNCE_MS: 150,
  /** Maximum results per category */
  MAX_RESULTS_PER_CATEGORY: 10,
  /** Timeout for backend search requests */
  BACKEND_TIMEOUT_MS: 2000,
  /** Maximum recent items to store */
  MAX_RECENT_ITEMS: 5,
} as const;
