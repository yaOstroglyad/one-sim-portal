import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriberAnalytics, DashboardError } from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { MetricCardComponent } from '../../../../shared/components/card';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { OsBarChartComponent } from '../../../../shared/components/bar-chart';
import { OsLineChartComponent } from '../../../../shared/components/line-chart';

@Component({
  selector: 'app-subscribers-tab',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MetricCardComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    CardComponent,
    OsBarChartComponent,
    OsLineChartComponent
  ],
  templateUrl: './subscribers-tab.component.html',
  styleUrls: ['./subscribers-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribersTabComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  data: SubscriberAnalytics | null = null;
  loading = false;
  error: DashboardError | null = null;

  constructor(
    private dashboardService: DashboardDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Subscribe to period changes
    this.dashboardService.period$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.dashboardService.getSubscriberAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.status === 'success') {
            this.data = response.data;
            this.error = null;
          } else {
            this.error = {
              code: 'FETCH_ERROR',
              message: response.message || 'Failed to load subscriber analytics',
              timestamp: new Date()
            };
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loading = false;
          this.error = {
            code: 'NETWORK_ERROR',
            message: err.message || 'An error occurred while loading subscriber analytics',
            timestamp: new Date()
          };
          this.cdr.markForCheck();
        }
      });
  }

  onRetry(): void {
    this.loadData();
  }
}