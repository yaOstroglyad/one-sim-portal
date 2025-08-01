import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, switchMap, catchError, startWith, debounceTime, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared/components/generic-right-panel/generic-right-panel.component';
import { CompanyProductDetailsComponent } from '../company-product-details/company-product-details.component';
import { CompanyProductFormComponent } from '../company-product-form/company-product-form.component';
import { GenericTableModule, HeaderModule, TableConfig, TemplateType, DeleteConfirmationComponent } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective, FormSelectDirective, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { CompanyProductService } from '../../../services';
import { CompanyProduct, CompanyProductSearchRequest } from '../../../models';
import { CompanyProductsTableService } from '../company-products-table.service';

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
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    ButtonDirective,
    FormControlDirective,
    FormSelectDirective,
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
  loading = true;
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

  constructor(
    private companyProductService: CompanyProductService,
    private tableService: CompanyProductsTableService,
    private cdr: ChangeDetectorRef
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
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loadData(); // Load initial data
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
    
    const searchRequest: CompanyProductSearchRequest = {
      searchParams: {
        countryId: params.countryId || undefined,
        regionId: params.regionId || undefined,
        accountId: params.accountId || undefined
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
    this.loadData();
  }

  resetForm(): void {
    this.filterForm.reset();
    this.loadData();
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
  }

  onViewDetails(companyProduct: CompanyProduct): void {
    this.selectedCompanyProduct = companyProduct;
    // Show panel immediately with basic data
    this.selectedCompanyProductDetails = companyProduct;
    this.showDetailsPanel = true;
    
    // Then load detailed data if needed
    this.companyProductService.getCompanyProduct(companyProduct.id).subscribe({
      next: (product) => {
        this.selectedCompanyProductDetails = product;
      },
      error: (error) => {
        console.error('Error loading company product details:', error);
        // Keep the panel open with basic data even if detailed loading fails
      }
    });
  }

  onEdit(companyProduct: CompanyProduct): void {
    this.selectedCompanyProduct = companyProduct;
    this.showEditPanel = true;
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
  }

  onDelete(companyProduct: CompanyProduct): void {
    this.selectedCompanyProduct = companyProduct;
    this.showDeletePanel = true;
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
  }

  onCompanyProductSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  onToggleStatus(companyProduct: CompanyProduct): void {
    const newStatus = !companyProduct.active;
    this.companyProductService.updateCompanyProductStatus(companyProduct.id, { isActive: newStatus }).subscribe({
      next: () => {
        companyProduct.active = newStatus;
        this.onRefresh();
      },
      error: (error) => {
        console.error('Error updating company product status:', error);
      }
    });
  }

  // Custom template for price display - available for future use
  formatPrice(companyProduct: CompanyProduct): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: companyProduct.currency
    });
    return formatter.format(companyProduct.price);
  }
}