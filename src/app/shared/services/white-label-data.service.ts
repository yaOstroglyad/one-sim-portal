import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { EditCompanySettings } from '../model';
import { EmailTemplate } from '../model/email-template';

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

	emailTemplateTypes(): Observable<string[]> {
		return this.http.get<any[]>('/api/v1/whitelabel/email-templates/query/template-types').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	allEmailTemplatesByType(type: string, ownerAccountId?: string): Observable<EmailTemplate[]> {
		let params = new HttpParams()
			.set('type', type);

		if (ownerAccountId) {
			params = params.set('ownerAccountId', ownerAccountId);
		}

		return this.http.get<EmailTemplate[]>('/api/v1/whitelabel/email-templates/query/all-by-type', { params }).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	allEmailTemplateLanguages(): Observable<string[]> {
		return this.http.get<any[]>('/api/v1/whitelabel/common/languages').pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([])
			})
		);
	}

	createEmailTemplateIntegration(payload: any): Observable<any> {
		return this.http.post('/api/v1/whitelabel/email-templates/command/create', payload);
	}

	updateEmailTemplateIntegration(payload: any): Observable<any> {
		return this.http.patch('/api/v1/whitelabel/email-templates/command/update', payload);
	}

	setPrimaryEmailTemplateIntegration(id: any): Observable<any> {
		return this.http.patch(`/api/v1/whitelabel/email-templates/command/set-primary/${id}`, {});
	}

	companySettings(accountId?: string): Observable<any> {
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
