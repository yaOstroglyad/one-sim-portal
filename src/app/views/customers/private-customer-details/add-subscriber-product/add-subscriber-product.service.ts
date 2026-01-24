import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { AddSubscriberProduct, RefundableProduct, SubscriberProduct } from '@shared/models/product';
import { SelectOption } from '@shared';
import { Pagination } from '@shared/models/ui';

@Injectable({
	providedIn: 'root'
})
export class AddSubscriberProductService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = '/api/v1/products/query/subscriber';

	list(id: any, params: { page?: number; size?: number; } = {page: 0, size: 200}): Observable<SelectOption[]> {
		return this.http.get<Pagination<SubscriberProduct>>(this.apiUrl + `/${id}`, { params }).pipe(
			map((response: Pagination<SubscriberProduct>) => {
				return response.content.map((product: SubscriberProduct) => ({
					value: product,
					displayValue: this.formatDisplayValue(product)
				}));
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
		return this.http.post<any>('/api/v1/portal/command/create-product-purchase', product);
	}
}
