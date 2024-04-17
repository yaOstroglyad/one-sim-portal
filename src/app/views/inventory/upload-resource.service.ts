import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
	providedIn: 'root'
})
export class UploadResourceService {
	private baseUrl = '/api/api/v1/sims/load';

	constructor(private http: HttpClient) {}

	uploadFile(file: File, serviceProviderId: string): Observable<any> {
		const formData = new FormData();
		formData.append('sims', file);

		return this.http.post(`${this.baseUrl}?serviceProviderId=${serviceProviderId}`, formData);
	}
}
