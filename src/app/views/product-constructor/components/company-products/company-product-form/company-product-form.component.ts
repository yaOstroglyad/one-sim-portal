import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';

import { FormGeneratorComponent, FormConfig } from '../../../../../shared';
import { CompanyProductService, ProductService } from '../../../services';
import { CompanyProduct, ActiveTariffOffer } from '../../../models';
import { AccountsDataService } from '../../../../../shared/services/accounts-data.service';
import { TariffOfferService } from '../../../../../shared/services/tariff-offer.service';
import { AuthService, ADMIN_PERMISSION } from '../../../../../shared/auth/auth.service';
import { SelectedTariffOfferDetailsComponent } from '../selected-tariff-offer-details/selected-tariff-offer-details.component';
import { 
  getCompanyProductFormConfig,
  getCompanyProductCreateRequest,
  getCompanyProductUpdateRequest
} from './company-product-form.utils';

@Component({
  selector: 'app-company-product-form',
  standalone: true,
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
  tariffOffers: ActiveTariffOffer[] = [];
  selectedTariffOffer: ActiveTariffOffer | null = null;
  
  // TODO: Remove this mapping when backend adds ID to ActiveTariffOffer response
  // Currently using index-based temporary IDs

  constructor(
    private companyProductService: CompanyProductService,
    private accountsService: AccountsDataService,
    private authService: AuthService,
    private productService: ProductService,
    private tariffOfferService: TariffOfferService
  ) {}

  ngOnInit(): void {
    const isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
    this.formConfig = getCompanyProductFormConfig(
      this.companyProduct, 
      this.isEditing, 
      this.accountsService, 
      isAdmin,
      this.productService,
      this.tariffOffers,
      this.selectedAccountId
    );
    
    // In edit mode, create a tariff offer from existing company product data
    if (this.isEditing && this.companyProduct) {
      this.selectedTariffOffer = this.createTariffOfferFromCompanyProduct(this.companyProduct);
    }
  }

  get isEditing(): boolean {
    return !!this.companyProduct;
  }

  onFormChanges(form: FormGroup): void {
    this.companyProductForm = form;
    
    // Listen for product changes to load tariff offers
    form.get('productId')?.valueChanges.subscribe(productId => {
      if (productId && !this.isEditing) {
        this.loadTariffOffers(productId);
      }
    });
    
    // Listen for tariff offer selection
    form.get('tariffOfferId')?.valueChanges.subscribe(tariffOfferId => {
      if (tariffOfferId) {
        // Temporary: using index-based ID until backend provides real ID
        const [index] = tariffOfferId.split('_').slice(-1);
        this.selectedTariffOffer = this.tariffOffers[parseInt(index)] || null;
      }
    });
  }
  
  private loadTariffOffers(productId: string): void {
    this.tariffOfferService.getActiveTariffOffers(productId).subscribe({
      next: (offers) => {
        this.tariffOffers = offers;
        this.updateFormConfigWithTariffOffers();
        // Reset tariff offer selection
        this.companyProductForm.get('tariffOfferId')?.setValue(null);
        this.selectedTariffOffer = null;
      },
      error: (error) => {
        console.error('Error loading tariff offers:', error);
        this.tariffOffers = [];
        this.updateFormConfigWithTariffOffers();
      }
    });
  }
  
  private updateFormConfigWithTariffOffers(): void {
    const isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
    this.formConfig = getCompanyProductFormConfig(
      this.companyProduct,
      this.isEditing,
      this.accountsService,
      isAdmin,
      this.productService,
      this.tariffOffers,
      this.selectedAccountId
    );
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
      },
      error: (error) => {
        this.loading = false;
        this.error = this.getErrorMessage(error);
        console.error('Error saving company product:', error);
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
      // Find the index of the updated offer in the tariffOffers array
      const updatedIndex = this.tariffOffers.findIndex(offer => 
        offer.productId === updatedOffer.productId && 
        offer.serviceProvider.id === updatedOffer.serviceProvider.id
      );
      
      if (updatedIndex !== -1) {
        // Replace the old offer with the updated one
        this.tariffOffers[updatedIndex] = updatedOffer;
        
        // Update form value to point to the updated offer
        const newFormValue = `${updatedOffer.productId}_${updatedIndex}`;
        this.companyProductForm.get('tariffOfferId')?.setValue(newFormValue, { emitEvent: false });
      }
    }
    // For edit mode, we just keep the updated selectedTariffOffer
    // It will be sent in the update request
  }
  
  private createTariffOfferFromCompanyProduct(companyProduct: CompanyProduct): ActiveTariffOffer {
    // Create a mock tariff offer from company product data for edit mode
    return {
      id: `company-product-${companyProduct.id}`, // Generate a unique ID for edit mode
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