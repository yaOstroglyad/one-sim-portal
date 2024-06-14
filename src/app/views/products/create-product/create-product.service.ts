import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from '../../../shared';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class CreateProductService extends DataService<any>  {
	constructor(public http: HttpClient) {
		super(http, '/api/product') // unnecessary url
	}

	// "unitType": "string" - GET /api/v1/provider-bundles/usage/types
	// "timeUnit": - GET /api/v1/provider-bundles/validity/timeunits

	getUnitTypes(): Observable<any> {
		return this.http.get<any>('/api/v1/provider-bundles/usage/types').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	getTimeUnits(): Observable<any> {
		return this.http.get<any>('/api/v1/provider-bundles/validity/timeunits').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}
}
