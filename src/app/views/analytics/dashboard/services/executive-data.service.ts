import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, delay, catchError, retry, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { DashboardResponse, DashboardPeriod, ExecutiveTabData } from '../models/dashboard.types';
import { BundleRevenueApiResponse, InventoryStatusApiResponse } from '../models/executive.types';
import { MockDataService } from './mock-data.service';
import { DashboardStateService } from './dashboard-state.service';
import {
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

/**
 * Service for Executive tab data
 */
@Injectable({
  providedIn: 'root'
})
export class ExecutiveDataService {
  private readonly http = inject(HttpClient);
  private readonly mockDataService = inject(MockDataService);
  private readonly stateService = inject(DashboardStateService);

  private readonly mockConfig = DEFAULT_MOCK_CONFIG;

  /**
   * Get Executive tab data
   */
  getExecutiveData(): Observable<DashboardResponse<ExecutiveTabData>> {
    const period = this.stateService.getCurrentPeriod();

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
    const params: Record<string, string> = {
      dateFrom: period.startDate.toISOString(),
      dateTo: period.endDate.toISOString()
    };

    const currentAccountId = this.stateService.getAccountId();
    if (currentAccountId) {
      params['accountId'] = currentAccountId;
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
    const params: Record<string, string> = {};

    const currentAccountId = this.stateService.getAccountId();
    if (currentAccountId) {
      params['accountId'] = currentAccountId;
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
    const totalRevenue = bundleRevenue.purchaseSummary.totalRevenue;

    return {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },
      isRealData: true,
      availableSections: {
        revenueBreakdown: false,
        bundleCharts: true,
        inventory: true
      },

      revenue: {
        total: totalRevenue,
        currency: bundleRevenue.currency,
        totalCost: bundleRevenue.purchaseSummary.totalCost,
        totalMargin: bundleRevenue.purchaseSummary.totalMargin,

        refunds: {
          totalRevenue: bundleRevenue.refundSummary.totalRevenue,
          totalCost: bundleRevenue.refundSummary.totalCost,
          totalMargin: bundleRevenue.refundSummary.totalMargin,
          totalCount: bundleRevenue.refundSummary.totalCount
        },

        breakdown: {
          new: 0,
          recurring: 0,
          churn: 0
        },
        trend: {
          daily: [],
          labels: []
        }
      },

      subscribersByBundle: {
        bundles: mapSubscriberBundles(bundleRevenue.subscribersByBundle, totalSubscribers),
        total: totalSubscribers,
        chartConfig: createSubscriberChartConfig(bundleRevenue.subscribersByBundle)
      },

      revenueByBundle: {
        bundles: mapRevenueBundles(bundleRevenue.revenueByBundle, totalRevenue),
        total: totalRevenue,
        chartConfig: createRevenueChartConfig(bundleRevenue.revenueByBundle)
      },

      inventoryStatus: {
        totalESIMs: inventoryStatus.total,
        available: inventoryStatus.available,
        allocated: inventoryStatus.allocated,
        expired: 0,
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
}
