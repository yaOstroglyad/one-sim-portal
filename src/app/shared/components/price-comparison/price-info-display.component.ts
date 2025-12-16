import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { PriceInfoViewModel } from '@shared/utils';

/**
 * Shared component for displaying current tariff pricing information
 * Shows base price, current price, and difference percentage
 * Used in ModifyTariffOfferDialog, ModifyPriceDialog, and SelectedTariffOfferDetails
 */
@Component({
  standalone: true,
  selector: 'app-price-info-display',
  templateUrl: './price-info-display.component.html',
  styleUrls: ['./price-info-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class PriceInfoDisplayComponent {
  /**
   * Price information to display
   */
  readonly priceInfo = input.required<PriceInfoViewModel>();

  /**
   * Label for base price (e.g., "Base Price", "Tariff Offer Price")
   */
  readonly basePriceLabel = input<string>('Base Price');

  /**
   * Label for current price (e.g., "Current Price", "Customer Price")
   */
  readonly currentPriceLabel = input<string>('Current Price');

  /**
   * Service provider name (optional)
   */
  readonly serviceProviderName = input<string | null>(null);

  /**
   * Whether to show service provider information
   */
  readonly showServiceProvider = input<boolean>(false);

  /**
   * Whether to show base price separately (only show if different from current)
   */
  readonly showBasePriceIfDifferent = input<boolean>(true);
}
