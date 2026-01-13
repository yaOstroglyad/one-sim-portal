/**
 * Backend Search Provider
 *
 * Orchestrates search across all registered entity adapters.
 * Collects results from adapters and transforms them to SearchResult format.
 */

import { Injectable, inject, InjectionToken } from '@angular/core';
import { Observable, of, forkJoin, map } from 'rxjs';

import {
  SearchResult,
  SEARCH_ITEM_TYPES,
  MATCH_SOURCES,
  RESULT_SOURCES,
  SEARCH_CONFIG,
} from '../../../models/search';
import { SearchProvider } from './search-provider.interface';
import {
  EntitySearchAdapter,
  GenericSearchEntity,
  ENTITY_ICONS,
} from './adapters';
import { CustomerSearchAdapter } from './adapters/customer-search.adapter';

/**
 * Injection token to enable/disable backend search
 */
export const BACKEND_SEARCH_ENABLED = new InjectionToken<boolean>(
  'BACKEND_SEARCH_ENABLED',
  { providedIn: 'root', factory: () => true }
);

@Injectable({ providedIn: 'root' })
export class BackendSearchProvider implements SearchProvider {
  readonly name = 'backend';
  readonly priority = 1;

  private readonly enabled = inject(BACKEND_SEARCH_ENABLED);
  private readonly customerAdapter = inject(CustomerSearchAdapter);

  /** Registered entity adapters */
  private readonly adapters: EntitySearchAdapter[] = [];

  constructor() {
    // Register default adapters
    this.registerAdapter(this.customerAdapter);
    // Future: this.registerAdapter(this.subscriberAdapter);
    // Future: this.registerAdapter(this.orderAdapter);
  }

  /**
   * Register an entity search adapter
   */
  registerAdapter(adapter: EntitySearchAdapter): void {
    if (!this.adapters.some(a => a.name === adapter.name)) {
      this.adapters.push(adapter);
      this.adapters.sort((a, b) => a.priority - b.priority);
    }
  }

  isAvailable(): boolean {
    return this.enabled && this.adapters.some(a => a.isEnabled());
  }

  search(query: string): Observable<SearchResult[]> {
    if (!this.isAvailable()) {
      return of([]);
    }

    const trimmedQuery = query?.trim();
    if (!trimmedQuery || trimmedQuery.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return of([]);
    }

    return this.executeAdapterSearches(trimmedQuery);
  }

  private executeAdapterSearches(query: string): Observable<SearchResult[]> {
    const enabledAdapters = this.adapters.filter(a => a.isEnabled());

    if (enabledAdapters.length === 0) {
      return of([]);
    }

    const limit = SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY;
    const searches$ = enabledAdapters.map(adapter => adapter.search(query, limit));

    return forkJoin(searches$).pipe(
      map(resultsArrays => {
        const allEntities = resultsArrays.flat();
        return this.transformToSearchResults(allEntities);
      })
    );
  }

  private transformToSearchResults(entities: GenericSearchEntity[]): SearchResult[] {
    return entities.map(entity => this.transformEntity(entity));
  }

  private transformEntity(entity: GenericSearchEntity): SearchResult {
    return {
      id: `${entity.entityType}-${entity.id}`,
      label: entity.name,
      url: entity.routePath,
      icon: ENTITY_ICONS[entity.entityType] || 'cilFile',
      type: SEARCH_ITEM_TYPES.NAVIGATION,
      score: 1,
      matchedOn: MATCH_SOURCES.LABEL,
      source: RESULT_SOURCES.BACKEND,
      parentLabel: entity.parentName,
      searchMeta: {
        category: entity.entityType,
      },
    };
  }
}
