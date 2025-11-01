import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { SimInfo } from '../model';
import { SubscriberStatusEvent } from '../model';
import { SimLocations } from '../model';
import { handleArrayError, handleObjectError } from '../utils';

export interface CreateSubscriberDto {
	customerId: string;
	serviceProviderId: string;
	productId: string;
	subscriberName: string;
	email: string;
}

@Injectable({
	providedIn: 'root'
})
export class SubscriberDataService {
	http = inject(HttpClient);

	createSubscriber(payload: CreateSubscriberDto): Observable<any> {
		return this.http.post('/api/v1/subscribers/command/create', payload);
	}

	getSimDetails(params: {id: string}): Observable<SimInfo | null> {
		return this.http.get<SimInfo>(`/api/v1/sims/query/sim/details`, { params }).pipe(
			catchError(handleObjectError<SimInfo>('fetching SIM details'))
		);
	}

	getSimLocations(id: string): Observable<SimLocations[]> {
		return this.http.get<SimLocations[]>(`/api/v1/sims/query/${id}/locations`).pipe(
			catchError(handleArrayError('fetching SIM locations'))
		);
	}

	getSimStatusEvents(id: string): Observable<SubscriberStatusEvent[]> {
		return this.http.get<SubscriberStatusEvent[]>(`/api/v1/sims/query/${id}/status/events`).pipe(
			catchError(handleArrayError('fetching SIM status events'))
		);
	}

	sendRegistrationEmail(subscriberId: string, email: string): Observable<any> {
		return this.http.get(`/api/v1/subscribers/send-registration-email`, {
			params: { subscriberId, email }
		}).pipe(
			catchError(handleObjectError('sending registration email'))
		);
	}
}
