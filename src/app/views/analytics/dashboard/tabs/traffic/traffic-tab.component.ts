import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconModule } from '@coreui/icons-angular';

import {
  CardComponent,
  OsBarChartComponent,
  OsLineChartComponent,
  TooltipDirective
} from '@shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { DashboardError } from '../../models/dashboard.types';
import {
  TrafficUsagePeriodResponse,
  TrafficKpiValues
} from '../../models/traffic.types';
import {
  parseDashboardError,
  calculateKpiValues,
  buildTrafficByCountryChartConfig,
  buildSubscribersByCountryChartConfig,
  buildAverageTrafficChartConfig
} from '../../utils';

@Component({
  standalone: true,
  selector: 'os-traffic-tab',
  imports: [
    CommonModule,
    TranslateModule,
    IconModule,
    CardComponent,
    TooltipDirective,
    OsBarChartComponent,
    OsLineChartComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent
  ],
  templateUrl: './traffic-tab.component.html',
  styleUrls: ['./traffic-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrafficTabComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly destroyRef = inject(DestroyRef);

  // UI state
  readonly loading = signal(true);
  readonly error = signal<DashboardError | null>(null);

  // Data signals
  readonly data = signal<TrafficUsagePeriodResponse | null>(null);
  readonly kpiValues = signal<TrafficKpiValues | null>(null);

  // Chart config signals
  readonly trafficChartConfig = signal<ReturnType<typeof buildTrafficByCountryChartConfig> | null>(null);
  readonly subscribersChartConfig = signal<ReturnType<typeof buildSubscribersByCountryChartConfig> | null>(null);
  readonly avgTrafficChartConfig = signal<ReturnType<typeof buildAverageTrafficChartConfig> | null>(null);

  constructor() {
    effect(() => {
      this.dashboardDataService.accountId();
      if (this.dashboardDataService.isReady()) {
        untracked(() => this.loadData());
      }
    });
  }

  onRetry(): void {
    this.loadData();
  }

  hasData(): boolean {
    const data = this.data();
    if (!data) return false;

    return !!(
      data.currentPeriodTraffic ||
      data.trafficByCountry?.length ||
      data.subscribersByCountry?.length ||
      data.subscriberAverageTraffic?.length
    );
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardDataService.getTrafficData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response) {
            this.data.set(response);
            this.processData(response);
          } else {
            this.clearData();
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(parseDashboardError(err, 'Failed to load traffic data'));
          this.loading.set(false);
        }
      });
  }

  private processData(data: TrafficUsagePeriodResponse): void {
    this.kpiValues.set(calculateKpiValues(data));
    this.trafficChartConfig.set(buildTrafficByCountryChartConfig(data.trafficByCountry));
    this.subscribersChartConfig.set(buildSubscribersByCountryChartConfig(data.subscribersByCountry));
    this.avgTrafficChartConfig.set(buildAverageTrafficChartConfig(data.subscriberAverageTraffic));
  }

  private clearData(): void {
    this.data.set(null);
    this.kpiValues.set(null);
    this.trafficChartConfig.set(null);
    this.subscribersChartConfig.set(null);
    this.avgTrafficChartConfig.set(null);
  }
}
