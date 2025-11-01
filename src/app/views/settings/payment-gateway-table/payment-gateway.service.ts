import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { PaymentStrategy } from '../../../shared';
import { handleArrayError, handleObjectError, transformHttpError } from '../../../shared';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  constructor(public http: HttpClient) {}

  create(paymentGatewayForm: PaymentStrategy, accountId?: string): Observable<any> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId);
    }

    return this.http.post<any>('/api/v1/payment-method/command/create', paymentGatewayForm, { params }).pipe(
      catchError(handleObjectError('creating payment gateway'))
    );
  }

  update(paymentGatewayForm: PaymentStrategy): Observable<any> {
    return this.http.patch<any>('/api/v1/payment-method/command/update', paymentGatewayForm).pipe(
      catchError(handleObjectError('updating payment gateway'))
    );
  }

  updateStatus(status: {
    "id": string,
    "active": boolean
  }): Observable<any> {
    return this.http.patch<any>('/api/v1/payment-method/command/update-status', status).pipe(
      catchError(handleObjectError('updating payment gateway status'))
    );
  }

  list(accountId?: string): Observable<PaymentStrategy[]> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId);
    }

    return this.http.get<PaymentStrategy[]>('/api/v1/payment-method/query/all', { params }).pipe(
      catchError(handleArrayError('fetching payment gateways'))
    );
  }

  getPaymentStrategyTypes(): Observable<string[]> {
    return this.http.get<string[]>('/api/v1/payment-method/payment-strategies').pipe(
      catchError(handleArrayError('fetching payment strategy types'))
    );
  }

  getFieldsByStrategyType(strategyType: string): Observable<any> {
    return this.http.get<any>(`/api/v1/payment-method/query/fields/${strategyType}`).pipe(
      catchError(error => {
        const apiError = transformHttpError(error);
        console.error('Error fetching payment strategy fields:', apiError);
        return throwError(() => apiError);
      })
    );
  }
}
