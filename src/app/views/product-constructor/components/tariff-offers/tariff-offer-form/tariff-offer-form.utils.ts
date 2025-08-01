import { FieldType, FormConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { TariffOffer, CreateTariffOfferRequest, UpdateTariffOfferRequest, Currency } from '../../../models';
import { ProductService } from '../../../services/product.service';
import { ProviderProductService } from '../../../services/provider-product.service';

const currencies = [
  { value: 'usd', displayValue: 'USD - US Dollar' },
  { value: 'eur', displayValue: 'EUR - Euro' },
  { value: 'gbp', displayValue: 'GBP - British Pound' },
  { value: 'ils', displayValue: 'ILS - Israeli Shekel' },
  { value: 'rub', displayValue: 'RUB - Russian Ruble' },
  { value: 'uah', displayValue: 'UAH - Ukrainian Hryvnia' }
];

export function getTariffOfferFormConfig(
  tariffOffer: TariffOffer | null = null,
  isEditing: boolean = false,
  productService: ProductService,
  providerProductService: ProviderProductService
): FormConfig {
  const defaultSearchRequest = {
    searchParams: {},
    page: { page: 0, size: 100 }
  };

  return {
    fields: [
      // Section Title: Product Selection
      {
        type: FieldType.text,
        name: 'sectionTitle1',
        label: 'Product Selection',
        value: '',
        invisible: true // This is just a section divider
      },

      // Product Selection
      {
        type: FieldType.select,
        name: 'productId',
        label: 'Product',
        placeholder: 'Select Product',
        validators: [Validators.required],
        options: productService.getProducts(defaultSearchRequest).pipe(
          map(response => response.content.map(product => ({
            value: product.id,
            displayValue: product.name
          }))),
          catchError(error => {
            console.error('Error loading products:', error);
            return of([]);
          })
        ),
        value: tariffOffer?.product?.id || '',
        disabled: isEditing
      },

      // Provider Product Selection
      {
        type: FieldType.select,
        name: 'providerProductId',
        label: 'Provider Product',
        placeholder: 'Select Provider Product',
        validators: [Validators.required],
        options: providerProductService.getProviderProducts(defaultSearchRequest).pipe(
          map(response => response.content.map(providerProduct => ({
            value: providerProduct.id,
            displayValue: `${providerProduct.serviceCoverage?.name} (${providerProduct.serviceProvider?.name})`
          }))),
          catchError(error => {
            console.error('Error loading provider products:', error);
            return of([]);
          })
        ),
        value: tariffOffer?.providerProduct?.id || '',
        disabled: isEditing,
        inputEvent: (event: any, formGenerator: any, field: any) => {
          // Handle provider product selection to show provider information
          const selectedId = event.value;
          console.log('Provider Product selected:', selectedId);
          // Additional logic can be added here to update provider info display
        }
      },

      // Section Title: Pricing Configuration
      {
        type: FieldType.text,
        name: 'sectionTitle2',
        label: 'Pricing Configuration',
        value: '',
        invisible: true // This is just a section divider
      },

      // Price
      {
        type: FieldType.number,
        name: 'price',
        label: 'Price',
        placeholder: '0.00',
        validators: [Validators.required, Validators.min(0.01), Validators.max(999999.99)],
        value: tariffOffer?.price || 0
      },

      // Currency
      {
        type: FieldType.select,
        name: 'currency',
        label: 'Currency',
        placeholder: 'Select Currency',
        validators: [Validators.required],
        options: of(currencies),
        value: tariffOffer?.currency || '',
        inputEvent: (event: any, formGenerator: any, field: any) => {
          // Handle currency change for price display
          const selectedCurrency = event.value;
          console.log('Currency changed to:', selectedCurrency);
          // Additional logic can be added here to update currency symbol display
        }
      }
    ]
  };
}

export function getTariffOfferCreateRequest(formValue: any): CreateTariffOfferRequest {
  return {
    productId: formValue.productId,
    providerProductId: formValue.providerProductId,
    price: parseFloat(formValue.price),
    currency: formValue.currency as Currency
  };
}

export function getTariffOfferUpdateRequest(formValue: any): UpdateTariffOfferRequest {
  return {
    price: parseFloat(formValue.price),
    currency: formValue.currency as Currency
  };
}

export function getCurrencySymbol(currency: string): string {
  switch (currency?.toLowerCase()) {
    case 'usd': return '$';
    case 'eur': return '€';
    case 'gbp': return '£';
    case 'ils': return '₪';
    case 'rub': return '₽';
    case 'uah': return '₴';
    default: return '';
  }
}