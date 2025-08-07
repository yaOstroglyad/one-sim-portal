import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    return this.http.get<ProductStatisticsResponse>(`/api-product/api/v1/esim-product/statistics/products`).pipe(
      catchError((error) => {
        console.warn('Error loading product statistics, returning fallback data:', error);
        return of({
          productsCount: 0,
          mobileBundlesCount: 0,
          regionsCount: 0
        });
      })
    );
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
      }),
      catchError((error) => {
        console.error('Error loading overview statistics:', error);
        // Return fallback data on error
        return of({
          regions: 0,
          bundles: 0,
          products: 0,
          companyProducts: 0,
          providerProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0
        });
      })
    );
  }
}
