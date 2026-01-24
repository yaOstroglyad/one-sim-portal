import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimInfo } from '@shared/models';
import { SubscriberStatusEvent } from '@shared/models';
import { SimLocations } from '@shared/models';

export interface CreateSubscriberDto {
	customerId: string;
	serviceProviderId?: string;
	productId: string;
	subscriberName: string;
	email: string;
}

@Injectable({
	providedIn: 'root'
})
export class SubscriberDataService {
	private readonly http = inject(HttpClient);

	createSubscriber(payload: CreateSubscriberDto): Observable<any> {
		return this.http.post('/api/v1/portal/command/create-subscriber', payload);
	}

	getSimDetails(params: {id: string}): Observable<SimInfo | null> {
		return this.http.get<SimInfo>(`/api/v1/sims/query/sim/details`, { params });
	}

	getSimLocations(id: string): Observable<SimLocations[]> {
		return this.http.get<SimLocations[]>(`/api/v1/sims/query/${id}/locations`);
	}

	getSimStatusEvents(id: string): Observable<SubscriberStatusEvent[]> {
		return this.http.get<SubscriberStatusEvent[]>(`/api/v1/sims/query/${id}/status/events`);
	}
}
