import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import { GenericTableModule, TableConfig, HeaderModule, Account } from '../../shared';
import { AccountSelectorComponent } from '../../shared/components/account-selector/account-selector.component';
import { EmailLogsTableConfigService } from './index';
import { AuthService, ADMIN_PERMISSION } from '../../shared/auth/auth.service';
import { EmailLog, EmailLogFilterParams } from '../../shared/model';
import { FormControlDirective, ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-email-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    GenericTableModule,
    AccountSelectorComponent,
    HeaderModule,
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
  private unsubscribe$ = new Subject<void>();

  // Form Controls
  public filterForm: FormGroup = new FormGroup({
    iccid: new FormControl(null),
  });

  // Table Configuration
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<EmailLog[]>;

  // Permission check
  isAdmin = false;
  selectedAccountId: string | null = null;

  constructor(
    private tableConfigService: EmailLogsTableConfigService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.initializeAccount();
    this.initializeTable();
    this.setupFilters();
  }

  private initializeTable(): void {
    this.tableConfig$ = this.tableConfigService.getTableConfig();
    this.dataList$ = of([]);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
        this.applyFilter(); // Загружаем данные сразу для не-админов
      }
    }
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  public onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    this.applyFilter();
  }

  public applyFilter(): void {
    if (!this.selectedAccountId) return;

    const params = {
      page: 0,
      size: 10,
      accountId: this.selectedAccountId,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public onPageChange({page, size}: { page: number; size: number }): void {
    if (!this.selectedAccountId) return;

    const params = {
      page,
      size,
      accountId: this.selectedAccountId,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableConfigService.updateColumnVisibility(selectedColumns);
  }

  public resetForm(): void {
    this.filterForm?.reset();
  }

  private loadData(params: {
    accountId: string;
    iccid?: string;
    page?: number;
    size?: number;
  }): void {
    const loadParams: EmailLogFilterParams = {
      accountId: params.accountId,
      page: params.page || 0,
      size: params.size || 10
    };

    if (params.iccid?.trim()) {
      loadParams.iccid = params.iccid.trim();
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
        error: (error) => {
          console.error('Error loading email logs:', error);
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
}
