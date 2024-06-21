import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
	providedIn: 'root'
})
export class MoveResourceService {
	private baseUrl = '/api/v1/sims/move';

	constructor(private http: HttpClient) {}

	moveResource(formData: any): Observable<any> {
		return this.http.patch<any>(this.baseUrl, formData);
	}
}
