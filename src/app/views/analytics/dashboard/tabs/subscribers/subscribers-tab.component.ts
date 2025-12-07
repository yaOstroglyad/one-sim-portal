import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import {
  DashboardError,
  SubscriberSummaryResponse,
  PeriodStatusesResponse,
  BundleSubscribersResponse
} from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { getChartColor, getChartColors } from '../../utils';
import {
  CardComponent,
  MetricCardComponent,
  OsBarChartComponent,
  MetricCard,
  BarChartData,
  BarChartOptions
} from '@shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';

@Component({
  standalone: true,
  selector: 'app-subscribers-tab',
  imports: [
    CommonModule,
    TranslateModule,
    MetricCardComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    CardComponent,
    OsBarChartComponent
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
  bundleChartData = signal<BarChartData>({ labels: [], datasets: [] });
  countryChartData = signal<BarChartData>({ labels: [], datasets: [] });
  bundleStatusChartData = signal<BarChartData>({ labels: [], datasets: [] });

  chartOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
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
    }, { allowSignalWrites: true });
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
        this.buildBundleStatusChartConfig(response.bundleStatuses);

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
      return;
    }

    // Get all unique statuses across all periods
    const allStatuses = new Set<string>();
    data.periodStatuses.forEach(period => {
      period.statuses.forEach(s => allStatuses.add(s.status));
    });

    const statusList = Array.from(allStatuses);
    const labels = data.periodStatuses.map(p => p.period);

    // Create a dataset for each status
    const datasets = statusList.map((status, index) => ({
      label: status,
      data: data.periodStatuses.map(period => {
        const found = period.statuses.find(s => s.status === status);
        return found ? found.count : 0;
      }),
      backgroundColor: getChartColor(index)
    }));

    const chartData: BarChartData = { labels, datasets };
    this.networkStatusChartData.set(chartData);
  }

  /**
   * Build bundle subscribers chart configuration (by bundle name)
   */
  private buildBundleChartConfig(data: BundleSubscribersResponse): void {
    if (!data.subscribersByBundle || data.subscribersByBundle.length === 0) {
      this.bundleChartData.set({ labels: [], datasets: [] });
      return;
    }

    const labels = data.subscribersByBundle.map(b => b.groupName);
    const values = data.subscribersByBundle.map(b => b.subscribers);

    const subscribersLabel = this.translateService.instant('dashboard.subscribers.chartLabels.subscribers');

    const chartData: BarChartData = {
      labels,
      datasets: [{
        label: subscribersLabel,
        data: values,
        backgroundColor: getChartColors(labels.length)
      }]
    };
    this.bundleChartData.set(chartData);
  }

  /**
   * Build country subscribers chart configuration
   */
  private buildCountryChartConfig(data: BundleSubscribersResponse): void {
    if (!data.subscribersByCountry || data.subscribersByCountry.length === 0) {
      this.countryChartData.set({ labels: [], datasets: [] });
      return;
    }

    const labels = data.subscribersByCountry.map(c => c.groupName);
    const values = data.subscribersByCountry.map(c => c.subscribers);
    const subscribersLabel = this.translateService.instant('dashboard.subscribers.chartLabels.subscribers');

    const chartData: BarChartData = {
      labels,
      datasets: [{
        label: subscribersLabel,
        data: values,
        backgroundColor: getChartColors(labels.length)
      }]
    };
    this.countryChartData.set(chartData);
  }

  /**
   * Build bundle status chart configuration
   */
  private buildBundleStatusChartConfig(data: PeriodStatusesResponse): void {
    if (!data.periodStatuses || data.periodStatuses.length === 0) {
      this.bundleStatusChartData.set({ labels: [], datasets: [] });
      return;
    }

    // Get all unique statuses
    const allStatuses = new Set<string>();
    data.periodStatuses.forEach(period => {
      period.statuses.forEach(s => allStatuses.add(s.status));
    });

    const statusList = Array.from(allStatuses);
    const labels = data.periodStatuses.map(p => p.period);

    const datasets = statusList.map((status, index) => ({
      label: status,
      data: data.periodStatuses.map(period => {
        const found = period.statuses.find(s => s.status === status);
        return found ? found.count : 0;
      }),
      backgroundColor: getChartColor(index)
    }));

    const chartData: BarChartData = { labels, datasets };
    this.bundleStatusChartData.set(chartData);
  }

  onRetry(): void {
    this.loadData();
  }
}
