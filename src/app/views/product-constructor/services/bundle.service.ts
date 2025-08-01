import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MobileBundle, CreateBundleRequest, UpdateBundleRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/bundles';

  constructor(private http: HttpClient) {}

  getBundles(): Observable<MobileBundle[]> {
    return this.http.get<MobileBundle[]>(this.baseUrl);
  }

  getBundle(id: string): Observable<MobileBundle> {
    return this.http.get<MobileBundle>(`${this.baseUrl}/${id}`);
  }

  createBundle(request: CreateBundleRequest): Observable<any> {
    return this.http.post(this.baseUrl, request);
  }

  updateBundle(id: string, request: UpdateBundleRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request);
  }

  deleteBundle(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}