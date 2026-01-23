import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlDirective } from '@coreui/angular';
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
  SmartFilterHeaderComponent,
  GenericRightPanelComponent,
  PageLayoutService,
  BreadcrumbComponent,
} from '@shared';
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
        SearchableSelectComponent,
        SmartFilterHeaderComponent,
        GenericRightPanelComponent,
        FormControlDirective,
        TranslateModule
    ],
    providers: [CustomersTableService],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, OnDestroy {
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly tableService = inject(CustomersTableService);
	private readonly customersDataService = inject(CustomersDataService);
	private readonly companiesDataService = inject(CompaniesDataService);
	private readonly router = inject(Router);
	private readonly dialog = inject(MatDialog);
	private readonly authService = inject(AuthService);
	private readonly layout = inject(PageLayoutService);

	constructor() {
		this.layout.header.set({
			start: [{ component: BreadcrumbComponent }],
		});
	}

	protected readonly CustomerType = CustomerType;
	private unsubscribe$ = new Subject<void>();
	public isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Customer[]>;
	public filterForm: FormGroup;
	public companyOptions$: Observable<SearchableSelectOption[]>;
	public smartFilterConfig: SmartFilterConfig;

	// External panel state (for z-index fix)
	protected readonly showFilterPanel = signal(false);
	protected readonly smartFilterRef = viewChild<SmartFilterHeaderComponent>('smartFilter');

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

	public onPanelOpenChange(isOpen: boolean): void {
		this.showFilterPanel.set(isOpen);
	}

	public closeFilterPanel(): void {
		this.showFilterPanel.set(false);
	}

	public onResetFilters(): void {
		this.smartFilterRef()?.onResetFilters();
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
