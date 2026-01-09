import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';
import {
  ThemeService,
  AuthService,
  ADMIN_PERMISSION,
  PeriodSelectorComponent,
  PeriodDateRange,
  PeriodPreset,
  PeriodPresets,
  DEFAULT_PERIOD_PRESETS,
  AccountContextService
} from '@shared';
import { DashboardTab } from './models/dashboard.types';
import { DashboardDataService } from './services/dashboard-data.service';

// Import shared components
import { ExecutiveTabComponent } from './tabs/executive/executive-tab.component';
import { SubscribersTabComponent } from './tabs/subscribers/subscribers-tab.component';
import { TrafficTabComponent } from './tabs/traffic';
import { FinanceTabComponent } from './tabs/finance';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [
    FormsModule,
    RouterModule,
    TranslateModule,
    IconModule,
    PeriodSelectorComponent,
    ExecutiveTabComponent,
    SubscribersTabComponent,
    TrafficTabComponent,
    FinanceTabComponent
],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardService = inject(DashboardDataService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly accountContext = inject(AccountContextService);

  // Tab configuration
  tabs = signal<DashboardTab[]>([
    { id: 'executive', label: 'dashboard.tabs.executive', icon: 'cilChartPie', disabled: false },
    { id: 'subscribers', label: 'dashboard.tabs.subscribers', icon: 'cilPeople', disabled: false },
    { id: 'traffic', label: 'dashboard.tabs.traffic', icon: 'cilSpeedometer', disabled: false },
    { id: 'finance', label: 'dashboard.tabs.finance', icon: 'cilDollar', disabled: false }
  ]);

  activeTab = signal<DashboardTab['id']>('executive');

  // Period presets from utils
  periodPresets = DEFAULT_PERIOD_PRESETS;

  selectedPeriod = signal<PeriodPreset>(PeriodPresets.CURRENT_MONTH);
  isDarkTheme = signal<boolean>(false);

  // Account selector for admins
  isAdmin = signal<boolean>(false);

  constructor() {
    // React to route query params changes
    effect(() => {
      this.route.queryParams.subscribe(params => {
        const tab = params['tab'] as DashboardTab['id'];
        if (tab && this.tabs().find(t => t.id === tab)) {
          this.activeTab.set(tab);
        }
      });
    });

    // React to URL fragment changes (for deep linking from global search)
    effect(() => {
      this.route.fragment.subscribe(fragment => {
        if (fragment && this.tabs().find(t => t.id === fragment)) {
          this.activeTab.set(fragment as DashboardTab['id']);
        }
      });
    });

    // React to account changes from global context
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account) {
        // Account selected, set account ID and trigger data reload
        this.dashboardService.setAccountId(account.id);
        const currentPeriod = this.dashboardService.getCurrentPeriod();
        this.dashboardService.setPeriod(currentPeriod);
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to global theme changes from ThemeService
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme.set(theme === 'dark');
    });

    // Check if user is admin
    this.checkPermissions();

    // Filter tabs based on user permissions
    this.filterTabsByPermissions();

    // Configure account context for this page
    this.accountContext.configure({
      visible: true,
      required: false,
      selectFirstByDefault: true
    });
  }

  ngOnDestroy(): void {
    this.accountContext.reset();
  }

  /**
   * Check if user has admin permissions
   */
  private checkPermissions(): void {
    this.isAdmin.set(this.authService.hasPermission(ADMIN_PERMISSION));
  }

  /**
   * Filter tabs based on user permissions
   */
  private filterTabsByPermissions(): void {
    // For now, show all tabs for authenticated users
    // In future, can add specific permissions per tab
    const currentActiveTab = this.activeTab();
    this.tabs.update(tabs => tabs.map(tab => ({
      ...tab,
      active: tab.id === currentActiveTab
    })));
  }

  /**
   * Change active tab
   */
  onTabChange(tabId: DashboardTab['id']): void {
    this.activeTab.set(tabId);

    // Update route query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId },
      queryParamsHandling: 'merge'
    });

    // Update tab active state
    this.tabs.update(tabs => tabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    })));
  }

  /**
   * Change period selection
   */
  /**
   * Handle period change from period-selector component
   * @param period - PeriodDateRange from period-selector
   */
  onPeriodChange(period: PeriodDateRange): void {
    // Update selected period for UI state
    if (period.preset) {
      this.selectedPeriod.set(period.preset);
    }

    // Convert to Dashboard format and set period
    const dashboardPeriod = {
      startDate: period.startDate,
      endDate: period.endDate,
      label: period.label || '',
      preset: period.preset
    };

    this.dashboardService.setPeriod(dashboardPeriod);
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    // Trigger reload by updating period to same value
    // This will cause tabs to re-fetch data
    this.dashboardService.setPeriod(this.dashboardService.getCurrentPeriod());
  }

  /**
   * Export data (future implementation)
   */
  exportData(): void {
    // Export functionality to be implemented
  }

  // Theme toggle removed - will be managed by global theme service
}
