import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from '../../shared';
import { Resource } from '../../shared/model/resource';
import { resourcesMock } from './resources-mock';

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
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}
}
