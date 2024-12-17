import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { Customer, CustomerType, DataObject } from '../model/customer';

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
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	getCustomerDetails(id: Customer['id']): Observable<DataObject> {
		return this.http.get<DataObject>(`/api/v1/customers/query/${id}/details`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of( {
					customer: {
						id: '12345',
						name: 'Acme Corporation',
						description: 'A global leader in advanced technology.',
						type: CustomerType.Corporate,
						status: 'Active',
						parentCustomer: {
							id: '54321',
							name: 'Global Holdings'
						},
						tags: ['Technology', 'Enterprise', 'Innovation']
					},
					subscribers: [
						{
							id: 'sub-001',
							name: 'John Doe',
							status: 'Active',
							externalId: 'ext-12345',
							providerData: {
								additionalProp1: 'Some value',
								additionalProp2: 'Another value',
								additionalProp3: 'Yet another value'
							},
							simId: 'sim-001',
							isPrimary: true,
							createdAt: '2024-12-14T20:36:51.076Z'
						},
						{
							id: 'sub-002',
							name: 'Jane Smith',
							status: 'Inactive',
							externalId: 'ext-54321',
							providerData: {
								additionalProp1: 'Example value 1',
								additionalProp2: 'Example value 2',
								additionalProp3: 'Example value 3'
							},
							simId: 'sim-002',
							isPrimary: false,
							createdAt: '2024-11-10T15:25:34.123Z'
						}
					]
				});
			})
		);
	}

	create(customer: Customer): Observable<any> {
		return this.http.post<any>(`/api/v1/customers/command/create`, customer).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	reSendInviteEmail(entityId: string, email: string): Observable<any> {
		return this.http.post<any>('/api/v1/customers/send-user-registration-email', {
			entityId, email
		}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}
}
