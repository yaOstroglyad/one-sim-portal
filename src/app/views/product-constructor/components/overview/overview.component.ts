import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Observable, of, timer, Subscription } from 'rxjs';
import { map, catchError, timeout, finalize } from 'rxjs/operators';

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
import { QUICK_ACTIONS, isActionEnabled } from './overview.utils';

@Component({
  selector: 'app-overview',
  standalone: true,
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

  stats$: Observable<OverviewStats>;
  loading = true;
  error = false;
  private subscription: Subscription = new Subscription();

  quickActions: QuickAction[] = QUICK_ACTIONS;

  isActionEnabled = isActionEnabled;

  constructor() {
    // Services will be injected when API endpoints are ready
  }

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.error = false;

    // Temporary mock data until API is ready
    this.stats$ = of({
      regions: 0,
      bundles: 0,
      products: 0,
      companyProducts: 0,
      providerProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    );

    this.subscription.add(
      this.stats$.subscribe({
        next: (data) => {
          console.log('Stats loaded successfully:', data);
        },
        error: (error) => {
          console.error('Error in stats subscription:', error);
          this.error = true;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onRetry(): void {
    this.loadStats();
  }

  getKpiMetrics(): MetricCard[] {
    const stats = {
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
        value: stats.regions,
        icon: 'cil-location-pin',
        color: 'primary'
      },
      {
        id: 'bundles',
        title: 'productConstructor.overview.bundles',
        value: stats.bundles,
        icon: 'cil-data-transfer-down',
        color: 'info'
      },
      {
        id: 'products',
        title: 'productConstructor.overview.products',
        value: stats.products,
        icon: 'cil-layers',
        color: 'success'
      }
    ];
  }
}