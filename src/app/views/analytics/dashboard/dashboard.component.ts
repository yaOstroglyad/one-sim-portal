import { Component, OnInit, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';
import {
  ThemeService,
  AuthService,
  ADMIN_PERMISSION,
  Account,
  PeriodSelectorComponent,
  PeriodDateRange,
  PeriodPreset,
  PeriodPresets,
  DEFAULT_PERIOD_PRESETS
} from '@shared';
import { AccountSelectorComponent } from '@shared/components/account-selector/account-selector.component';
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
        CommonModule,
        FormsModule,
        RouterModule,
        TranslateModule,
        IconModule,
        AccountSelectorComponent,
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
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardService = inject(DashboardDataService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  // Tab configuration
  tabs = signal<DashboardTab[]>([
    { id: 'executive', label: 'dashboard.tabs.executive', icon: 'cilChartPie', disabled: false },
    { id: 'subscribers', label: 'dashboard.tabs.subscribers', icon: 'cilPeople', disabled: false },
    { id: 'traffic', label: 'dashboard.tabs.traffic', icon: 'cilSpeedometer', disabled: true },
    { id: 'finance', label: 'dashboard.tabs.finance', icon: 'cilDollar', disabled: true }
  ]);

  activeTab = signal<DashboardTab['id']>('executive');

  // Period presets from utils
  periodPresets = DEFAULT_PERIOD_PRESETS;

  selectedPeriod = signal<PeriodPreset>(PeriodPresets.CURRENT_MONTH);
  isDarkTheme = signal<boolean>(false);

  // Account selector for admins
  isAdmin = signal<boolean>(false);
  selectedAccountId = signal<string | null>(null);
  isAccountReady = signal<boolean>(false); // Flag to track if account is ready for data loading

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

    // React to account readiness - trigger period update to reload data
    effect(() => {
      const accountReady = this.isAccountReady();
      const accountId = this.selectedAccountId();

      if (accountReady && accountId) {
        // Account is ready, trigger data reload by setting period
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

    // Initialize account based on user role
    this.initializeAccount();

    // Filter tabs based on user permissions
    this.filterTabsByPermissions();
  }

  /**
   * Check if user has admin permissions
   */
  private checkPermissions(): void {
    this.isAdmin.set(this.authService.hasPermission(ADMIN_PERMISSION));
  }

  /**
   * Initialize account ID based on user role
   * For admins: wait for account-selector
   * For non-admins: use logged user's accountId immediately
   */
  private initializeAccount(): void {
    if (!this.isAdmin()) {
      // For non-admins, use account from logged user immediately
      const loggedUser = this.authService.loggedUser;
      if (loggedUser?.accountId) {
        this.selectedAccountId.set(loggedUser.accountId);
        this.dashboardService.setAccountId(loggedUser.accountId);
        this.isAccountReady.set(true); // Mark as ready immediately for non-admins
      }
    }
    // For admins: isAccountReady will be set to true when account is selected via onAccountSelected
  }

  /**
   * Handle account selection change (for admins)
   */
  onAccountSelected(account: Account): void {
    this.selectedAccountId.set(account.id);
    this.dashboardService.setAccountId(account.id);
    this.isAccountReady.set(true); // Mark account as ready after selection
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
