import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { providersMock } from './providers-mock';
import { Provider } from '../../shared/model/provider';
import { DataService } from '../../shared';

@Injectable({
	providedIn: 'root'
})
export class ProvidersDataService extends DataService<Provider> {
	private apiUrl = '/api/api/v1/service-providers/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/api/v1/service-providers')
	}

	list(): Observable<Provider[]> {
		return this.http.get<Provider[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of(providersMock)
			})
		);
	}
}