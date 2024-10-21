import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { Customer, CustomerType } from '../model/customer';

@Injectable({
	providedIn: 'root'
})
export class CustomersDataService extends DataService<Customer> {
	private apiUrl = '/api/v1/customers/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/customers')
	}

	list(type?: CustomerType): Observable<Customer[]> {
		let params = new HttpParams();
		if (type) {
			params = params.set('type', type);
		}

		return this.http.get<Customer[]>(this.apiUrl, { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	create(customer: Customer): Observable<any> {
		return this.http.post<any>(`/api/v1/customers/command/create`, customer).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	reSendInviteEmail(entityId: string, email: string): Observable<any> {
		return this.http.post<any>('/api/v1/customers/send-user-registration-email', {
			entityId, email
		}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}
}
