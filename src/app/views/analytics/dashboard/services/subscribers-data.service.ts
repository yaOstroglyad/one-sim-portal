import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { retry, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import {
  DashboardPeriod,
  SubscriberSummaryResponse,
  PeriodStatusesResponse,
  BundleSubscribersResponse
} from '../models/dashboard.types';
import { DashboardStateService } from './dashboard-state.service';
import { DASHBOARD_API_CONFIG, HTTP_RETRY_CONFIG } from '../utils';

/**
 * Service for Subscribers tab data
 */
@Injectable({
  providedIn: 'root'
})
export class SubscribersDataService {
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(DashboardStateService);

  /**
   * Get Subscriber Summary from API
   * Endpoint: /api/v1/reports/dashboards/subscribers/subscriber-summary
   */
  getSubscriberSummary(): Observable<SubscriberSummaryResponse> {
    const period = this.stateService.getCurrentPeriod();
    const params = this.buildSubscriberReportParams(period);

    return this.http.get<SubscriberSummaryResponse>(
      DASHBOARD_API_CONFIG.endpoints.subscribers.subscriberSummary,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Get Network Statuses from API
   * Endpoint: /api/v1/reports/dashboards/subscribers/network-statuses
   */
  getNetworkStatuses(): Observable<PeriodStatusesResponse> {
    const period = this.stateService.getCurrentPeriod();
    const params = this.buildSubscriberReportParams(period);

    return this.http.get<PeriodStatusesResponse>(
      DASHBOARD_API_CONFIG.endpoints.subscribers.networkStatuses,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Get Bundle Subscribers from API
   * Endpoint: /api/v1/reports/dashboards/subscribers/bundle-subscribers
   */
  getBundleSubscribers(): Observable<BundleSubscribersResponse> {
    const period = this.stateService.getCurrentPeriod();
    const params = this.buildSubscriberReportParams(period);

    return this.http.get<BundleSubscribersResponse>(
      DASHBOARD_API_CONFIG.endpoints.subscribers.bundleSubscribers,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Get Bundle Statuses from API
   * Endpoint: /api/v1/reports/dashboards/subscribers/bundle-statuses
   */
  getBundleStatuses(): Observable<PeriodStatusesResponse> {
    const period = this.stateService.getCurrentPeriod();
    const params = this.buildSubscriberReportParams(period);

    return this.http.get<PeriodStatusesResponse>(
      DASHBOARD_API_CONFIG.endpoints.subscribers.bundleStatuses,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Build query parameters for subscriber report endpoints
   */
  private buildSubscriberReportParams(period: DashboardPeriod): Record<string, string> {
    const params: Record<string, string> = {
      dateFrom: period.startDate.toISOString(),
      dateTo: period.endDate.toISOString(),
      period: this.stateService.mapPeriodToApiEnum(period.preset)
    };

    const currentAccountId = this.stateService.getAccountId();
    if (currentAccountId) {
      params['accountId'] = currentAccountId;
    }

    return params;
  }
}
