import { FormGroup } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';

import { CompanyProductPriceService } from '../../../../services';
import { Currency } from '../../../../models';
import { PriceFormConfigUtils } from '../../utils';
import {
  ModifyPriceDialogData,
  ModifyPriceResult
} from '../models/modify-price-dialog.model';
import { DialogMode } from '../models/dialog-mode.model';

/**
 * Strategy function type for dialog save operations
 * Modern functional approach instead of class-based strategy pattern
 */
export type DialogSaveStrategy = (
  form: FormGroup,
  data: ModifyPriceDialogData
) => Observable<ModifyPriceResult | null>;

/**
 * Utility to format date to ISO string (YYYY-MM-DD)
 */
function formatValidFromDate(date: Date | string): string {
  return typeof date === 'string'
    ? date.split('T')[0]
    : new Date(date).toISOString().split('T')[0];
}

/**
 * Create mode strategy factory - creates new price via API
 * Returns a strategy function with service dependency
 */
export function createPriceSaveStrategy(priceService: CompanyProductPriceService): DialogSaveStrategy {
  return (form: FormGroup, data: ModifyPriceDialogData): Observable<ModifyPriceResult | null> => {
    const formData = PriceFormConfigUtils.extractFormData(form);
    if (!formData) {
      return of(null);
    }

    if (!data.companyProductId) {
      return throwError(() => new Error('companyProductId is required for create mode'));
    }

    const request = {
      tariffOfferId: formData.tariffOfferId!,
      price: Number(formData.price),
      currency: formData.currency as Currency,
      validFrom: formatValidFromDate(formData.validFrom)
    };

    return priceService.createPrice(data.companyProductId, request);
  };
}

/**
 * Edit mode strategy factory - updates existing price via API
 * Returns a strategy function with service dependency
 */
export function editPriceSaveStrategy(priceService: CompanyProductPriceService): DialogSaveStrategy {
  return (form: FormGroup, data: ModifyPriceDialogData): Observable<ModifyPriceResult | null> => {
    const formData = PriceFormConfigUtils.extractFormData(form);
    if (!formData) {
      return of(null);
    }

    if (!data.companyProductId) {
      return throwError(() => new Error('companyProductId is required for edit mode'));
    }

    if (!data.existingTariff?.id) {
      return throwError(() => new Error('existingTariff.id is required for edit mode'));
    }

    const request = {
      price: Number(formData.price),
      currency: formData.currency as Currency,
      validFrom: formatValidFromDate(formData.validFrom)
    };

    return priceService.updatePrice(data.companyProductId, data.existingTariff.id, request);
  };
}

/**
 * Factory function to create appropriate strategy based on dialog mode
 * Service must be injected in component and passed here
 */
export function createDialogSaveStrategy(
  mode: DialogMode,
  priceService: CompanyProductPriceService
): DialogSaveStrategy {
  switch (mode) {
    case DialogMode.Create:
      return createPriceSaveStrategy(priceService);
    case DialogMode.Edit:
      return editPriceSaveStrategy(priceService);
  }
}
