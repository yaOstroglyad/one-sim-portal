import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { providersMock } from '../../views/providers/providers-mock';
import { Provider } from '../model/provider';
import { DataService } from '../index';

@Injectable({
	providedIn: 'root'
})
export class ProvidersDataService extends DataService<Provider> {
	private apiUrl = '/api/v1/service-providers/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/service-providers')
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
