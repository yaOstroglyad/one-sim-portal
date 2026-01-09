import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  GenericTableComponent,
  AuthService,
  ADMIN_PERMISSION,
  PeriodSelectorComponent,
  PeriodDateRange,
  PeriodPreset,
  PeriodPresets,
  formatDateForAPI,
  createPeriodFromPreset,
  IconComponent,
  ExcelExportService,
  AccountContextService
} from '@shared';
import { mapDataForExcel } from '@shared/utils/data';
import { BundlePurchasesTableService } from './services/bundle-purchases-table.service';
import { BundleLeftoversTableService } from './services/bundle-leftovers-table.service';
import { TrafficUsageTableService } from './services/traffic-usage-table.service';
import { DEFAULT_REPORT_TABS, ReportTab, ReportTabId } from './models/report-tab.model';
import { ReportStrategyService } from './services/report-strategy.service';
import { ReportStrategy } from './models/report-strategy.interface';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [
    TranslateModule,
    GenericTableComponent,
    PeriodSelectorComponent,
    IconComponent
],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly bundlePurchasesTableService = inject(BundlePurchasesTableService);
  private readonly bundleLeftoversTableService = inject(BundleLeftoversTableService);
  private readonly trafficUsageTableService = inject(TrafficUsageTableService);
  private readonly excelExportService = inject(ExcelExportService);
  private readonly translateService = inject(TranslateService);
  private readonly strategyService = inject(ReportStrategyService);
  private readonly accountContext = inject(AccountContextService);
  private readonly unsubscribe$ = new Subject<void>();

  // Tab Management
  private readonly allTabs = signal<ReportTab[]>(DEFAULT_REPORT_TABS);
  public readonly activeTabId = signal<string>(ReportTabId.BUNDLE_PURCHASES);

  // Computed signals - filter tabs based on admin permission
  public readonly tabs = computed(() => {
    const allTabs = this.allTabs();
    if (this.isAdmin()) {
      return allTabs;
    }
    // Non-admins see only Bundle Purchases tab
    return allTabs.filter(tab => tab.id === ReportTabId.BUNDLE_PURCHASES);
  });

  public readonly activeTab = computed(() =>
    this.tabs().find(tab => tab.id === this.activeTabId())
  );

  public readonly currentStrategy = computed(() =>
    this.strategyService.getStrategy(this.activeTabId())
  );

  public readonly currentDescription = computed(() =>
    this.currentStrategy().getDescriptionKey()
  );

  public readonly currentTableService = computed(() => {
    const tabId = this.activeTabId();
    switch (tabId) {
      case ReportTabId.BUNDLE_PURCHASES:
        return this.bundlePurchasesTableService;
      case ReportTabId.BUNDLE_LEFTOVERS:
        return this.bundleLeftoversTableService;
      case ReportTabId.TRAFFIC_USAGE:
        return this.trafficUsageTableService;
      default:
        return this.bundlePurchasesTableService;
    }
  });

  // General Signals
  public readonly isAdmin = signal(false);
  public readonly selectedPeriod = signal<PeriodPreset>(PeriodPresets.CURRENT_MONTH);
  public readonly loading = signal(false);
  public readonly hasData = signal(false);
  public readonly currentPeriod = signal<PeriodDateRange | null>(null);

  constructor() {
    // React to account changes from global context
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account && this.currentPeriod()) {
        this.loadReport();
      }
    });
  }

  // Table Configuration (dynamic based on active tab)
  public get tableConfig$(): BehaviorSubject<any> {
    return this.currentTableService().getTableConfig();
  }

  public get dataList$(): Observable<any[]> {
    return this.currentTableService().dataList$;
  }

  ngOnInit(): void {
    this.checkPermissions();
    this.initializePeriod();

    // Configure account context for this page
    this.accountContext.configure({
      visible: true,
      required: true
    });
  }

  ngOnDestroy(): void {
    this.accountContext.reset();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private checkPermissions(): void {
    this.isAdmin.set(this.authService.hasPermission(ADMIN_PERMISSION));
  }

  private initializePeriod(): void {
    // Load default period (current month) on component init
    const defaultPeriod = createPeriodFromPreset(PeriodPresets.CURRENT_MONTH);
    this.currentPeriod.set(defaultPeriod);

    // Auto-load data with default period
    // For admins: load data for all accounts (without accountId)
    // For non-admins: load data for their account
    this.loadReport();
  }

  public onTabChange(tabId: string): void {
    // Don't switch to disabled tabs
    const tab = this.tabs().find(t => t.id === tabId);
    if (tab?.disabled) {
      return;
    }

    this.activeTabId.set(tabId);

    // Reload data for the new tab
    if (this.currentPeriod()) {
      this.loadReport();
    }
  }

  public onPeriodChange(period: PeriodDateRange): void {
    this.currentPeriod.set(period);
    if (period.preset) {
      this.selectedPeriod.set(period.preset);
    }
    // Automatically load report when period changes
    this.loadReport();
  }

  private loadReport(): void {
    const period = this.currentPeriod();
    if (!period) {
      return;
    }

    this.loading.set(true);

    // Use current strategy to load data
    const strategy = this.currentStrategy();
    const params = {
      period,
      // Pass accountId from global context
      // For admins without selection: undefined (get data for all accounts)
      // For non-admins: their accountId
      accountId: this.accountContext.selectedAccountId() || undefined
    };

    strategy.loadData(params)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.currentTableService().originalDataSubject.next(data);
          this.hasData.set(data.length > 0);
          this.loading.set(false);

          // Update footer with custom values if strategy provides calculateFooterValues
          this.updateFooterValues(data);
        },
        error: () => {
          this.currentTableService().originalDataSubject.next([]);
          this.hasData.set(false);
          this.loading.set(false);
        }
      });
  }

  /**
   * Update footer values using strategy's calculateFooterValues method
   * Footer visibility logic:
   * - Admin with no account selected: hide footer (data from all accounts)
   * - Admin with account selected: show footer
   * - Non-admin: always show footer (data only from their account)
   */
  private updateFooterValues(data: any[]): void {
    const strategy = this.currentStrategy();
    const currentConfig = this.currentTableService().tableConfigSubject.value;

    if (!currentConfig.footer) {
      return;
    }

    // Determine footer visibility based on role and account selection
    const shouldShowFooter = !this.isAdmin() || this.accountContext.selectedAccountId() !== null;
    currentConfig.footer.enabled = shouldShowFooter;

    // If footer is disabled, clear values and skip calculation
    if (!shouldShowFooter) {
      currentConfig.footer.customValues = undefined;
      currentConfig.footer.customTooltips = undefined;
      this.currentTableService().tableConfigSubject.next({...currentConfig});
      return;
    }

    // Check if strategy has custom footer calculation
    if (!strategy.calculateFooterValues) {
      this.currentTableService().tableConfigSubject.next({...currentConfig});
      return;
    }

    // Calculate custom footer values and tooltips
    const result = strategy.calculateFooterValues(data);

    // Update table config with custom values and tooltips
    currentConfig.footer.customValues = result.values;
    currentConfig.footer.customTooltips = result.tooltips;
    this.currentTableService().tableConfigSubject.next({...currentConfig});
  }

  /**
   * Export report data to Excel
   * Uses current strategy to determine mapping and transformers
   */
  public exportData(): void {
    const currentData = this.currentTableService().originalDataSubject.value;

    if (!currentData || currentData.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get current strategy for export configuration
    const strategy = this.currentStrategy();

    // Transform data using strategy's mapping, transformers, and numeric fields
    const exportData = mapDataForExcel(
      currentData as any[],
      strategy.getExportMapping() as any,
      this.translateService,
      strategy.getExportTransformers?.() || {},
      strategy.getNumericFields?.() || []
    );

    // Generate filename with current date and strategy prefix
    const period = this.currentPeriod();
    const dateStr = period
      ? `${formatDateForAPI(period.startDate)}_${formatDateForAPI(period.endDate)}`
      : new Date().toISOString().split('T')[0];

    const fileName = `${strategy.getExportFilePrefix()}_${dateStr}`;
    const sheetName = this.translateService.instant(strategy.getSheetNameKey());

    this.excelExportService.exportToExcel(exportData, fileName, sheetName);
  }
}
