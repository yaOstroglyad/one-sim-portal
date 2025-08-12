import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared';
import { CompanyProductDetailsComponent } from '../company-product-details/company-product-details.component';
import { CompanyProductFormComponent } from '../company-product-form/company-product-form.component';
import { GenericTableModule, HeaderModule, TableConfig, DeleteConfirmationComponent, SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonDirective, FormControlDirective, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { CompanyProductService, RegionService } from '../../../services';
import { CompanyProduct, CompanyProductSearchRequest, RegionSummary } from '../../../models';
import { CompanyProductsTableService } from '../company-products-table.service';
import { AccountSelectorComponent } from '../../../../../shared/components/account-selector/account-selector.component';
import { AuthService, ADMIN_PERMISSION } from '../../../../../shared';
import { Account, Country } from '../../../../../shared';
import { CountryService } from '../../../../../shared';

@Component({
  selector: 'app-company-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    GenericRightPanelComponent,
    CompanyProductDetailsComponent,
    CompanyProductFormComponent,
    DeleteConfirmationComponent,
    GenericTableModule,
    HeaderModule,
    AccountSelectorComponent,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SearchableSelectComponent,
    ButtonDirective,
    FormControlDirective,
    BadgeComponent,
    IconDirective
  ],
  providers: [CompanyProductsTableService],
  templateUrl: './company-product-list.component.html',
  styleUrls: ['./company-product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyProductListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('priceTemplate', { static: true }) priceTemplate: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate: TemplateRef<any>;

  companyProducts$: Observable<CompanyProduct[]>;
  tableConfig$: BehaviorSubject<TableConfig>;
  filterForm: FormGroup;
  loading = false; // Will be set to true when needed
  error = false;

  private unsubscribe$ = new Subject<void>();

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDeletePanel = false;
  showDetailsPanel = false;
  selectedCompanyProduct: CompanyProduct | null = null;
  selectedCompanyProductDetails: CompanyProduct | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  // Permission check and account selection
  isAdmin = false;
  selectedAccountId: string | null = null;

  // Dropdown data
  countries$: Observable<Country[]>;
  regions$: Observable<RegionSummary[]>;
  countryOptions$: Observable<SearchableSelectOption[]>;
  regionOptions$: Observable<SearchableSelectOption[]>;

  constructor(
    private companyProductService: CompanyProductService,
    private tableService: CompanyProductsTableService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private countryService: CountryService,
    private regionService: RegionService
  ) {
    // Initialize form
    this.filterForm = new FormGroup({
      countryId: new FormControl(null),
      regionId: new FormControl(null),
      accountId: new FormControl(null)
    });

    // Get table config from service
    this.tableConfig$ = this.tableService.getTableConfig();

    // Initialize panel actions
    this.initializePanelActions();

    // Initialize products$ with empty data
    this.companyProducts$ = of([]);

    // Initialize dropdown data
    this.countries$ = this.countryService.getCountries();
    this.regions$ = this.regionService.getRegions();

    // Transform data for searchable-select
    this.countryOptions$ = this.countries$.pipe(
      map(countries => countries.map(country => ({
        value: country.id,
        label: country.name,
        data: country
      } as SearchableSelectOption)))
    );

    this.regionOptions$ = this.regions$.pipe(
      map(regions => regions.map(region => ({
        value: region.id,
        label: region.name,
        data: region
      } as SearchableSelectOption)))
    );
  }

  ngOnInit(): void {
    this.checkPermissions();
    this.initializeAccount();
    this.setupFilters();

    // Only load data if user is not admin (non-admin users have account already set)
    if (!this.isAdmin) {
      this.loading = true;
      this.loadData(); // Load initial data for non-admin users
    }
    // For admins, don't load data until they select an account
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    // Set templates after view initialization
    this.tableService.setTemplates(this.priceTemplate, this.statusTemplate);
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  private loadData(params: {
    page: number;
    size: number;
    countryId?: number;
    regionId?: number;
    accountId?: string;
  } = { page: 0, size: 20 }): void {

    // For admins, ensure we have a selected account before making the request
    if (this.isAdmin && !params.accountId && !this.selectedAccountId) {
      // No account selected, don't make the request
      this.companyProducts$ = of([]);
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const searchRequest: CompanyProductSearchRequest = {
      searchParams: {
        countryId: params.countryId || undefined,
        regionId: params.regionId || undefined,
        accountId: params.accountId || (this.isAdmin ? this.selectedAccountId : undefined) || undefined
      },
      page: {
        page: params.page,
        size: params.size
      }
    };

    this.companyProductService.searchCompanyProducts(searchRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.tableService.updateConfigData(data?.totalPages || 20);
          this.tableConfig$ = this.tableService.getTableConfig();
          this.companyProducts$ = of(data.content);
          this.loading = false;
          this.error = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading company products:', error);
          this.loading = false;
          this.error = true;
          this.companyProducts$ = of([]);
          this.cdr.detectChanges();
        }
      });
  }

  onRefresh(): void {
    // Preserve current filter values including accountId
    const currentFilters = this.filterForm.getRawValue();
    this.loadData({
      page: 0,
      size: 20,
      ...currentFilters
    });
  }

  resetForm(): void {
    // For admins, keep the selected account when resetting other filters
    if (this.isAdmin && this.selectedAccountId) {
      this.filterForm.reset({ accountId: this.selectedAccountId });
    } else {
      this.filterForm.reset();
    }
    this.applyFilter();
  }

  applyFilter(): void {
    const params = {
      page: 0,
      size: 20,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  onPageChange({ page, size }: { page: number; size: number }): void {
    this.loadData({
      page,
      size,
      ...this.filterForm.getRawValue()
    });
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  private initializePanelActions(): void {
    this.detailsPanelActions = [
      {
        id: 'edit',
        icon: 'cilPencil',
        label: 'Edit Company Product',
        handler: () => this.onEditFromDetails()
      }
    ];
  }

  onCreateNew(): void {
    this.selectedCompanyProduct = null;
    this.showCreatePanel = true;
    this.cdr.markForCheck(); // Mark for change detection
  }

  onViewDetails(companyProduct: CompanyProduct): void {
    this.selectedCompanyProduct = companyProduct;
    // Use table data directly - no need for API call
    this.selectedCompanyProductDetails = companyProduct;
    this.showDetailsPanel = true;
    this.cdr.markForCheck(); // Mark for change detection
  }

  onEdit(companyProduct: CompanyProduct): void {
    this.selectedCompanyProduct = companyProduct;
    this.showEditPanel = true;
    this.cdr.markForCheck(); // Mark for change detection
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
    this.cdr.markForCheck(); // Mark for change detection
  }

  onDelete(companyProduct: CompanyProduct): void {
    this.selectedCompanyProduct = companyProduct;
    this.showDeletePanel = true;
    this.cdr.markForCheck(); // Mark for change detection
  }

  onConfirmDelete(): void {
    if (this.selectedCompanyProduct) {
      this.companyProductService.deleteCompanyProduct(this.selectedCompanyProduct.id).subscribe({
        next: () => {
          this.showDeletePanel = false;
          this.selectedCompanyProduct = null;
          this.onRefresh();
        },
        error: (error) => {
          console.error('Error deleting company product:', error);
        }
      });
    }
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDeletePanel = false;
    this.showDetailsPanel = false;
    this.selectedCompanyProduct = null;
    this.selectedCompanyProductDetails = null;
    this.cdr.markForCheck(); // Mark for change detection
  }

  onCompanyProductSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  onToggleStatus(companyProduct: CompanyProduct): void {
    const newStatus = !companyProduct.active;
    this.companyProductService.updateCompanyProductStatus(companyProduct.id, { isActive: newStatus }).subscribe({
      next: () => {
        // Не изменяем объект напрямую для OnPush стратегии
        // companyProduct.active = newStatus;

        // Обновляем данные через перезагрузку
        this.onRefresh();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating company product status:', error);
      }
    });
  }

  // Custom template for price display - available for future use
  formatPrice(companyProduct: CompanyProduct): string {
    // Handle missing price or currency
    if (companyProduct.price == null || companyProduct.currency == null) {
      return 'N/A';
    }

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: companyProduct.currency
      });
      return formatter.format(companyProduct.price);
    } catch (error) {
      // Fallback if currency code is invalid
      console.warn(`Invalid currency code: ${companyProduct.currency}`, error);
      return `${companyProduct.price} ${companyProduct.currency || ''}`.trim();
    }
  }

  // Account selection methods
  private checkPermissions(): void {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  private initializeAccount(): void {
    if (!this.isAdmin) {
      const loggedUser = this.authService.loggedUser;
      if (loggedUser?.accountId) {
        this.selectedAccountId = loggedUser.accountId;
        this.filterForm.patchValue({ accountId: this.selectedAccountId });
      }
    }
  }

  public onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    this.filterForm.patchValue({ accountId: account.id }, { emitEvent: false });

    // For admins, this is the first time we load data after account selection
    if (this.isAdmin) {
      this.loading = true;
      this.cdr.markForCheck();
    }

    this.applyFilter();
  }
}
