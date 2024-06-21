import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root'
})
export class ProviderBundlesDataService extends DataService<any> {
	private apiUrl = '/api/v1/';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/')
	}

	list(): Observable<any> {
		return this.http.get<any>('/api/v1/provider-bundles/query/all').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({})
			})
		);
	}
}
