/**
 * Search Provider Interface
 *
 * Defines the contract for pluggable search providers.
 * Allows mixing client-side and backend search sources.
 */

import { Observable } from 'rxjs';
import { SearchResult } from '@shared/models/search';

/**
 * Interface for search providers (client-side or backend)
 */
export interface SearchProvider {
  /** Unique provider name for identification */
  readonly name: string;

  /** Priority for result ordering (lower = shown first) */
  readonly priority: number;

  /**
   * Execute search and return results
   * @param query Search query string
   * @returns Observable of search results
   */
  search(query: string): Observable<SearchResult[]>;

  /**
   * Check if provider is currently available
   * @returns true if provider can handle searches
   */
  isAvailable(): boolean;

  /**
   * Rebuild the search index (if applicable)
   * Called when language changes or nav items update
   */
  rebuildIndex?(): void;
}
