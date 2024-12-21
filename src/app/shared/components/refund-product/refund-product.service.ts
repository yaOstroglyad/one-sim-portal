import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RefundableProduct } from '../../model/package';
import { SelectOption } from '../../model';
import { formatDate } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class RefundProductService {
	private apiUrl = '/api/v1/product-purchases/query/refundable';

	constructor(public http: HttpClient) {}

	list(params?: any): Observable<SelectOption[]> {
		return this.http.get<RefundableProduct[]>(this.apiUrl, {params}).pipe(
			map((products: RefundableProduct[]) => {
				return products.map((product: RefundableProduct) => ({
					value: product,
					displayValue: this.formatDisplayValue(product)
				}));
			}),
			catchError(() => {
				console.warn('Error happened, presenting mocked data');
				return of([
					{value: 1, displayValue: 'Product 1'}
				]);
			})
		);
	}

	private formatDisplayValue(product: RefundableProduct): string {
		const formattedDate = formatDate(product.purchasedAt, 'MM/dd/yyyy', 'en-US');
		return `${product.name} - ${product.price.price} ${product.price.currency} - ${formattedDate}`;
	}

	refund(productId: string): Observable<{
		transactionId: string,
		externalTransactionId: string,
		transactionStatus: string,
		redirectRef: string
	}> {
		return this.http.post<any>(`/api/v1/product-purchases/command/${productId}/refund`, {}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of();
			})
		);
	}
}
