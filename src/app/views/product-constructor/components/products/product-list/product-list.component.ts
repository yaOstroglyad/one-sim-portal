import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, switchMap, catchError, startWith, debounceTime, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared/components/generic-right-panel/generic-right-panel.component';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { GenericTableModule, HeaderModule, TableConfig, TemplateType, DeleteConfirmationComponent } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective, FormSelectDirective, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { ProductService } from '../../../services';
import { Product, ProductSearchRequest } from '../../../models';
import { ProductsTableService } from '../products-table.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    GenericRightPanelComponent,
    ProductDetailsComponent,
    ProductFormComponent,
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
  providers: [ProductsTableService],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('statusTemplate', { static: true }) statusTemplate: TemplateRef<any>;
  @ViewChild('validityTemplate', { static: true }) validityTemplate: TemplateRef<any>;

  products$: Observable<Product[]>;
  tableConfig$: BehaviorSubject<TableConfig>;
  filterForm: FormGroup;
  loading = true;
  error = false;

  private unsubscribe$ = new Subject<void>();

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDetailsPanel = false;
  selectedProduct: Product | null = null;
  selectedProductDetails: Product | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  constructor(
    private productService: ProductService,
    private tableService: ProductsTableService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize form
    this.filterForm = new FormGroup({
      countryId: new FormControl(null),
      regionId: new FormControl(null),
      mobileBundleId: new FormControl(null)
    });

    // Get table config from service
    this.tableConfig$ = this.tableService.getTableConfig();

    // Initialize panel actions
    this.initializePanelActions();

    // Initialize products$ with empty data
    this.products$ = of([]);
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
    this.tableService.setTemplates(this.statusTemplate, this.validityTemplate);
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
    mobileBundleId?: string;
  } = { page: 0, size: 20 }): void {

    const searchRequest: ProductSearchRequest = {
      searchParams: {
        countryId: params.countryId || undefined,
        regionId: params.regionId || undefined,
        mobileBundleId: params.mobileBundleId || undefined
      },
      page: {
        page: params.page,
        size: params.size
      }
    };

    this.productService.getProducts(searchRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.tableService.updateConfigData(data?.totalPages || 20);
          this.tableConfig$ = this.tableService.getTableConfig();
          this.products$ = of(data.content);
          this.loading = false;
          this.error = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
          this.error = true;
          this.products$ = of([]);
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
        label: 'Edit Product',
        handler: () => this.onEditFromDetails()
      }
    ];
  }

  onCreateNew(): void {
    this.selectedProduct = null;
    this.showCreatePanel = true;
  }

  onViewDetails(product: Product): void {
    this.selectedProduct = product;
    // Show panel immediately with basic data
    this.selectedProductDetails = product;
    this.showDetailsPanel = true;

    // Then load detailed data if needed
    this.productService.getProduct(product.id).subscribe({
      next: (productDetails) => {
        this.selectedProductDetails = productDetails;
      },
      error: (error) => {
        console.error('Error loading product details:', error);
        // Keep the panel open with basic data even if detailed loading fails
      }
    });
  }

  onEdit(product: Product): void {
    this.selectedProduct = product;
    this.showEditPanel = true;
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDetailsPanel = false;
    this.selectedProduct = null;
    this.selectedProductDetails = null;
  }

  onProductSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  onToggleStatus(product: Product): void {
    const newStatus = !product.active;
    this.productService.updateProductStatus(product.id, { isActive: newStatus }).subscribe({
      next: () => {
        product.active = newStatus;
        this.onRefresh();
      },
      error: (error) => {
        console.error('Error updating product status:', error);
      }
    });
  }

  // Helper method for validity display
  formatValidity(product: Product): string {
    if (product.validityPeriod) {
      return `${product.validityPeriod.period} ${product.validityPeriod.timeUnit}`;
    }
    return 'N/A';
  }
}
