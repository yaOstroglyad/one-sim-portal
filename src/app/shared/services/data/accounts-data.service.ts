import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from '../core';
import { Account } from '@shared/models';

@Injectable({
	providedIn: 'root'
})
export class AccountsDataService extends DataService<any> {
	private apiUrl = '/api/v1/accounts/query/all';

	constructor(public http: HttpClient) {
		super(http, '/api/v1/accounts');
	}

	list(): Observable<any[]> {
		return this.http.get<any[]>(this.apiUrl);
	}

	ownerAccounts(): Observable<Account[]> {
		return this.http.get<Account[]>('/api/v1/whitelabel/common/owner-accounts');
	}
}
