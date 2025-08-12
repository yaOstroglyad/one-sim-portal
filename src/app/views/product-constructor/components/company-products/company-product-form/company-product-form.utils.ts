import { FieldType, FormConfig, SelectOption, FieldConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CompanyProduct, CreateCompanyProductRequest, UpdateCompanyProductRequest, ActiveTariffOffer } from '../../../models';
import { AccountsDataService } from '../../../../../shared';
import { ProductService, CompanyProductService } from '../../../services';

// Fallback mock data for when services are not available
const mockProducts = [
  { id: 'product-1', name: 'Europe Business Plan' },
  { id: 'product-2', name: 'Global Roaming Package' },
  { id: 'product-3', name: 'US Data Bundle' }
];

const timeUnits = [
  { value: 'days', displayValue: 'Days' },
  { value: 'hours', displayValue: 'Hours' },
  { value: 'months', displayValue: 'Months' },
  { value: 'years', displayValue: 'Years' }
];

// Simplified product options logic based on clear business rules
function getProductOptions(
  mode: 'admin-create' | 'admin-edit' | 'user-edit',
  productService?: ProductService,
  companyProductService?: CompanyProductService,
  selectedCompanyId?: string | null
): Observable<SelectOption[]> {
  
  // Edit mode: Use cached products for initial form setup (both admin and user)
  if (mode === 'admin-edit' || mode === 'user-edit') {
    return getAllProducts(productService);
  }
  
  // Admin create mode: Use missing products if company selected
  if (mode === 'admin-create' && selectedCompanyId && companyProductService) {
    return companyProductService.getMissingCoreProducts(selectedCompanyId).pipe(
      map(products => {
        if (products.length === 0) {
          return [{
            value: '',
            displayValue: 'All products have been added to this company',
            disabled: true
          } as SelectOption];
        }
        return products.map(product => ({
          value: product.id,
          displayValue: product.name
        } as SelectOption));
      }),
      catchError(() => of([]))
    );
  }
  
  // Default: empty options (admin create without company selection)
  return of([]);
}

// Helper to get all products (now uses cache automatically via ProductService)
function getAllProducts(productService?: ProductService): Observable<SelectOption[]> {
  if (!productService) {
    return of(mockProducts.map(product => ({
      value: product.id,
      displayValue: product.name
    })));
  }
  
  return productService.getProducts({
    searchParams: {},
    page: { page: 0, size: 1000 }
  }).pipe(
    map(response => response.content.map(product => ({
      value: product.id,
      displayValue: product.name
    } as SelectOption))),
    catchError(() => of([]))
  );
}

// Helper functions for creating form fields
function createCompanySelectionField(
  accountsService: AccountsDataService,
  selectedAccountId?: string | null
): FieldConfig {
  return {
    type: FieldType.select,
    name: 'companyId',
    label: 'Company',
    placeholder: 'Select a company',
    value: selectedAccountId || null,
    validators: [Validators.required],
    options: accountsService.ownerAccounts().pipe(
      map(accounts => accounts.map(account => ({
        value: account.id,
        displayValue: account.name || account.email || account.id
      } as SelectOption)))
    )
  };
}

function createProductSelectionField(
  mode: 'admin-create' | 'admin-edit' | 'user-edit',
  productService?: ProductService,
  companyProductService?: CompanyProductService,
  selectedAccountId?: string | null
): FieldConfig {
  return {
    type: FieldType.select,
    name: 'productId',
    label: 'Product',
    placeholder: 'Select a product',
    validators: [Validators.required],
    value: '', // In edit mode, will be set by component after products are loaded
    disabled: mode !== 'admin-create', // Only admin can select products in create mode
    ...(mode === 'admin-create' ? { dependsOn: ['companyId'] } : {}),
    options: getProductOptions(mode, productService, companyProductService, selectedAccountId)
  };
}

function createTariffOfferSelectionField(tariffOffers: ActiveTariffOffer[]): FieldConfig {
  return {
    type: FieldType.select,
    name: 'tariffOfferId',
    label: 'Tariff Offer',
    placeholder: 'Select a tariff offer',
    validators: [Validators.required],
    dependsOn: ['productId'],
    options: of((tariffOffers || []).map((offer, index) => ({
      value: offer.id || `${offer.productId}_${index}`,
      displayValue: `${offer.serviceProvider.name} - ${offer.price} ${offer.currency.toUpperCase()}`
    } as SelectOption)))
  };
}

