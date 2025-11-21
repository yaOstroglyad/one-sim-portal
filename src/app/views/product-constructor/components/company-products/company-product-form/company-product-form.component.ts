import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import {
  FormGeneratorComponent,
  FormConfig,
  AccountsDataService,
  TariffOfferService,
  UserRoleService
} from '@shared';
import { CompanyProductService, CompanyProductPriceService } from '../../../services';
import { CompanyProduct, ActiveTariffOffer, CompanyProductPrice } from '../../../models';
import { SelectedTariffOfferDetailsComponent } from '../selected-tariff-offer-details';
import { CompanyProductPricesTableComponent, PriceValidationUtils } from '../company-product-prices-table';
import { ModifyPriceDialogComponent } from '../modify-price-dialog';
import { ModifyPriceDialogData, ModifyPriceResult } from '../modify-price-dialog';
import { ModifyTariffOfferDialogComponent, ModifyTariffOfferDialogData, ModifyTariffOfferResult } from '../modify-tariff-offer-dialog/modify-tariff-offer-dialog.component';
import { UIConfigFactory, CompanyProductFormConfig } from '../factories';
import {
  getCompanyProductFormConfig,
  getCompanyProductCreateRequest,
  getCompanyProductUpdateRequest
} from './company-product-form.utils';

@Component({
  standalone: true,
    selector: 'app-company-product-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormGeneratorComponent,
        IconDirective,
        SelectedTariffOfferDetailsComponent,
        CompanyProductPricesTableComponent
    ],
    templateUrl: './company-product-form.component.html',
    styleUrls: ['./company-product-form.component.scss']
})
export class CompanyProductFormComponent implements OnInit, OnDestroy {
  @Input() companyProduct: CompanyProduct | null = null;
  @Input() selectedAccountId: string | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  companyProductForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedTariffOffer: ActiveTariffOffer | null = null;
  modifiedRetailPrice: ModifyTariffOfferResult | null = null; // Stores modified price from dialog
  uiConfig: CompanyProductFormConfig;

  readonly prices = signal<CompanyProductPrice[]>([]);
  readonly pricesLoading = signal(false);

  private pendingProductId: string | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly companyProductService = inject(CompanyProductService);
  private readonly accountsService = inject(AccountsDataService);
  private readonly tariffOfferService = inject(TariffOfferService);
  private readonly uiConfigFactory = inject(UIConfigFactory);
  private readonly userRoleService = inject(UserRoleService);
  private readonly companyProductPriceService = inject(CompanyProductPriceService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    const userRole = this.userRoleService.getCurrentUserRole();
    this.uiConfig = this.uiConfigFactory.createCompanyProductFormConfig(userRole);

    const isAdmin = this.userRoleService.isAdmin();
    this.initializeForm(isAdmin);

    if (this.isEditing && this.companyProduct) {
      console.log('companyProduct',this.companyProduct);
      this.initializeEditMode();
      this.loadPrices(this.companyProduct.id);
    }
  }

  private initializeForm(isAdmin: boolean): void {
    this.formConfig = getCompanyProductFormConfig(
      this.companyProduct,
      this.isEditing,
      this.accountsService,
      isAdmin,
      this.tariffOfferService,
      this.selectedAccountId,
      this.companyProductService
    );
  }

  private initializeEditMode(): void {
    this.selectedTariffOffer = this.createTariffOfferFromCompanyProduct(this.companyProduct!);
    this.resolveAndLoadTariffOffers();
  }

  private resolveAndLoadTariffOffers(): void {
    if (!this.companyProduct) return;

    const searchParams = this.userRoleService.isAdmin()
      ? { accountId: this.selectedAccountId }
      : {};

    this.companyProductService.searchCompanyProducts({
      searchParams,
      page: { page: 0, size: 1000 }
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: (error) => console.error('Error loading products for edit mode:', error)
      });
  }

  private handleProductsResponse(response: any): void {
    if (!response?.content || !Array.isArray(response.content)) {
      console.error('Invalid products response:', response);
      return;
    }

    const matchingProduct = this.findMatchingBaseProduct(response.content, this.companyProduct!);

    if (matchingProduct) {
      this.setProductId(matchingProduct.id);
    } else {
      console.warn('No matching product found for company product:', this.companyProduct?.name);
      this.tryFallbackMatching(response.content);
    }
  }

  private setProductId(productId: string): void {
    if (this.companyProductForm) {
      this.companyProductForm.get('productId')?.setValue(productId, { emitEvent: false });
      this.cdr.markForCheck();
    } else {
      this.pendingProductId = productId;
    }
  }

  private findMatchingBaseProduct(products: any[], companyProduct: CompanyProduct): any | null {
    return products.find(product =>
      product.name === companyProduct.name &&
      JSON.stringify(product.serviceCoverage) === JSON.stringify(companyProduct.serviceCoverage)
    ) || null;
  }

  private tryFallbackMatching(products: any[]): void {
    if (!this.companyProduct) return;

    const fallbackProduct = products.find(product =>
      product.name === this.companyProduct!.name
    ) || products.find(product =>
      product.name.toLowerCase().includes(this.companyProduct!.name.toLowerCase()) ||
      this.companyProduct!.name.toLowerCase().includes(product.name.toLowerCase())
    );

    if (fallbackProduct) {
      console.log('Using fallback product match:', fallbackProduct.name);
      this.setProductId(fallbackProduct.id);
    } else {
      console.error('No product match found even with fallback for:', this.companyProduct.name);
    }
  }

  get isEditing(): boolean {
    return !!this.companyProduct;
  }

  get infoMessage(): string {
    if (this.isEditing) {
      return this.uiConfig.texts.infoMessages.componentInfo.editing;
    } else {
      return this.uiConfig.texts.infoMessages.componentInfo.creating;
    }
  }

