import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ExecutiveTabData, DashboardResponse, DashboardError } from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { CardComponent, OsBarChartComponent } from '@shared';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  standalone: true,
  selector: 'app-executive-tab',
  imports: [
    CommonModule,
    TranslateModule,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    CardComponent,
    OsBarChartComponent,
    IconComponent
  ],
  templateUrl: './executive-tab.component.html',
  styleUrls: ['./executive-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveTabComponent {
  private readonly dashboardService = inject(DashboardDataService);

  // Signals for reactive state
  readonly data = signal<ExecutiveTabData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<DashboardError | null>(null);

  // UI state
  readonly refundsExpanded = signal(false);

  toggleRefunds(): void {
    this.refundsExpanded.update(v => !v);
  }

  constructor() {
    // React to period and accountId changes using effect
    effect(() => {
      const period = this.dashboardService.period(); // Track signal changes
      const accountId = this.dashboardService.accountId(); // Track accountId changes

      // Only load data if accountId is set (required for API calls)
      if (accountId) {
        // Schedule data load on next tick to avoid effect issues
        setTimeout(() => this.loadData(), 0);
      }
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getExecutiveData()
      .subscribe({
        next: (response: DashboardResponse<ExecutiveTabData>) => {
          if (response.status === 'success') {
            this.data.set(response.data);
            this.loading.set(false);
          } else {
            // Error response from createErrorResponse - use the full error object
            const errorToSet = response.error || {
              code: '500',
              message: response.message || 'Failed to load executive data',
              timestamp: new Date()
            };
            this.error.set(errorToSet);
            this.loading.set(false);
          }
        },
        error: (error) => {
          // Check if this is an ApiResponse with error status
          if (error && error.status === 'error' && error.error) {
            // Error wrapped in ApiResponse format from createErrorResponse
            this.error.set(error.error);
          } else {
            // Raw error (not wrapped in ApiResponse)
            this.error.set({
              code: error?.code || error?.status?.toString() || '500',
              message: error?.message || 'An unexpected error occurred',
              details: error?.details,
              timestamp: new Date()
            });
          }
          this.loading.set(false);
        }
      });
  }

  onRetry(): void {
    this.loadData();
  }
}
