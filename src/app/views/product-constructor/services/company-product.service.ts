import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { 
  CompanyProduct,
  CreateCompanyProductRequest,
  UpdateCompanyProductRequest,
  CompanyProductStatusRequest,
  CompanyProductSearchRequest,
  PageResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyProductService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/company-products';

  constructor(private http: HttpClient) {}

  searchCompanyProducts(request: CompanyProductSearchRequest): Observable<PageResponse<CompanyProduct>> {
    let params = new HttpParams()
      .set('page', request.page.page.toString())
      .set('size', request.page.size.toString());

    // Add sort parameters only if provided
    if (request.page.sort?.length) {
      params = params.set('sort', request.page.sort.join(','));
    }

    // Add search parameters
    if (request.searchParams.countryId) {
      params = params.set('countryId', request.searchParams.countryId.toString());
    }
    if (request.searchParams.regionId) {
      params = params.set('regionId', request.searchParams.regionId.toString());
    }
    if (request.searchParams.accountId) {
      params = params.set('accountId', request.searchParams.accountId);
    }

    return this.http.get<PageResponse<CompanyProduct>>(this.baseUrl, { params });
  }

  getCompanyProducts(): Observable<CompanyProduct[]> {
    return this.http.get<CompanyProduct[]>(this.baseUrl);
  }

  getCompanyProduct(id: string): Observable<CompanyProduct> {
    return this.http.get<CompanyProduct>(`${this.baseUrl}/${id}`);
  }

  createCompanyProduct(request: CreateCompanyProductRequest): Observable<any> {
    return this.http.post(this.baseUrl, request);
  }

  updateCompanyProduct(id: string, request: UpdateCompanyProductRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request);
  }

  updateCompanyProductStatus(id: string, request: CompanyProductStatusRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, request);
  }

  deleteCompanyProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}