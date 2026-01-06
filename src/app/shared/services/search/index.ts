/**
 * Search Service Barrel Export
 *
 * Global search (command palette) services and providers.
 *
 * @example
 * ```typescript
 * import { SearchIndexService } from '@shared/services/search';
 *
 * // In component
 * private searchService = inject(SearchIndexService);
 * this.searchService.openPalette();
 * ```
 */

export * from './search-index.service';
export * from './providers';
export * from './nav-items.token';
// deep-links.registry is internal - used only by client-search.provider
