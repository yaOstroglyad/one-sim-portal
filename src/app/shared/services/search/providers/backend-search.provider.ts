/**
 * Backend Search Provider
 *
 * Provides search over backend entities via /api/search endpoint.
 * Disabled by default - can be enabled for testing or when API is ready.
 */

import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, timeout } from 'rxjs';

import {
  SearchResult,
  BackendSearchResponse,
  BackendSearchItem,
  SEARCH_ITEM_TYPES,
  MATCH_SOURCES,
  RESULT_SOURCES,
  SEARCH_CONFIG,
} from '../../../models/search';
import { SearchProvider } from './search-provider.interface';

/**
 * Injection token to enable/disable backend search
 */
export const BACKEND_SEARCH_ENABLED = new InjectionToken<boolean>(
  'BACKEND_SEARCH_ENABLED',
  { providedIn: 'root', factory: () => false }
);

/**
 * Injection token for backend search timeout
 */
export const BACKEND_SEARCH_TIMEOUT = new InjectionToken<number>(
  'BACKEND_SEARCH_TIMEOUT',
  { providedIn: 'root', factory: () => SEARCH_CONFIG.BACKEND_TIMEOUT_MS }
);

/** Icon mapping for backend entity types (CoreUI naming convention) */
const ENTITY_ICONS: Record<string, string> = {
  customer: 'cilUser',
  order: 'cilBasket',
  product: 'cil3d',
  ticket: 'cilSpeech',
  provider: 'cilSpreadsheet',
};

@Injectable({ providedIn: 'root' })
export class BackendSearchProvider implements SearchProvider {
  readonly name = 'backend';
  readonly priority = 1;

  private http = inject(HttpClient);
  private enabled = inject(BACKEND_SEARCH_ENABLED);
  private timeoutMs = inject(BACKEND_SEARCH_TIMEOUT);

  isAvailable(): boolean {
    return this.enabled;
  }

  search(query: string): Observable<SearchResult[]> {
    if (!this.isAvailable()) {
      return of([]);
    }

    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return of([]);
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const limit = SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY;

    return this.http
      .get<BackendSearchResponse>(`/api/search?q=${encodedQuery}&limit=${limit}`)
      .pipe(
        timeout(this.timeoutMs),
        map(response => this.transformResults(response.results)),
        catchError(error => {
          console.warn('Backend search failed:', error);
          return of([]);
        })
      );
  }

  private transformResults(items: BackendSearchItem[]): SearchResult[] {
    return items.map(item => this.transformItem(item));
  }

  private transformItem(item: BackendSearchItem): SearchResult {
    return {
      id: item.id,
      label: item.label,
      url: item.url,
      icon: item.icon || ENTITY_ICONS[item.type] || 'cilFile',
      type: SEARCH_ITEM_TYPES.NAVIGATION,
      score: 1, // Backend doesn't provide score, use default
      matchedOn: MATCH_SOURCES.LABEL,
      source: RESULT_SOURCES.BACKEND,
      searchMeta: {
        category: item.type,
      },
    };
  }
}
