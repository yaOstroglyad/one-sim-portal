/**
 * Client Search Provider
 *
 * Provides fuzzy search over local navigation items using @tanstack/match-sorter-utils.
 * Respects user permissions and supports localized labels.
 */

import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { rankItem, rankings } from '@tanstack/match-sorter-utils';

import { AuthService } from '@shared/auth';
import {
  SearchResult,
  SearchableItem,
  NavItemWithSearch,
  SEARCH_ITEM_TYPES,
  MATCH_SOURCES,
  RESULT_SOURCES,
  SEARCH_CONFIG,
} from '@models';
import { SearchProvider } from '@shared/services/search';
import { NAV_ITEMS } from '../nav-items.token';
import { getDeepLinkItems } from '../deep-links.registry';

interface IndexedItem extends SearchableItem {
  /** Original translation key for label */
  translationKey: string;
  /** All searchable text fields combined */
  searchableText: string;
}

@Injectable({ providedIn: 'root' })
export class ClientSearchProvider implements SearchProvider {
  readonly name = 'client';
  readonly priority = 0;

  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly navItems = inject(NAV_ITEMS);
  private readonly destroyRef = inject(DestroyRef);

  /** Search index built from nav items */
  private index = signal<IndexedItem[]>([]);

  constructor() {
    // Build index on initialization
    this.rebuildIndex();

    // Rebuild index when language changes (with proper cleanup)
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.rebuildIndex();
      });
  }

  isAvailable(): boolean {
    return true;
  }

  rebuildIndex(): void {
    const navItemsIndexed = this.flattenNavItems(this.navItems);
    const deepLinks = this.processDeepLinks(getDeepLinkItems());
    const allItems = [...navItemsIndexed, ...deepLinks];
    const filteredItems = this.filterByPermissions(allItems);
    this.index.set(filteredItems);
  }

  search(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return of([]);
    }

    const normalizedQuery = query.trim().toLowerCase();
    const indexItems = this.index();
    const results: SearchResult[] = [];

    for (const item of indexItems) {
      const matchResult = this.matchItem(item, normalizedQuery);
      if (matchResult) {
        results.push(matchResult);
      }
    }

    // Sort by score (higher is better)
    results.sort((a, b) => b.score - a.score);

    // Limit results per category
    return of(results.slice(0, SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY));
  }

  private matchItem(item: IndexedItem, query: string): SearchResult | null {
    // Try matching on label first
    const labelRank = rankItem(item.label, query, { threshold: rankings.CONTAINS });

    if (labelRank.passed) {
      return this.createResult(item, labelRank.rank, MATCH_SOURCES.LABEL, query);
    }

    // Try matching on keywords
    if (item.searchMeta?.keywords) {
      for (const keyword of item.searchMeta.keywords) {
        const keywordRank = rankItem(keyword, query, { threshold: rankings.CONTAINS });
        if (keywordRank.passed) {
          return this.createResult(item, keywordRank.rank, MATCH_SOURCES.KEYWORD, query, keyword);
        }
      }
    }

    // Try matching on URL
    const urlRank = rankItem(item.url, query, { threshold: rankings.CONTAINS });
    if (urlRank.passed) {
      return this.createResult(item, urlRank.rank, MATCH_SOURCES.URL, query);
    }

    return null;
  }

  private createResult(
    item: IndexedItem,
    score: number,
    matchedOn: typeof MATCH_SOURCES[keyof typeof MATCH_SOURCES],
    query: string,
    matchedKeyword?: string
  ): SearchResult {
    const textToHighlight = matchedOn === MATCH_SOURCES.URL ? item.url : item.label;
    const highlightRanges = this.calculateHighlightRanges(textToHighlight, query);

    return {
      id: item.id,
      label: item.label,
      url: item.url,
      fragment: item.fragment,
      parentLabel: item.parentLabel,
      icon: item.icon,
      type: item.type,
      permissions: item.permissions,
      searchMeta: item.searchMeta,
      score,
      matchedOn,
      matchedKeyword,
      highlightRanges,
      source: RESULT_SOURCES.CLIENT,
    };
  }

  private calculateHighlightRanges(text: string, query: string): Array<[number, number]> {
    const ranges: Array<[number, number]> = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let startIndex = 0;
    let index: number;

    while ((index = lowerText.indexOf(lowerQuery, startIndex)) !== -1) {
      ranges.push([index, index + query.length]);
      // Skip past the matched text to avoid overlapping ranges
      startIndex = index + query.length;
    }

    return ranges;
  }

  private flattenNavItems(
    items: NavItemWithSearch[],
    parentLabel?: string
  ): IndexedItem[] {
    const result: IndexedItem[] = [];

    for (const item of items) {
      if (item.url) {
        const translatedLabel = this.translateService.instant(item.name);
        const iconName = item.iconComponent?.name;

        const indexedItem: IndexedItem = {
          id: this.generateId(item.url),
          label: translatedLabel,
          translationKey: item.name,
          url: this.normalizeUrl(item.url),
          icon: iconName,
          type: SEARCH_ITEM_TYPES.NAVIGATION,
          permissions: item.permissions,
          searchMeta: item.searchMeta,
          parentLabel,
          searchableText: `${translatedLabel} ${item.url}`.toLowerCase(),
        };

        result.push(indexedItem);
      }

      // Process children recursively
      if (item.children && item.children.length > 0) {
        const translatedParent = item.name
          ? this.translateService.instant(item.name)
          : parentLabel;
        const childItems = this.flattenNavItems(item.children, translatedParent);
        result.push(...childItems);
      }
    }

    return result;
  }

  private processDeepLinks(items: SearchableItem[]): IndexedItem[] {
    return items.map(item => {
      const translatedLabel = item.label.toLowerCase().startsWith('nav.')
        ? this.translateService.instant(item.label)
        : item.label;

      const translatedParent = item.parentLabel?.toLowerCase().startsWith('nav.')
        ? this.translateService.instant(item.parentLabel)
        : item.parentLabel;

      return {
        ...item,
        label: translatedLabel,
        parentLabel: translatedParent,
        translationKey: item.label,
        searchableText: `${translatedLabel} ${item.url}`.toLowerCase(),
      };
    });
  }

  private filterByPermissions(items: IndexedItem[]): IndexedItem[] {
    return items.filter(item => {
      // No permissions required - show to all
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // Check if user has at least one of the required permissions
      return item.permissions.some(permission =>
        this.authService.hasPermission(permission)
      );
    });
  }

  private generateId(url: string): string {
    return `nav-${url.replace(/\//g, '-').replace(/^-/, '')}`;
  }

  private normalizeUrl(url: string): string {
    // Ensure URL starts with /
    if (!url.startsWith('/')) {
      return `/${url}`;
    }
    return url;
  }
}
