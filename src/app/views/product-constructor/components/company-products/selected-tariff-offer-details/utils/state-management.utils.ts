import { ActiveTariffOffer } from '../../../../models';
import {
  OriginalPriceState,
  PendingPriceState,
  PriceModificationResult,
  DialogConfiguration
} from '../models';

/**
 * Utility class for managing component state
 */
export class StateManagementUtils {

  /**
   * Initialize original price state from tariff offer
   */
  static initializeOriginalPriceState(tariffOffer: ActiveTariffOffer | null): OriginalPriceState {
    if (!tariffOffer) {
      return {
        originalPrice: 0,
        originalCurrency: '',
        isInitialized: false
      };
    }

    // Check if tariffOffer has originalPrice embedded (from CompanyProduct)
    const offer = tariffOffer as any;
    if (offer?.originalPrice !== undefined && offer?.originalPrice !== null) {
      return {
        originalPrice: offer.originalPrice,
        originalCurrency: offer.originalCurrency || tariffOffer.currency,
        isInitialized: true
      };
    } else {
      return {
        originalPrice: tariffOffer.price || 0,
        originalCurrency: tariffOffer.currency || '',
        isInitialized: true
      };
    }
  }

  /**
   * Create initial pending state (no pending changes)
   */
  static createInitialPendingState(): PendingPriceState {
    return {
      pendingPrice: null,
      pendingCurrency: null,
      previousCompanyPrice: null,
      previousCompanyCurrency: null,
      hasPendingChanges: false
    };
  }

  /**
   * Update pending state with new price modification
   */
  static updatePendingState(
    currentState: PendingPriceState,
    currentTariffOffer: ActiveTariffOffer,
    modification: PriceModificationResult
  ): PendingPriceState {
    return {
      pendingPrice: modification.price,
      pendingCurrency: modification.currency,
      previousCompanyPrice: currentTariffOffer.price,
      previousCompanyCurrency: currentTariffOffer.currency,
      hasPendingChanges: true
    };
  }

  /**
   * Clear pending changes
   */
  static clearPendingState(): PendingPriceState {
    return {
      pendingPrice: null,
      pendingCurrency: null,
      previousCompanyPrice: null,
      previousCompanyCurrency: null,
      hasPendingChanges: false
    };
  }

  /**
   * Check if tariff offer has changed (different ID)
   */
  static hasTariffOfferChanged(
    previous: ActiveTariffOffer | null,
    current: ActiveTariffOffer | null
  ): boolean {
    if (!previous && !current) return false;
    if (!previous || !current) return true;
    return previous.id !== current.id;
  }

  /**
   * Create updated tariff offer with new price
   */
  static createUpdatedTariffOffer(
    currentOffer: ActiveTariffOffer,
    modification: PriceModificationResult
  ): ActiveTariffOffer {
    return {
      ...currentOffer,
      price: modification.price,
      currency: modification.currency
    };
  }

  /**
   * Create dialog configuration from current state
   */
  static createDialogConfiguration(
    tariffOffer: ActiveTariffOffer,
    originalState: OriginalPriceState
  ): DialogConfiguration {
    const offer = tariffOffer as any;

    return {
      tariffOffer,
      basePrice: offer?.originalPrice !== undefined ? offer.originalPrice : originalState.originalPrice,
      baseCurrency: offer?.originalCurrency || originalState.originalCurrency
    };
  }

  /**
   * Validate if component can be edited
   */
  static canEdit(tariffOffer: ActiveTariffOffer | null, showEditButton: boolean): boolean {
    return showEditButton && tariffOffer !== null;
  }

  /**
   * Check if tariff offer is valid for display
   */
  static hasValidTariffOffer(tariffOffer: ActiveTariffOffer | null): boolean {
    return tariffOffer !== null &&
           tariffOffer.price !== null &&
           tariffOffer.currency !== null &&
           tariffOffer.productName !== null;
  }

  /**
   * Determine if original state should be reset
   */
  static shouldResetOriginalState(
    originalState: OriginalPriceState,
    previousTariffOffer: ActiveTariffOffer | null,
    currentTariffOffer: ActiveTariffOffer | null
  ): boolean {
    // Reset if not initialized or if tariff offer has completely changed
    return !originalState.isInitialized ||
           this.hasTariffOfferChanged(previousTariffOffer, currentTariffOffer);
  }
}
