import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RefundableProduct } from '../../model/package';
import { SelectOption } from '../../model/field-config';

@Injectable({
	providedIn: 'root'
})
export class RefundProductService {
	private apiUrl = '/api/v1/product-purchases/query/refundable';

	constructor(public http: HttpClient) {}

	list(params?: any): Observable<SelectOption[]> {
		return this.http.get<RefundableProduct[]>(this.apiUrl, { params }).pipe(
			map((products: RefundableProduct[]) => {
				return products.map((product: RefundableProduct) => ({
					value: product,
					displayValue: product.name
				}));
			}),
			catchError(() => {
				console.warn('Error happened, presenting mocked data');
				return of([
					{ value: 1, displayValue: 'Product 1' }
				]);
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
