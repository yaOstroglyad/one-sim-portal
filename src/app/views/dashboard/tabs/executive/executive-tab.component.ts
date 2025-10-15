import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { ExecutiveTabData, DashboardResponse } from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';

// Import shared components
import { MetricCardComponent } from '../../../../shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';

// Import shared components
import { CardComponent } from '../../../../shared';
import { OsBarChartComponent } from '../../../../shared';

@Component({
  standalone: true,
    selector: 'app-executive-tab',
    imports: [
        CommonModule,
        TranslateModule,
        MetricCardComponent,
        LoadingIndicatorComponent,
        ErrorDisplayComponent,
        CardComponent,
        OsBarChartComponent
    ],
    templateUrl: './executive-tab.component.html',
    styleUrls: ['./executive-tab.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveTabComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  data: ExecutiveTabData | null = null;
  loading = true;
  error: any = null;

  constructor(
    private dashboardService: DashboardDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.dashboardService.getExecutiveData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: DashboardResponse<ExecutiveTabData>) => {
          if (response.status === 'success') {
            this.data = response.data;
            this.loading = false;
          } else {
            this.error = { message: response.message };
            this.loading = false;
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  onRetry(): void {
    this.loadData();
  }
}
