import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface RevertOrderRequest {
  parentOrderId: string;
  orderDescription: string;
  simCount: number;
}

@Injectable({
	providedIn: 'root'
})
export class RevertOrderService {
	private baseUrl = '/api/v1/sims/move/revert';

	constructor(private http: HttpClient) {}

	revertOrder(formData: RevertOrderRequest): Observable<any> {
		return this.http.post<any>(this.baseUrl, formData);
	}
}