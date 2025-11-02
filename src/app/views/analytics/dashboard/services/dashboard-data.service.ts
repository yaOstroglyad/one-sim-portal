import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, delay, catchError, retry, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import {
  DashboardResponse,
  DashboardPeriod,
  ExecutiveTabData,
  SubscribersTabData,
  SubscriberAnalytics
} from '../models/dashboard.types';
import {
  BundleRevenueApiResponse,
  InventoryStatusApiResponse
} from '../models/executive.types';
import { TrafficAnalytics } from '../models/traffic.types';
import { FinanceAnalytics } from '../models/finance.types';
import { MockDataService } from './mock-data.service';
import {
  getDefaultPeriod,
  DASHBOARD_API_CONFIG,
  DEFAULT_MOCK_CONFIG,
  MOCK_DELAYS,
  HTTP_RETRY_CONFIG,
  createSubscriberChartConfig,
  createRevenueChartConfig,
  mapSubscriberBundles,
  mapRevenueBundles
} from '../utils';
import { wrapResponse, createErrorResponse } from '@shared';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly http = inject(HttpClient);
  private readonly mockDataService = inject(MockDataService);

  // Configuration from utils
  private readonly mockConfig = DEFAULT_MOCK_CONFIG;

  // Period management with Signals
  private readonly selectedPeriodSignal = signal<DashboardPeriod>(getDefaultPeriod());
  public readonly period = this.selectedPeriodSignal.asReadonly();

  // Account ID for filtering data (used by admins)
  private readonly accountIdSignal = signal<string | null>(null);
  public readonly accountId = this.accountIdSignal.asReadonly();

  /**
   * Get Executive tab data
   */
  getExecutiveData(): Observable<DashboardResponse<ExecutiveTabData>> {
    const period = this.selectedPeriodSignal();

    if (this.mockConfig.executive) {
      return this.mockDataService.getExecutiveData(period)
        .pipe(
          delay(MOCK_DELAYS.executive),
          map(data => wrapResponse(data)),
          catchError(error => createErrorResponse(error))
        );
    }

    // Real API: Combine both endpoints with forkJoin
    return forkJoin({
      bundleRevenue: this.getBundleRevenueFromApi(period),
      inventoryStatus: this.getInventoryStatusFromApi()
    }).pipe(
      map(({ bundleRevenue, inventoryStatus }) =>
        this.mapApiDataToExecutiveData(bundleRevenue, inventoryStatus, period)
      ),
      map(data => wrapResponse(data)),
      catchError(error => createErrorResponse(error))
    );
  }

  /**
   * Get Bundle Revenue from real API
   */
  private getBundleRevenueFromApi(period: DashboardPeriod): Observable<BundleRevenueApiResponse> {
    const params: any = {
      dateFrom: period.startDate.toISOString(),
      dateTo: period.endDate.toISOString()
    };

    // Add accountId if set (for admin filtering)
    const currentAccountId = this.accountIdSignal();
    if (currentAccountId) {
      params.accountId = currentAccountId;
    }

    return this.http.get<BundleRevenueApiResponse>(
      DASHBOARD_API_CONFIG.endpoints.executive.bundleRevenue,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Get Inventory Status from real API
   */
  private getInventoryStatusFromApi(): Observable<InventoryStatusApiResponse> {
    const params: any = {};

    // Add accountId if set (for admin filtering)
    const currentAccountId = this.accountIdSignal();
    if (currentAccountId) {
      params.accountId = currentAccountId;
    }

    return this.http.get<InventoryStatusApiResponse>(
      DASHBOARD_API_CONFIG.endpoints.executive.inventoryStatus,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Map combined API data to ExecutiveTabData
   */
  private mapApiDataToExecutiveData(
    bundleRevenue: BundleRevenueApiResponse,
    inventoryStatus: InventoryStatusApiResponse,
    period: DashboardPeriod
  ): ExecutiveTabData {
    const totalSubscribers = bundleRevenue.subscribersByBundle.reduce((sum, b) => sum + b.subscribers, 0);
    const totalRevenue = bundleRevenue.totalRevenue;

    return {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },
      isRealData: true,
      availableSections: {
        revenueBreakdown: false,   // ❌ Not available from API
        bundleCharts: true,        // ✅ From bundle-revenue API
        inventory: true            // ✅ From inventory-status API (partial)
      },

      // Revenue from API
      revenue: {
        total: totalRevenue,
        currency: bundleRevenue.currency,
        totalCost: bundleRevenue.totalCost,
        totalMargin: bundleRevenue.totalMargin,
        breakdown: {
          new: 0,       // Disabled
          recurring: 0, // Disabled
          churn: 0      // Disabled
        },
        trend: {
          daily: [],
          labels: []
        }
      },

      // Subscribers by Bundle from API
      subscribersByBundle: {
        bundles: mapSubscriberBundles(bundleRevenue.subscribersByBundle, totalSubscribers),
        total: totalSubscribers,
        chartConfig: createSubscriberChartConfig(bundleRevenue.subscribersByBundle)
      },

      // Revenue by Bundle from API
      revenueByBundle: {
        bundles: mapRevenueBundles(bundleRevenue.revenueByBundle, totalRevenue),
        total: totalRevenue,
        chartConfig: createRevenueChartConfig(bundleRevenue.revenueByBundle)
      },

      // Inventory Status from API
      inventoryStatus: {
        totalESIMs: inventoryStatus.total,
        available: inventoryStatus.available,
        allocated: inventoryStatus.allocated,
        expired: 0, // ❌ Not provided by API
        breakdown: [
          {
            label: 'Available',
            value: inventoryStatus.available,
            percentage: inventoryStatus.total > 0 ? (inventoryStatus.available / inventoryStatus.total) * 100 : 0,
            status: 'healthy'
          },
          {
            label: 'Allocated',
            value: inventoryStatus.allocated,
            percentage: inventoryStatus.total > 0 ? (inventoryStatus.allocated / inventoryStatus.total) * 100 : 0,
            status: 'healthy'
          }
        ]
      }
    };
  }


  /**
   * Get Subscribers tab data
   */
  getSubscribersData(): Observable<DashboardResponse<SubscribersTabData>> {
    const period = this.selectedPeriodSignal();

    if (this.mockConfig.subscribers) {
      return this.mockDataService.getSubscribersData(period)
        .pipe(
          delay(MOCK_DELAYS.subscribers),
          map(data => wrapResponse(data)),
          catchError(error => createErrorResponse(error))
        );
    }

    return this.http.post<SubscribersTabData>(DASHBOARD_API_CONFIG.endpoints.subscribers, {
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString()
    }).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      map(data => wrapResponse(data)),
      catchError(error => createErrorResponse(error)),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Get Traffic tab data
   */
  getTrafficData(): Observable<DashboardResponse<TrafficAnalytics>> {
    const period = this.selectedPeriodSignal();

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

  /**
   * Get Finance tab data
   */
  getFinanceData(): Observable<DashboardResponse<FinanceAnalytics>> {
    const period = this.selectedPeriodSignal();

    if (this.mockConfig.finance) {
      return this.mockDataService.getFinanceData(period)
        .pipe(
          delay(MOCK_DELAYS.finance),
          map(data => wrapResponse(data)),
          catchError(error => createErrorResponse(error))
        );
    }

    return this.http.post<FinanceAnalytics>(DASHBOARD_API_CONFIG.endpoints.finance, {
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString()
    }).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      map(data => wrapResponse(data)),
      catchError(error => createErrorResponse(error)),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Get Subscriber Analytics data
   */
  getSubscriberAnalytics(): Observable<DashboardResponse<SubscriberAnalytics>> {
    const period = this.selectedPeriodSignal();

    if (this.mockConfig.subscribers) {
      return this.mockDataService.getSubscriberAnalytics(period)
        .pipe(
          delay(MOCK_DELAYS.subscriberAnalytics),
          map(data => wrapResponse(data)),
          catchError(error => createErrorResponse(error))
        );
    }

    return this.http.post<SubscriberAnalytics>(DASHBOARD_API_CONFIG.endpoints.subscriberAnalytics, {
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString()
    }).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      map(data => wrapResponse(data)),
      catchError(error => createErrorResponse(error)),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Update selected period
   */
  setPeriod(period: DashboardPeriod): void {
    this.selectedPeriodSignal.set(period);
  }

  /**
   * Get current period value
   */
  getCurrentPeriod(): DashboardPeriod {
    return this.selectedPeriodSignal();
  }

  /**
   * Set account ID for filtering (used by admins)
   */
  setAccountId(accountId: string | null): void {
    this.accountIdSignal.set(accountId);
  }

  /**
   * Get current account ID value
   */
  getAccountId(): string | null {
    return this.accountIdSignal();
  }
}
