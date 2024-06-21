import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { Customer } from '../model/customer';
import { customersMock } from '../../views/customers/customers-mock';

@Injectable({
	providedIn: 'root'
})
export class CustomersDataService extends DataService<Customer> {
	private apiUrl = '/api/v1/customers/query/all/corporate';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/customers')
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
