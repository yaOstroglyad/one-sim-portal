import { Injectable, inject, computed, Injector, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  ModifyPriceDialogData,
  PriceInfoViewModel,
  PricePreviewViewModel,
  ModifyPriceDialogViewModel
} from '../models/modify-price-dialog.model';
import { PriceFormConfigUtils, PriceData } from '../../utils';
import { ModifyPriceDialogConfig } from '../../factories';
import { ProductsDataService, PriceComparisonUtils } from '@shared';

/**
 * Presenter service for modify price dialog
 * Handles business logic and view model creation using signals
 */
@Injectable()
export class ModifyPriceDialogPresenter {
  private readonly productsDataService = inject(ProductsDataService);
  private readonly injector = inject(Injector);

  // Cache exchange rates as signal
  private readonly exchangeRates = toSignal(
    this.productsDataService.getExchangeRates(),
    { initialValue: {}, injector: this.injector }
  );

  /**
   * Create view model signals from form and data
   */
  createViewModel(
    form: FormGroup,
    data: ModifyPriceDialogData,
    uiConfig: ModifyPriceDialogConfig
  ): Signal<ModifyPriceDialogViewModel> {

    // Convert form value changes to signal with debounce
    const formValue = toSignal(
      form.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) =>
          prev.price === curr.price && prev.currency === curr.currency
        )
      ),
      { initialValue: form.value, injector: this.injector }
    );

    // Convert form status to signal
    const formStatus = toSignal(
      form.statusChanges,
      { initialValue: form.status, injector: this.injector }
    );

    // Computed price data based on form changes
    const priceData = computed(() => {
      const baseData = PriceFormConfigUtils.extractPriceData(data.tariffOffer);
      const value = formValue();

      // Handle null case when valueChanges hasn't emitted yet
      if (!value) {
        return {
          ...baseData,
          newPrice: null,
          newCurrency: null
        };
      }

      return {
        ...baseData,
        newPrice: value.price,
        newCurrency: value.currency
      };
    });

    // Computed price info
    const priceInfo = computed(() =>
      this.calculatePriceInfo(priceData(), this.exchangeRates())
    );

    // Computed price preview
    const pricePreview = computed(() =>
      this.calculatePricePreview(priceData(), formStatus() === 'VALID', this.exchangeRates())
    );

    // Final view model
    return computed(() => ({
      priceInfo: priceInfo(),
      pricePreview: pricePreview(),
      isFormValid: formStatus() === 'VALID',
      showServiceProvider: uiConfig.visibility.showServiceProvider,
      serviceProviderName: data.tariffOffer?.serviceProvider?.name || null
    }));
  }

  /**
   * Calculate price info view model (synchronous with cached exchange rates)
   */
  private calculatePriceInfo(priceData: PriceData, exchangeRates: Record<string, number>): PriceInfoViewModel {
    return PriceComparisonUtils.createPriceInfoViewModel(
      priceData.basePrice,
      priceData.baseCurrency,
      priceData.currentPrice,
      priceData.currentCurrency,
      exchangeRates,
      'USD'
    );
  }

  /**
   * Calculate price preview view model (synchronous with cached exchange rates)
   */
  private calculatePricePreview(
    priceData: PriceData,
    isFormValid: boolean,
    exchangeRates: Record<string, number>
  ): PricePreviewViewModel {
    // Only show preview if form is valid
    if (!isFormValid) {
      return PriceComparisonUtils.createPricePreviewViewModel(
        priceData.currentPrice,
        priceData.currentCurrency,
        null,
        null,
        exchangeRates,
        'USD'
      );
    }

    return PriceComparisonUtils.createPricePreviewViewModel(
      priceData.currentPrice,
      priceData.currentCurrency,
      priceData.newPrice,
      priceData.newCurrency,
      exchangeRates,
      'USD'
    );
  }
}
