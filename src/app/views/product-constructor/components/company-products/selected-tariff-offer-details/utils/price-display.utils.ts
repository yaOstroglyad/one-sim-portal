import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActiveTariffOffer } from '../../../../models';
import {
  CurrencyPriceCalculatorUtils,
  CurrencyAwarePriceDifference
} from '@shared';
import { ProductsDataService } from '@shared';
import { createReactivePriceDifference } from '../../utils';

/**
 * Interface for price display data
 */
export interface PriceDisplayData {
  originalPrice: number | null;
  originalCurrency: string | null;
  currentPrice: number | null;
  currentCurrency: string | null;
  pendingPrice?: number | null;
  pendingCurrency?: string | null;
}

/**
 * Interface for price comparison result with currency awareness
 */
export interface CurrencyAwarePriceComparison {
  hasModifiedPrice: boolean;
  difference: CurrencyAwarePriceDifference | null;
  formattedOriginalPrice: string;
  formattedCurrentPrice: string;
  formattedPendingPrice?: string;
  markupDisplay: string | null;
  showPendingChange: boolean;
}

/**
 * Utility class for price display in selected tariff offer details
 */
export class PriceDisplayUtils {

  /**
   * Extract price display data from tariff offer
   */
  static extractPriceDisplayData(
    tariffOffer: ActiveTariffOffer,
    pendingPrice?: number | null,
    pendingCurrency?: string | null
  ): PriceDisplayData {
    const offer = tariffOffer as any;

    return {
      originalPrice: offer?.originalPrice !== undefined ? offer.originalPrice : tariffOffer.price,
      originalCurrency: offer?.originalCurrency || tariffOffer.currency,
      currentPrice: tariffOffer.price,
      currentCurrency: tariffOffer.currency,
      pendingPrice: pendingPrice || null,
      pendingCurrency: pendingCurrency || null
    };
  }

  /**
   * Create reactive price comparison with currency awareness
   */
  static createCurrencyAwarePriceComparison(
    priceData: PriceDisplayData,
    productsDataService: ProductsDataService,
    baseCurrency: string = 'USD'
  ): Observable<CurrencyAwarePriceComparison> {

    const originalPrice = CurrencyPriceCalculatorUtils.createPrice(
      priceData.originalPrice,
      priceData.originalCurrency
    );
    const currentPrice = CurrencyPriceCalculatorUtils.createPrice(
      priceData.currentPrice,
      priceData.currentCurrency
    );

    // Check if price has been modified (simple check first)
    const hasModifiedPrice = originalPrice && currentPrice &&
      (originalPrice.amount !== currentPrice.amount || originalPrice.currency !== currentPrice.currency);

    if (!hasModifiedPrice || !originalPrice || !currentPrice) {
      // No modification, return simple data
      return new Observable(subscriber => {
        subscriber.next({
          hasModifiedPrice: false,
          difference: null,
          formattedOriginalPrice: CurrencyPriceCalculatorUtils.formatPrice(
            priceData.originalPrice,
            priceData.originalCurrency
          ),
          formattedCurrentPrice: CurrencyPriceCalculatorUtils.formatPrice(
            priceData.currentPrice,
            priceData.currentCurrency
          ),
          formattedPendingPrice: priceData.pendingPrice ?
            CurrencyPriceCalculatorUtils.formatPrice(priceData.pendingPrice, priceData.pendingCurrency) :
            undefined,
          markupDisplay: null,
          showPendingChange: Boolean(priceData.pendingPrice)
        });
        subscriber.complete();
      });
    }

    // Calculate currency-aware difference
    return createReactivePriceDifference(
      originalPrice,
      currentPrice,
      productsDataService,
      baseCurrency
    ).pipe(
      map(difference => ({
        hasModifiedPrice: true,
        difference,
        formattedOriginalPrice: CurrencyPriceCalculatorUtils.formatPrice(
          priceData.originalPrice,
          priceData.originalCurrency
        ),
        formattedCurrentPrice: CurrencyPriceCalculatorUtils.formatPrice(
          priceData.currentPrice,
          priceData.currentCurrency
        ),
        formattedPendingPrice: priceData.pendingPrice ?
          CurrencyPriceCalculatorUtils.formatPrice(priceData.pendingPrice, priceData.pendingCurrency) :
          undefined,
        markupDisplay: this.createMarkupDisplay(difference),
        showPendingChange: Boolean(priceData.pendingPrice)
      }))
    );
  }

  /**
   * Create markup display string
   */
  private static createMarkupDisplay(difference: CurrencyAwarePriceDifference): string {
    const sign = difference.percentageDifference > 0 ? '+' : '';
    const conversionNote = difference.currencyConverted ? ' (converted)' : '';

    return `${sign}${difference.percentageDifference.toFixed(1)}%${conversionNote}`;
  }

}
