import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import {
  InvoicingMethod,
  transformHttpError
} from '@shared';

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

    return this.http.post<any>('/api/v1/invoicing-method/command/create', invoicingMethodForm, { params });
  }

  update(invoicingMethodForm: InvoicingMethod): Observable<any> {
    return this.http.patch<any>('/api/v1/invoicing-method/command/update', invoicingMethodForm);
  }

  updateStatus(status: {
    "id": string,
    "active": boolean
  }): Observable<any> {
    return this.http.patch<any>('/api/v1/invoicing-method/command/update-status', status);
  }

  list(accountId?: string): Observable<InvoicingMethod[]> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId);
    }

    return this.http.get<InvoicingMethod[]>('/api/v1/invoicing-method/query/all', { params });
  }

  getInvoicingStrategyTypes(): Observable<string[]> {
    return this.http.get<string[]>('/api/v1/invoicing-method/invoicing-strategies');
  }

  getFieldsByStrategyType(strategyType: string): Observable<any> {
    return this.http.get<any>(`/api/v1/invoicing-method/query/fields/${strategyType}`).pipe(
      catchError(error => {
        const apiError = transformHttpError(error);
        console.error('Error fetching invoicing strategy fields:', apiError);
        return throwError(() => apiError);
      })
    );
  }
}
