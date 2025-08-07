import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { MetricCardComponent, MetricCard } from '../../../../shared/components/card/metric-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective, IconModule } from '@coreui/icons-angular';
import { OverviewStats, QuickAction } from '../../models';
import { QUICK_ACTIONS, isActionEnabled } from './overview.utils';
import { OverviewService } from '../../services';

@Component({
  selector: 'app-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CardComponent,
    BadgeComponent,
    MetricCardComponent,
    IconDirective,
    IconModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

  stats: OverviewStats | null = null;
  loading = true;
  error = false;
  private subscription: Subscription = new Subscription();

  quickActions: QuickAction[] = QUICK_ACTIONS;
  kpiMetrics: MetricCard[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private overviewService: OverviewService
  ) {}

  ngOnInit(): void {
    this.updateKpiMetrics();
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.error = false;

    this.subscription.add(
      this.getOverviewStats().subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
          this.updateKpiMetrics(); // Обновляем метрики с новыми данными
          this.cdr.markForCheck(); // Помечаем компонент для проверки изменений
        },
        error: (error) => {
          this.error = true;
          this.stats = null;
          this.loading = false;
          this.updateKpiMetrics(); // Обновляем метрики с fallback данными
          this.cdr.markForCheck(); // Помечаем компонент для проверки изменений
        }
      })
    );
  }

  /**
   * Get overview statistics from API
   */
  private getOverviewStats(): Observable<OverviewStats> {
    return this.overviewService.getOverviewStats();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onRetry(): void {
    this.error = false;
    this.cdr.markForCheck(); // Помечаем для проверки изменений
    this.loadStats();
  }

  isActionEnabled(action: QuickAction): boolean {
    return isActionEnabled(action);
  }

  private updateKpiMetrics(): void {
    this.kpiMetrics = this.generateKpiMetrics();
  }

  private generateKpiMetrics(): MetricCard[] {
    // Use actual stats from API or fallback to zeros if still loading
    const currentStats = this.stats || {
      regions: 0,
      bundles: 0,
      products: 0,
      companyProducts: 0,
      providerProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0
    };

    return [
      {
        id: 'regions',
        title: 'productConstructor.overview.regions',
        value: currentStats.regions,
        icon: 'cil-location-pin',
        color: 'primary'
      },
      {
        id: 'bundles',
        title: 'productConstructor.overview.bundles',
        value: currentStats.bundles,
        icon: 'cil-data-transfer-down',
        color: 'info'
      },
      {
        id: 'products',
        title: 'productConstructor.overview.products',
        value: currentStats.products,
        icon: 'cil-layers',
        color: 'success'
      }
    ];
  }
}
