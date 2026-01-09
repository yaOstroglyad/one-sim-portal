import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TrafficUsageFilterParams,
  TrafficUsageResponse
} from '../models/traffic-usage.model';

/**
 * Data service for Traffic Usage Report
 * Handles API communication for traffic usage data
 */
@Injectable({
  providedIn: 'root'
})
export class TrafficUsageDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reports/tables/traffic-usage';

  /**
   * Get traffic usage report with totals
   * @param params Filter parameters (dateFrom, dateTo, accountId)
   * @returns Observable of traffic usage response (records + totals)
   */
  getTrafficUsage(params: TrafficUsageFilterParams): Observable<TrafficUsageResponse> {
    let httpParams = new HttpParams()
      .set('dateFrom', params.dateFrom)
      .set('dateTo', params.dateTo);

    if (params.accountId) {
      httpParams = httpParams.set('accountId', params.accountId);
    }

    return this.http.get<TrafficUsageResponse>(this.baseUrl, { params: httpParams });
  }
}
