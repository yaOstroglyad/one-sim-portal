import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { DataService, handleArrayError } from '@shared';
import { Resource } from '@shared/model/resource';

@Injectable({
	providedIn: 'root'
})
export class InventoryDataService extends DataService<Resource> {
	private apiUrl = '/api/v1/sims/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/resource')
	}

	list(params?: any): Observable<any> {
		return this.http.get<any>(this.apiUrl, { params }).pipe(
			catchError(handleArrayError('fetching inventory'))
		);
	}
}
