import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { Domain } from '../model/domain';
import { SelectOption } from '../model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DomainsDataService extends DataService<Domain> {
  private apiUrl = '/api/v1/whitelabel/domains/query/all';

  constructor(public http: HttpClient) {
    super(http, '/api/v1/whitelabel/domains');
  }

  list(): Observable<Domain[]> {
    let params = new HttpParams();

    return this.http.get<Domain[]>(this.apiUrl, {params}).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([]);
      })
    );
  }

  paginatedDomains(searchParams: any = {}, page: number = 0, size: number = 20, sort: string[] = []): Observable<any> {
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

    return this.http.get<any>('/api/v1/whitelabel/domains/query/all/page', { params }).pipe(
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

  create(domain: Domain): Observable<any> {
    return this.http.post<any>(`/api/v1/whitelabel/domains/command/create`, domain).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([]);
      })
    );
  }

  updateDomainName(domain: { id: string, name: string }): Observable<any> {
    return this.http.patch<any>(`/api/v1/whitelabel/domains/command/update/name`, domain).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([]);
      })
    );
  }

  updateDomainOwner(domain: { id: string, ownerAccountId: string }): Observable<any> {
    return this.http.patch<any>(`/api/v1/whitelabel/domains/command/update/owner`, domain).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([]);
      })
    );
  }

  changeDomainState(id: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`/api/v1/whitelabel/domains/command/change/state/${id}?isActive=${isActive}`, {}).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([]);
      })
    );
  }
}
