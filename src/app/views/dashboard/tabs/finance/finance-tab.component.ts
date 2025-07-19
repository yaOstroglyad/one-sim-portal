import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { MetricCardComponent } from '../../../../shared/components/card';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { OsBarChartComponent } from '../../../../shared/components/bar-chart/os-bar-chart.component';
import { OsLineChartComponent } from '../../../../shared/components/line-chart/os-line-chart.component';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { FinanceAnalytics } from '../../models/finance.types';
import { DashboardError } from '../../models/dashboard.types';

@Component({
  selector: 'app-finance-tab',
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
  templateUrl: './finance-tab.component.html',
  styleUrls: ['./finance-tab.component.scss']
})
export class FinanceTabComponent implements OnInit, OnDestroy {
  data: FinanceAnalytics | null = null;
  loading = true;
  error: DashboardError | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardDataService: DashboardDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('FinanceTabComponent ngOnInit called');
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardDataService.getFinanceData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.data = response.data;
          this.loading = false;
          console.log('Finance data loaded:', this.data);
          console.log('KPI metrics:', this.data?.kpiMetrics);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = {
            code: error.status || 'UNKNOWN',
            message: error.message || 'Failed to load finance data',
            details: error
          };
          this.loading = false;
          console.error('Finance data error:', error);
        }
      });
  }
}