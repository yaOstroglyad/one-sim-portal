import { Component, ChangeDetectionStrategy, computed, input, output, inject, signal } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from '@coreui/angular';

import { ActiveTariffOffer } from '../../../models';
import { ModifyTariffOfferResult } from '../modify-tariff-offer-dialog/modify-tariff-offer-dialog.component';
import {
  UserRoleService,
  InfoStripComponent,
  DetailRowComponent,
  ProductsDataService,
  PriceComparisonUtils,
  PricePreviewViewModel,
  PriceInfoViewModel,
  PricePreviewComponent
} from '@shared';
import { UIConfigFactory, TariffOfferDetailsConfig } from '../factories';

/**
 * Component for displaying selected tariff offer details with price comparison
 * Shows original tariff offer price and optionally modified retail price
 * Uses signals for all reactive state
 */
@Component({
  standalone: true,
  selector: 'app-selected-tariff-offer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    ButtonModule,
    InfoStripComponent,
    DetailRowComponent,
    PricePreviewComponent
],
  templateUrl: './selected-tariff-offer-details.component.html',
  styleUrls: ['./selected-tariff-offer-details.component.scss']
})
export class SelectedTariffOfferDetailsComponent {
  // Inputs as signals
  readonly tariffOffer = input<ActiveTariffOffer | null>(null);
  readonly modifiedRetailPrice = input<ModifyTariffOfferResult | null>(null);
  readonly showTitle = input<boolean>(true);
  readonly infoMessage = input<string>('This price will be used as the base price for this company product.');
  readonly editable = input<boolean>(true);

  // Outputs
  readonly modifyPrice = output<ActiveTariffOffer>();

  // Services
  private readonly uiConfigFactory = inject(UIConfigFactory);
  private readonly userRoleService = inject(UserRoleService);
  private readonly productsDataService = inject(ProductsDataService);

  // Exchange rates signal
  readonly exchangeRates = signal<Record<string, number>>({});

  // UI configuration
  readonly uiConfig = computed<TariffOfferDetailsConfig>(() => {
    const userRole = this.userRoleService.getCurrentUserRole();
    return this.uiConfigFactory.createTariffOfferDetailsConfig(userRole);
  });

  // Basic computed signals
  readonly hasValidTariffOffer = computed(() => {
    const offer = this.tariffOffer();
    return offer !== null && offer !== undefined;
  });

  readonly hasModifiedPrice = computed(() => {
    return this.modifiedRetailPrice() !== null;
  });

  readonly formattedCurrentPrice = computed(() => {
    const offer = this.tariffOffer();
    if (!offer || offer.price == null) return 'N/A';
    return `${offer.price} ${(offer.currency || 'USD').toUpperCase()}`;
  });

  readonly productName = computed(() => this.tariffOffer()?.productName || 'N/A');

  readonly serviceProviderName = computed(() => {
    const offer = this.tariffOffer();
    if (!offer) return 'N/A';

    // Check both old and new API response structures
    return offer.serviceProvider?.name ||
           offer.providerProductInfo?.serviceProvider?.name ||
           'N/A';
  });

  readonly validFrom = computed(() => this.tariffOffer()?.validFrom || null);

  // Price info view model (original tariff offer price)
  readonly priceInfo = computed<PriceInfoViewModel | null>(() => {
    const offer = this.tariffOffer();
    if (!offer || offer.price == null || !offer.currency) {
      return null;
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

  // Price preview view model (original → modified)
  readonly pricePreview = computed<PricePreviewViewModel | null>(() => {
    const offer = this.tariffOffer();
    const modified = this.modifiedRetailPrice();

    if (!offer || offer.price == null || !offer.currency || !modified) {
      return null;
    }

    return PriceComparisonUtils.createPricePreviewViewModel(
      offer.price,
      offer.currency,
      modified.price,
      modified.currency,
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

  /**
   * Handle modify price button click
   */
  onModifyPrice(): void {
    const offer = this.tariffOffer();
    if (offer) {
      this.modifyPrice.emit(offer);
    }
  }
}
