import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { CompanyProductPrice } from '../../../models';
import { PriceValidationUtils } from '../company-product-prices-table';

/**
 * Unified validators for all price-related forms
 * Used by: modify-price-dialog, modify-tariff-offer-dialog
 */
export class PriceFormValidators {
  /**
   * Validator: ensure date is not before minimum date
   * @param minDate - ISO date string "2025-11-22"
   */
  static minDateValidator(minDate: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const controlDate = typeof control.value === 'string'
        ? control.value
        : control.value.toISOString().split('T')[0];

      return controlDate < minDate
        ? { minDate: { minDate, actual: controlDate } }
        : null;
    };
  }

  /**
   * Validator: ensure validFrom date is unique (no duplicates)
   * @param existingTariffs - List of existing tariffs to check against
   * @param excludeTariffId - Optional tariff ID to exclude from check (for edit mode)
   */
  static uniqueValidFromValidator(
    existingTariffs: CompanyProductPrice[],
    excludeTariffId?: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const controlDate = typeof control.value === 'string'
        ? control.value
        : control.value.toISOString().split('T')[0];

      const hasConflict = PriceValidationUtils.hasValidFromConflict(
        controlDate,
        existingTariffs,
        excludeTariffId
      );

      return hasConflict ? { duplicateValidFrom: true } : null;
    };
  }

  /**
   * Mark all form controls as touched (for validation display)
   * Useful when submitting form to show all validation errors
   */
  static markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Get user-friendly error message for form control
   * @param form - FormGroup containing the control
   * @param controlName - Name of the control
   * @returns Localized error message or null
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
      const error = control.getError('min');
      return `${controlName} must be at least ${error.min}`;
    }

    if (control.hasError('minDate')) {
      const error = control.getError('minDate');
      return `Date must be on or after ${error.minDate}`;
    }

    if (control.hasError('duplicateValidFrom')) {
      return 'A tariff with this date already exists';
    }

    return 'Invalid value';
  }
}
