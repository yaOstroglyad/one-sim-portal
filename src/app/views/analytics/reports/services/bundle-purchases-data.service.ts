import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleArrayError } from '@shared/utils';
import { BundlePurchase, BundlePurchaseFilterParams } from '../models/bundle-purchase.model';

/**
 * Data service for Bundle Purchases Report
 * Handles API communication for bundle purchases data
 */
@Injectable({
  providedIn: 'root'
})
export class BundlePurchasesDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reports/tables/bundle-purchases';

  /**
   * Get bundle purchases report
   * @param params Filter parameters (dateFrom, dateTo, accountId)
   * @returns Observable of bundle purchases array
   */
  getBundlePurchases(params: BundlePurchaseFilterParams): Observable<BundlePurchase[]> {
    let httpParams = new HttpParams()
      .set('dateFrom', params.dateFrom)
      .set('dateTo', params.dateTo);

    if (params.accountId) {
      httpParams = httpParams.set('accountId', params.accountId);
    }

    return this.http.get<BundlePurchase[]>(this.baseUrl, { params: httpParams }).pipe(
      catchError(handleArrayError<BundlePurchase>('fetching bundle purchases report'))
    );
  }
}
