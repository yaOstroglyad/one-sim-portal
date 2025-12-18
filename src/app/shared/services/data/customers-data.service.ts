import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from '../core';
import { Customer, CustomerType, DataObject } from '@shared/models';
import { Pagination } from '@shared/models/ui';
import { handleArrayError, handleObjectError, handleWithDefault } from '../../utils';

@Injectable({
	providedIn: 'root'
})
export class CustomersDataService extends DataService<Customer> {
	private apiUrl = '/api/v1/customers/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/customers');
	}

	list(type?: CustomerType): Observable<Customer[]> {
		let params = new HttpParams();
		if (type) {
			params = params.set('type', type);
		}

		return this.http.get<Customer[]>(this.apiUrl, {params}).pipe(
			handleArrayError('fetching customers list')
		);
	}

	paginatedCustomers(searchParams: any = {},
										 page: number = 0,
										 size: number = 15,
										 sort: string[] = []): Observable<Pagination<Customer>> {
		let params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString());

		if (sort.length) {
			params = params.set('sort', sort.join(','));
		}

		Object.keys(searchParams).forEach(key => {
			if (searchParams[key]) {
				params = params.set(key, searchParams[key]);
			}
		});

		return this.http.get<any>('/api/v1/customers/query/all/page', {params}).pipe(
			handleWithDefault('fetching paginated customers', {
				totalElements: 0,
				totalPages: 0,
				content: []
			})
		);
	}

	getCustomerDetails(id: Customer['id']): Observable<DataObject | null> {
		return this.http.get<DataObject>(`/api/v1/customers/query/${id}/details`).pipe(
			handleObjectError<DataObject>('fetching customer details')
		);
	}

	create(customer: Customer): Observable<any> {
		return this.http.post<any>(`/api/v1/customers/command/create`, customer).pipe(
			handleObjectError('creating customer')
		);
	}
}
