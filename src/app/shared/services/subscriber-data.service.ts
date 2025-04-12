import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { SimInfo } from '../model';
import { SubscriberStatusEvent } from '../model';
import { SimLocations } from '../model';

// Определяем интерфейс для создания подписчика
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

	// Метод для создания нового подписчика
	createSubscriber(payload: CreateSubscriberDto): Observable<any> {
		return this.http.post('/api/v1/subscribers/command/create', payload);
	}

	getSimDetails(params: {id: string}): Observable<SimInfo> {
		return this.http.get<SimInfo>(`/api/v1/sims/query/sim/details`, { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of(null);
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

	sendRegistrationEmail(subscriberId: string, email: string): Observable<any> {
		return this.http.get(`/api/v1/subscribers/send-registration-email`, {
			params: { subscriberId, email }
		}).pipe(
			catchError(() => {
				console.warn('Error sending registration email');
				return of(null);
			})
		);
	}
}
