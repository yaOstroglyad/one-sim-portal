import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from '../core';
import { AvailableOrders, Order } from '@shared/models/payment';
import { CacheHubService, DataType } from '../cache-hub';

@Injectable({
	providedIn: 'root'
})
export class OrdersDataService extends DataService<Order> {
	private apiUrl = '/api/v1/inventory/query/orders/all';
	private readonly cacheHub = inject(CacheHubService);

	constructor(public http: HttpClient) {
		super(http, '/api/v1/inventory/query/orders')
	}

	list(): Observable<Order[]> {
		return this.cacheHub.get(
			'orders:all-orders',
			() => this.http.get<Order[]>(this.apiUrl),
			{
				dataType: DataType.BUSINESS,
				ttl: 5 * 60 * 1000 // 5 minutes - orders change frequently
			}
		);
	}

	availableOrders(): Observable<AvailableOrders[]> {
		return this.http.get<AvailableOrders[]>('/api/v1/inventory/query/orders/available');
	}

	updateDescription(param: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/inventory/command/orders/update`, param);
	}
}
