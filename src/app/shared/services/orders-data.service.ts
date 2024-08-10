import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { AvailableOrders, Order } from '../model/order';
import { ordersMock } from '../../views/orders/orders-mock';

@Injectable({
	providedIn: 'root'
})
export class OrdersDataService extends DataService<Order> {
	private apiUrl = '/api/v1/inventory/query/orders/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/inventory/query/orders')
	}

	list(): Observable<Order[]> {
		return this.http.get<Order[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of(ordersMock);
			})
		);
	}

	availableOrders(): Observable<AvailableOrders[]> {
		return this.http.get<AvailableOrders[]>('/api/v1/inventory/query/orders/available').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	updateDescription(param: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/inventory/command/orders/update`, param).pipe(
			catchError(() => {
				console.warn('error happened, cant update status');
				return of([])
			})
		);
	}
}
