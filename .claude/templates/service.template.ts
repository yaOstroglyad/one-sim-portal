import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Entity } from '@models';
import { handleArrayError, handleObjectError } from '@shared/utils';
import { CacheHubService, DataType } from '@shared/services';

/**
 * Data service for [Resource] management
 *
 * Provides CRUD operations and caching for [Resource] entities
 *
 * @example
 * ```typescript
 * const service = inject(ResourceDataService);
 * service.list().subscribe(items => console.log(items));
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceDataService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);
  private readonly baseUrl = '/api/v1/resources';

  /**
   * Fetch all resources
   */
  list(): Observable<Entity[]> {
    return this.cacheHub.get(
      'resources:list',
      () => this.http.get<Entity[]>(this.baseUrl),
      { dataType: DataType.BUSINESS }
    ).pipe(
      catchError(handleArrayError<Entity>('fetching resources'))
    );
  }

  /**
   * Fetch resource by ID
   */
  getById(id: string): Observable<Entity | null> {
    return this.cacheHub.get(
      `resources:detail-${id}`,
      () => this.http.get<Entity>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    ).pipe(
      catchError(handleObjectError<Entity>('fetching resource by id'))
    );
  }

  /**
   * Create new resource
   */
  create(resource: Entity): Observable<Entity | null> {
    return this.http.post<Entity>(`${this.baseUrl}/create`, resource).pipe(
      tap(() => this.cacheHub.invalidatePattern('default:resources:')),
      catchError(handleObjectError<Entity>('creating resource'))
    );
  }

  /**
   * Update existing resource
   */
  update(id: string, resource: Entity): Observable<Entity | null> {
    return this.http.put<Entity>(`${this.baseUrl}/${id}`, resource).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern(`default:resources:detail-${id}`);
        this.cacheHub.invalidatePattern('default:resources:list');
      }),
      catchError(handleObjectError<Entity>('updating resource'))
    );
  }

  /**
   * Delete resource
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.cacheHub.invalidatePattern('default:resources:'))
    );
  }
}
