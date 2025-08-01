import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Observable, of, timer, Subscription } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { MetricCardComponent, MetricCard } from '../../../../shared/components/card/metric-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective, IconModule } from '@coreui/icons-angular';
// Services will be used when API endpoints are ready
// import { 
//   RegionService, 
//   BundleService, 
//   ProductService, 
//   CompanyProductService,
//   ProviderProductService 
// } from '../../services';
import { OverviewStats, QuickAction } from '../../models';
import { getQuickActions, isActionEnabled } from './overview.utils';
import { AuthService, ADMIN_PERMISSION } from '../../../../shared/auth/auth.service';

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

  quickActions: QuickAction[] = [];
  kpiMetrics: MetricCard[] = [];
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Services will be injected when API endpoints are ready
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
    this.quickActions = getQuickActions(this.isAdmin);
    this.updateKpiMetrics(); // Инициализируем метрики
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
   * Emulates API call to get overview statistics
   * In real implementation, this would be replaced with actual HTTP service call
   */
  private getOverviewStats(): Observable<OverviewStats> {
    // Mock API response with different data for admin vs non-admin
    const mockStats: OverviewStats = this.isAdmin 
      ? {
          regions: 12,
          bundles: 25,
          products: 18,
          companyProducts: 45,
          providerProducts: 32,
          activeProducts: 15,
          inactiveProducts: 3
        }
      : {
          regions: 8,
          bundles: 15,
          products: 0, // Non-admin doesn't see core products
          companyProducts: 28,
          providerProducts: 0, // Non-admin doesn't see provider products
          activeProducts: 25,
          inactiveProducts: 3
        };

    // Simulate API call with delay
    return timer(800).pipe(
      map(() => mockStats),
      catchError((error) => {
        throw error;
      })
    );
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
    return isActionEnabled(action, this.isAdmin);
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

    const adminMetrics: MetricCard[] = [
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

    const nonAdminMetrics: MetricCard[] = [
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
        id: 'companyProducts',
        title: 'productConstructor.overview.companyProducts',
        value: currentStats.companyProducts,
        icon: 'cil-industry',
        color: 'secondary'
      }
    ];

    return this.isAdmin ? adminMetrics : nonAdminMetrics;
  }
}