import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { ProductPurchase } from '../model';

@Injectable({
	providedIn: 'root'
})
export class PurchasedProductsDataService {
	http = inject(HttpClient);

	getPurchasedProducts(params: { subscriberId: string }): Observable<ProductPurchase[]> {
		return this.http.get<ProductPurchase[]>(`/api/v1/product-purchases/query/all`, { params }).pipe(
			catchError(() => {
				console.warn('Error occurred, presenting mocked data');
				return of(null);
			})
		);
	}
}
