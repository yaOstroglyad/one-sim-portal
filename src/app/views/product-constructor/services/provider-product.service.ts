import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProviderProduct,
  ProviderProductSearchRequest,
  ProviderProductResponse,
  ProviderProductUploadRequest,
  StatusUpdate
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProviderProductService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/provider-products';

  constructor(private http: HttpClient) {}

  getProviderProducts(searchRequest: ProviderProductSearchRequest): Observable<ProviderProductResponse> {
    let params = new HttpParams()
      .set('page', searchRequest.page.page.toString())
      .set('size', searchRequest.page.size.toString());

    // Add sort parameters only if provided
    if (searchRequest.page.sort?.length) {
      params = params.set('sort', searchRequest.page.sort.join(','));
    }

    // Add search parameters
    if (searchRequest.searchParams.countryId) {
      params = params.set('countryId', searchRequest.searchParams.countryId.toString());
    }
    if (searchRequest.searchParams.regionId) {
      params = params.set('regionId', searchRequest.searchParams.regionId.toString());
    }
    if (searchRequest.searchParams.providerId) {
      params = params.set('providerId', searchRequest.searchParams.providerId);
    }

    return this.http.get<ProviderProductResponse>(this.baseUrl, { params });
  }

  getProviderProduct(id: string): Observable<ProviderProduct> {
    return this.http.get<ProviderProduct>(`${this.baseUrl}/${id}`);
  }

  uploadProviderProducts(file: File, providerId?: string, countryId?: number, regionId?: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (providerId) {
      formData.append('providerId', providerId);
    }
    if (countryId) {
      formData.append('countryId', countryId.toString());
    }
    if (regionId) {
      formData.append('regionId', regionId.toString());
    }

    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  updateProviderProductStatus(id: string, status: StatusUpdate): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, status);
  }

  deleteProviderProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}