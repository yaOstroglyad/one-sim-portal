import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { SimInfo } from '../model/subscriberInfo';
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
}