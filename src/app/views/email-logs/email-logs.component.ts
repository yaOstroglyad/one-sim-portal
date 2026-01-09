import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, inject, effect } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  GenericTableComponent,
  TableConfig,
  HeaderComponent,
  AuthService,
  ADMIN_PERMISSION,
  EmailLog,
  EmailLogFilterParams,
  DatepickerComponent,
  AccountContextService
} from '@shared';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { EmailLogsTableConfigService } from './index';
import { FormControlDirective, ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
    standalone: true,
    selector: 'app-email-logs',
    imports: [
    ReactiveFormsModule,
    DatepickerComponent,
    TranslateModule,
    GenericTableComponent,
    HeaderComponent,
    FormControlDirective,
    ButtonDirective,
    IconDirective
],
    providers: [EmailLogsTableConfigService],
    templateUrl: './email-logs.component.html',
    styleUrls: ['./email-logs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailLogsComponent implements OnInit, OnDestroy {
  @ViewChild('genericTable') genericTable: GenericTableComponent;

  private unsubscribe$ = new Subject<void>();
  private readonly accountContext = inject(AccountContextService);
  private readonly tableConfigService = inject(EmailLogsTableConfigService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Form Controls
  public filterForm: FormGroup = new FormGroup({
    iccid: new FormControl(null),
    email: new FormControl(null),
    dateFrom: new FormControl(null),
    dateTo: new FormControl(null),
  });

  // Table Configuration
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<EmailLog[]>;

  // Permission check
  isAdmin = false;

  constructor() {
    // React to account changes from global context
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account) {
        this.resetForm();
      }
    });
  }

  ngOnInit(): void {
    this.checkPermissions();
    this.initializeTable();
    this.setupFilters();

    // Configure account context for this page
    this.accountContext.configure({
      visible: true,
      required: true
    });
  }

  private initializeTable(): void {
    this.tableConfig$ = this.tableConfigService.getTableConfig();
    this.dataList$ = of([]);
  }

  ngOnDestroy(): void {
    this.accountContext.reset();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private checkPermissions(): void {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  public applyFilter(): void {
    const selectedAccountId = this.accountContext.selectedAccountId();
    if (!selectedAccountId) return;

    const formValues = this.filterForm.getRawValue();

    const params = {
      page: 0,
      size: 15,
      accountId: selectedAccountId,
      ...formValues
    };

    this.loadData(params);
  }

  public onPageChange({page, size}: { page: number; size: number }): void {
    const selectedAccountId = this.accountContext.selectedAccountId();
    if (!selectedAccountId) return;

    const params = {
      page,
      size,
      accountId: selectedAccountId,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableConfigService.updateColumnVisibility(selectedColumns);
  }

  public resetForm(): void {
    // Reset pagination directly on the table component
    if (this.genericTable) {
      this.genericTable.currentPage = 0;
    }

    this.filterForm?.reset();
    this.applyFilter();
  }

  private loadData(params: {
    accountId: string;
    iccid?: string;
    email?: string;
    dateFrom?: string | Date;
    dateTo?: string | Date;
    page?: number;
    size?: number;
  }): void {

    const loadParams: EmailLogFilterParams = {
      accountId: params.accountId,
      page: params.page || 0,
      size: params.size || 15
    };

    if (params.iccid?.trim()) {
      loadParams.iccid = params.iccid.trim();
    }

    if (params.email?.trim()) {
      loadParams.email = params.email.trim();
    }

    if (params.dateFrom) {
      const formattedDateFrom = this.formatDateForAPI(params.dateFrom);
      if (formattedDateFrom) {
        loadParams.dateFrom = formattedDateFrom;
      } else {
      }
    } else {
    }

    if (params.dateTo) {
      const formattedDateTo = this.formatDateForAPI(params.dateTo);
      if (formattedDateTo) {
        loadParams.dateTo = formattedDateTo;
      } else {
      }
    } else {
    }
    this.tableConfigService.loadData(loadParams)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          if (response && response.content) {
            // Transform data for display
            const transformedData = this.transformDataForDisplay(response.content);
            this.tableConfigService.updateConfigData(response.totalPages);
            this.tableConfig$ = this.tableConfigService.getTableConfig();
            this.dataList$ = of(transformedData);
            this.cdr.detectChanges();
          } else {
            this.dataList$ = of([]);
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.dataList$ = of([]);
          this.cdr.detectChanges();
        }
      });
  }

  private transformDataForDisplay(data: EmailLog[]): any[] {
    return data.map(item => ({
      ...item,
      // Transform iccids array to string for display
      iccids: item.iccids && item.iccids.length > 0
        ? item.iccids.join(', ')
        : '-',
      // Transform metadata object to status string
      metadata: item.metadata
        ? `${item.metadata.status}`
        : '-'
    }));
  }

  private formatDateForAPI(date: string | Date | null): string {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return dateObj.toISOString();
    } catch {
      return '';
    }
  }
}
