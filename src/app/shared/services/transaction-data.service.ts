import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { SimInfo } from '../model/subscriberInfo';
import { TransactionOrder } from '../model/purchaseHistory';

@Injectable({
	providedIn: 'root'
})
export class TransactionDataService {
	http = inject(HttpClient);

	getTransactions(customerId: string, subscriberId?: string): Observable<TransactionOrder[]> {
		const params: { customerId: string; subscriberId?: string } = { customerId };

		if (subscriberId) {
			params.subscriberId = subscriberId;
		}

		return this.http.get<TransactionOrder[]>(`/api/v1/transaction-orders/query/all`, { params }).pipe(
			catchError(() => {
				console.warn('Error occurred, presenting mocked data');
				return of([
					{
						type: 'Purchase',
						status: 'Completed',
						data: { productId: '12345', amount: 50 },
						createdAt: '2024-12-14T10:00:00.000Z',
						createdBy: 'admin',
						updatedAt: '2024-12-14T12:00:00.000Z',
						updatedBy: 'system',
						externalTransactionId: 'ext-12345',
						triggerType: 'UserAction'
					},
					{
						type: 'Refund',
						status: 'Pending',
						data: { productId: '67890', refundAmount: 25 },
						createdAt: '2024-12-13T15:30:00.000Z',
						createdBy: 'user123',
						updatedAt: '2024-12-13T16:00:00.000Z',
						updatedBy: 'supportAgent',
						externalTransactionId: 'ext-67890',
						triggerType: 'SystemTriggered'
					},
					{
						type: 'Upgrade',
						status: 'InProgress',
						data: { oldPlanId: 'plan123', newPlanId: 'plan456' },
						createdAt: '2024-12-12T09:00:00.000Z',
						createdBy: 'user456',
						updatedAt: '2024-12-12T11:00:00.000Z',
						updatedBy: 'system',
						externalTransactionId: 'ext-98765',
						triggerType: 'UserAction'
					}
				]);
			})
		);
	}
}
