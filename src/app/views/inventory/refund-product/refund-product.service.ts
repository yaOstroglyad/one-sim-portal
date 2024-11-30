import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class RefundProductService {
	private apiUrl = '/api/v1/get-refundable-products';

	constructor(public http: HttpClient) {}

	list(params?: any): Observable<any> {
		return this.http.get<any>(this.apiUrl, { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([{
					value: 1, displayValue: 'Product 1'
				}])
			})
		);
	}

	refund(product) {
		return this.http.post<any>('/api/v1/refund', { product }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of();
			})
		);
	}
}