  onFormChanges(form: FormGroup): void {
    this.companyProductForm = form;

    if (this.isEditing && this.pendingProductId) {
      form.get('productId')?.setValue(this.pendingProductId, { emitEvent: false });
      this.pendingProductId = null;
      this.cdr.markForCheck();
    }

    if (this.userRoleService.isAdmin() && !this.isEditing) {
      this.setupProductChangeSubscription(form);
      this.setupTariffOfferChangeSubscription(form);
    }
  }

  private setupProductChangeSubscription(form: FormGroup): void {
    form.get('productId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedTariffOffer = null;
        form.get('tariffOfferId')?.setValue(null, { emitEvent: false });
      });
  }

  private setupTariffOfferChangeSubscription(form: FormGroup): void {
    form.get('tariffOfferId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tariffOfferId => {
        const productId = form.get('productId')?.value;
        if (tariffOfferId && productId) {
          this.loadSelectedTariffOffer(productId, tariffOfferId);
        }
      });
  }

  private loadSelectedTariffOffer(productId: string, tariffOfferId: string): void {
    this.tariffOfferService.getActiveTariffOffers(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (offers) => {
          if (!offers?.length) {
            console.warn('No offers returned for productId:', productId);
            return;
          }

          const selectedOffer = offers.find(offer =>
            offer.id === tariffOfferId ||
            `${offer.productId}_${offers.indexOf(offer)}` === tariffOfferId
          );

          if (selectedOffer) {
            this.selectedTariffOffer = selectedOffer;
            this.cdr.markForCheck();
          }
        },
        error: (error) => console.error('Error loading selected tariff offer:', error)
      });
  }

  onSubmit(): void {
    if (!this.companyProductForm?.valid) return;

    this.loading = true;
    this.error = null;

    const formValue = this.companyProductForm.getRawValue();

    const operation$ = this.isEditing
      ? this.companyProductService.updateCompanyProduct(
          this.companyProduct!.id,
          getCompanyProductUpdateRequest(formValue, this.selectedTariffOffer)
        )
      : this.companyProductService.createCompanyProduct(
          getCompanyProductCreateRequest(formValue, this.selectedTariffOffer, this.modifiedRetailPrice)
        );

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.error = this.getErrorMessage(error);
        console.error('Error saving company product:', error);
        this.cdr.markForCheck();
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  private createTariffOfferFromCompanyProduct(companyProduct: CompanyProduct): ActiveTariffOffer {
    if (companyProduct.tariffOffer) {
      return {
        id: companyProduct.tariffOffer.id,
        productId: companyProduct.id,
        productName: companyProduct.name,
        serviceProvider: {
          id: companyProduct.tariffOffer.serviceProvider.id,
          name: companyProduct.tariffOffer.serviceProvider.name
        },
        price: companyProduct.price,
        currency: companyProduct.currency,
        validFrom: companyProduct.tariffOffer.validFrom,
        originalPrice: companyProduct.tariffOffer.price,
        originalCurrency: companyProduct.tariffOffer.currency
      } as ActiveTariffOffer & { originalPrice?: number; originalCurrency?: string };
    }

    return {
      id: companyProduct?.tariffOfferId || `company-product-${companyProduct.id}`,
      productId: companyProduct.id,
      productName: companyProduct.name,
      serviceProvider: {
        id: 'unknown',
        name: 'Unknown Provider'
      },
      price: companyProduct.price,
      currency: companyProduct.currency,
      validFrom: new Date().toISOString()
    } as ActiveTariffOffer;
  }

  private loadPrices(companyProductId: string): void {
    this.pricesLoading.set(true);

    this.companyProductPriceService.getPrices(companyProductId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prices) => {
          this.prices.set(prices);
          this.pricesLoading.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading prices:', error);
          this.pricesLoading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  onEditPrice(price: CompanyProductPrice): void {
    if (!this.companyProduct || !this.selectedTariffOffer) return;

    const dialogRef = this.dialog.open(ModifyPriceDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        companyProductId: this.companyProduct.id,
        tariffOffer: this.selectedTariffOffer,
        existingTariff: price,
        existingTariffs: this.prices(),
        minValidFromDate: PriceValidationUtils.getMinValidFromDate(
          this.selectedTariffOffer.validFrom as string
        )
      } as ModifyPriceDialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: ModifyPriceResult) => {
        if (result) {
          this.loadPrices(this.companyProduct!.id);
        }
      });
  }

  onAddPrice(): void {
    if (!this.companyProduct || !this.selectedTariffOffer) return;

    const dialogRef = this.dialog.open(ModifyPriceDialogComponent, {
      width: '500px',
      data: {
        mode: 'create',
        companyProductId: this.companyProduct.id,
        tariffOffer: this.selectedTariffOffer,
        existingTariffs: this.prices(),
        minValidFromDate: PriceValidationUtils.getMinValidFromDate(
          this.selectedTariffOffer.validFrom as string
        )
      } as ModifyPriceDialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: ModifyPriceResult) => {
        if (result) {
          this.loadPrices(this.companyProduct!.id);
        }
      });
  }

  onModifyTariffOfferPrice(tariffOffer: ActiveTariffOffer): void {
    if (!tariffOffer) return;

    const dialogRef = this.dialog.open(ModifyTariffOfferDialogComponent, {
      width: '500px',
      data: {
        tariffOffer
      } as ModifyTariffOfferDialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: ModifyTariffOfferResult | undefined) => {
        if (result) {
          // Store the modified retail price for use when creating the company product
          this.modifiedRetailPrice = result;
          console.log('Modified retail price:', this.modifiedRetailPrice);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
