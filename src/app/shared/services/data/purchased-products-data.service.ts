import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { ProductPurchase } from '@shared/models';
import { handleArrayError } from '../../utils';

@Injectable({
	providedIn: 'root'
})
export class PurchasedProductsDataService {
	http = inject(HttpClient);

	getPurchasedProducts(params: { subscriberId: string; isActive?: boolean }): Observable<ProductPurchase[]> {
		return this.http.get<ProductPurchase[]>(`/api/v1/product-purchases/query/all`, { params }).pipe(
			catchError(handleArrayError<ProductPurchase>('fetching purchased products'))
		);
	}
}
