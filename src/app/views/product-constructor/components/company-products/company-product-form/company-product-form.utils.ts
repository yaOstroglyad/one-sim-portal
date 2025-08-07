import { FieldType, FormConfig, SelectOption, FieldConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CompanyProduct, CreateCompanyProductRequest, UpdateCompanyProductRequest, ActiveTariffOffer, Currency } from '../../../models';
import { AccountsDataService } from '../../../../../shared/services/accounts-data.service';
import { ProductService } from '../../../services';

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

export function getCompanyProductFormConfig(
  companyProduct: CompanyProduct | null = null,
  isEditing: boolean = false,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  productService?: ProductService,
  tariffOffers: ActiveTariffOffer[] = [],
  selectedAccountId?: string | null
): FormConfig {
  const formFields: FieldConfig[] = [
    // Section Title: Product Assignment
    {
      type: FieldType.text,
      name: 'sectionTitle1',
      label: 'Product Assignment',
      value: '',
      invisible: true // This is just a section divider
    }
  ];

  // Add company selection field only for admins
  if (isAdmin && accountsService) {
    const companyField: FieldConfig = {
      type: FieldType.select,
      name: 'companyId',
      label: 'Company',
      placeholder: 'Select a company',
      value: selectedAccountId || null,
      disabled: isEditing,
      validators: [Validators.required],
      options: accountsService.ownerAccounts().pipe(
        map(accounts => accounts.map(
          account => ({
            value: account.id,
            displayValue: account.name || account.email || account.id
          } as SelectOption)
        ))
      )
    };
    formFields.push(companyField);
  }

  // Product Selection field
  const productField: FieldConfig = {
    type: FieldType.select,
    name: 'productId',
    label: 'Product',
    placeholder: 'Select a product',
    validators: [Validators.required],
    value: companyProduct?.id || '', // In edit mode, this represents the product
    disabled: isEditing,
    options: productService
      ? productService.getProducts({
          searchParams: {},
          page: { page: 0, size: 1000 } // Get all products for dropdown
        }).pipe(
          map(response => response.content.map(product => ({
            value: product.id,
            displayValue: product.name
          } as SelectOption))),
          catchError(() => of([]))
        )
      : of(mockProducts.map(product => ({
          value: product.id,
          displayValue: product.name
        })))
  };

  formFields.push(productField);

  // Add Tariff Offer field only for create mode
  if (!isEditing) {
    const tariffOfferField: FieldConfig = {
      type: FieldType.select,
      name: 'tariffOfferId',
      label: 'Tariff Offer',
      placeholder: 'Select a tariff offer',
      validators: [Validators.required],
      dependsOn: ['productId'],
      options: of((tariffOffers || []).map((offer, index) => ({
        // Temporary: Generate ID using productId + index until backend provides real ID
        // When backend adds ID, just replace with: value: offer.id
        value: `${offer.productId}_${index}`,
        displayValue: `${offer.serviceProvider.name} - ${offer.price} ${offer.currency.toUpperCase()}`
      } as SelectOption)))
    };
    formFields.push(tariffOfferField);
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

export function getCompanyProductCreateRequest(formValue: any, selectedTariffOffer: ActiveTariffOffer | null): CreateCompanyProductRequest {
  if (!selectedTariffOffer) {
    throw new Error('Tariff offer must be selected');
  }

  const request: CreateCompanyProductRequest = {
    companyId: formValue.companyId || '',
    productId: formValue.productId,
    retailTariff: {
      // TODO: Replace with selectedTariffOffer.id when backend provides it
      // For now, using a combination that backend can parse
      tariffOfferId: `${selectedTariffOffer.productId}_${selectedTariffOffer.serviceProvider.id}`,
      price: selectedTariffOffer.price,
      currency: selectedTariffOffer.currency
    },
    description: formValue.description || '',
    validityPeriod: {
      period: parseInt(formValue.period) || 30,
      timeUnit: formValue.timeUnit || 'days'
    }
  };

  return request;
}

export function getCompanyProductUpdateRequest(formValue: any): UpdateCompanyProductRequest {
  return {
    description: formValue.description || undefined,
    validityPeriod: {
      period: parseInt(formValue.period),
      timeUnit: formValue.timeUnit
    }
  };
}
