import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BundlePurchaseFilterParams,
  BundlePurchasesResponse
} from '../models/bundle-purchase.model';

/**
 * Data service for Bundle Purchases Report
 * Handles API communication for bundle purchases data
 * Updated: 2025-11-26 - API now returns wrapped response with totals
 */
@Injectable({
  providedIn: 'root'
})
export class BundlePurchasesDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reports/tables/bundle-purchases';

  /**
   * Get bundle purchases report with totals
   * @param params Filter parameters (dateFrom, dateTo, accountId)
   * @returns Observable of bundle purchases response (records + totals)
   */
  getBundlePurchases(params: BundlePurchaseFilterParams): Observable<BundlePurchasesResponse> {
    let httpParams = new HttpParams()
      .set('dateFrom', params.dateFrom)
      .set('dateTo', params.dateTo);

    if (params.accountId) {
      httpParams = httpParams.set('accountId', params.accountId);
    }

    return this.http.get<BundlePurchasesResponse>(this.baseUrl, { params: httpParams });
  }
}
