import { Observable } from 'rxjs';
import { ActiveTariffOffer } from '../../../../models';
import {
  CurrencyPriceCalculatorUtils,
  CurrencyAwarePriceDifference
} from '../../../../../../shared';
import { ProductsDataService } from '../../../../../../shared';
import { createReactivePriceDifference } from '../../utils';

/**
 * Interface for price calculation data
 */
export interface PriceData {
  basePrice: number | null;
  baseCurrency: string | null;
  currentPrice: number | null;
  currentCurrency: string | null;
  newPrice?: number | null;
  newCurrency?: string | null;
}

// PriceDifference interface removed - use CurrencyAwarePriceDifference instead

/**
 * Utility class for currency-aware price calculations in modify price dialog
 */
export class PriceCalculationUtils {

  /**
   * Extract price data from tariff offer
   */
  static extractPriceData(tariffOffer: ActiveTariffOffer): PriceData {
    const offer = tariffOffer as any;

    return {
      basePrice: offer?.basePrice !== undefined ? offer.basePrice : tariffOffer.price,
      baseCurrency: offer?.baseCurrency || tariffOffer.currency,
      currentPrice: tariffOffer.price,
      currentCurrency: tariffOffer.currency
    };
  }

  /**
   * Calculate currency-aware price difference between base and current price
   */
  static calculateCurrencyAwareBasePriceDifference(
    priceData: PriceData,
    productsDataService: ProductsDataService,
    baseCurrency: string = 'USD'
  ): Observable<CurrencyAwarePriceDifference> {

    const basePrice = CurrencyPriceCalculatorUtils.createPrice(priceData.basePrice, priceData.baseCurrency);
    const currentPrice = CurrencyPriceCalculatorUtils.createPrice(priceData.currentPrice, priceData.currentCurrency);

    if (!basePrice || !currentPrice) {
      // Return observable with zero difference if prices are invalid
      return new Observable(subscriber => {
        subscriber.next({
          absoluteDifference: 0,
          percentageDifference: 0,
          baseCurrency,
          isIncrease: false,
          isDecrease: false,
          convertedFromPrice: 0,
          convertedToPrice: 0,
          currencyConverted: false
        });
        subscriber.complete();
      });
    }

    return createReactivePriceDifference(
      basePrice,
      currentPrice,
      productsDataService,
      baseCurrency
    );
  }

  /**
   * Calculate currency-aware price difference between current and new price
   */
  static calculateCurrencyAwareNewPriceDifference(
    priceData: PriceData,
    productsDataService: ProductsDataService,
    baseCurrency: string = 'USD'
  ): Observable<CurrencyAwarePriceDifference> {

    const currentPrice = CurrencyPriceCalculatorUtils.createPrice(priceData.currentPrice, priceData.currentCurrency);
    const newPrice = CurrencyPriceCalculatorUtils.createPrice(priceData.newPrice, priceData.newCurrency);

    if (!currentPrice || !newPrice) {
      // Return observable with zero difference if prices are invalid
      return new Observable(subscriber => {
        subscriber.next({
          absoluteDifference: 0,
          percentageDifference: 0,
          baseCurrency,
          isIncrease: false,
          isDecrease: false,
          convertedFromPrice: 0,
          convertedToPrice: 0,
          currencyConverted: false
        });
        subscriber.complete();
      });
    }

    return createReactivePriceDifference(
      currentPrice,
      newPrice,
      productsDataService,
      baseCurrency
    );
  }

  /**
   * Format price with proper currency formatting
   */
  static formatCurrencyPrice(amount: number | null, currency: string | null): string {
    return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
  }

  /**
   * Format currency-aware price difference
   */
  static formatCurrencyAwareDifference(difference: CurrencyAwarePriceDifference): string {
    return CurrencyPriceCalculatorUtils.formatPriceDifference(difference);
  }
}
