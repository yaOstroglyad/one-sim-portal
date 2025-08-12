import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchRequest,
  PageResponse,
  StatusUpdate
} from '../models';
import { CacheHubService, DataType } from '../../../shared/services/cache-hub';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/products';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

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

    // For form initialization, use cache for all products request
    if (this.isAllProductsRequest(searchRequest)) {
      return this.cacheHub.get(
        'products:all',
        () => this.http.get<PageResponse<Product>>(this.baseUrl, { params }),
        { dataType: DataType.BUSINESS }
      ).pipe(
        // tap(response => console.log('Cache returned products response:', response)),
        map(response => {
          // If cache returns null or invalid response, make direct HTTP call
          if (!response || !response.content || !Array.isArray(response.content)) {
            console.log('Cache returned invalid data, will fallback to direct HTTP');
            throw new Error('Invalid cache data');
          }
          return response;
        }),
        catchError(error => {
          console.log('Cache error or invalid data, falling back to direct HTTP call:', error.message);
          return this.http.get<PageResponse<Product>>(this.baseUrl, { params });
        })
      );
    }

    return this.http.get<PageResponse<Product>>(this.baseUrl, { params });
  }

  private isAllProductsRequest(searchRequest: ProductSearchRequest): boolean {
    // Check if this is a request for all products (used for form initialization)
    return searchRequest.page.size >= 1000 &&
           !searchRequest.searchParams.countryId &&
           !searchRequest.searchParams.regionId &&
           !searchRequest.searchParams.mobileBundleId;
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<any> {
    return this.http.post(this.baseUrl, request).pipe(
      tap(() => {
        // Invalidate products cache after creation
        this.cacheHub.invalidate('products:all');
      })
    );
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request).pipe(
      tap(() => {
        // Invalidate products cache after update
        this.cacheHub.invalidate('products:all');
      })
    );
  }

  updateProductStatus(id: string, status: StatusUpdate): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, status).pipe(
      tap(() => {
        // Invalidate products cache after status update
        this.cacheHub.invalidate('products:all');
      })
    );
  }
}
