/**
 * Search Types
 *
 * Interfaces and type definitions for global search functionality.
 */

import {
  SEARCH_ITEM_TYPES,
  MATCH_SOURCES,
  RESULT_SOURCES,
  BACKEND_ENTITY_TYPES,
} from '@shared/models';

// Derived types from constants
export type SearchItemType = typeof SEARCH_ITEM_TYPES[keyof typeof SEARCH_ITEM_TYPES];
export type MatchSource = typeof MATCH_SOURCES[keyof typeof MATCH_SOURCES];
export type ResultSource = typeof RESULT_SOURCES[keyof typeof RESULT_SOURCES];
export type BackendEntityType = typeof BACKEND_ENTITY_TYPES[keyof typeof BACKEND_ENTITY_TYPES];

/**
 * Additional search metadata for navigation items
 */
export interface SearchMetadata {
  /** Additional search terms (aliases, translations) */
  keywords?: string[];
  /** Category for grouping in results */
  category?: string;
  /** Higher = shown first in ties (default: 0) */
  priority?: number;
}

/**
 * Base searchable item interface
 */
export interface SearchableItem {
  /** Unique identifier */
  id: string;
  /** Translated display name */
  label: string;
  /** Navigation URL */
  url: string;
  /** URL fragment for deep linking (e.g., 'finance') */
  fragment?: string;
  /** Parent page label for hierarchical display */
  parentLabel?: string;
  /** CoreUI icon name */
  icon?: string;
  /** Item type */
  type: SearchItemType;
  /** Required permissions to view */
  permissions?: string[];
  /** Additional search configuration */
  searchMeta?: SearchMetadata;
}

/**
 * Search result with match information
 */
export interface SearchResult extends SearchableItem {
  /** Relevance score from match-sorter (higher = better match) */
  score: number;
  /** Where the match was found */
  matchedOn: MatchSource;
  /** If matched by keyword, which one */
  matchedKeyword?: string;
  /** Character ranges to highlight [start, end] */
  highlightRanges?: Array<[number, number]>;
  /** Result origin (client or backend) */
  source: ResultSource;
}

/**
 * Grouped search results by category
 */
export interface GroupedSearchResults {
  navigation: SearchResult[];
  actions: SearchResult[];
  backend: SearchResult[];
}

/**
 * Backend API search response (future integration)
 */
export interface BackendSearchResponse {
  results: BackendSearchItem[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Backend search item from API
 */
export interface BackendSearchItem {
  /** Unique ID (e.g., 'customer-123') */
  id: string;
  /** Entity type */
  type: BackendEntityType;
  /** Display name */
  label: string;
  /** Secondary text (e.g., email) */
  description?: string;
  /** Navigation URL */
  url: string;
  /** Optional icon override */
  icon?: string;
  /** Additional context */
  metadata?: Record<string, unknown>;
}

/**
 * Navigation item from _nav.ts with optional search metadata
 */
export interface NavItemWithSearch {
  name: string;
  url?: string;
  iconComponent?: { name: string };
  permissions?: string[];
  featureToggle?: string;
  children?: NavItemWithSearch[];
  searchMeta?: SearchMetadata;
}
