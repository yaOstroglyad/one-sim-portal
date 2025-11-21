import { ActiveTariffOffer, CompanyProductPrice } from '../../../../models';

/**
 * Data interface for modify price dialog
 * Supports both create and edit modes for company retail tariffs
 */
export interface ModifyPriceDialogData {
  mode: 'create' | 'edit';
  companyProductId: string;
  tariffOffer: ActiveTariffOffer; // For display context
  existingTariff?: CompanyProductPrice; // For edit mode
  existingTariffs?: CompanyProductPrice[]; // For validFrom validation
  minValidFromDate?: string; // Calculated from tariffOffer.validFrom
}

/**
 * Result interface for modify price dialog
 * Includes validFrom for company retail tariff management
 */
export interface ModifyPriceResult {
  price: number;
  currency: string; // Using string instead of Currency enum for API compatibility
  validFrom: string; // ISO date string "2025-11-20"
  tariffOfferId?: string; // Only for create mode
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