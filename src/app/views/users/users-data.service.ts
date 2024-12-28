import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService, User } from '../../shared';

@Injectable({
  providedIn: 'root'
})
export class UsersDataService extends DataService<User> {
  private apiUrl = '/api/v1/users/query/all';

  constructor(public http: HttpClient) {
    super(http, '/api/v1/users');
  }

  list(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([]);
      })
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

    return this.http.get<any>('/api/v1/users/query/all', { params }).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of({
          totalElements: 0,
          totalPages: 0,
          content: []
        });
      })
    );
  }

	createUser(user: User): Observable<User> {
    console.log('user', user);
		return this.http.post<User>(`/api/v1/users/command/create?accountId=${user.accountId}`, user);
	}

  public verifyEmail(email: string): Observable<{ isExist: boolean }> {
    // return of({isExist: false})
    return this.http.get<{ isExist: boolean }>(`/api/v1/users/query/verify-user`, {
      params: { email }
    });
  }
}
