import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { Company } from '../model';

@Injectable({
	providedIn: 'root'
})
export class CompaniesDataService extends DataService<Company> {
	private apiUrl = '/api/v1/companies/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/companies');
	}

	list(): Observable<Company[]> {
		let params = new HttpParams();

		return this.http.get<Company[]>(this.apiUrl, {params}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	create(company: Company): Observable<any> {
		return this.http.post<any>(`/api/v1/companies/command/create`, company).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	paginatedCompanies(searchParams: any = {}, page: number = 0, size: number = 20, sort: string[] = []): Observable<any> {
		let params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString());

		if (sort.length) {
			params = params.set('sort', sort.join(','));
		}

		Object.keys(searchParams).forEach(key => {
			if (searchParams[key]) {
				params = params.set(key, searchParams[key]);
			}
		});

		return this.http.get<any>('/api/v1/companies/query/all/page', { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({
					totalElements: 0,
					totalPages: 0,
					content: []
				});
			})
		);
	}

	sendInviteEmail(entityId: string, email: string): Observable<any> {
		return this.http.post<any>('/api/v1/companies/send-user-registration-email', {
			entityId, email
		}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}
}
