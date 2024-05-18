import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { packagesMock } from './products-mock';
import { Package } from '../../shared/model/package';
import { DataService } from '../../shared';

@Injectable({
	providedIn: 'root'
})
export class ProductsDataService extends DataService<Package>{
	private apiUrl = '/api/v1/products/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/products')
	}

	list(): Observable<Package[]> {
		return this.http.get<Package[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of(packagesMock)
			})
		);
	}
}
