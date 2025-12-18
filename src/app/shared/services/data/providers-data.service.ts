import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '@shared/models/business';
import { DataService } from '../core';

@Injectable({
	providedIn: 'root'
})
export class ProvidersDataService extends DataService<Provider> {
	private apiUrl = '/api/v1/service-providers/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/service-providers')
	}

	list(): Observable<Provider[]> {
		return this.http.get<Provider[]>(this.apiUrl);
	}
}
