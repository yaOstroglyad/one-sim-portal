import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ButtonModule } from '@coreui/angular';

import { ActiveTariffOffer, Currency } from '../../../models';
import {
  ProductsDataService,
  FormGeneratorComponent,
  FormConfig,
  InfoStripComponent,
  PriceComparisonUtils,
  PricePreviewViewModel,
  PriceInfoViewModel,
  PricePreviewComponent,
  PriceInfoDisplayComponent
} from '@shared';
import { PriceFormConfigUtils } from '../utils';

export interface ModifyTariffOfferDialogData {
  tariffOffer: ActiveTariffOffer;
}

export interface ModifyTariffOfferResult {
  tariffOfferId: string;
  price: number;
  currency: Currency;
  validFrom: string; // ISO date string "2025-11-21"
}

/**
 * Dialog component for modifying tariff offer price
 * Uses signal-based architecture with OnPush change detection
 */
@Component({
  selector: 'app-modify-tariff-offer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    ButtonModule,
    FormGeneratorComponent,
    InfoStripComponent,
    PricePreviewComponent,
    PriceInfoDisplayComponent
  ],
  templateUrl: './modify-tariff-offer-dialog.component.html',
  styleUrls: ['./modify-tariff-offer-dialog.component.scss']
})
export class ModifyTariffOfferDialogComponent implements OnInit {
  // Form
  modifyForm: FormGroup;
  formConfig: FormConfig;
  viewModel: Signal<{
    priceInfo: PriceInfoViewModel;
    pricePreview: PricePreviewViewModel;
    isFormValid: boolean;
  }> | null = null;

  // Injected dependencies
  private readonly dialogData = inject<ModifyTariffOfferDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ModifyTariffOfferDialogComponent>);
  private readonly productsDataService = inject(ProductsDataService);

  // Exchange rates signal
  readonly exchangeRates = signal<Record<string, number>>({});

  // Form state
  private formData = signal<any>(null);

  // Computed signals for display data
  readonly tariffOffer = computed(() => this.dialogData.tariffOffer);

  readonly serviceProviderName = computed(() => {
    const offer = this.tariffOffer();
    if (!offer) return 'N/A';

    // Check both old and new API response structures
    return offer.serviceProvider?.name ||
           offer.providerProductInfo?.serviceProvider?.name ||
           'N/A';
  });

  readonly hasCurrentPrice = computed(() => {
    const offer = this.tariffOffer();
    return offer?.price != null && !!offer?.currency;
  });

  // Form value signals
  readonly formPrice = computed(() => this.formData()?.price || 0);
  readonly formCurrency = computed(() => this.formData()?.currency || 'usd');

  // Form validity
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return data?.price > 0 && !!data?.currency;
  });

  // Price info view model
  readonly priceInfo = computed<PriceInfoViewModel>(() => {
    const offer = this.tariffOffer();
    if (!offer || offer.price == null || !offer.currency) {
      return {
        basePrice: null,
        baseCurrency: null,
        currentPrice: null,
        currentCurrency: null,
        formattedBasePrice: 'N/A',
        formattedCurrentPrice: 'N/A',
        priceDifference: 0,
        priceDifferencePercentage: 0,
        hasPriceDifference: false
      };
    }

    return PriceComparisonUtils.createPriceInfoViewModel(
      offer.price,
      offer.currency,
      offer.price,
      offer.currency,
      this.exchangeRates(),
      'USD'
    );
  });

  // Price preview view model (old price → new price)
  readonly pricePreview = computed<PricePreviewViewModel>(() => {
    const offer = this.tariffOffer();
    const newPrice = this.formPrice();
    const newCurrency = this.formCurrency();

    if (!offer || offer.price == null || !offer.currency || !this.isFormValid()) {
      return {
        oldPrice: offer?.price || null,
        oldCurrency: offer?.currency || null,
        newPrice: null,
        newCurrency: null,
        formattedOldPrice: 'N/A',
        formattedNewPrice: 'N/A',
        changePercentage: 0,
        isIncrease: false,
        isDecrease: false,
        isVisible: false
      };
    }

    return PriceComparisonUtils.createPricePreviewViewModel(
      offer.price,
      offer.currency,
      newPrice,
      newCurrency,
      this.exchangeRates(),
      'USD'
    );
  });

  constructor() {
    // Load exchange rates once on initialization
    this.productsDataService.getExchangeRates().subscribe({
      next: (rates) => this.exchangeRates.set(rates),
      error: () => {} // Silently handle error
    });
  }

  ngOnInit(): void {
    this.createFormConfig();
  }

  private createFormConfig(): void {
    const offer = this.dialogData.tariffOffer;
    const { price, currency } = PriceFormConfigUtils.getInitialValuesFromTariffOffer(offer);
    const currencyOptions$ = PriceFormConfigUtils.createCurrencyOptions(this.productsDataService);

    this.formConfig = PriceFormConfigUtils.createModifyTariffOfferFormConfig(
      price,
      currency,
      currencyOptions$
    );
  }

  onFormChanges(form: FormGroup): void {
    const isFirstInit = !this.modifyForm;
    this.modifyForm = form;

    // Update form data signal
    if (this.modifyForm) {
      this.formData.set(this.modifyForm.value);

      // Subscribe to value changes
      if (isFirstInit) {
        this.modifyForm.valueChanges.subscribe(value => {
          this.formData.set(value);
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.isFormValid() || !this.tariffOffer()) {
      return;
    }

    const formValue = this.formData();
    const offer = this.tariffOffer();

    // Return modified price data for retailPrice object
    // The actual API call will be made when creating/updating the company product
    const result: ModifyTariffOfferResult = {
      tariffOfferId: offer.id,
      price: Number(formValue.price),
      currency: formValue.currency as Currency,
      validFrom: new Date().toISOString().split('T')[0] // Format: "2025-11-21"
    };

    this.dialogRef.close(result);
  }
}
