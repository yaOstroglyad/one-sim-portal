import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DataService } from '../core';
import { Company } from '@shared/models';
import { CacheHubService, DataType } from '../cache-hub';

@Injectable({
	providedIn: 'root'
})
export class CompaniesDataService extends DataService<Company> {
	private apiUrl = '/api/v1/companies/query/all';

	constructor(
		public http: HttpClient,
		private cacheHub: CacheHubService
	) {
		super(http, '/api/v1/companies');
	}

	list(): Observable<Company[]> {
		return this.cacheHub.get(
			'companies:list',
			() => {
				let params = new HttpParams();
				return this.http.get<Company[]>(this.apiUrl, {params});
			},
			{ dataType: DataType.REFERENCE }
		);
	}

	create(company: Company): Observable<any> {
		return this.http.post<any>(`/api/v1/companies/command/create`, company).pipe(
			tap(() => {
				// Invalidate companies list cache after creation
				this.cacheHub.invalidate('companies:list');
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

		return this.http.get<any>('/api/v1/companies/query/all/page', { params });
	}

	sendInviteEmail(entityId: string, email: string): Observable<any> {
		return this.http.post<any>('/api/v1/companies/send-user-registration-email', {
			entityId, email
		});
	}
}
