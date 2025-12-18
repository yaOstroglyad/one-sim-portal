import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';

import { CardComponent, OsBarChartComponent, OsLineChartComponent, TooltipDirective } from '@shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';

import { DashboardDataService } from '../../services/dashboard-data.service';
import {
  TrafficUsagePeriodResponse,
  TrafficKpiValues,
  TrafficChartLegendItem
} from '../../models/traffic.types';
import { DashboardError } from '../../models/dashboard.types';
import {
  calculateKpiValues,
  buildTrafficByCountryChartConfig,
  buildSubscribersByCountryChartConfig,
  buildAverageTrafficChartConfig
} from '../../utils/traffic.utils';

@Component({
  standalone: true,
  selector: 'os-traffic-tab',
  imports: [
    CommonModule,
    TranslateModule,
    IconModule,
    CardComponent,
    TooltipDirective,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    OsBarChartComponent,
    OsLineChartComponent
  ],
  templateUrl: './traffic-tab.component.html',
  styleUrls: ['./traffic-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrafficTabComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  // State signals
  readonly loading = signal(true);
  readonly error = signal<DashboardError | null>(null);
  readonly data = signal<TrafficUsagePeriodResponse | null>(null);

  // Computed values for template
  readonly kpiValues = signal<TrafficKpiValues | null>(null);
  readonly trafficChartConfig = signal<any>(null);
  readonly subscribersChartConfig = signal<any>(null);
  readonly avgTrafficChartConfig = signal<any>(null);

  constructor() {
    // React to period and accountId changes
    effect(() => {
      const period = this.dashboardDataService.period();
      const accountId = this.dashboardDataService.accountId();

      if (accountId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardDataService.getTrafficData().subscribe({
      next: (response) => {
        if (response) {
          this.data.set(response);
          this.processData(response);
        } else {
          // Empty response
          this.data.set(null);
          this.kpiValues.set(null);
          this.trafficChartConfig.set(null);
          this.subscribersChartConfig.set(null);
          this.avgTrafficChartConfig.set(null);
        }
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error.set({
          code: err.status || err.code || 'UNKNOWN',
          message: err.message || 'Failed to load traffic data',
          details: err,
          timestamp: new Date()
        });
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  private processData(data: TrafficUsagePeriodResponse): void {
    // Calculate KPI values
    this.kpiValues.set(calculateKpiValues(data));

    // Build chart configurations
    this.trafficChartConfig.set(buildTrafficByCountryChartConfig(data.trafficByCountry));
    this.subscribersChartConfig.set(buildSubscribersByCountryChartConfig(data.subscribersByCountry));
    this.avgTrafficChartConfig.set(buildAverageTrafficChartConfig(data.subscriberAverageTraffic));
  }

  onRetry(): void {
    this.loadData();
  }

  /**
   * Check if there is any data to display
   */
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
}
