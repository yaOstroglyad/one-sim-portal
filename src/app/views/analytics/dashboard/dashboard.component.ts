import { Component, OnInit, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';
import { ThemeService } from '../../../shared';
import { DashboardTab } from './models/dashboard.types';
import { DashboardDataService } from './services/dashboard-data.service';
import {
  DEFAULT_PERIOD_PRESETS,
  createPeriodFromPreset,
  createCustomPeriod
} from './utils';

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

  // Tab configuration
  tabs = signal<DashboardTab[]>([
    { id: 'executive', label: 'dashboard.tabs.executive', icon: 'cilChartPie', disabled: false },
    { id: 'subscribers', label: 'dashboard.tabs.subscribers', icon: 'cilPeople', disabled: true },
    { id: 'traffic', label: 'dashboard.tabs.traffic', icon: 'cilSpeedometer', disabled: true },
    { id: 'finance', label: 'dashboard.tabs.finance', icon: 'cilDollar', disabled: true }
  ]);

  activeTab = signal<DashboardTab['id']>('executive');

  // Period presets from utils
  periodPresets = DEFAULT_PERIOD_PRESETS;

  selectedPeriod = signal<string>('last30days');
  customDateRange = signal<{ start: any; end: any }>({ start: null, end: null });
  showCustomDatePicker = signal<boolean>(false);
  isDarkTheme = signal<boolean>(false);

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
  }

  ngOnInit(): void {
    // Subscribe to global theme changes from ThemeService
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme.set(theme === 'dark');
    });

    // Filter tabs based on user permissions
    this.filterTabsByPermissions();
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
  onPeriodChange(preset: string): void {
    this.selectedPeriod.set(preset);

    if (preset === 'custom') {
      this.showCustomDatePicker.set(true);
      return;
    }

    this.showCustomDatePicker.set(false);
    const period = createPeriodFromPreset(preset);
    this.dashboardService.setPeriod(period);
  }

  /**
   * Apply custom date range
   */
  applyCustomDateRange(): void {
    const dateRange = this.customDateRange();
    if (dateRange.start && dateRange.end) {
      const period = createCustomPeriod(dateRange.start, dateRange.end);
      this.dashboardService.setPeriod(period);
      this.showCustomDatePicker.set(false);
    }
  }

  /**
   * Update custom date range start
   */
  onCustomStartDateChange(value: any): void {
    this.customDateRange.update(v => ({ ...v, start: value }));
  }

  /**
   * Update custom date range end
   */
  onCustomEndDateChange(value: any): void {
    this.customDateRange.update(v => ({ ...v, end: value }));
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
