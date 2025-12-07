import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, delay, catchError, retry, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { DashboardResponse } from '../models/dashboard.types';
import { TrafficAnalytics } from '../models/traffic.types';
import { MockDataService } from './mock-data.service';
import { DashboardStateService } from './dashboard-state.service';
import {
  DASHBOARD_API_CONFIG,
  DEFAULT_MOCK_CONFIG,
  MOCK_DELAYS,
  HTTP_RETRY_CONFIG
} from '../utils';
import { wrapResponse, createErrorResponse } from '@shared';

/**
 * Service for Traffic tab data
 */
@Injectable({
  providedIn: 'root'
})
export class TrafficDataService {
  private readonly http = inject(HttpClient);
  private readonly mockDataService = inject(MockDataService);
  private readonly stateService = inject(DashboardStateService);

  private readonly mockConfig = DEFAULT_MOCK_CONFIG;

  /**
   * Get Traffic tab data
   */
  getTrafficData(): Observable<DashboardResponse<TrafficAnalytics>> {
    const period = this.stateService.getCurrentPeriod();

    if (this.mockConfig.traffic) {
      return this.mockDataService.getTrafficData(period)
        .pipe(
          delay(MOCK_DELAYS.traffic),
          map(data => wrapResponse(data)),
          catchError(error => createErrorResponse(error))
        );
    }

    return this.http.post<TrafficAnalytics>(DASHBOARD_API_CONFIG.endpoints.traffic, {
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString()
    }).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      map(data => wrapResponse(data)),
      catchError(error => createErrorResponse(error)),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }
}
