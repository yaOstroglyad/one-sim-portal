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
	private apiUrl = '/api/api/v1/resource/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/api/v1/resource')
	}

	list(): Observable<Resource[]> {
		return this.http.get<Resource[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of(resourcesMock)
			})
		);
	}
}
