import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { InvoicingMethod } from '../../../shared/model/invoicing-method';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  constructor(public http: HttpClient) {}

  create(invoicingMethodForm: InvoicingMethod, accountId?: string): Observable<any> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId);
    }
    
    return this.http.post<any>('/api/v1/invoicing-method/command/create', invoicingMethodForm, { params }).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  update(invoicingMethodForm: InvoicingMethod): Observable<any> {
    return this.http.patch<any>('/api/v1/invoicing-method/command/update', invoicingMethodForm).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  updateStatus(status: {
    "id": string,
    "active": boolean
  }): Observable<any> {
    return this.http.patch<any>('/api/v1/invoicing-method/command/update-status', status).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  list(accountId?: string): Observable<InvoicingMethod[]> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId);
    }
    
    return this.http.get<InvoicingMethod[]>('/api/v1/invoicing-method/query/all', { params }).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  getInvoicingStrategyTypes(): Observable<string[]> {
    return this.http.get<string[]>('/api/v1/invoicing-method/invoicing-strategies').pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  getFieldsByStrategyType(strategyType: string): Observable<any> {
    return this.http.get<any>(`/api/v1/invoicing-method/query/fields/${strategyType}`).pipe(
      catchError(error => {
        console.error('Error fetching fields for strategy:', strategyType, error);
        return throwError(error);
      })
    );
  }
}