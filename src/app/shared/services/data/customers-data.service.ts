import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from '../core';
import { CreateCustomerCommand, Customer, CustomerType, DataObject } from '@shared/models';
import { Pagination } from '@shared/models/ui';

@Injectable({
	providedIn: 'root'
})
export class CustomersDataService extends DataService<Customer> {
	private readonly apiUrl = '/api/v1/customers/query/all';

	constructor() {
		super(inject(HttpClient), '/api/v1/customers');
	}

	list(type?: CustomerType): Observable<Customer[]> {
		let params = new HttpParams();
		if (type) {
			params = params.set('type', type);
		}

		return this.http.get<Customer[]>(this.apiUrl, {params});
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

		return this.http.get<Pagination<Customer>>('/api/v1/customers/query/all/page', {params});
	}

	getCustomerDetails(id: Customer['id']): Observable<DataObject> {
		return this.http.get<DataObject>(`/api/v1/customers/query/${id}/details`);
	}

	/**
	 * Creates a new customer via Portal API
	 * Note: Named createCustomer to avoid conflict with base DataService.create()
	 */
	createCustomer(command: CreateCustomerCommand, productId?: string): Observable<any> {
		const params = productId
			? new HttpParams().set('productId', productId)
			: undefined;
		return this.http.post<any>('/api/v1/portal/command/create-customer', command, { params });
	}
}
