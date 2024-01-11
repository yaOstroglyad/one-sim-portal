import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { providersMock } from './providers-mock';
import { Provider } from '../../shared/model/provider';

@Injectable({
	providedIn: 'root'
})
export class ProvidersDataService {
	private apiUrl = 'url_to_your_api_endpoint';

	constructor(private http: HttpClient) {}

	getData(): Observable<Provider[]> {
		// return throwError(() => new Error('Internal Server Error'));
		return of(providersMock);
		// return this.http.get<Provider[]>(this.apiUrl);
	}
}
