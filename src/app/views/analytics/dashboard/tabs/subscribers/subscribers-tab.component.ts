import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, effect, inject, signal } from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import {
  DashboardError,
  SubscriberSummaryResponse,
  PeriodStatusesResponse,
  BundleSubscribersResponse
} from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { getChartColor, getChartColors, applyDefaultVisibility, buildBundleStatusWaterfallData } from '../../utils';
import {
  CardComponent,
  MetricCardComponent,
  OsBarChartComponent,
  OsWaterfallChartComponent,
  WaterfallDataPoint,
  MetricCard,
  BarChartData,
  BarChartOptions,
  ChartLegendItem
} from '@shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';

@Component({
  standalone: true,
  selector: 'app-subscribers-tab',
  imports: [
    TranslateModule,
    MetricCardComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    CardComponent,
    OsBarChartComponent,
    OsWaterfallChartComponent
],
  templateUrl: './subscribers-tab.component.html',
  styleUrls: ['./subscribers-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribersTabComponent implements OnInit {
  private readonly dashboardService = inject(DashboardDataService);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Data signals for each API response
  summaryData = signal<SubscriberSummaryResponse | null>(null);
  networkStatusData = signal<PeriodStatusesResponse | null>(null);
  bundleSubscribersData = signal<BundleSubscribersResponse | null>(null);
  bundleStatusData = signal<PeriodStatusesResponse | null>(null);

  // UI state
  loading = signal<boolean>(false);
  error = signal<DashboardError | null>(null);

  // KPI cards computed from summary data
  kpiCards = signal<MetricCard[]>([]);

  // Chart configurations
  networkStatusChartData = signal<BarChartData>({ labels: [], datasets: [] });
  networkStatusLegendItems = signal<ChartLegendItem[]>([]);
  bundleChartData = signal<BarChartData>({ labels: [], datasets: [] });
  bundleLegendItems = signal<ChartLegendItem[]>([]);
  countryChartData = signal<BarChartData>({ labels: [], datasets: [] });
  countryLegendItems = signal<ChartLegendItem[]>([]);

  // T025: Waterfall data for bundle statuses
  bundleStatusWaterfallData = signal<WaterfallDataPoint[]>([]);

  chartOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Using custom legend component
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor() {
    // React to period and accountId changes using effect
    effect(() => {
      const period = this.dashboardService.period();
      const accountId = this.dashboardService.accountId();

      // Only load data if accountId is set (required for API calls)
      if (accountId) {
        this.loadData();
      }
    });
  }

  ngOnInit(): void {
    // Initial data load is handled by effect
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cdr.markForCheck();

    // Call all 4 API endpoints in parallel
    forkJoin({
      summary: this.dashboardService.getSubscriberSummary(),
      networkStatuses: this.dashboardService.getNetworkStatuses(),
      bundleSubscribers: this.dashboardService.getBundleSubscribers(),
      bundleStatuses: this.dashboardService.getBundleStatuses()
    }).subscribe({
      next: (response) => {
        this.loading.set(false);

        // Store raw data
        this.summaryData.set(response.summary);
        this.networkStatusData.set(response.networkStatuses);
        this.bundleSubscribersData.set(response.bundleSubscribers);
        this.bundleStatusData.set(response.bundleStatuses);

        // Build KPI cards from summary
        this.buildKpiCards(response.summary);

        // Build chart configurations
        this.buildNetworkStatusChartConfig(response.networkStatuses);
        this.buildBundleChartConfig(response.bundleSubscribers);
        this.buildCountryChartConfig(response.bundleSubscribers);
        this.buildBundleStatusWaterfallDataFromResponse(response.bundleStatuses);

        this.error.set(null);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set({
          code: 'NETWORK_ERROR',
          message: err.message || 'An error occurred while loading subscriber analytics',
          timestamp: new Date()
        });
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Build KPI cards from subscriber summary response
   */
  private buildKpiCards(summary: SubscriberSummaryResponse): void {
    const cards: MetricCard[] = [
      {
        id: 'new-subscribers',
        title: 'dashboard.subscribers.newSubscribers',
        value: summary.newSubscribers,
        format: 'number',
        icon: 'cilUserFollow'
      },
      {
        id: 'downloaded-sims',
        title: 'dashboard.subscribers.downloadedSims',
        value: summary.downloadedSims,
        format: 'number',
        icon: 'cilCloudDownload'
      },
      {
        id: 'active-subscribers',
        title: 'dashboard.subscribers.activeSubscribers',
        value: summary.activeSubscribers,
        format: 'number',
        icon: 'cilPeople'
      },
      {
        id: 'spent-bundles',
        title: 'dashboard.subscribers.spentBundles',
        value: summary.spentBundles,
        format: 'number',
        icon: 'cilLayers'
      },
      {
        id: 'avg-bundle-size',
        title: 'dashboard.subscribers.avgBundleSize',
        value: summary.avrBundleSize,
        format: 'number',
        unit: 'GB',
        icon: 'cilChart'
      }
    ];

    this.kpiCards.set(cards);
  }

  /**
   * Build network status chart configuration
   */
  private buildNetworkStatusChartConfig(data: PeriodStatusesResponse): void {
    if (!data.periodStatuses || data.periodStatuses.length === 0) {
      this.networkStatusChartData.set({ labels: [], datasets: [] });
      this.networkStatusLegendItems.set([]);
      return;
    }

    // Get all unique statuses across all periods
    const allStatuses = new Set<string>();
    data.periodStatuses.forEach(period => {
      period.statuses.forEach(s => allStatuses.add(s.status));
    });

    const statusList = Array.from(allStatuses);
    const labels = data.periodStatuses.map(p => p.period);

    // Calculate totals per status for legend
    const statusTotals = new Map<string, number>();
    data.periodStatuses.forEach(period => {
      period.statuses.forEach(s => {
        const current = statusTotals.get(s.status) || 0;
        statusTotals.set(s.status, current + s.count);
      });
    });

    // Create a dataset for each status
    const datasets = statusList.map((status, index) => ({
      label: status,
      data: data.periodStatuses.map(period => {
        const found = period.statuses.find(s => s.status === status);
        return found ? found.count : 0;
      }),
      backgroundColor: getChartColor(index),
      borderWidth: 0
    }));

    // Build legend items
    const legendItems: ChartLegendItem[] = statusList.map((status, index) => ({
      label: status,
      color: getChartColor(index),
      value: statusTotals.get(status) || 0,
      hidden: false
    }));

    const chartData: BarChartData = { labels, datasets };
    this.networkStatusChartData.set(chartData);
    this.networkStatusLegendItems.set(legendItems);
  }

  /**
   * Build bundle subscribers chart configuration (by bundle name)
   */
  private buildBundleChartConfig(data: BundleSubscribersResponse): void {
    if (!data.subscribersByBundle || data.subscribersByBundle.length === 0) {
      this.bundleChartData.set({ labels: [], datasets: [] });
      this.bundleLegendItems.set([]);
      return;
    }

    const labels = data.subscribersByBundle.map(b => b.groupName);
    const values = data.subscribersByBundle.map(b => b.subscribers);
    const colors = getChartColors(labels.length);

    const subscribersLabel = this.translateService.instant('dashboard.subscribers.chartLabels.subscribers');

    const chartData: BarChartData = {
      labels,
      datasets: [{
        label: subscribersLabel,
        data: values,
        backgroundColor: colors,
        borderWidth: 0
      }]
    };

    // Build legend items for each bundle with default visibility (top 3 visible)
    const legendItems: ChartLegendItem[] = applyDefaultVisibility(
      labels.map((label, index) => ({
        label,
        color: colors[index],
        value: values[index]
      }))
    );

    this.bundleChartData.set(chartData);
    this.bundleLegendItems.set(legendItems);
  }

  /**
   * Build country subscribers chart configuration
   */
  private buildCountryChartConfig(data: BundleSubscribersResponse): void {
    if (!data.subscribersByCountry || data.subscribersByCountry.length === 0) {
      this.countryChartData.set({ labels: [], datasets: [] });
      this.countryLegendItems.set([]);
      return;
    }

    const labels = data.subscribersByCountry.map(c => c.groupName);
    const values = data.subscribersByCountry.map(c => c.subscribers);
    const colors = getChartColors(labels.length);
    const subscribersLabel = this.translateService.instant('dashboard.subscribers.chartLabels.subscribers');

    const chartData: BarChartData = {
      labels,
      datasets: [{
        label: subscribersLabel,
        data: values,
        backgroundColor: colors,
        borderWidth: 0
      }]
    };

    // Build legend items for each country with default visibility (top 3 visible)
    const legendItems: ChartLegendItem[] = applyDefaultVisibility(
      labels.map((label, index) => ({
        label,
        color: colors[index],
        value: values[index]
      }))
    );

    this.countryChartData.set(chartData);
    this.countryLegendItems.set(legendItems);
  }

  /**
   * T024: Build bundle status waterfall data.
   * Uses utility function from bundle-status.utils.ts
   */
  private buildBundleStatusWaterfallDataFromResponse(data: PeriodStatusesResponse): void {
    if (!data.periodStatuses || data.periodStatuses.length === 0) {
      this.bundleStatusWaterfallData.set([]);
      return;
    }

    // Calculate totals per status across all periods
    const statusTotals = new Map<string, number>();
    data.periodStatuses.forEach(period => {
      period.statuses.forEach(s => {
        const current = statusTotals.get(s.status) || 0;
        statusTotals.set(s.status, current + s.count);
      });
    });

    // Use utility function with translation
    const translateFn = (key: string) => this.translateService.instant(key);
    const points = buildBundleStatusWaterfallData(statusTotals, translateFn);
    this.bundleStatusWaterfallData.set(points);
  }

  onRetry(): void {
    this.loadData();
  }
}
