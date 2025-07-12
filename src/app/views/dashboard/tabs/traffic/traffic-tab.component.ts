import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { OsBarChartComponent } from '../../../../shared/components/bar-chart/os-bar-chart.component';
import { OsLineChartComponent } from '../../../../shared/components/line-chart/os-line-chart.component';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { TrafficAnalytics } from '../../models/traffic.types';
import { DashboardError } from '../../models/dashboard.types';

@Component({
  selector: 'app-traffic-tab',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IconModule,
    CardComponent,
    MetricCardComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    OsBarChartComponent,
    OsLineChartComponent
  ],
  templateUrl: './traffic-tab.component.html',
  styleUrls: ['./traffic-tab.component.scss']
})
export class TrafficTabComponent implements OnInit, OnDestroy {
  data: TrafficAnalytics | null = null;
  loading = true;
  error: DashboardError | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardDataService: DashboardDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('TrafficTabComponent ngOnInit called');
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardDataService.getTrafficData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.data = response.data;
          this.loading = false;
          console.log('Traffic data loaded:', this.data);
          console.log('KPI metrics:', this.data?.kpiMetrics);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = {
            code: error.status || 'UNKNOWN',
            message: error.message || 'Failed to load traffic data',
            details: error
          };
          this.loading = false;
          console.error('Traffic data error:', error);
        }
      });
  }

  trackByMetricId(index: number, metric: any): string {
    return metric.id;
  }
}