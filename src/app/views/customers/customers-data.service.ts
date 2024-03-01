import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { customersMock } from './customers-mock';
import { DataService } from '../../shared';
import { Customer } from '../../shared/model/customer';

@Injectable({
	providedIn: 'root'
})
export class CustomersDataService extends DataService<Customer> {
	private apiUrl = '/api/api/v1/customers/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/api/v1/customers')
	}

	list(): Observable<Customer[]> {
		return this.http.get<Customer[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of(customersMock)
			})
		);
	}
}
