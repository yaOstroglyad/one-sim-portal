import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductPurchase } from '@shared/models';

@Injectable({
	providedIn: 'root'
})
export class PurchasedProductsDataService {
	http = inject(HttpClient);

	getPurchasedProducts(params: { subscriberId: string; isActive?: boolean }): Observable<ProductPurchase[]> {
		return this.http.get<ProductPurchase[]>(`/api/v1/product-purchases/query/all`, { params });
	}
}
