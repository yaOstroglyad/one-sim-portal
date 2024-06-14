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

	create(product: any): Observable<any> {
		return this.http.post<any>(`/api/v1/products/command/create`, product).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	update(product: any): Observable<any> {
		return this.http.post<any>(`/api/v1/products/command/create`, product).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	getCurrencies(): Observable<any> {
		return this.http.get<any>(`/api/v1/products/currency`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	getProductTemplate(bundleId?: string, productId?: string): Observable<any> {
		let params: any = {};

		if (bundleId) {
			params.bundleId = bundleId;
		}
		if (productId) {
			params.productId = productId;
		}

		return this.http.get<any>(`/api/v1/products/command/template`, { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({})
			})
		);
	}
}
