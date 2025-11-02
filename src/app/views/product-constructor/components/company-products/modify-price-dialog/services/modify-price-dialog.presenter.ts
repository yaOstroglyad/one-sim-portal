import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import {
  ModifyPriceDialogData,
  PriceInfoViewModel,
  PricePreviewViewModel,
  ModifyPriceDialogViewModel
} from '../models/modify-price-dialog.model';
import { PriceCalculationUtils, PriceData } from '../utils/price-calculation.utils';
import { FormUtils } from '../utils/form.utils';
import { ModifyPriceDialogConfig } from '../../factories';
import { ProductsDataService } from '@shared';

/**
 * Presenter service for modify price dialog
 * Handles business logic and view model creation
 */
@Injectable()
export class ModifyPriceDialogPresenter {
  private readonly productsDataService = inject(ProductsDataService);

  /**
   * Create view model stream from form and data
   */
  createViewModel(
    form: FormGroup,
    data: ModifyPriceDialogData,
    uiConfig: ModifyPriceDialogConfig
  ): Observable<ModifyPriceDialogViewModel> {

    // Stream of form changes
    const formChanges$ = form.valueChanges.pipe(
      startWith(form.value)
    );

    // Stream of form status changes
    const formStatus$ = form.statusChanges.pipe(
      startWith(form.status)
    );

    return combineLatest([formChanges$, formStatus$]).pipe(
      switchMap(([formValue, formStatus]) => {
        const priceData = this.createPriceData(data, formValue);

        return combineLatest([
          this.createPriceInfoViewModel(priceData),
          this.createPricePreviewViewModel(priceData, formStatus === 'VALID')
        ]).pipe(
          map(([priceInfo, pricePreview]) => ({
            priceInfo,
            pricePreview,
            isFormValid: formStatus === 'VALID',
            showServiceProvider: uiConfig.visibility.showServiceProvider,
            serviceProviderName: data.tariffOffer?.serviceProvider?.name || null
          }))
        );
      })
    );
  }

  /**
   * Create price data object from dialog data and form value
   */
  private createPriceData(data: ModifyPriceDialogData, formValue: any): PriceData {
    const baseData = PriceCalculationUtils.extractPriceData(data.tariffOffer);

    return {
      ...baseData,
      newPrice: formValue.price,
      newCurrency: formValue.currency
    };
  }

  /**
   * Create price info view model
   */
  private createPriceInfoViewModel(priceData: PriceData): Observable<PriceInfoViewModel> {
    return PriceCalculationUtils.calculateCurrencyAwareBasePriceDifference(
      priceData,
      this.productsDataService,
      'USD'
    ).pipe(
      map(difference => ({
        basePrice: priceData.basePrice,
        baseCurrency: priceData.baseCurrency,
        currentPrice: priceData.currentPrice,
        currentCurrency: priceData.currentCurrency,
        formattedBasePrice: PriceCalculationUtils.formatCurrencyPrice(priceData.basePrice, priceData.baseCurrency),
        formattedCurrentPrice: PriceCalculationUtils.formatCurrencyPrice(priceData.currentPrice, priceData.currentCurrency),
        priceDifference: difference.absoluteDifference,
        priceDifferencePercentage: difference.percentageDifference,
        hasPriceDifference: difference.absoluteDifference !== 0
      }))
    );
  }

  /**
   * Create price preview view model
   */
  private createPricePreviewViewModel(priceData: PriceData, isFormValid: boolean): Observable<PricePreviewViewModel> {
    // Check if we should show preview
    const shouldShow = isFormValid &&
                      priceData.newPrice !== null &&
                      priceData.newPrice !== undefined &&
                      priceData.newPrice !== priceData.currentPrice;

    if (!shouldShow) {
      return of({
        oldPrice: priceData.currentPrice,
        oldCurrency: priceData.currentCurrency,
        newPrice: priceData.newPrice,
        newCurrency: priceData.newCurrency,
        formattedOldPrice: PriceCalculationUtils.formatCurrencyPrice(priceData.currentPrice, priceData.currentCurrency),
        formattedNewPrice: PriceCalculationUtils.formatCurrencyPrice(priceData.newPrice, priceData.newCurrency),
        changePercentage: 0,
        isIncrease: false,
        isDecrease: false,
        isVisible: false
      });
    }

    return PriceCalculationUtils.calculateCurrencyAwareNewPriceDifference(
      priceData,
      this.productsDataService,
      'USD'
    ).pipe(
      map(change => ({
        oldPrice: priceData.currentPrice,
        oldCurrency: priceData.currentCurrency,
        newPrice: priceData.newPrice,
        newCurrency: priceData.newCurrency,
        formattedOldPrice: PriceCalculationUtils.formatCurrencyPrice(priceData.currentPrice, priceData.currentCurrency),
        formattedNewPrice: PriceCalculationUtils.formatCurrencyPrice(priceData.newPrice, priceData.newCurrency),
        changePercentage: change.percentageDifference,
        isIncrease: change.isIncrease,
        isDecrease: change.isDecrease,
        isVisible: true
      }))
    );
  }

  /**
   * Extract result from form data
   */
  extractResult(form: FormGroup): any | null {
    const formData = FormUtils.extractFormData(form);

    if (!formData) {
      return null;
    }

    return {
      price: formData.price,
      currency: formData.currency
    };
  }

  /**
   * Validate form and return error messages
   */
  validateForm(form: FormGroup): string[] {
    const errors: string[] = [];

    if (!form.valid) {
      Object.keys(form.controls).forEach(key => {
        const errorMessage = FormUtils.getErrorMessage(form, key);
        if (errorMessage) {
          errors.push(errorMessage);
        }
      });
    }

    return errors;
  }
}
