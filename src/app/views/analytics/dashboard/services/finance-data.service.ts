import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, delay, catchError, retry, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { DashboardResponse, DashboardPeriod } from '../models/dashboard.types';
import {
  FinanceAnalytics,
  PeriodRevenueSummaryResponse,
  PeriodRevenueData,
  TopBundleRevenue,
  TopCountryRevenue,
  MarginByMonth
} from '../models/finance.types';
import { MockDataService } from './mock-data.service';
import { DashboardStateService } from './dashboard-state.service';
import {
  DASHBOARD_API_CONFIG,
  DEFAULT_MOCK_CONFIG,
  MOCK_DELAYS,
  HTTP_RETRY_CONFIG,
  getChartColors,
  DASHBOARD_CHART_COLORS
} from '../utils';
import { wrapResponse, createErrorResponse } from '@shared';

/**
 * Service for Finance tab data
 */
@Injectable({
  providedIn: 'root'
})
export class FinanceDataService {
  private readonly http = inject(HttpClient);
  private readonly mockDataService = inject(MockDataService);
  private readonly stateService = inject(DashboardStateService);

  private readonly mockConfig = DEFAULT_MOCK_CONFIG;

  /**
   * Get Finance tab data
   */
  getFinanceData(): Observable<DashboardResponse<FinanceAnalytics>> {
    const period = this.stateService.getCurrentPeriod();

    if (this.mockConfig.finance) {
      return this.mockDataService.getFinanceData(period)
        .pipe(
          delay(MOCK_DELAYS.finance),
          map(data => wrapResponse(data)),
          catchError(error => createErrorResponse(error))
        );
    }

    // Real API call
    return this.getPeriodRevenueSummary().pipe(
      map(response => this.transformToFinanceAnalytics(response, period)),
      map(data => wrapResponse(data)),
      catchError(error => createErrorResponse(error))
    );
  }

  /**
   * Build query parameters for finance report endpoint
   */
  private buildFinanceReportParams(period: DashboardPeriod): Record<string, string> {
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

  /**
   * Fetch period revenue summary from API
   */
  private getPeriodRevenueSummary(): Observable<PeriodRevenueSummaryResponse> {
    const period = this.stateService.getCurrentPeriod();
    const params = this.buildFinanceReportParams(period);

    return this.http.get<PeriodRevenueSummaryResponse>(
      DASHBOARD_API_CONFIG.endpoints.finance,
      { params }
    ).pipe(
      retry(HTTP_RETRY_CONFIG.retries),
      shareReplay(HTTP_RETRY_CONFIG.shareReplay)
    );
  }

  /**
   * Transform API response to FinanceAnalytics format for UI
   * No manual calculations - data displayed as received from API
   */
  private transformToFinanceAnalytics(
    response: PeriodRevenueSummaryResponse,
    period: DashboardPeriod
  ): FinanceAnalytics {
    const currency = response.currency || 'EUR';

    // Transform revenue by bundle to TopBundleRevenue[] - no percentage calculations
    const topBundlesData = this.transformRevenueByBundle(response.revenueByBundle);

    // Transform revenue by country to TopCountryRevenue[] - no percentage calculations
    const topCountriesData = this.transformRevenueByCountry(response.revenueByCountry);

    // Transform margin by country to MarginByMonth[]
    const marginData = this.transformMarginByCountry(response.marginByCountry);

    return {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },

      // No KPI metrics - removed manual calculations
      kpiMetrics: [],

      // Margin by Month - stacked bar chart by country
      marginByMonth: {
        data: marginData,
        chartConfig: this.buildStackedBarChartByPeriod(response.marginByCountry, currency, 'Margin'),
        loading: false
      },

      // Revenue by Country - stacked bar chart
      topCountries: {
        data: topCountriesData,
        chartConfig: this.buildStackedBarChartByPeriod(response.revenueByCountry, currency, 'Revenue'),
        loading: false
      },

      // Revenue by Bundle - stacked bar chart
      topBundles: {
        data: topBundlesData,
        chartConfig: this.buildStackedBarChartByPeriod(response.revenueByBundle, currency, 'Revenue'),
        loading: false
      },

      // Revenue trend (line chart) - use bundle data aggregated by period
      revenue: {
        data: this.transformRevenueByPeriod(response.revenueByBundle),
        chartConfig: this.buildRevenueChartConfig(response.revenueByBundle, currency),
        loading: false
      },

      // Balance for Invoice - empty for now (not in API)
      balanceForInvoice: {
        data: [],
        loading: false
      },

      // Bundle Purchases - empty for now (not in API)
      bundlePurchases: {
        data: [],
        loading: false
      }
    };
  }

