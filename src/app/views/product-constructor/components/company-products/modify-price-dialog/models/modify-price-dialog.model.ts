import { ActiveTariffOffer } from '../../../../models';

/**
 * Data interface for modify price dialog
 */
export interface ModifyPriceDialogData {
  tariffOffer: ActiveTariffOffer;
}

/**
 * Result interface for modify price dialog
 */
export interface ModifyPriceResult {
  price: number;
  currency: string; // Using string instead of Currency enum for API compatibility
}

/**
 * View model for price information display
 */
export interface PriceInfoViewModel {
  basePrice: number | null;
  baseCurrency: string | null;
  currentPrice: number | null;
  currentCurrency: string | null;
  formattedBasePrice: string;
  formattedCurrentPrice: string;
  priceDifference: number;
  priceDifferencePercentage: number;
  hasPriceDifference: boolean;
}

/**
 * View model for price preview
 */
export interface PricePreviewViewModel {
  oldPrice: number | null;
  oldCurrency: string | null;
  newPrice: number | null;
  newCurrency: string | null;
  formattedOldPrice: string;
  formattedNewPrice: string;
  changePercentage: number;
  isIncrease: boolean;
  isDecrease: boolean;
  isVisible: boolean;
}

/**
 * Complete view model for the dialog
 */
export interface ModifyPriceDialogViewModel {
  priceInfo: PriceInfoViewModel;
  pricePreview: PricePreviewViewModel;
  isFormValid: boolean;
  showServiceProvider: boolean;
  serviceProviderName: string | null;
}