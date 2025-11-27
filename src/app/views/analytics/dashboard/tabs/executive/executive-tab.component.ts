import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ExecutiveTabData, DashboardResponse, DashboardError } from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { RefundsSummaryComponent } from '../../components/refunds-summary/refunds-summary.component';
import { CardComponent, OsBarChartComponent } from '@shared';

@Component({
  standalone: true,
  selector: 'app-executive-tab',
  imports: [
    CommonModule,
    TranslateModule,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    RefundsSummaryComponent,
    CardComponent,
    OsBarChartComponent
  ],
  templateUrl: './executive-tab.component.html',
  styleUrls: ['./executive-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveTabComponent {
  private readonly dashboardService = inject(DashboardDataService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals for reactive state
  readonly data = signal<ExecutiveTabData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<DashboardError | null>(null);

  // Computed signals for template optimization
  readonly currency = computed(() => this.data()?.revenue?.currency || 'EUR');

  constructor() {
    effect(() => {
      const period = this.dashboardService.period();
      const accountId = this.dashboardService.accountId();

      if (accountId) {
        untracked(() => this.loadData());
      }
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getExecutiveData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: DashboardResponse<ExecutiveTabData>) => {
          if (response.status === 'success') {
            this.data.set(response.data);
          } else {
            this.error.set(this.parseError(response.error, response.message));
          }
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(this.parseError(error?.error || error));
          this.loading.set(false);
        }
      });
  }

  private parseError(error: any, fallbackMessage?: string): DashboardError {
    if (error && typeof error === 'object' && error.code) {
      return error;
    }
    return {
      code: error?.code || error?.status?.toString() || '500',
      message: error?.message || fallbackMessage || 'An unexpected error occurred',
      details: error?.details,
      timestamp: new Date()
    };
  }

  onRetry(): void {
    this.loadData();
  }
}
