import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { PaymentStrategies } from '../../../shared/model/payment-strategies';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  constructor(public http: HttpClient) {}



  create(paymentGatewayForm: PaymentStrategies): Observable<any> {
    return this.http.post<any>('/api/v1/payment-method/command/create', paymentGatewayForm).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  update(paymentGatewayForm: PaymentStrategies): Observable<any> {
    return this.http.patch<any>('/api/v1/payment-method/command/update', paymentGatewayForm).pipe(
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
    return this.http.patch<any>('/api/v1/payment-method/command/update-status', status).pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  list(): Observable<PaymentStrategies[]> {
    return this.http.get<PaymentStrategies[]>('/api/v1/payment-method/query/all').pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  getPaymentStrategyTypes(): Observable<string[]> {
    return this.http.get<string[]>('/api/v1/customers/payment-strategies').pipe(
      catchError(() => {
        console.warn('error happened, presenting mocked data');
        return of([])
      })
    );
  }

  getFieldsByStrategyType(strategyType: string): Observable<any> {
    return this.http.get<any>(`/api/v1/payment-method/query/fields/${strategyType}`).pipe(
      catchError(error => {
        console.error('Error fetching fields:', error);
        return throwError(error);
      })
    );
  }
}
