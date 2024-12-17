import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { SimInfo } from '../model/subscriberInfo';
import { CustomerType } from '../model/customer';
import { SubscriberStatusEvent } from '../model/subscriberStatusEvent';
import { SimLocations } from '../model/sim';

@Injectable({
	providedIn: 'root'
})
export class SubscriberDataService {
	http = inject(HttpClient);

	getSimDetails(params: {id: string}): Observable<SimInfo> {
		return this.http.get<SimInfo>(`/api/v1/sims/query/sim/details`, { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({
					createdAt: '2024-12-14T10:15:30.000Z',
					createdBy: 'admin',
					customer: {
						id: 'cust-12345',
						name: 'Tech Solutions',
						description: 'A leading provider of technology solutions.',
						type: CustomerType.Corporate,
						status: 'Active'
					},
					externalReferenceId: 'ext-ref-98765',
					iccid: '893710310000088713',
					id: 'sim-54321',
					imei: '359879000000012',
					imsi: '310150123456789',
					msisdn: '1234567890',
					networkStatus: 'REGISTERED',
					qrCode: 'LPA:1$dp-plus-par07-01.oasis-smartsim.com$17030-68480-563YA-UWV3X$1.3.6.1.4.1.53460.7.5.1.1',
					serviceProvider: {
						id: 'provider-001',
						name: 'Global Telecom',
						country: 'USA',
						networkCode: '310-150'
					},
					status: 'ACTIVE',
					updatedAt: '2024-12-14T12:45:00.000Z',
					updatedBy: 'john.doe'
				});
			})
		);
	}

	getSimLocations(id: string): Observable<SimLocations[]> {
		return this.http.get<SimLocations[]>(`/api/v1/sims/query/${id}/locations`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	getSimStatusEvents(id: string): Observable<SubscriberStatusEvent[]> {
		return this.http.get<SubscriberStatusEvent[]>(`/api/v1/sims/query/${id}/status/events`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}
}
