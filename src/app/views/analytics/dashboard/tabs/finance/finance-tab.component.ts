import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CardComponent, OsBarChartComponent } from '@shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { FinanceAnalytics } from '../../models/finance.types';
import { DashboardError, DashboardResponse } from '../../models/dashboard.types';
import { parseDashboardError } from '../../utils';

@Component({
  standalone: true,
  selector: 'app-finance-tab',
  imports: [
    TranslateModule,
    CardComponent,
    OsBarChartComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent
  ],
  templateUrl: './finance-tab.component.html',
  styleUrls: ['./finance-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceTabComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<DashboardError | null>(null);
  readonly data = signal<FinanceAnalytics | null>(null);

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

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardDataService.getFinanceData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: DashboardResponse<FinanceAnalytics>) => {
          if (response.status === 'success') {
            this.data.set(response.data);
          } else {
            this.error.set(parseDashboardError(response.error, response.message));
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(parseDashboardError(err, 'Failed to load finance data'));
          this.loading.set(false);
        }
      });
  }
}
