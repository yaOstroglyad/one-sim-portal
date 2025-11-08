import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleArrayError } from '@shared/utils';
import { BundleLeftover, BundleLeftoverFilterParams } from '../models/bundle-leftover.model';

/**
 * Data service for Bundle Leftovers Report
 * Handles API communication for bundle leftovers data
 */
@Injectable({
  providedIn: 'root'
})
export class BundleLeftoversDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reports/tables/bundle-leftovers';

  /**
   * Get bundle leftovers report
   * @param params Filter parameters (dateFrom, dateTo, accountId)
   * @returns Observable of bundle leftovers array
   */
  getBundleLeftovers(params: BundleLeftoverFilterParams): Observable<BundleLeftover[]> {
    let httpParams = new HttpParams()
      .set('dateFrom', params.dateFrom)
      .set('dateTo', params.dateTo);

    if (params.accountId) {
      httpParams = httpParams.set('accountId', params.accountId);
    }

    return this.http.get<BundleLeftover[]>(this.baseUrl, { params: httpParams }).pipe(
      catchError(handleArrayError<BundleLeftover>('fetching bundle leftovers report'))
    );
  }
}
