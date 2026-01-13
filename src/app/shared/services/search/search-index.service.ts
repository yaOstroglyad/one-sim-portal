/**
 * Search Index Service
 *
 * Orchestrates search across all registered providers.
 * Manages palette state, debouncing, and result merging.
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  Subject,
  debounceTime,
  switchMap,
  forkJoin,
  of,
  takeUntil,
  distinctUntilChanged,
} from 'rxjs';

import {
  SearchResult,
  GroupedSearchResults,
  SEARCH_ITEM_TYPES,
  RESULT_SOURCES,
  SEARCH_CONFIG,
} from '@models';
import { ClientSearchProvider } from '@shared/services/search/providers';
import { BackendSearchProvider } from '@shared/services/search/providers';
import { SearchProvider } from '@shared/services/search/providers';

@Injectable({ providedIn: 'root' })
export class SearchIndexService {
  private router = inject(Router);
  private clientProvider = inject(ClientSearchProvider);
  private backendProvider = inject(BackendSearchProvider);

  /** Registered search providers */
  private providers: SearchProvider[] = [];

  /** Search query input */
  private querySubject$ = new Subject<string>();

  /** Cleanup subject */
  private destroy$ = new Subject<void>();

  // State signals
  readonly query = signal('');
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly results = signal<SearchResult[]>([]);
  readonly error = signal<string | null>(null);
  readonly recentItems = signal<SearchResult[]>([]);

  // Computed signals
  readonly hasResults = computed(() => this.results().length > 0);

  readonly groupedResults = computed<GroupedSearchResults>(() => {
    const all = this.results();
    return {
      navigation: all.filter(
        r => r.type === SEARCH_ITEM_TYPES.NAVIGATION && r.source === RESULT_SOURCES.CLIENT
      ),
      actions: all.filter(r => r.type === SEARCH_ITEM_TYPES.ACTION),
      backend: all.filter(r => r.source === RESULT_SOURCES.BACKEND),
    };
  });

  readonly flatResults = computed(() => {
    const grouped = this.groupedResults();
    return [...grouped.navigation, ...grouped.actions, ...grouped.backend];
  });

  constructor() {
    // Register default providers
    this.registerProvider(this.clientProvider);
    this.registerProvider(this.backendProvider);

    // Setup debounced search
    this.querySubject$
      .pipe(
        debounceTime(SEARCH_CONFIG.DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap(query => this.executeSearch(query)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // Close palette on route change
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.isOpen()) {
        this.closePalette();
      }
    });
  }

  /**
   * Register a search provider
   */
  registerProvider(provider: SearchProvider): void {
    if (!this.providers.some(p => p.name === provider.name)) {
      this.providers.push(provider);
      // Sort by priority (lower = first)
      this.providers.sort((a, b) => a.priority - b.priority);
    }
  }

  /**
   * Open the command palette
   */
  openPalette(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.results.set([]);
    this.error.set(null);
  }

  /**
   * Close the command palette
   */
  closePalette(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);
    this.error.set(null);
    this.isLoading.set(false);
  }

  /**
   * Update search query (debounced)
   */
  search(query: string): void {
    this.query.set(query);
    this.querySubject$.next(query);
  }

  /**
   * Navigate to a search result
   */
  navigateTo(result: SearchResult): void {
    // Add to recent items
    this.addToRecent(result);

    // Close palette
    this.closePalette();

    // Navigate
    if (result.fragment) {
      this.router.navigate([result.url], { fragment: result.fragment });
    } else {
      this.router.navigate([result.url]);
    }
  }

  /**
   * Rebuild all provider indexes
   */
  rebuildIndexes(): void {
    for (const provider of this.providers) {
      if (provider.rebuildIndex) {
        provider.rebuildIndex();
      }
    }
  }

  private executeSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.results.set([]);
      this.isLoading.set(false);
      return of([]);
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Get available providers
    const availableProviders = this.providers.filter(p => p.isAvailable());

    if (availableProviders.length === 0) {
      this.isLoading.set(false);
      return of([]);
    }

    // Execute search on all providers in parallel
    const searches$ = availableProviders.map(provider => provider.search(query));

    return forkJoin(searches$).pipe(
      switchMap(resultsArrays => {
        const merged = this.mergeResults(resultsArrays.flat());
        this.results.set(merged);
        this.isLoading.set(false);
        return of(merged);
      })
    );
  }

  private mergeResults(results: SearchResult[]): SearchResult[] {
    // Deduplicate by id
    const seen = new Map<string, SearchResult>();

    for (const result of results) {
      const existing = seen.get(result.id);
      if (!existing || result.score > existing.score) {
        seen.set(result.id, result);
      }
    }

    // Sort by score (higher is better)
    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  }

  private addToRecent(result: SearchResult): void {
    const current = this.recentItems();

    // Remove if already exists
    const filtered = current.filter(r => r.id !== result.id);

    // Add to beginning
    const updated = [result, ...filtered].slice(0, SEARCH_CONFIG.MAX_RECENT_ITEMS);

    this.recentItems.set(updated);
  }
}
