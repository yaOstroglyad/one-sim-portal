import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import {
  CardComponent,
  MetricCardComponent,
  MetricCard,
  Account,
  AuthService,
  ADMIN_PERMISSION
} from '@shared';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective, IconModule } from '@coreui/icons-angular';
import { AccountSelectorComponent } from '@shared/components/account-selector/account-selector.component';

import { TicketStats } from '../../models';
import { QUICK_ACTIONS } from './overview.utils';
import { OverviewService } from '../../services';
import { QuickAction } from '../../models';

@Component({
    selector: 'app-tickets-overview',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        CardComponent,
        MetricCardComponent,
        IconDirective,
        IconModule,
        AccountSelectorComponent
    ],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

  stats: TicketStats | null = null;
  loading = true;
  error = false;
  private subscription: Subscription = new Subscription();

  quickActions: QuickAction[] = QUICK_ACTIONS;
  kpiMetrics: MetricCard[] = [];

  // Account selector properties
  isAdmin = false;
  selectedAccountId: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private overviewService: OverviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('[TicketsOverview] Component initialized');
    this.checkPermissions();
    this.initializeAccount();
    this.updateKpiMetrics(); // Initialize metrics with fallback data
    console.log('[TicketsOverview] Initial KPI metrics set:', this.kpiMetrics.length);
    this.loadStats();
  }

  private checkPermissions(): void {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  private initializeAccount(): void {
    if (!this.isAdmin) {
      // Для не-админов используем аккаунт из loggedUser
      const loggedUser = this.authService.loggedUser;
      if (loggedUser?.accountId) {
        this.selectedAccountId = loggedUser.accountId;
        // Данные будут загружены в loadStats()
      }
    }
  }

  public onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    this.loadStats();
  }

  private loadStats(): void {
    // Don't load stats if admin hasn't selected an account yet
    if (this.isAdmin && !this.selectedAccountId) {
      console.log('[TicketsOverview] Admin without account selected - skipping stats loading');
      return;
    }

    console.log('[TicketsOverview] Starting to load stats...');
    this.loading = true;
    this.error = false;
    console.log('[TicketsOverview] State set - loading: true, error: false');
    this.cdr.markForCheck(); // Trigger initial change detection
    console.log('[TicketsOverview] Change detection triggered');

    console.log('[TicketsOverview] Calling getOverviewStats()...');
    this.subscription.add(
      this.getOverviewStats().subscribe({
        next: (data) => {
          console.log('[TicketsOverview] ✅ SUCCESS - Received ticket stats:', data);
          this.stats = data;
          this.loading = false;
          this.error = false;
          console.log('[TicketsOverview] State updated - loading: false, error: false, stats:', !!this.stats);
          this.updateKpiMetrics(); // Update metrics with new data
          console.log('[TicketsOverview] KPI metrics updated with real data');
          this.cdr.markForCheck(); // Mark component for change detection
          console.log('[TicketsOverview] Final change detection triggered');
        },
        error: (error) => {
          console.log('[TicketsOverview] ❌ ERROR - Failed to load ticket stats');
          console.error('[TicketsOverview] Error details:', error);
          console.log('[TicketsOverview] Error status:', error.status, 'Error message:', error.message);

          this.error = true;
          this.loading = false;

          // Don't set stats to null - keep existing data or use fallback
          if (!this.stats) {
            console.log('[TicketsOverview] No existing stats, using fallback data');
            this.stats = this.getFallbackStats();
          } else {
            console.log('[TicketsOverview] Keeping existing stats data');
          }

          console.log('[TicketsOverview] State updated - loading: false, error: true, stats:', !!this.stats);
          this.updateKpiMetrics(); // Update metrics with current data (real or fallback)
          console.log('[TicketsOverview] KPI metrics updated with fallback data');
          this.cdr.markForCheck(); // Mark component for change detection
          console.log('[TicketsOverview] Error state change detection triggered');
        }
      })
    );
  }

  /**
   * Get overview statistics from API
   */
  private getOverviewStats(): Observable<TicketStats> {
    console.log('[TicketsOverview] Calling overviewService.getTicketStats() with accountId:', this.selectedAccountId);
    const observable = this.overviewService.getTicketStats(this.selectedAccountId || undefined);
    console.log('[TicketsOverview] Observable created:', !!observable);
    return observable;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onRetry(): void {
    console.log('[TicketsOverview] 🔄 RETRY button clicked');
    this.error = false;
    this.cdr.markForCheck(); // Mark for change detection
    console.log('[TicketsOverview] Error cleared, reloading stats...');
    this.loadStats();
  }


  private updateKpiMetrics(): void {
    this.kpiMetrics = this.generateKpiMetrics();
  }

  private getFallbackStats(): TicketStats {
    return {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      averageResolutionTime: 0,
      ticketsTodayCount: 0,
      ticketsThisWeekCount: 0,
      ticketsThisMonthCount: 0
    };
  }

  private generateKpiMetrics(): MetricCard[] {
    // Use actual stats from API or fallback if no data available
    const currentStats = this.stats || this.getFallbackStats();

    return [
      {
        id: 'total-tickets',
        title: 'tickets.overview.totalTickets',
        value: currentStats.totalTickets,
        icon: 'cil-list',
        color: 'primary'
      },
      {
        id: 'open-tickets',
        title: 'tickets.overview.openTickets',
        value: currentStats.openTickets,
        icon: 'cil-clock',
        color: 'warning'
      },
      {
        id: 'in-progress-tickets',
        title: 'tickets.overview.inProgressTickets',
        value: currentStats.inProgressTickets,
        icon: 'cil-settings',
        color: 'info'
      },
      {
        id: 'tickets-today',
        title: 'tickets.overview.ticketsToday',
        value: currentStats.ticketsTodayCount,
        icon: 'cil-calendar-today',
        color: 'info'
      }
    ];
  }

  /**
   * Get query params with accountId included for navigation
   */
  getQueryParamsWithAccount(originalParams: Record<string, any> = {}): Record<string, any> {
    const params = { ...originalParams };

    // Add accountId to query params if available
    if (this.selectedAccountId) {
      params['accountId'] = this.selectedAccountId;
    }

    return params;
  }
}
