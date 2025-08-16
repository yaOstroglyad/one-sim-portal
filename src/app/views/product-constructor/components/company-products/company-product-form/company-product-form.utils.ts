import { FieldType, FormConfig, SelectOption, FieldConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CompanyProduct, CreateCompanyProductRequest, UpdateCompanyProductRequest, ActiveTariffOffer } from '../../../models';
import { AccountsDataService } from '../../../../../shared';
import { CompanyProductService } from '../../../services';


const timeUnits = [
  { value: 'days', displayValue: 'Days' },
  { value: 'hours', displayValue: 'Hours' },
  { value: 'months', displayValue: 'Months' },
  { value: 'years', displayValue: 'Years' }
];



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
    disabled: true,
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

// Helper functions for creating specific product selection fields
function createAdminCreateProductField(companyProductService?: CompanyProductService): FieldConfig {
  return {
    type: FieldType.select,
    name: 'productId',
    label: 'Product',
    placeholder: 'Select a product',
    validators: [Validators.required],
    value: '',
    disabled: false,
    dependsOnValue: ['companyId'],
    options: (values: any) => {
      const { companyId } = values;
      if (!companyId || !companyProductService) return of([]);

      // Admin создание: использовать getMissingCoreProducts по companyId
      return companyProductService.getMissingCoreProducts(companyId).pipe(
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
  };
}

function createAdminEditProductField(companyProductService?: CompanyProductService): FieldConfig {
  return {
    type: FieldType.select,
    name: 'productId',
    label: 'Product',
    placeholder: 'Select a product',
    validators: [Validators.required],
    value: '',
    invisible: true,
    dependsOnValue: ['companyId'],
    options: (values: any) => {
      const { companyId } = values;
      if (!companyId || !companyProductService) return of([]);

      // Admin редактирование: использовать searchCompanyProducts с указанной компанией
      return companyProductService.searchCompanyProducts({
        searchParams: { accountId: companyId },
        page: { page: 0, size: 1000 }
      }).pipe(
        map(response => response.content.map(product => ({
          value: product.id,
          displayValue: product.name
        } as SelectOption))),
        catchError(() => of([]))
      );
    }
  };
}

function createUserEditProductField(companyProductService?: CompanyProductService): FieldConfig {
  return {
    type: FieldType.select,
    name: 'productId',
    label: 'Product',
    placeholder: 'Select a product',
    validators: [Validators.required],
    value: '',
    disabled: true, // Disabled in edit mode
    options: companyProductService ?
      // Пользователь редактирование: использовать searchCompanyProducts без companyId
      companyProductService.searchCompanyProducts({
        searchParams: {},
        page: { page: 0, size: 1000 }
      }).pipe(
        map(response => response.content.map(product => ({
          value: product.id,
          displayValue: product.name
        } as SelectOption))),
        catchError(() => of([]))
      ) :
      of([])
  };
}

function createTariffOfferSelectionField(tariffOfferService: any): FieldConfig {
  return {
    type: FieldType.select,
    name: 'tariffOfferId',
    label: 'Tariff Offer',
    placeholder: 'Select a tariff offer',
    validators: [Validators.required],
    dependsOnValue: ['productId'],
    disabled: true,
    options: (values: any) => {
      const { productId } = values;
      if (!productId || !tariffOfferService) return of([]);

      return tariffOfferService.getActiveTariffOffers(productId).pipe(
        map((offers: ActiveTariffOffer[]) =>
          offers.map((offer, index) => ({
            value: offer.id || `${offer.productId}_${index}`,
            displayValue: `${offer.serviceProvider.name} - ${offer.price} ${offer.currency.toUpperCase()}`
          } as SelectOption))
        ),
        catchError(() => of([]))
      );
    }
  };
}

export function getCompanyProductFormConfig(
  companyProduct: CompanyProduct | null = null,
  isEditing: boolean = false,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  tariffOfferService?: any,
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

  // Company selection field (for admin modes)
  // if ((mode === 'admin-create' || mode === 'admin-edit') && accountsService) {
  //   // In edit mode, use the company from the existing product
  //   const companyIdValue = mode === 'admin-edit' && companyProduct?.company?.id
  //     ? companyProduct.company.id
  //     : selectedAccountId;
  //   formFields.push(createCompanySelectionField(accountsService, companyIdValue, mode));
  // }

  if ((mode === 'admin-create' || mode === 'admin-edit') && accountsService) {
    formFields.push(createCompanySelectionField(accountsService, selectedAccountId));
  }

  // Product selection field (behavior differs by mode)
  if (mode === 'admin-edit') {
    formFields.push(createAdminEditProductField(companyProductService));
  } else if (mode === 'admin-create') {
    formFields.push(createAdminCreateProductField(companyProductService));
  } else if (mode === 'user-edit') {
    formFields.push(createUserEditProductField(companyProductService));
  }

  // Tariff offer field (only for create mode)
  if (mode === 'admin-create') {
    formFields.push(createTariffOfferSelectionField(tariffOfferService));
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
