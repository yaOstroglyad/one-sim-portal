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

import { CardComponent, OsBarChartComponent } from '@shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { RefundsSummaryComponent } from '../../components/refunds-summary/refunds-summary.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ExecutiveTabData, DashboardResponse, DashboardError } from '../../models/dashboard.types';
import { parseDashboardError } from '../../utils';

@Component({
  standalone: true,
  selector: 'app-executive-tab',
  imports: [
    CommonModule,
    TranslateModule,
    CardComponent,
    OsBarChartComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
    RefundsSummaryComponent
  ],
  templateUrl: './executive-tab.component.html',
  styleUrls: ['./executive-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveTabComponent {
  private readonly dashboardService = inject(DashboardDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<DashboardError | null>(null);
  readonly data = signal<ExecutiveTabData | null>(null);

  readonly currency = computed(() => this.data()?.revenue?.currency || 'EUR');

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

    this.dashboardService.getExecutiveData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: DashboardResponse<ExecutiveTabData>) => {
          if (response.status === 'success') {
            this.data.set(response.data);
          } else {
            this.error.set(parseDashboardError(response.error, response.message));
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(parseDashboardError(err?.error || err, 'An unexpected error occurred'));
          this.loading.set(false);
        }
      });
  }
}
