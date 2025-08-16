import { ActiveTariffOffer } from '../../../../models';
import { CurrencyAwarePriceComparison } from '../utils/price-display.utils';

/**
 * Input data for selected tariff offer details component
 */
export interface SelectedTariffOfferDetailsData {
  tariffOffer: ActiveTariffOffer | null;
  showTitle: boolean;
  showEditButton: boolean;
  infoMessage: string;
}

/**
 * State of pending price changes
 */
export interface PendingPriceState {
  pendingPrice: number | null;
  pendingCurrency: string | null;
  previousCompanyPrice: number | null;
  previousCompanyCurrency: string | null;
  hasPendingChanges: boolean;
}

/**
 * Original price state
 */
export interface OriginalPriceState {
  originalPrice: number;
  originalCurrency: string;
  isInitialized: boolean;
}

/**
 * Complete view model for the component
 */
export interface SelectedTariffOfferDetailsViewModel {
  // Display data
  tariffOffer: ActiveTariffOffer | null;
  priceComparison: CurrencyAwarePriceComparison;
  
  // State flags
  showTitle: boolean;
  showEditButton: boolean;
  infoMessage: string;
  
  // Pending changes
  pendingState: PendingPriceState;
  originalState: OriginalPriceState;
  
  // UI helpers
  canEdit: boolean;
  hasValidTariffOffer: boolean;
}

/**
 * Result of price modification action
 */
export interface PriceModificationResult {
  price: number;
  currency: string;
}


/**
 * Configuration for dialog opening
 */
export interface DialogConfiguration {
  tariffOffer: ActiveTariffOffer;
  basePrice: number;
  baseCurrency: string;
}