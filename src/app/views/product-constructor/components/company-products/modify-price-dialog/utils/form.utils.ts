import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActiveTariffOffer } from '../../../../models';
import { ProductsDataService } from '../../../../../../shared';

/**
 * Interface for currency option
 */
export interface CurrencyOption {
  value: string;
  label: string;
}

/**
 * Interface for form data
 */
export interface ModifyPriceFormData {
  price: number;
  currency: string;
}

/**
 * Utility class for form operations in modify price dialog
 */
export class FormUtils {
  
  /**
   * Create modify price form with validation
   */
  static createModifyPriceForm(fb: FormBuilder): FormGroup {
    return fb.group({
      price: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]]
    });
  }

  /**
   * Initialize form with tariff offer data
   */
  static initializeFormWithTariffOffer(form: FormGroup, tariffOffer: ActiveTariffOffer): void {
    if (!tariffOffer) {
      return;
    }

    form.patchValue({
      price: tariffOffer.price,
      currency: tariffOffer.currency
    });
  }

  /**
   * Load currency options from service (uses real API)
   */
  static loadCurrencyOptions(productsDataService: ProductsDataService): Observable<CurrencyOption[]> {
    return productsDataService.getCurrencies().pipe(
      map((currencies: string[]) => 
        currencies.map((currency: string) => ({
          value: currency,
          label: currency.toUpperCase() // Ensure consistent display
        }))
      )
    );
  }

  /**
   * Extract form data
   */
  static extractFormData(form: FormGroup): ModifyPriceFormData | null {
    if (!form.valid) {
      return null;
    }

    return {
      price: form.get('price')?.value,
      currency: form.get('currency')?.value
    };
  }

  /**
   * Get form control value safely
   */
  static getControlValue<T>(form: FormGroup, controlName: string): T | null {
    const control = form.get(controlName);
    return control ? control.value : null;
  }

  /**
   * Check if form has errors for specific control
   */
  static hasControlError(form: FormGroup, controlName: string, errorType: string): boolean {
    const control = form.get(controlName);
    return control ? control.hasError(errorType) : false;
  }

  /**
   * Get error message for form control
   */
  static getErrorMessage(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);
    
    if (!control || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return `${controlName} is required`;
    }

    if (control.hasError('min')) {
      return `${controlName} must be greater than 0`;
    }

    return 'Invalid value';
  }

  /**
   * Reset form to initial state
   */
  static resetForm(form: FormGroup): void {
    form.reset({
      price: 0,
      currency: 'USD'
    });
  }

  /**
   * Mark all form controls as touched (for validation display)
   */
  static markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}