  /**
   * Transform revenueByBundle to TopBundleRevenue[]
   * Aggregates revenue across all periods by bundle name
   * No percentage calculations - raw API data only
   */
  private transformRevenueByBundle(data: PeriodRevenueData[]): TopBundleRevenue[] {
    const bundleMap = new Map<string, number>();

    // Aggregate revenue by bundle name across all periods
    for (const period of data) {
      for (const group of period.revenueByGroup) {
        const current = bundleMap.get(group.name) || 0;
        bundleMap.set(group.name, current + group.revenue);
      }
    }

    // Convert to array and sort by revenue descending
    const result: TopBundleRevenue[] = [];

    bundleMap.forEach((revenue, bundle) => {
      result.push({
        bundle,
        revenue
      });
    });

    return result.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  /**
   * Transform revenueByCountry to TopCountryRevenue[]
   * Aggregates revenue across all periods by country name
   * No percentage calculations - raw API data only
   */
  private transformRevenueByCountry(data: PeriodRevenueData[]): TopCountryRevenue[] {
    const countryMap = new Map<string, number>();

    // Aggregate revenue by country name across all periods
    for (const period of data) {
      for (const group of period.revenueByGroup) {
        const current = countryMap.get(group.name) || 0;
        countryMap.set(group.name, current + group.revenue);
      }
    }

    // Convert to array and sort by revenue descending
    const result: TopCountryRevenue[] = [];

    countryMap.forEach((revenue, country) => {
      result.push({
        country,
        revenue
      });
    });

    return result.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  /**
   * Transform marginByCountry to MarginByMonth[]
   * Uses totalRevenue as margin value per period
   */
  private transformMarginByCountry(data: PeriodRevenueData[]): MarginByMonth[] {
    return data.map(period => ({
      month: period.period,
      margin: period.totalRevenue
    }));
  }

  /**
   * Transform revenueByBundle to revenue by period for line chart
   */
  private transformRevenueByPeriod(data: PeriodRevenueData[]): { month: string; revenue: number }[] {
    return data.map(period => ({
      month: period.period,
      revenue: period.totalRevenue
    }));
  }

  /**
   * Build stacked bar chart config by period
   * X-axis = periods (months), each bar segment = group (country/bundle)
   * Returns both chart config and legend items for custom legend component
   *
   * Creates two datasets per group: one for positive values, one for negative.
   * This creates a proper bidirectional stacked bar chart.
   */
  private buildStackedBarChartByPeriod(
    data: PeriodRevenueData[],
    currency: string,
    label: string
  ) {
    // Get all periods as labels (x-axis)
    const periods = data.map(d => this.formatPeriodLabel(d.period));

    // Calculate totals per group
    const groupTotals = new Map<string, number>();
    for (const period of data) {
      for (const group of period.revenueByGroup) {
        const current = groupTotals.get(group.name) || 0;
        groupTotals.set(group.name, current + group.revenue);
      }
    }

    // Sort groups by absolute total revenue (descending)
    const sortedGroups = Array.from(groupTotals.entries())
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 15)
      .map(([name]) => name);

    // Calculate min/max values across all data for proper scale
    let minValue = 0;
    let maxValue = 0;
    let hasAnyNegative = false;

    // Calculate stacked totals per period (positive and negative separately)
    for (const period of data) {
      let periodPositiveSum = 0;
      let periodNegativeSum = 0;

      for (const group of period.revenueByGroup) {
        if (group.revenue >= 0) {
          periodPositiveSum += group.revenue;
        } else {
          periodNegativeSum += group.revenue;
          hasAnyNegative = true;
        }
      }

      maxValue = Math.max(maxValue, periodPositiveSum);
      minValue = Math.min(minValue, periodNegativeSum);
    }

    // Create datasets - split positive and negative into separate datasets for proper stacking
    const datasets: any[] = [];

    sortedGroups.forEach((groupName, index) => {
      const color = DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length];

      const allValues = data.map(period => {
        const group = period.revenueByGroup.find(g => g.name === groupName);
        return group ? group.revenue : 0;
      });

      const hasNegativeInGroup = allValues.some(v => v < 0);
      const hasPositiveInGroup = allValues.some(v => v > 0);

      if (hasAnyNegative && hasNegativeInGroup && hasPositiveInGroup) {
        // Split into two datasets: positive and negative
        const positiveValues = allValues.map(v => v > 0 ? v : 0);
        const negativeValues = allValues.map(v => v < 0 ? v : 0);

        // Positive dataset
        datasets.push({
          label: `${label}, ${groupName}`,
          data: positiveValues,
          backgroundColor: color,
          borderWidth: 0,
          borderRadius: 2,
          stack: 'positive'
        });

        // Negative dataset (same color, different stack)
        datasets.push({
          label: `${label}, ${groupName} (refund)`,
          data: negativeValues,
          backgroundColor: color,
          borderWidth: 0,
          borderRadius: 2,
          stack: 'negative'
        });
      } else if (hasAnyNegative) {
        // All values are same sign - put in appropriate stack
        const isNegative = allValues.some(v => v < 0);
        datasets.push({
          label: `${label}, ${groupName}`,
          data: allValues,
          backgroundColor: color,
          borderWidth: 0,
          borderRadius: 2,
          stack: isNegative ? 'negative' : 'positive'
        });
      } else {
        // No negatives anywhere - single stack
        datasets.push({
          label: `${label}, ${groupName}`,
          data: allValues,
          backgroundColor: color,
          borderWidth: 0,
          borderRadius: 2,
          stack: 'stack0'
        });
      }
    });

    // Build legend items for custom legend component
    const legendItems = sortedGroups.map((groupName, index) => ({
      label: groupName,
      color: DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
      value: groupTotals.get(groupName) || 0,
      hidden: false
    }));

    return {
      type: 'bar' as const,
      data: {
        labels: periods,
        datasets
      },
      legendItems,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Disabled - using custom legend component
          },
          tooltip: {
            enabled: true,
            mode: 'index' as const,
            intersect: false,
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.y || 0;
                if (value === 0) return null; // Skip zero values in tooltip
                const formatted = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).formatToParts(value).map(p => p.type === 'currency' ? p.value + ' ' : p.value).join('');
                return `${context.dataset.label}: ${formatted}`;
              },
              footer: (items: any) => {
                const total = items.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
                const formatted = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).formatToParts(total).map(p => p.type === 'currency' ? p.value + ' ' : p.value).join('');
                return `Total: ${formatted}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            // Set explicit min/max to properly scale negative values
            // Use smart calculation: ensure negative portion is at least 5% of total range
            // so that 0 and min don't visually merge
            ...(hasAnyNegative && minValue < 0 ? (() => {
              const range = maxValue - minValue;
              const minNegativePortion = range * 0.08; // At least 8% of range for negative
              const calculatedMin = Math.min(minValue * 1.5, -minNegativePortion);
              return {
                min: Math.floor(calculatedMin),
                max: Math.ceil(maxValue * 1.1)
              };
            })() : {}),
            // Force include 0 in ticks when negative values exist
            afterBuildTicks: hasAnyNegative ? (axis: any) => {
              const ticks = axis.ticks;
              const hasZero = ticks.some((t: any) => t.value === 0);
              if (!hasZero) {
                ticks.push({ value: 0 });
                ticks.sort((a: any, b: any) => a.value - b.value);
              }
            } : undefined,
            ticks: {
              callback: (value: number) => {
                // Format with currency symbol and space between symbol and value
                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
                const parts = formatter.formatToParts(value);
                // Add space after currency symbol
                return parts.map(p => p.type === 'currency' ? p.value + ' ' : p.value).join('');
              }
            }
          }
        }
      }
    };
  }

  /**
   * Format period label for display (e.g., "2025-01" -> "Jan")
   */
  private formatPeriodLabel(period: string): string {
    try {
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { month: 'short' });
    } catch {
      return period;
    }
  }

  /**
   * Build chart config for revenue line chart
   */
  private buildRevenueChartConfig(data: PeriodRevenueData[], currency: string) {
    return {
      type: 'line' as const,
      data: {
        labels: data.map(d => d.period),
        datasets: [{
          label: `Revenue (${currency})`,
          data: data.map(d => d.totalRevenue),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
  }
}