export function getCompanyProductFormConfig(
  companyProduct: CompanyProduct | null = null,
  isEditing: boolean = false,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  productService?: ProductService,
  tariffOffers: ActiveTariffOffer[] = [],
  selectedAccountId?: string | null,
  companyProductService?: CompanyProductService
): FormConfig {
  // Determine the mode based on user role and editing state
  const mode: 'admin-create' | 'admin-edit' | 'user-edit' = 
    isAdmin ? (isEditing ? 'admin-edit' : 'admin-create') : 'user-edit';

  const formFields: FieldConfig[] = [
    {
      type: FieldType.text,
      name: 'sectionTitle1',
      label: 'Product Assignment',
      value: '',
      invisible: true
    }
  ];

  // Company selection field (only for admin create mode)
  if (mode === 'admin-create' && accountsService) {
    formFields.push(createCompanySelectionField(accountsService, selectedAccountId));
  }

  // Product selection field (behavior differs by mode)
  formFields.push(createProductSelectionField(
    mode, 
    productService, 
    companyProductService, 
    selectedAccountId
  ));

  // Tariff offer field (only for create mode)
  if (mode === 'admin-create') {
    formFields.push(createTariffOfferSelectionField(tariffOffers));
  }

  formFields.push(...[
    // Section Title: Product Details
    {
      type: FieldType.text,
      name: 'sectionTitle2',
      label: 'Product Details',
      value: '',
      invisible: true // This is just a section divider
    },

    // Description
    {
      type: FieldType.textarea,
      name: 'description',
      label: 'Description',
      placeholder: 'Enter a custom description for this company product',
      validators: [Validators.maxLength(500)],
      value: companyProduct?.description || '',
      hintMessage: 'This description will be shown to customers of this company'
    },

    // Section Title: Validity Period Override
    {
      type: FieldType.text,
      name: 'sectionTitle3',
      label: 'Validity Period Override',
      value: '',
      invisible: true // This is just a section divider
    },

    // Validity Period
    {
      type: FieldType.number,
      name: 'period',
      label: 'Period',
      placeholder: '30',
      validators: [Validators.required, Validators.min(1)],
      value: companyProduct?.validityPeriod?.period || 30
    },

    // Time Unit
    {
      type: FieldType.select,
      name: 'timeUnit',
      label: 'Time Unit',
      validators: [Validators.required],
      options: of(timeUnits),
      value: companyProduct?.validityPeriod?.timeUnit || 'days'
    }
  ]);

  return {
    fields: formFields
  };
}

// Note: productId resolution is handled in the component via API product matching

export function getCompanyProductCreateRequest(formValue: any, selectedTariffOffer: ActiveTariffOffer | null): CreateCompanyProductRequest {
  if (!selectedTariffOffer) {
    throw new Error('Tariff offer must be selected');
  }

  return {
    companyAccountId: formValue.companyId || '',
    productId: formValue.productId,
    retailTariff: {
      tariffOfferId: selectedTariffOffer.id || `${selectedTariffOffer.productId}_${selectedTariffOffer.serviceProvider.id}`,
      // Use the potentially modified price and currency from selectedTariffOffer
      price: selectedTariffOffer.price,
      currency: selectedTariffOffer.currency
    },
    description: formValue.description || '',
    validityPeriod: {
      period: parseInt(formValue.period) || 30,
      timeUnit: formValue.timeUnit || 'days'
    }
  };
}

export function getCompanyProductUpdateRequest(formValue: any, selectedTariffOffer?: ActiveTariffOffer | null): UpdateCompanyProductRequest {
  const request: UpdateCompanyProductRequest = {
    description: formValue.description || undefined,
    validityPeriod: {
      period: parseInt(formValue.period),
      timeUnit: formValue.timeUnit
    }
  };

  // Include retailTariff only if tariffOffer is provided (price was modified)
  if (selectedTariffOffer) {
    request.retailTariff = {
      tariffOfferId: selectedTariffOffer.id || `${selectedTariffOffer.productId}_${selectedTariffOffer.serviceProvider.id}`,
      price: selectedTariffOffer.price,
      currency: selectedTariffOffer.currency
    };
  }

  return request;
}
