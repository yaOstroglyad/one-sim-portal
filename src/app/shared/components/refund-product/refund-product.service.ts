import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RefundableProduct } from '@shared/models/product';
import { SelectOption } from '@shared/models';
import { formatDate } from '@angular/common';

export interface RefundParams {
	simId: string;
}

export interface RefundResponse {
	transactionId: string;
	externalTransactionId: string;
	transactionStatus: string;
	redirectRef: string;
}

@Injectable({
	providedIn: 'root'
})
export class RefundProductService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = '/api/v1/product-purchases/query/refundable';

	list(params: RefundParams): Observable<SelectOption[]> {
		return this.http.get<RefundableProduct[]>(this.apiUrl, {
			params: { simId: params.simId }
		}).pipe(
			map((products: RefundableProduct[]) =>
				products.map((product: RefundableProduct) => ({
					value: product,
					displayValue: this.formatDisplayValue(product)
				}))
			)
		);
	}

	refund(productId: string): Observable<RefundResponse> {
		return this.http.post<RefundResponse>(
			`/api/v1/product-purchases/command/${productId}/refund`,
			{}
		);
	}

	private formatDisplayValue(product: RefundableProduct): string {
		const formattedDate = formatDate(product.purchasedAt, 'MM/dd/yyyy', 'en-US');
		return `${product.name} - ${product.price.price} ${product.price.currency} - ${formattedDate}`;
	}
}
