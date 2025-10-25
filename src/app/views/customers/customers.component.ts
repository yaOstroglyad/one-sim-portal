import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  Customer,
  CustomersDataService,
  CustomerType,
  TableConfig,
  CompaniesDataService,
  SearchableSelectOption,
  SmartFilterConfig,
  AuthService,
  ADMIN_PERMISSION,
  GenericTableComponent,
  HeaderComponent,
  SearchableSelectComponent,
  SmartFilterHeaderComponent
} from '../../shared';
import { CustomersTableService } from './customers-table.service';
import { CustomersUtils, CustomersFilterParams } from './customers.utils';

interface FilterFieldConfig {
	key: string;
	label: string;
	type: 'input' | 'searchable-select';
	adminOnly?: boolean;
}

@Component({
    standalone: true,
    selector: 'app-customers',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        GenericTableComponent,
        HeaderComponent,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatSnackBarModule,
        SearchableSelectComponent,
        SmartFilterHeaderComponent,
        FormControlDirective,
        IconDirective,
        ButtonDirective,
        TranslateModule
    ],
    providers: [CustomersTableService],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, OnDestroy {
	private cdr = inject(ChangeDetectorRef);
	private tableService = inject(CustomersTableService);
	private customersDataService = inject(CustomersDataService);
	private companiesDataService = inject(CompaniesDataService);
	private router = inject(Router);
	private dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	private authService = inject(AuthService);

	protected readonly CustomerType = CustomerType;
	private unsubscribe$ = new Subject<void>();
	public isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Customer[]>;
	public filterForm: FormGroup;
	public companyOptions$: Observable<SearchableSelectOption[]>;
	public smartFilterConfig: SmartFilterConfig;

	// Filter fields configuration for template
	public filterFieldsConfig: FilterFieldConfig[] = [
		{ key: 'companyId', label: 'customer.company', type: 'searchable-select', adminOnly: true },
		{ key: 'name', label: 'customer.name', type: 'input' },
		{ key: 'iccid', label: 'customer.iccid', type: 'input' },
		{ key: 'externalId', label: 'customer.externalId', type: 'input' },
		{ key: 'externalTransactionId', label: 'customer.externalTransactionId', type: 'input' }
	];

	public ngOnInit(): void {
		this.initFormControls();
		this.initializeCompanyOptions();
		this.initSmartFilterConfig();
		this.loadData();
		this.setupFilters();
	}

	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onPageChange({page, size}: { page: number; size: number }): void {
		const params = CustomersUtils.Form.createFilterParams(this.filterForm.getRawValue(), page, size as any);
		this.loadData(params);
	}

	public applyFilter(): void {
		const params = CustomersUtils.Form.createFilterParams(this.filterForm.getRawValue());
		this.loadData(params);
	}

	public onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	public createCustomer(): void {
		CustomersUtils.Dialog.openCreateCustomerDialog(
			this.dialog,
			this.customersDataService,
			() => this.loadData()
		);
	}

	public openCustomerDetails(customer: Customer): void {
		CustomersUtils.Navigation.navigateToCustomerDetails(this.router, customer);
	}

	public resetForm(): void {
		this.filterForm.reset();
	}

	private initFormControls(): void {
		this.filterForm = CustomersUtils.Form.createFilterForm();
	}

	private setupFilters(): void {
		this.filterForm.valueChanges.pipe(
			debounceTime(CustomersUtils.CONFIG.FILTER_DEBOUNCE_TIME),
			takeUntil(this.unsubscribe$)
		).subscribe(() => {
			this.applyFilter();
		});
	}

	private loadData(params: CustomersFilterParams = CustomersUtils.Form.createFilterParams({})): void {
		this.customersDataService.paginatedCustomers(params, params.page, params.size)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				const processedData = CustomersUtils.Data.processCustomersData(data);

				this.tableService.updateConfigData(processedData.totalPages);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = of(processedData.content);
				this.cdr.detectChanges();

				if (this.filterForm.dirty) {
					CustomersUtils.Notification.showSearchResultsNotification(
						this.snackBar,
						processedData.totalElements
					);
				}
			});
	}

	private initializeCompanyOptions(): void {
		if (this.isAdmin) {
			this.companyOptions$ = CustomersUtils.Company.createCompanyOptions(this.companiesDataService);
		}
	}

	private initSmartFilterConfig(): void {
		this.smartFilterConfig = CustomersUtils.SmartFilter.create(this.companiesDataService, this.isAdmin);
	}
}
