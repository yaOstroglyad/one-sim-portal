import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { Provider } from '../model/provider';
import { DataService } from '../index';
import { handleArrayError } from '../utils';

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
			catchError(handleArrayError('fetching service providers'))
		);
	}
}
