import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';
import { AuthService } from '../../shared';
import { DashboardTab, DashboardPeriod } from './models/dashboard.types';
import { DashboardDataService } from './services/dashboard-data.service';

// Import shared standalone components
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge';
import { OsBarChartComponent } from '../../shared/components/bar-chart';
import { OsLineChartComponent } from '../../shared/components/line-chart';

// Import dashboard-specific components
import { MetricCardComponent } from './components/metric-card/metric-card.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from './components/error-display/error-display.component';
import { ExecutiveTabComponent } from './tabs/executive/executive-tab.component';
import { SubscribersTabComponent } from './tabs/subscribers/subscribers-tab.component';
import { TrafficTabComponent } from './tabs/traffic/traffic-tab.component';
import { FinanceTabComponent } from './tabs/finance/finance-tab.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    IconModule,
    CardComponent,
    BadgeComponent,
    OsBarChartComponent,
    OsLineChartComponent,
    MetricCardComponent,
    LoadingIndicatorComponent,
    ErrorDisplayComponent,
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
  private destroy$ = new Subject<void>();
  
  // Tab configuration
  tabs: DashboardTab[] = [
    { id: 'executive', label: 'dashboard.tabs.executive', icon: 'cilChartPie' },
    { id: 'subscribers', label: 'dashboard.tabs.subscribers', icon: 'cilPeople' },
    { id: 'traffic', label: 'dashboard.tabs.traffic', icon: 'cilSpeedometer' },
    { id: 'finance', label: 'dashboard.tabs.finance', icon: 'cilDollar' }
  ];
  
  activeTab: DashboardTab['id'] = 'executive';
  
  // Period presets
  periodPresets = [
    { label: 'dashboard.periods.today', value: 'today' },
    { label: 'dashboard.periods.yesterday', value: 'yesterday' },
    { label: 'dashboard.periods.last7days', value: 'last7days' },
    { label: 'dashboard.periods.last30days', value: 'last30days' },
    { label: 'dashboard.periods.lastMonth', value: 'lastMonth' },
    { label: 'dashboard.periods.custom', value: 'custom' }
  ];
  
  selectedPeriod = 'last30days';
  customDateRange = { start: null, end: null };
  showCustomDatePicker = false;
  isDarkTheme = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private translateService: TranslateService,
    private dashboardService: DashboardDataService
  ) {}

  ngOnInit(): void {
    // Initialize theme from localStorage (will be managed by parent/global theme service)
    const savedTheme = localStorage.getItem('dashboard-theme');
    this.isDarkTheme = savedTheme === 'dark';
    
    // Filter tabs based on user permissions
    this.filterTabsByPermissions();
    
    // Get active tab from route
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const tab = params['tab'] as DashboardTab['id'];
        if (tab && this.tabs.find(t => t.id === tab)) {
          this.activeTab = tab;
        }
      });
    
    // Subscribe to period changes
    this.dashboardService.period$
      .pipe(takeUntil(this.destroy$))
      .subscribe(period => {
        // Handle period updates if needed
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Filter tabs based on user permissions
   */
  private filterTabsByPermissions(): void {
    // For now, show all tabs for authenticated users
    // In future, can add specific permissions per tab
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === this.activeTab
    }));
  }

  /**
   * Change active tab
   */
  onTabChange(tabId: DashboardTab['id']): void {
    this.activeTab = tabId;
    
    // Update route query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId },
      queryParamsHandling: 'merge'
    });
    
    // Update tab active state
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    }));
  }

  /**
   * Change period selection
   */
  onPeriodChange(preset: string): void {
    this.selectedPeriod = preset;
    
    if (preset === 'custom') {
      this.showCustomDatePicker = true;
      return;
    }
    
    this.showCustomDatePicker = false;
    const period = this.createPeriodFromPreset(preset);
    this.dashboardService.setPeriod(period);
  }

  /**
   * Apply custom date range
   */
  applyCustomDateRange(): void {
    if (this.customDateRange.start && this.customDateRange.end) {
      const period: DashboardPeriod = {
        startDate: new Date(this.customDateRange.start),
        endDate: new Date(this.customDateRange.end),
        label: 'Custom Period',
        preset: 'custom'
      };
      
      this.dashboardService.setPeriod(period);
      this.showCustomDatePicker = false;
    }
  }

  /**
   * Create period from preset
   */
  private createPeriodFromPreset(preset: string): DashboardPeriod {
    const endDate = new Date();
    const startDate = new Date();
    let label = '';

    switch (preset) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        label = 'Today';
        break;
      
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        label = 'Yesterday';
        break;
      
      case 'last7days':
        startDate.setDate(startDate.getDate() - 7);
        label = 'Last 7 Days';
        break;
      
      case 'last30days':
        startDate.setDate(startDate.getDate() - 30);
        label = 'Last 30 Days';
        break;
      
      case 'lastMonth':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(0); // Last day of previous month
        label = 'Last Month';
        break;
    }

    return {
      startDate,
      endDate,
      label,
      preset: preset as any
    };
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.dashboardService.clearCache();
    // Trigger refresh in active tab component
  }

  /**
   * Export data (future implementation)
   */
  exportData(): void {
    console.log('Export functionality to be implemented');
  }

  // Theme toggle removed - will be managed by global theme service
}