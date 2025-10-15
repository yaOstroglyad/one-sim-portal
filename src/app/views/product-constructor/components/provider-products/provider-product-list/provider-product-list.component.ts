import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { GenericRightPanelComponent, PanelAction, SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared';
import { ProviderProductDetailsComponent } from '../provider-product-details/provider-product-details.component';
import { ProviderProductUploadDialogComponent } from '../provider-product-upload-dialog';
import { GenericTableComponent, HeaderComponent, TableConfig } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { ProviderProductService, RegionService } from '../../../services';
import { ProviderProduct, ProviderProductSearchRequest } from '../../../models';
import { ProviderProductsTableService } from '../provider-products-table.service';
import { CountryService } from '../../../../../shared';
import { LanguageService } from '../../../../../shared';

@Component({
  standalone: true,
    selector: 'app-provider-product-list',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        GenericRightPanelComponent,
        ProviderProductDetailsComponent,
        GenericTableComponent,
        HeaderComponent,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        ButtonDirective,
        IconDirective,
        SearchableSelectComponent,
        TranslateModule
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

  // Options for searchable-select dropdowns
  public countryOptions$: Observable<SearchableSelectOption[]>;
  public regionOptions$: Observable<SearchableSelectOption[]>;

  private unsubscribe$ = new Subject<void>();

  // RTL support
  private readonly languageService = inject(LanguageService);

  readonly containerClasses = computed(() => ({
    'provider-product-list-container': true,
    'provider-product-list-container--rtl': this.languageService.isRtl()
  }));

  // Panel states
  showDetailsPanel = false;
  selectedProviderProduct: ProviderProduct | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private providerProductService: ProviderProductService,
    private tableService: ProviderProductsTableService,
    private dialog: MatDialog,
    private countryService: CountryService,
    private regionService: RegionService
  ) {}

  public ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.loadOptions();
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
      size: 15,
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
  } = {page: 0, size: 15}): void {

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
    this.showDetailsPanel = true;
  }

  onPanelClose(): void {
    this.showDetailsPanel = false;
    this.selectedProviderProduct = null;
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

  private loadOptions(): void {
    // Load countries
    this.countryOptions$ = this.countryService.getCountries().pipe(
      map(countries => {
        if (!countries || !Array.isArray(countries)) {
          return [];
        }
        return countries.map(country => ({
          value: country.id,
          label: `${country.name} (${country?.isoAlphaCode3 || ''})`,
          data: country
        } as SearchableSelectOption));
      })
    );

    // Load regions
    this.regionOptions$ = this.regionService.getRegions().pipe(
      map(regions => {
        if (!regions || !Array.isArray(regions)) {
          return [];
        }
        return regions.map(region => ({
          value: region.id,
          label: region.name,
          data: region
        } as SearchableSelectOption));
      })
    );
  }
}
