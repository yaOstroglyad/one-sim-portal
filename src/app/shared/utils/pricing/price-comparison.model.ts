/**
 * Shared view models for price comparison across the application
 * Used in ModifyTariffOfferDialog, ModifyPriceDialog, and SelectedTariffOfferDetails
 */

/**
 * View model for price information display
 * Shows current pricing information with base price comparison
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
 * Shows visual comparison of old price → new price with percentage change
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
 * Interface for price calculation data
 * Used as input for price calculation utilities
 */
export interface PriceData {
  basePrice: number | null;
  baseCurrency: string | null;
  currentPrice: number | null;
  currentCurrency: string | null;
  newPrice?: number | null;
  newCurrency?: string | null;
}
