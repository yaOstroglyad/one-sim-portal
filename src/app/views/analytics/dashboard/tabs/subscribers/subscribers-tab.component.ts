import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

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
import { DashboardDataService } from '../../services/dashboard-data.service';
import {
  DashboardError,
  SubscriberSummaryResponse,
  PeriodStatusesResponse,
  BundleSubscribersResponse
} from '../../models/dashboard.types';
import {
  parseDashboardError,
  calculateStatusTotals,
  buildBundleStatusWaterfallData,
  buildSubscriberKpiCards,
  buildPeriodStatusesChartConfig,
  buildBundleSubscribersChartConfig,
  buildCountrySubscribersChartConfig
} from '../../utils';

@Component({
  standalone: true,
  selector: 'app-subscribers-tab',
  imports: [
    TranslateModule,
    CardComponent,
    MetricCardComponent,
    OsBarChartComponent,
    OsWaterfallChartComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent
  ],
  templateUrl: './subscribers-tab.component.html',
  styleUrls: ['./subscribers-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribersTabComponent {
  private readonly dashboardService = inject(DashboardDataService);
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // UI state
  readonly loading = signal(false);
  readonly error = signal<DashboardError | null>(null);

  // Data signals
  readonly summaryData = signal<SubscriberSummaryResponse | null>(null);
  readonly networkStatusData = signal<PeriodStatusesResponse | null>(null);
  readonly bundleSubscribersData = signal<BundleSubscribersResponse | null>(null);
  readonly bundleStatusData = signal<PeriodStatusesResponse | null>(null);

  // KPI cards
  readonly kpiCards = signal<MetricCard[]>([]);

  // Chart data signals
  readonly networkStatusChartData = signal<BarChartData>({ labels: [], datasets: [] });
  readonly networkStatusLegendItems = signal<ChartLegendItem[]>([]);
  readonly bundleChartData = signal<BarChartData>({ labels: [], datasets: [] });
  readonly bundleLegendItems = signal<ChartLegendItem[]>([]);
  readonly countryChartData = signal<BarChartData>({ labels: [], datasets: [] });
  readonly countryLegendItems = signal<ChartLegendItem[]>([]);
  readonly bundleStatusWaterfallData = signal<WaterfallDataPoint[]>([]);

  // Chart options
  readonly chartOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor() {
    effect(() => {
      this.dashboardService.period();
      this.dashboardService.accountId();
      if (this.dashboardService.isReady()) {
        untracked(() => this.loadData());
      }
    });
  }

  onRetry(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.dashboardService.getSubscriberSummary(),
      networkStatuses: this.dashboardService.getNetworkStatuses(),
      bundleSubscribers: this.dashboardService.getBundleSubscribers(),
      bundleStatuses: this.dashboardService.getBundleStatuses()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.processResponse(response);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(parseDashboardError(err, 'An error occurred while loading subscriber analytics'));
          this.loading.set(false);
        }
      });
  }

  private processResponse(response: {
    summary: SubscriberSummaryResponse;
    networkStatuses: PeriodStatusesResponse;
    bundleSubscribers: BundleSubscribersResponse;
    bundleStatuses: PeriodStatusesResponse;
  }): void {
    // Store raw data
    this.summaryData.set(response.summary);
    this.networkStatusData.set(response.networkStatuses);
    this.bundleSubscribersData.set(response.bundleSubscribers);
    this.bundleStatusData.set(response.bundleStatuses);

    // Build KPI cards
    this.kpiCards.set(buildSubscriberKpiCards(response.summary));

    // Build network status chart
    const networkConfig = buildPeriodStatusesChartConfig(response.networkStatuses);
    this.networkStatusChartData.set(networkConfig.chartData);
    this.networkStatusLegendItems.set(networkConfig.legendItems);

    // Build bundle chart
    const subscribersLabel = this.translateService.instant('dashboard.subscribers.chartLabels.subscribers');
    const bundleConfig = buildBundleSubscribersChartConfig(response.bundleSubscribers, subscribersLabel);
    this.bundleChartData.set(bundleConfig.chartData);
    this.bundleLegendItems.set(bundleConfig.legendItems);

    // Build country chart
    const countryConfig = buildCountrySubscribersChartConfig(response.bundleSubscribers, subscribersLabel);
    this.countryChartData.set(countryConfig.chartData);
    this.countryLegendItems.set(countryConfig.legendItems);

    // Build waterfall chart
    const statusTotals = calculateStatusTotals(response.bundleStatuses);
    const translateFn = (key: string) => this.translateService.instant(key);
    this.bundleStatusWaterfallData.set(buildBundleStatusWaterfallData(statusTotals, translateFn));
  }
}
