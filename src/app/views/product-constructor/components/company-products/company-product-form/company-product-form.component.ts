import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';

import { FormGeneratorComponent, FormConfig } from '../../../../../shared';
import { CompanyProductService, ProductService } from '../../../services';
import { CompanyProduct, ActiveTariffOffer } from '../../../models';
import { AccountsDataService } from '../../../../../shared';
import { TariffOfferService } from '../../../../../shared/services/tariff-offer.service';
import { AuthService, ADMIN_PERMISSION } from '../../../../../shared';
import { SelectedTariffOfferDetailsComponent } from '../selected-tariff-offer-details/selected-tariff-offer-details.component';
import {
  getCompanyProductFormConfig,
  getCompanyProductCreateRequest,
  getCompanyProductUpdateRequest
} from './company-product-form.utils';

@Component({
  selector: 'app-company-product-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormGeneratorComponent,
    IconDirective,
    SelectedTariffOfferDetailsComponent
  ],
  templateUrl: './company-product-form.component.html',
  styleUrls: ['./company-product-form.component.scss']
})
export class CompanyProductFormComponent implements OnInit {

  @Input() companyProduct: CompanyProduct | null = null;
  @Input() selectedAccountId: string | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  companyProductForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedTariffOffer: ActiveTariffOffer | null = null;
  private pendingProductId: string | null = null;

  constructor(
    private companyProductService: CompanyProductService,
    private accountsService: AccountsDataService,
    private authService: AuthService,
    private productService: ProductService,
    private tariffOfferService: TariffOfferService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

    this.initializeForm(isAdmin);

    // In edit mode, initialize tariff offer and load tariff offers for product
    if (this.isEditing && this.companyProduct) {
      this.initializeEditMode();
    }
  }

  private initializeForm(isAdmin: boolean): void {
    this.formConfig = getCompanyProductFormConfig(
      this.companyProduct,
      this.isEditing,
      this.accountsService,
      isAdmin,
      this.productService,
      this.tariffOfferService,
      this.selectedAccountId,
      this.companyProductService
    );
  }

  private initializeEditMode(): void {
    // Create tariff offer from company product data
    this.selectedTariffOffer = this.createTariffOfferFromCompanyProduct(this.companyProduct!);

    // In edit mode, we need to resolve the base productId from companyProduct
    // Since CompanyProduct doesn't contain direct productId reference,
    // we need to find it by matching company product properties with base products
    this.resolveAndLoadTariffOffers();
  }

  private resolveAndLoadTariffOffers(): void {
    if (!this.productService || !this.companyProduct) return;

    // Get all products to find the base product that matches this company product
    this.productService.getProducts({
      searchParams: {},
      page: { page: 0, size: 1000 }
    }).subscribe({
      next: (response) => {
        // Check if response and response.content exist
        if (!response || !response.content || !Array.isArray(response.content)) {
          console.error('Invalid products response:', response);
          return;
        }
        
        const matchingProduct = this.findMatchingBaseProduct(response.content, this.companyProduct!);
        
        if (matchingProduct) {
          // Set the correct productId in the form after products are loaded
          if (this.companyProductForm) {
            this.companyProductForm.get('productId')?.setValue(matchingProduct.id, { emitEvent: false });
            this.cdr.markForCheck();
          } else {
            // Form not ready yet, store for later
            this.pendingProductId = matchingProduct.id;
          }
          // FormGenerator will now handle tariff offer loading automatically
        } else {
          console.warn('No matching product found for company product:', this.companyProduct?.name);
          // Fallback: try to use company product name as fallback matching
          this.tryFallbackMatching(response.content);
        }
      },
      error: (error) => {
        console.error('Error loading products for edit mode:', error);
      }
    });
  }

  private findMatchingBaseProduct(products: any[], companyProduct: CompanyProduct): any | null {
    // Match by name and service coverage as primary criteria
    // You may need to adjust matching criteria based on your API structure
    return products.find(product =>
      product.name === companyProduct.name &&
      JSON.stringify(product.serviceCoverage) === JSON.stringify(companyProduct.serviceCoverage)
    ) || null;
  }

