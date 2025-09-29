import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Role, RolesPageResponse, CreateRoleRequest, UpdateRoleRequest } from '../models';
import { CacheHubService, DataType } from '../../../shared/services/cache-hub';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly baseUrl = '/api/v1/roles';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

  getRoles(category?: string, page: number = 0, size: number = 20, sort: string[] = []): Observable<RolesPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (category) {
      params = params.set('category', category);
    }

    if (sort.length) {
      params = params.set('sort', sort.join(','));
    }

    const cacheKey = `roles:page-${page}-${size}-${category || 'all'}-${sort.join(',')}`;
    
    return this.cacheHub.get(
      cacheKey,
      () => this.http.get<RolesPageResponse>(`${this.baseUrl}/query/all/page`, { params }),
      { dataType: DataType.BUSINESS }
    ).pipe(
      map(response => ({
        ...response,
        content: response.content.map(role => ({
          ...role,
          isProtected: role.name === 'ADMIN' ? true : role.isProtected
        }))
      }))
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.cacheHub.get(
      `roles:detail-${id}`,
      () => this.http.get<Role>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    );
  }

  createRole(request: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/create`, request).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:roles:page-*');
      })
    );
  }

  updateRole(id: string, request: UpdateRoleRequest): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}/update`, request).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:roles:page-*');
        this.cacheHub.invalidate(`default:roles:detail-${id}`);
      })
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/delete`).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:roles:page-*');
        this.cacheHub.invalidate(`default:roles:detail-${id}`);
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }
}