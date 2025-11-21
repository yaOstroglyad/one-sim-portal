import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Validators } from '@angular/forms';

import { FieldType, FormConfig, FieldConfig, SelectOption, ProductsDataService } from '@shared';
import { CompanyProductPrice, ActiveTariffOffer } from '../../../models';
import { PriceValidationUtils } from '../company-product-prices-table';
import { PriceFormValidators } from './price-form-validators.utils';

/**
 * Interface for price data extraction
 */
export interface PriceData {
  basePrice: number | null;
  baseCurrency: string | null;
  currentPrice: number | null;
  currentCurrency: string | null;
  newPrice?: number | null;
  newCurrency?: string | null;
}

/**
 * Unified utility class for creating form configurations for price-related dialogs
 * Used by: modify-price-dialog, modify-tariff-offer-dialog
 */
export class PriceFormConfigUtils {
  /**
   * Create currency options observable from ProductsDataService
   * Returns options in format: { value: 'USD', displayValue: 'USD' }
   */
  static createCurrencyOptions(
    productsDataService: ProductsDataService
  ): Observable<SelectOption[]> {
    return productsDataService.getCurrencies().pipe(
      map(currencies => currencies.map(currency => ({
        value: currency,
        displayValue: currency
      } as SelectOption)))
    );
  }

  /**
   * Create price field configuration
   * @param defaultValue - Default price value
   * @param className - CSS class for layout (default: 'col-md-8')
   */
  static createPriceField(defaultValue: number = 0, className: string = 'col-md-8'): FieldConfig {
    return {
      type: FieldType.number,
      name: 'price',
      label: 'Price',
      placeholder: '0.00',
      value: defaultValue,
      validators: [Validators.required, Validators.min(0.01)],
      className
    };
  }

  /**
   * Create currency field configuration
   * @param defaultValue - Default currency value
   * @param currencyOptions$ - Observable of currency options
   * @param className - CSS class for layout (default: 'col-md-4')
   */
  static createCurrencyField(
    defaultValue: string = 'USD',
    currencyOptions$: Observable<SelectOption[]>,
    className: string = 'col-md-4'
  ): FieldConfig {
    return {
      type: FieldType.select,
      name: 'currency',
      label: 'Currency',
      placeholder: 'Select currency',
      value: defaultValue,
      validators: [Validators.required],
      options: currencyOptions$,
      className
    };
  }

  /**
   * Create validFrom field configuration
   * @param minDate - Minimum allowed date (ISO string)
   * @param existingTariffs - List of existing tariffs for uniqueness validation
   * @param excludeTariffId - Optional tariff ID to exclude from uniqueness check
   */
  static createValidFromField(
    minDate: string,
    existingTariffs: CompanyProductPrice[] = [],
    excludeTariffId?: string
  ): FieldConfig {
    return {
      type: FieldType.datepicker,
      name: 'validFrom',
      label: 'Valid From',
      placeholder: 'Select date',
      value: minDate,
      validators: [
        Validators.required,
        PriceFormValidators.minDateValidator(minDate),
        PriceFormValidators.uniqueValidFromValidator(existingTariffs, excludeTariffId)
      ],
      errorMessages: {
        required: 'Valid From date is required',
        minDate: 'Date must be tomorrow or later',
        duplicateValidFrom: 'This date is already used for another price'
      },
      className: 'col-12'
    };
  }

  /**
   * Create complete form config for modify price dialog
   * @param minValidFromDate - Minimum allowed validFrom date
   * @param existingTariffs - List of existing tariffs
   * @param excludeTariffId - Optional tariff ID to exclude
   * @param defaultPrice - Default price value
   * @param defaultCurrency - Default currency value
   * @param currencyOptions$ - Observable of currency options
   * @param includeValidFrom - Whether to include validFrom field (default: true)
   */
  static createModifyPriceFormConfig(
    minValidFromDate: string | undefined,
    existingTariffs: CompanyProductPrice[],
    excludeTariffId: string | undefined,
    defaultPrice: number,
    defaultCurrency: string,
    currencyOptions$: Observable<SelectOption[]>,
    includeValidFrom: boolean = true
  ): FormConfig {
    const tomorrow = PriceValidationUtils.getTomorrowISOString();
    const minDate = minValidFromDate || tomorrow;

    const fields: FieldConfig[] = [
      this.createPriceField(defaultPrice),
      this.createCurrencyField(defaultCurrency, currencyOptions$)
    ];

    if (includeValidFrom) {
      fields.push(this.createValidFromField(minDate, existingTariffs, excludeTariffId));
    }

    return { fields };
  }

  /**
   * Create simple form config for modify tariff offer dialog (no validFrom)
   * @param defaultPrice - Default price value
   * @param defaultCurrency - Default currency value
   * @param currencyOptions$ - Observable of currency options
   */
  static createModifyTariffOfferFormConfig(
    defaultPrice: number,
    defaultCurrency: string,
    currencyOptions$: Observable<SelectOption[]>
  ): FormConfig {
    return {
      fields: [
        this.createPriceField(defaultPrice),
        this.createCurrencyField(defaultCurrency, currencyOptions$)
      ]
    };
  }

  /**
   * Extract initial values from CompanyProductPrice (for edit mode)
   */
  static getInitialValuesFromTariff(tariff?: CompanyProductPrice): {
    price: number;
    currency: string;
    validFrom?: string;
  } {
    if (!tariff) {
      return {
        price: 0,
        currency: 'USD'
      };
    }

    return {
      price: tariff.price,
      currency: tariff.currency,
      validFrom: tariff.validFrom
    };
  }

  /**
   * Extract initial values from ActiveTariffOffer
   */
  static getInitialValuesFromTariffOffer(tariffOffer: ActiveTariffOffer | null): {
    price: number;
    currency: string;
  } {
    return {
      price: tariffOffer?.price || 0,
      currency: tariffOffer?.currency || 'USD'
    };
  }

  /**
   * Extract price data from tariff offer for price comparison calculations
   * Handles cases where tariff offer may have basePrice/baseCurrency fields
   */
  static extractPriceData(tariffOffer?: ActiveTariffOffer): PriceData {
    if (!tariffOffer) {
      return {
        basePrice: null,
        baseCurrency: null,
        currentPrice: null,
        currentCurrency: null
      };
    }

    const offer = tariffOffer as any;

    return {
      basePrice: offer?.basePrice !== undefined ? offer.basePrice : tariffOffer.price,
      baseCurrency: offer?.baseCurrency || tariffOffer.currency,
      currentPrice: tariffOffer.price,
      currentCurrency: tariffOffer.currency
    };
  }

  /**
   * Extract form data safely from FormGroup
   * @param form - The form to extract data from
   * @returns Extracted form data or null if form is invalid
   */
  static extractFormData(form: any): {
    price: number;
    currency: string;
    validFrom?: string;
    tariffOfferId?: string;
  } | null {
    if (!form.valid) {
      return null;
    }

    return {
      price: form.get('price')?.value,
      currency: form.get('currency')?.value,
      validFrom: form.get('validFrom')?.value,
      tariffOfferId: form.get('tariffOfferId')?.value
    };
  }
}