  private tryFallbackMatching(products: any[]): void {
    if (!this.companyProduct) return;
    
    // Fallback 1: Match only by name (ignore service coverage differences)
    let fallbackProduct = products.find(product => 
      product.name === this.companyProduct!.name
    );

    // Fallback 2: Match by partial name (in case names have slight differences)
    if (!fallbackProduct) {
      fallbackProduct = products.find(product => 
        product.name.toLowerCase().includes(this.companyProduct!.name.toLowerCase()) ||
        this.companyProduct!.name.toLowerCase().includes(product.name.toLowerCase())
      );
    }

    if (fallbackProduct) {
      console.log('Using fallback product match:', fallbackProduct.name);
      
      if (this.companyProductForm) {
        this.companyProductForm.get('productId')?.setValue(fallbackProduct.id, { emitEvent: false });
        this.cdr.markForCheck();
      } else {
        this.pendingProductId = fallbackProduct.id;
      }
      
      // FormGenerator will handle tariff offer loading automatically
    } else {
      console.error('No product match found even with fallback for:', this.companyProduct.name);
    }
  }

  get isEditing(): boolean {
    return !!this.companyProduct;
  }

  onFormChanges(form: FormGroup): void {
    this.companyProductForm = form;
    const isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

    // In edit mode, try to set productId if we have pending resolved product
    if (this.isEditing && this.pendingProductId) {
      form.get('productId')?.setValue(this.pendingProductId, { emitEvent: false });
      this.pendingProductId = null; // Clear pending
      this.cdr.markForCheck();
    }

    this.setupFormSubscriptions(form, isAdmin);
  }

  private setupFormSubscriptions(form: FormGroup, isAdmin: boolean): void {
    // Only setup tariff offer selection for admin create mode
    // FormGenerator now handles all field dependencies automatically
    if (isAdmin && !this.isEditing) {
      this.setupTariffOfferChangeSubscription(form);
    }
  }

  private setupTariffOfferChangeSubscription(form: FormGroup): void {
    form.get('tariffOfferId')?.valueChanges.subscribe(tariffOfferId => {
      if (tariffOfferId) {
        // Get real tariff offer data by making API call
        const productId = form.get('productId')?.value;
        if (productId) {
          this.loadSelectedTariffOffer(productId, tariffOfferId);
        }
      }
    });
  }

  private loadSelectedTariffOffer(productId: string, tariffOfferId: string): void {
    this.tariffOfferService.getActiveTariffOffers(productId).subscribe({
      next: (offers) => {
        const selectedOffer = offers.find(offer => 
          (offer.id && offer.id === tariffOfferId) || 
          `${offer.productId}_${offers.indexOf(offer)}` === tariffOfferId
        );
        
        if (selectedOffer) {
          this.selectedTariffOffer = selectedOffer;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error loading selected tariff offer:', error);
      }
    });
  }




  onSubmit(): void {
    if (!this.companyProductForm?.valid) return;

    this.loading = true;
    this.error = null;

    const formValue = this.companyProductForm.value;

    const operation$ = this.isEditing
      ? this.companyProductService.updateCompanyProduct(
          this.companyProduct!.id,
          getCompanyProductUpdateRequest(formValue, this.selectedTariffOffer)
        )
      : this.companyProductService.createCompanyProduct(
          getCompanyProductCreateRequest(formValue, this.selectedTariffOffer)
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

  onTariffOfferUpdated(updatedOffer: ActiveTariffOffer): void {
    this.selectedTariffOffer = updatedOffer;

    // Update the form with the new tariff offer (for create mode)
    if (this.companyProductForm && !this.isEditing) {
      // Since FormGenerator now handles tariff offers dynamically,
      // we just need to update the form value with the selected offer ID
      const newFormValue = updatedOffer.id || `${updatedOffer.productId}_${updatedOffer.serviceProvider.id}`;
      this.companyProductForm.get('tariffOfferId')?.setValue(newFormValue, { emitEvent: false });
    }
    // For edit mode, we just keep the updated selectedTariffOffer
    // It will be sent in the update request
  }

  private createTariffOfferFromCompanyProduct(companyProduct: CompanyProduct): ActiveTariffOffer {
    // Create a tariff offer from company product data for edit mode
    return {
      id: companyProduct?.tariffOfferId || `company-product-${companyProduct.id}`, // Use actual tariffOfferId if available
      productId: companyProduct.id,
      productName: companyProduct.name,
      serviceProvider: {
        id: 'current-provider', // We don't have this data, using placeholder
        name: 'Current Provider' // We don't have this data, using placeholder
      },
      price: companyProduct.price,
      currency: companyProduct.currency,
      validFrom: new Date().toISOString() // Placeholder
    } as ActiveTariffOffer;
  }
}
