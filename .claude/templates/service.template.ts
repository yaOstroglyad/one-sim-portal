import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry, shareReplay, tap } from 'rxjs/operators';
// Replace with actual entity type, e.g.:
// import { Customer } from '@models/business';
// import { Product } from '@models/product';
// @ts-ignore
import { Entity } from '@models'; // Placeholder - replace with actual type
import { handleArrayError, handleObjectError, HTTP_RETRY_CONFIG, CacheHubService, DataType } from '@shared';

/**
 * Data service for [Resource] management
 *
 * Provides CRUD operations, caching, and reactive state for [Resource] entities.
 * Uses signals for reactive state management and RxJS operators for resilience.
 *
 * @example
 * ```typescript
 * // Inject the service
 * private readonly resourceService = inject(ResourceDataService);
 *
 * // Use signals for reactive UI
 * readonly resources = this.resourceService.resources;
 * readonly loading = this.resourceService.loading;
 * readonly error = this.resourceService.error;
 *
 * // Fetch data
 * this.resourceService.list().subscribe();
 *
 * // In template with signals
 * @if (loading()) {
 *   <loading-spinner />
 * } @else if (error()) {
 *   <error-display [error]="error()" />
 * } @else {
 *   @for (item of resources(); track item.id) {
 *     <resource-item [data]="item" />
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceDataService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);
  private readonly baseUrl = '/api/v1/resources';

  // Reactive state with signals
  readonly resources = signal<Entity[]>([]);
  readonly selectedResource = signal<Entity | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Fetch all resources
   * Updates resources signal on success
   */
  list(): Observable<Entity[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.cacheHub.get(
      'resources:list',
      () => this.http.get<Entity[]>(this.baseUrl),
      { dataType: DataType.BUSINESS }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay),
      tap(data => {
        this.resources.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to fetch resources');
        return handleArrayError<Entity>('fetching resources')(err);
      })
    );
  }

  /**
   * Fetch resource by ID
   * Updates selectedResource signal on success
   */
  getById(id: string): Observable<Entity | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.cacheHub.get(
      `resources:detail-${id}`,
      () => this.http.get<Entity>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay),
      tap(data => {
        this.selectedResource.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to fetch resource');
        return handleObjectError<Entity>('fetching resource by id')(err);
      })
    );
  }

  /**
   * Create new resource
   * Invalidates cache and refreshes list on success
   */
  create(resource: Entity): Observable<Entity | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Entity>(`${this.baseUrl}/create`, resource).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      tap(() => {
        this.cacheHub.invalidatePattern('default:resources:');
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to create resource');
        return handleObjectError<Entity>('creating resource')(err);
      })
    );
  }

  /**
   * Update existing resource
   * Invalidates specific cache entries on success
   */
  update(id: string, resource: Entity): Observable<Entity | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<Entity>(`${this.baseUrl}/${id}`, resource).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      tap(() => {
        this.cacheHub.invalidatePattern(`default:resources:detail-${id}`);
        this.cacheHub.invalidatePattern('default:resources:list');
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to update resource');
        return handleObjectError<Entity>('updating resource')(err);
      })
    );
  }

  /**
   * Delete resource
   * Invalidates all resource cache entries on success
   */
  delete(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      tap(() => {
        this.cacheHub.invalidatePattern('default:resources:');
        this.loading.set(false);
        // Remove from local state
        this.resources.update(items => items.filter(item => item.id !== id));
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to delete resource');
        throw err;
      })
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.resources.set([]);
    this.selectedResource.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}
