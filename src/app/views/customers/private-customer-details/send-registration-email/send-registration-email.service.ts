import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { handleArrayError, handleObjectError } from '@shared/utils';
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
			handleArrayError<ProductPurchase>('SendRegistrationEmailService.checkActiveProducts'),
			map((products: ProductPurchase[]) => products && products.length > 0)
		);
	}

	sendEmail(params: SendRegistrationEmailParams): Observable<unknown> {
		return this.http.get('/api/v1/subscribers/send-registration-email', {
			params: { subscriberId: params.subscriberId, email: params.email }
		}).pipe(
			handleObjectError('SendRegistrationEmailService.sendEmail')
		);
	}
}
