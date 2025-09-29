import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService, User } from '../../../shared';
import { CreateUserRequest, UpdateUserRequest } from '../models';
import { MockedService } from '../../../shared/decorators/mock.decorator';
import { CacheHubService, DataType } from '../../../shared/services/cache-hub';

@Injectable({
  providedIn: 'root'
})
@MockedService({
  endpoints: ['list', 'paginatedUsers', 'createUser', 'verifyEmail']
})
export class UserService extends DataService<User> {
  private apiUrl = '/api/v1/users/query/all';

  constructor(
    public http: HttpClient,
    private cacheHub: CacheHubService
  ) {
    super(http, '/api/v1/users');
  }

  list(params?: any): Observable<any> {
    const cacheKey = `users:list-${JSON.stringify(params || {})}`;
    
    return this.cacheHub.get(
      cacheKey,
      () => this.http.get<any>(this.apiUrl, { params }).pipe(
        catchError(() => {
          console.warn('error happened, presenting mocked data');
          return of([]);
        })
      ),
      { dataType: DataType.BUSINESS }
    );
  }

  paginatedUsers(searchParams: any = {}, page: number = 0, size: number = 20, sort: string[] = []): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort.length) {
      params = params.set('sort', sort.join(','));
    }

    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        params = params.set(key, searchParams[key]);
      }
    });

    const cacheKey = `users:page-${page}-${size}-${JSON.stringify(searchParams)}-${sort.join(',')}`;
    
    return this.cacheHub.get(
      cacheKey,
      () => this.http.get<any>('/api/v1/users/query/all', { params }).pipe(
        catchError(() => {
          console.warn('error happened, presenting mocked data');
          return of({
            totalElements: 0,
            totalPages: 0,
            content: []
          });
        })
      ),
      { dataType: DataType.BUSINESS }
    );
  }

  createUser(user: User | CreateUserRequest): Observable<User> {
    console.log('user', user);
    return this.http.post<User>(`/api/v1/users/command/create?accountId=${user.accountId}`, user).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:users:page-*');
        this.cacheHub.invalidatePattern('default:users:list-*');
      })
    );
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`/api/v1/users/${id}/update`, user).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:users:page-*');
        this.cacheHub.invalidatePattern('default:users:list-*');
        this.cacheHub.invalidate(`default:users:detail-${id}`);
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${id}/delete`).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:users:page-*');
        this.cacheHub.invalidatePattern('default:users:list-*');
        this.cacheHub.invalidate(`default:users:detail-${id}`);
      })
    );
  }

  resetPassword(id: string): Observable<void> {
    return this.http.post<void>(`/api/v1/users/${id}/reset-password`, {});
  }

  public verifyEmail(email: string): Observable<{ isExist: boolean }> {
    return this.http.get<{ isExist: boolean }>(`/api/v1/users/query/verify-user`, {
      params: { email }
    });
  }

  assignRoles(userId: string, roleIds: string[]): Observable<void> {
    return this.http.post<void>(`/api/v1/users/${userId}/roles/assign`, { roleIds }).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:users:page-*');
        this.cacheHub.invalidatePattern('default:users:list-*');
        this.cacheHub.invalidate(`default:users:detail-${userId}`);
      })
    );
  }

  removeRoles(userId: string, roleIds: string[]): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${userId}/roles/remove`, { 
      body: { roleIds }
    }).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern('default:users:page-*');
        this.cacheHub.invalidatePattern('default:users:list-*');
        this.cacheHub.invalidate(`default:users:detail-${userId}`);
      })
    );
  }
}