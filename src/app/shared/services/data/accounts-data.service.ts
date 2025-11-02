import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { DataService } from '../core';
import { Account } from '@shared/models';
import { handleArrayError, handleWithDefault } from '../../utils';

@Injectable({
	providedIn: 'root'
})
export class AccountsDataService extends DataService<any> {
	private apiUrl = '/api/v1/accounts/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/accounts');
	}

	list(): Observable<any[]> {
		return this.http.get<any[]>(this.apiUrl).pipe(
			catchError(handleWithDefault('fetching accounts', [{
				"id": "edff203a-757d-41e7-b8b2-36d10223f778",
				"name": "Anex",
			}].map((account: any) => ({
				value: account.id,
				displayValue: account.name
			}))))
		);
	}

	ownerAccounts(): Observable<Account[]> {
		return this.http.get<Account[]>('/api/v1/whitelabel/common/owner-accounts').pipe(
			catchError(handleArrayError('fetching owner accounts'))
		);
	}
}
