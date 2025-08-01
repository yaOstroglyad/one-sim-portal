import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchRequest,
  PageResponse,
  StatusUpdate
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/products';

  constructor(private http: HttpClient) {}

  getProducts(searchRequest: ProductSearchRequest): Observable<PageResponse<Product>> {
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
    if (searchRequest.searchParams.mobileBundleId) {
      params = params.set('mobileBundleId', searchRequest.searchParams.mobileBundleId);
    }

    return this.http.get<PageResponse<Product>>(this.baseUrl, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<any> {
    return this.http.post(this.baseUrl, request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request);
  }

  updateProductStatus(id: string, status: StatusUpdate): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, status);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}