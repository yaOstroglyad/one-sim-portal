import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { packagesMock } from './products-mock';
import { Package } from '../../shared/model/package';

@Injectable({
	providedIn: 'root'
})
export class ProductsDataService {
	private apiUrl = 'url_to_your_api_endpoint';

	constructor(private http: HttpClient) {}

	getData(): Observable<Package[]> {
		// return throwError(() => new Error('Internal Server Error'));
		return of(packagesMock);
		// return this.http.get<Provider[]>(this.apiUrl);
	}
}
