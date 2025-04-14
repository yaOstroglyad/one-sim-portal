import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Package } from '../model/package';
import { DataService } from '../../shared';

@Injectable({
	providedIn: 'root'
})
export class ProductsDataService extends DataService<Package> {
	private apiUrl = '/api/v1/products/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/products');
	}

	list(): Observable<Package[]> {
		return this.http.get<Package[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	listFiltered(params: {
		serviceProviderId: string;
		customerId?: string;
		page?: number;
		size?: number;
		sort?: string[];
	}): Observable<Package[]> {
		const queryParams: any = {
			serviceProviderId: params.serviceProviderId,
			...(params.customerId && {customerId: params.customerId}),
			...(params.page != null && {page: params.page}),
			...(params.size != null && {size: params.size}),
			...(params.sort && params.sort.length > 0 && {sort: params.sort})
		};

		return this.http.get<Package[]>('/api/v1/products/query/available', {
			params: queryParams
		}).pipe(
			catchError(() => {
				console.warn('Error occurred, returning mocked data');
				return of([]);
			})
		);
	}

	create(product: any): Observable<any> {
		return this.http.post<any>(`/api/v1/products/command/create`, product).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	update(product: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/products/command/update`, product).pipe(
			catchError(() => {
				console.warn('error happened, cant update');
				return of([]);
			})
		);
	}

	updateStatus(changeStatus: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/products/command/update-status`, changeStatus).pipe(
			catchError(() => {
				console.warn('error happened, cant update status');
				return of([]);
			})
		);
	}

	getStatuses(): Observable<string[]> {
		return this.http.get<any>(`/api/v1/products/statuses`).pipe(
			catchError(() => {
				console.warn('error happened, cant get statuses');
				return of([]);
			})
		);
	}

	getCurrencies(): Observable<any> {
		return this.http.get<any>(`/api/v1/products/currency`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	getProductTemplate(params: any): Observable<any> {
		return this.http.get<any>(`/api/v1/products/command/template`, {params}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({});
			})
		);
	}

	getParentProducts(): Observable<any> {
		return this.http.get<any>(`/api/v1/products/query/parent`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({});
			})
		);
	}
}
