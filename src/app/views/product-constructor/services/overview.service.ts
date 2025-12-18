import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OverviewStats, ProductStatisticsResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  constructor(private http: HttpClient) {}

  /**
   * Get product statistics from API
   */
  getProductStatistics(): Observable<ProductStatisticsResponse> {
    return this.http.get<ProductStatisticsResponse>(`/api-product/api/v1/esim-product/statistics/products`);
  }

  /**
   * Get overview statistics mapped to UI format
   */
  getOverviewStats(): Observable<OverviewStats> {
    return this.getProductStatistics().pipe(
      map((response: ProductStatisticsResponse) => {
        // Map API response to our OverviewStats interface
        return {
          regions: response.regionsCount || 0,
          bundles: response.mobileBundlesCount || 0,
          products: response.productsCount || 0,
          companyProducts: 0, // Not available in current API response
          providerProducts: 0, // Not available in current API response
          activeProducts: 0, // Not available in current API response
          inactiveProducts: 0 // Not available in current API response
        };
      })
    );
  }
}
