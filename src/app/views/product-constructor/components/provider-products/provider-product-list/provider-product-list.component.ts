import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared';
import { ProviderProductDetailsComponent } from '../provider-product-details/provider-product-details.component';
import { ProviderProductUploadDialogComponent } from '../provider-product-upload-dialog';
import { GenericTableModule, HeaderModule, TableConfig, DeleteConfirmationComponent } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonDirective, FormControlDirective, FormSelectDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { ProviderProductService } from '../../../services';
import { ProviderProduct, ProviderProductSearchRequest } from '../../../models';
import { ProviderProductsTableService } from '../provider-products-table.service';

@Component({
  selector: 'app-provider-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    GenericRightPanelComponent,
    ProviderProductDetailsComponent,
    DeleteConfirmationComponent,
    GenericTableModule,
    HeaderModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ButtonDirective,
    FormControlDirective,
    FormSelectDirective,
    IconDirective
  ],
  providers: [ProviderProductsTableService],
  templateUrl: './provider-product-list.component.html',
  styleUrls: ['./provider-product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderProductListComponent implements OnInit, OnDestroy {

  public providerProducts$: Observable<ProviderProduct[]>;
  public tableConfig$: BehaviorSubject<TableConfig>;
  public filterForm: FormGroup;

  private unsubscribe$ = new Subject<void>();

  // Panel states
  showDetailsPanel = false;
  selectedProviderProduct: ProviderProduct | null = null;
  selectedProviderProductDetails: ProviderProduct | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private providerProductService: ProviderProductService,
    private tableService: ProviderProductsTableService,
    private dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
    this.initializePanelActions();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onPageChange({page, size}: { page: number; size: number }): void {
    this.loadData({
      page,
      size,
      ...this.filterForm.getRawValue()
    });
  }

  public applyFilter(): void {
    const params = {
      page: 0,
      size: 10,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public resetForm(): void {
    this.filterForm.reset();
  }

  private initFormControls(): void {
    this.filterForm = new FormGroup({
      providerId: new FormControl(null),
      countryId: new FormControl(null),
      regionId: new FormControl(null)
    });
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
    providerId?: string;
    countryId?: number;
    regionId?: number;
  } = {page: 0, size: 10}): void {

    const searchRequest: ProviderProductSearchRequest = {
      searchParams: {
        countryId: params.countryId || undefined,
        regionId: params.regionId || undefined,
        providerId: params.providerId || undefined
      },
      page: {
        page: params.page,
        size: params.size
      }
    };

    this.providerProductService.getProviderProducts(searchRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableService.updateConfigData(data?.totalPages || 20);
        this.tableConfig$ = this.tableService.getTableConfig();
        this.providerProducts$ = of(data.content);
        this.cdr.detectChanges();
      });
  }

  private initializePanelActions(): void {
    this.detailsPanelActions = [];
  }

  onCreateNew(): void {
    const dialogRef = this.dialog.open(ProviderProductUploadDialogComponent, {
      width: '600px',
      data: {
        providerId: this.filterForm.value.providerId,
        regionId: this.filterForm.value.regionId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onViewDetails(providerProduct: ProviderProduct): void {
    this.selectedProviderProduct = providerProduct;
    // Mock provider product details data until API is ready
    this.selectedProviderProductDetails = { ...providerProduct };
    this.showDetailsPanel = true;
  }

  onPanelClose(): void {
    this.showDetailsPanel = false;
    this.selectedProviderProduct = null;
    this.selectedProviderProductDetails = null;
  }

  onToggleStatus(providerProduct: ProviderProduct): void {
    const newStatus = !providerProduct.active;
    this.providerProductService.updateProviderProductStatus(providerProduct.id, { isActive: newStatus }).subscribe({
      next: () => {
        providerProduct.active = newStatus;
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating provider product status:', error);
      }
    });
  }
}
