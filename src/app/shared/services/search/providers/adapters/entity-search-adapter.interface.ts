/**
 * Entity Search Adapter Interface
 *
 * Defines the contract for entity-specific search adapters.
 * Each adapter knows how to query its API and map results to GenericSearchEntity.
 */

import { Observable } from 'rxjs';

/**
 * Generic search entity - unified structure for all backend search results
 */
export interface GenericSearchEntity {
  /** Unique entity identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional description or secondary text */
  description?: string;
  /** Entity type for categorization and icon selection */
  entityType: EntityType;
  /** Full route path for navigation (without hash) */
  routePath: string;
  /** Parent entity name (company, account, etc.) */
  parentName?: string;
  /** Additional metadata for display or filtering */
  metadata?: Record<string, unknown>;
}

/**
 * Supported entity types for backend search
 */
export const ENTITY_TYPES = {
  CUSTOMER: 'customer',
  SUBSCRIBER: 'subscriber',
  ORDER: 'order',
  PRODUCT: 'product',
  TICKET: 'ticket',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

/**
 * Icon mapping for entity types
 */
export const ENTITY_ICONS: Record<EntityType, string> = {
  [ENTITY_TYPES.CUSTOMER]: 'cilUser',
  [ENTITY_TYPES.SUBSCRIBER]: 'cilMobile',
  [ENTITY_TYPES.ORDER]: 'cilBasket',
  [ENTITY_TYPES.PRODUCT]: 'cil3d',
  [ENTITY_TYPES.TICKET]: 'cilSpeech',
};

/**
 * Interface for entity-specific search adapters
 */
export interface EntitySearchAdapter {
  /** Unique adapter name for identification */
  readonly name: string;

  /** Entity type this adapter handles */
  readonly entityType: EntityType;

  /** Priority for result ordering (lower = shown first) */
  readonly priority: number;

  /**
   * Execute search and return generic entities
   * @param query Search query string
   * @param limit Maximum results to return
   * @returns Observable of generic search entities
   */
  search(query: string, limit: number): Observable<GenericSearchEntity[]>;

  /**
   * Check if adapter is currently enabled
   * @returns true if adapter should be used
   */
  isEnabled(): boolean;
}
