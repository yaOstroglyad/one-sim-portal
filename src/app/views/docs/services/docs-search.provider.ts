import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SearchProvider } from '@shared/services/search/providers/search-provider.interface';
import { SearchResult, SEARCH_ITEM_TYPES, MATCH_SOURCES, RESULT_SOURCES } from '@shared/models/search';
import { DocsDataService } from './docs-data.service';
import { ProcessedDocDocument } from '../models';

/**
 * Internal search index item
 */
interface SearchIndexItem {
  id: string;
  title: string;
  url: string;
  fragment?: string;
  parentTitle?: string;
  level: number;
  titleLower: string;
}

/**
 * Search provider for documentation content
 * Integrates with global search (Cmd+K)
 * Indexes documents AND sections (h2, h3) for deep linking
 */
@Injectable()
export class DocsSearchProvider implements SearchProvider {
  private readonly docsDataService = inject(DocsDataService);

  readonly name = 'docs';
  readonly priority = 10;

  private searchIndex: SearchIndexItem[] = [];

  /**
   * Execute search over documentation content
   */
  search(query: string): Observable<SearchResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    this.ensureIndexBuilt();

    const normalizedQuery = query.toLowerCase().trim();
    const results = this.performSearch(normalizedQuery);

    return of(results);
  }

  /**
   * Check if provider is available
   */
  isAvailable(): boolean {
    return this.docsDataService.documents().length > 0;
  }

  /**
   * Rebuild the search index when documentation changes
   */
  rebuildIndex(): void {
    this.searchIndex = [];
    this.buildIndex();
  }

  /**
   * Ensure index is built before searching
   */
  private ensureIndexBuilt(): void {
    if (this.searchIndex.length === 0) {
      this.buildIndex();
    }
  }

  /**
   * Build search index from documentation documents and their sections
   */
  private buildIndex(): void {
    const docs = this.docsDataService.documents();
    if (docs.length === 0) return;

    this.searchIndex = [];

    for (const doc of docs) {
      // Index the document itself
      this.searchIndex.push({
        id: doc.id,
        title: doc.title,
        url: `/docs/${doc.id}`,
        level: 1,
        titleLower: doc.title.toLowerCase(),
      });

      // Index all sections (h2, h3) from the document
      const sections = this.extractSections(doc);
      this.searchIndex.push(...sections);
    }
  }

  /**
   * Extract sections (h2, h3) from document content
   */
  private extractSections(doc: ProcessedDocDocument): SearchIndexItem[] {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const sections: SearchIndexItem[] = [];
    let match;

    while ((match = headingRegex.exec(doc.content)) !== null) {
      const level = match[1].length; // 2 for h2, 3 for h3
      const title = match[2].trim();
      const fragment = this.generateFragmentId(title);

      sections.push({
        id: `${doc.id}-${fragment}`,
        title,
        url: `/docs/${doc.id}`,
        fragment,
        parentTitle: doc.title,
        level,
        titleLower: title.toLowerCase(),
      });
    }

    return sections;
  }

  /**
   * Generate fragment ID from heading title
   */
  private generateFragmentId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Perform search over indexed content
   */
  private performSearch(query: string): SearchResult[] {
    const results: Array<{ item: SearchIndexItem; score: number }> = [];

    for (const item of this.searchIndex) {
      const score = this.calculateScore(item, query);
      if (score > 0) {
        results.push({ item, score });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 15).map(({ item, score }) => this.toSearchResult(item, score, query));
  }

  /**
   * Calculate relevance score for an item
   */
  private calculateScore(item: SearchIndexItem, query: string): number {
    let score = 0;
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);

    // Title exact match (highest priority)
    if (item.titleLower === query) {
      score += 100;
    } else if (item.titleLower.startsWith(query)) {
      score += 80;
    } else if (item.titleLower.includes(query)) {
      score += 60;
    } else if (queryWords.every(word => item.titleLower.includes(word))) {
      score += 40;
    } else {
      const matchedWords = queryWords.filter(word => item.titleLower.includes(word));
      if (matchedWords.length > 0) {
        score += matchedWords.length * 10;
      }
    }

    // Boost document-level items (h1)
    if (item.level === 1) {
      score += 10;
    }

    return score;
  }

  /**
   * Convert internal item to SearchResult
   */
  private toSearchResult(item: SearchIndexItem, score: number, query: string): SearchResult {
    return {
      id: `docs-${item.id}`,
      label: item.title,
      parentLabel: item.parentTitle,
      url: item.url,
      fragment: item.fragment,
      icon: 'cilBook',
      type: SEARCH_ITEM_TYPES.NAVIGATION,
      score,
      matchedOn: item.titleLower.includes(query) ? MATCH_SOURCES.LABEL : MATCH_SOURCES.KEYWORD,
      source: RESULT_SOURCES.CLIENT,
      searchMeta: {
        category: 'Documentation',
      },
    };
  }
}
