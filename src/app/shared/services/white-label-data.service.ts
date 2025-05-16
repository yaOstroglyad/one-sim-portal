import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { CreateSubscriberDto } from './subscriber-data.service';
import { EditCompanySettings } from '../model';

@Injectable({
	providedIn: 'root'
})
export class WhiteLabelDataService extends DataService<any> {
	private apiUrl = '/api/v1/white-label';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/white-label');
	}

	applicationTypes(): Observable<any[]> {
		return this.http.get<any[]>('/api/v1/whitelabel/common/application-types').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	companySettings(accountId?: string): Observable<any[]> {
		const params = accountId ? new HttpParams().set('accountId', accountId) : undefined;

		return this.http.get<any[]>('/api/v1/whitelabel/account-settings/query', { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	createCompanySettings(payload: EditCompanySettings): Observable<any> {
		return this.http.post('/api/v1/whitelabel/account-settings/command/create', payload);
	}

	updateCompanySettings(payload: EditCompanySettings): Observable<any> {
		return this.http.patch('/api/v1/whitelabel/account-settings/command/update', payload);
	}

}
