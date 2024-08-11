import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
	providedIn: 'root'
})
export class UploadResourceService {
	private baseUrl = '/api/v1/sims/load';

	constructor(private http: HttpClient) {}

	uploadFile(file: File, serviceProviderId: string, orderDescription: string): Observable<any> {
		const formData = new FormData();
		formData.append('sims', file);

		return this.http.post(`${this.baseUrl}?serviceProviderId=${serviceProviderId}&orderDescription=${orderDescription}`, formData);
	}
}
