import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { AddSubscriberProduct, RefundableProduct, SubscriberProduct } from '../../../../shared/model/package';
import { SelectOption } from '../../../../shared';
import { Pagination } from '../../../../shared/model/grid-configs';

@Injectable({
	providedIn: 'root'
})
export class AddSubscriberProductService {
	private apiUrl = '/api/v1/products/query/subscriber';

	constructor(public http: HttpClient) {}

	list(id: any, params: { page?: number; size?: number; } = {page: 0, size: 100}): Observable<SelectOption[]> {
		return this.http.get<Pagination<SubscriberProduct>>(this.apiUrl + `/${id}`, { params }).pipe(
			map((response: Pagination<SubscriberProduct>) => {
				return response.content.map((product: SubscriberProduct) => ({
					value: product,
					displayValue: this.formatDisplayValue(product)
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


	private formatDisplayValue(product: RefundableProduct | SubscriberProduct): string {
		let price: number;
		let currency: string;
		let formattedDate = '';

		if ('price' in product && typeof product.price === 'object') {
			price = product.price.price;
			currency = product.price.currency;
		} else {
			price = product.price as number;
			currency = (product as SubscriberProduct).currency;
		}

		if ('purchasedAt' in product) {
			formattedDate = ` - ${formatDate(product.purchasedAt, 'MM/dd/yyyy', 'en-US')}`;
		}

		return `${product.name} - ${price} ${currency}${formattedDate}`;
	}

	addProduct(product: AddSubscriberProduct): Observable<{
		code: number,
		message: string
	}> {
		return this.http.post<any>(`/api/v1/product-purchases/command/create`, product).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of();
			})
		);
	}
}
