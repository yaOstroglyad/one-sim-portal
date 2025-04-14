import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { TransactionOrder } from '../model';

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
				return of([]);
			})
		);
	}
}
