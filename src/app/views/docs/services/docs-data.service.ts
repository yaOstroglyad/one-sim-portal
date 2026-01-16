import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';

import { DocDocument, ProcessedDocDocument } from '../models';
import { MOCK_DOCUMENTS } from './mock-docs.data';

/**
 * Service for fetching documentation data
 * Provided at feature level (DocsLayoutComponent) to clean up when leaving /docs
 *
 * Fetches from /api/open-api/docs, falls back to mock data on error
 */
@Injectable()
export class DocsDataService {
  private readonly http = inject(HttpClient);

  // State signals
  private readonly rawDocuments = signal<DocDocument[]>([]);
  readonly isLoading = signal(false);
  readonly isUsingMock = signal(false);

  // Processed documents with extracted titles
  readonly documents = computed((): ProcessedDocDocument[] =>
    this.rawDocuments().map(doc => ({
      ...doc,
      title: this.extractTitle(doc.content)
    }))
  );

  /**
   * Load documentation from API, fallback to mock on error
   */
  getDocumentation(): Observable<DocDocument[]> {
    this.isLoading.set(true);
    this.isUsingMock.set(false);

    return this.http.get<DocDocument[]>('/api/open-api/docs').pipe(
      tap(data => {
        this.rawDocuments.set(data);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.warn('Failed to load docs from API, using mock data:', err.message);
        this.isUsingMock.set(true);
        this.rawDocuments.set(MOCK_DOCUMENTS);
        this.isLoading.set(false);
        return of(MOCK_DOCUMENTS);
      })
    );
  }

  /**
   * Get document by ID
   */
  getDocumentById(documentId: string): ProcessedDocDocument | undefined {
    return this.documents().find(doc => doc.id === documentId);
  }

  /**
   * Get first document (for default redirect)
   */
  getFirstDocument(): ProcessedDocDocument | undefined {
    return this.documents()[0];
  }

  /**
   * Extract title from markdown content (first h1)
   */
  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }
}
