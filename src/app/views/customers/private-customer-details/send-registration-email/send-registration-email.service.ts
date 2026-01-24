import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductPurchase } from '@shared/models';

export interface SendRegistrationEmailParams {
	subscriberId: string;
	email: string;
}

@Injectable({
	providedIn: 'root'
})
export class SendRegistrationEmailService {
	private readonly http = inject(HttpClient);

	checkActiveProducts(subscriberId: string): Observable<boolean> {
		return this.http.get<ProductPurchase[]>('/api/v1/product-purchases/query/all', {
			params: { subscriberId, isActive: 'true' }
		}).pipe(
			map((products: ProductPurchase[]) => products && products.length > 0)
		);
	}

	sendEmail(params: SendRegistrationEmailParams): Observable<unknown> {
		return this.http.post('/api/v1/portal/command/send-registration-email', params);
	}
}
