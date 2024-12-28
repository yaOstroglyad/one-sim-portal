import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from './data.service';

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
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([{
						"id": "edff203a-757d-41e7-b8b2-36d10223f778",
						"name": "Anex",
					}].map((account: any) => ({
						value: account.id,
						displayValue: account.name
					}))
				);
			})
		);
	}
}
