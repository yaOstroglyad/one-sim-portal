import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { DataService } from './data.service';
import { EditCompanySettings } from '../model';
import { EmailTemplate } from '../model';
import { handleArrayError } from '../utils';

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
			catchError(handleArrayError('fetching application types'))
		);
	}

	emailTemplateTypes(): Observable<string[]> {
		return this.http.get<any[]>('/api/v1/whitelabel/email-templates/query/template-types').pipe(
			catchError(handleArrayError('fetching email template types'))
		);
	}

	allEmailTemplatesByType(type: string, ownerAccountId?: string): Observable<EmailTemplate[]> {
		let params = new HttpParams()
			.set('type', type);

		if (ownerAccountId) {
			params = params.set('ownerAccountId', ownerAccountId);
		}

		return this.http.get<EmailTemplate[]>('/api/v1/whitelabel/email-templates/query/all-by-type', { params }).pipe(
			catchError(handleArrayError('fetching email templates by type'))
		);
	}

	allEmailTemplateLanguages(): Observable<string[]> {
		return this.http.get<any[]>('/api/v1/whitelabel/common/languages').pipe(
			catchError(handleArrayError('fetching email template languages'))
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
			catchError(handleArrayError('fetching company settings'))
		);
	}

	createCompanySettings(payload: EditCompanySettings): Observable<any> {
		return this.http.post('/api/v1/whitelabel/account-settings/command/create', payload);
	}

	updateCompanySettings(payload: EditCompanySettings): Observable<any> {
		return this.http.patch('/api/v1/whitelabel/account-settings/command/update', payload);
	}

}
