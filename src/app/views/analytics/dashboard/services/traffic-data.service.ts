import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, shareReplay } from 'rxjs/operators';

import { TrafficUsagePeriodResponse } from '../models/traffic.types';
import { DashboardStateService } from './dashboard-state.service';
import { DASHBOARD_API_CONFIG, HTTP_RETRY_CONFIG } from '../utils';

/**
 * Service for fetching traffic dashboard data from API
 */
@Injectable({ providedIn: 'root' })
export class TrafficDataService {
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(DashboardStateService);

  /**
   * Fetch traffic usage data from API
   * @returns Observable of TrafficUsagePeriodResponse or null on error
   */
  getTrafficData(): Observable<TrafficUsagePeriodResponse | null> {
    const period = this.stateService.getCurrentPeriod();
    const accountId = this.stateService.getAccountId();

    if (!accountId) {
      console.warn('TrafficDataService: No accountId available');
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }

    const params = new HttpParams()
      .set('accountId', accountId)
      .set('period', this.stateService.mapPeriodToApiEnum(period.preset))
      .set('dateFrom', period.startDate.toISOString())
      .set('dateTo', period.endDate.toISOString());

    return this.http
      .get<TrafficUsagePeriodResponse>(DASHBOARD_API_CONFIG.endpoints.traffic, { params })
      .pipe(
        retry(HTTP_RETRY_CONFIG.retries),
        shareReplay(HTTP_RETRY_CONFIG.shareReplay)
      );
  }
}
