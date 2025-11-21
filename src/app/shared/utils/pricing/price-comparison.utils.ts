import {
  CurrencyPriceCalculatorUtils,
  CurrencyAwarePriceDifference
} from '@shared/utils';
import { PriceData, PricePreviewViewModel, PriceInfoViewModel } from '@shared/utils';

/**
 * Shared utility class for price comparison calculations
 * Used across ModifyTariffOfferDialog, ModifyPriceDialog, and SelectedTariffOfferDetails
 */
export class PriceComparisonUtils {

  /**
   * Calculate currency-aware price difference between current and new price (synchronous)
   * @param priceData Price data containing current and new prices
   * @param exchangeRates Exchange rates map
   * @param baseCurrency Base currency for comparison (default: 'USD')
   * @returns Currency-aware price difference with percentage
   */
  static calculatePriceDifference(
    priceData: PriceData,
    exchangeRates: Record<string, number>,
    baseCurrency: string = 'USD'
  ): CurrencyAwarePriceDifference {

    const currentPrice = CurrencyPriceCalculatorUtils.createPrice(
      priceData.currentPrice,
      priceData.currentCurrency
    );
    const newPrice = CurrencyPriceCalculatorUtils.createPrice(
      priceData.newPrice,
      priceData.newCurrency
    );

    if (!currentPrice || !newPrice) {
      return {
        absoluteDifference: 0,
        percentageDifference: 0,
        baseCurrency,
        isIncrease: false,
        isDecrease: false,
        convertedFromPrice: 0,
        convertedToPrice: 0,
        currencyConverted: false
      };
    }

    return CurrencyPriceCalculatorUtils.calculateCurrencyAwarePriceDifference(
      currentPrice,
      newPrice,
      exchangeRates,
      baseCurrency
    );
  }

  /**
   * Create price preview view model for visual comparison
   * @param oldPrice Old price amount
   * @param oldCurrency Old price currency
   * @param newPrice New price amount
   * @param newCurrency New price currency
   * @param exchangeRates Exchange rates map
   * @param baseCurrency Base currency for comparison (default: 'USD')
   * @returns Price preview view model with formatted values
   */
  static createPricePreviewViewModel(
    oldPrice: number | null,
    oldCurrency: string | null,
    newPrice: number | null,
    newCurrency: string | null,
    exchangeRates: Record<string, number>,
    baseCurrency: string = 'USD'
  ): PricePreviewViewModel {

    const isVisible = oldPrice != null && newPrice != null && oldPrice !== newPrice;

    if (!isVisible) {
      return {
        oldPrice,
        oldCurrency,
        newPrice,
        newCurrency,
        formattedOldPrice: this.formatPrice(oldPrice, oldCurrency),
        formattedNewPrice: this.formatPrice(newPrice, newCurrency),
        changePercentage: 0,
        isIncrease: false,
        isDecrease: false,
        isVisible: false
      };
    }

    const priceData: PriceData = {
      basePrice: oldPrice,
      baseCurrency: oldCurrency,
      currentPrice: oldPrice,
      currentCurrency: oldCurrency,
      newPrice,
      newCurrency
    };

    const difference = this.calculatePriceDifference(priceData, exchangeRates, baseCurrency);

    return {
      oldPrice,
      oldCurrency,
      newPrice,
      newCurrency,
      formattedOldPrice: this.formatPrice(oldPrice, oldCurrency),
      formattedNewPrice: this.formatPrice(newPrice, newCurrency),
      changePercentage: difference.percentageDifference,
      isIncrease: difference.isIncrease,
      isDecrease: difference.isDecrease,
      isVisible: true
    };
  }

  /**
   * Create price info view model for current price display
   * @param basePrice Base price amount
   * @param baseCurrency Base price currency
   * @param currentPrice Current price amount
   * @param currentCurrency Current price currency
   * @param exchangeRates Exchange rates map
   * @param baseCurrencyForComparison Base currency for comparison (default: 'USD')
   * @returns Price info view model with formatted values
   */
  static createPriceInfoViewModel(
    basePrice: number | null,
    baseCurrency: string | null,
    currentPrice: number | null,
    currentCurrency: string | null,
    exchangeRates: Record<string, number>,
    baseCurrencyForComparison: string = 'USD'
  ): PriceInfoViewModel {

    const hasPriceDifference = basePrice != null && currentPrice != null && basePrice !== currentPrice;

    if (!hasPriceDifference) {
      return {
        basePrice,
        baseCurrency,
        currentPrice,
        currentCurrency,
        formattedBasePrice: this.formatPrice(basePrice, baseCurrency),
        formattedCurrentPrice: this.formatPrice(currentPrice, currentCurrency),
        priceDifference: 0,
        priceDifferencePercentage: 0,
        hasPriceDifference: false
      };
    }

    const priceData: PriceData = {
      basePrice,
      baseCurrency,
      currentPrice: basePrice,
      currentCurrency: baseCurrency,
      newPrice: currentPrice,
      newCurrency: currentCurrency
    };

    const difference = this.calculatePriceDifference(priceData, exchangeRates, baseCurrencyForComparison);

    return {
      basePrice,
      baseCurrency,
      currentPrice,
      currentCurrency,
      formattedBasePrice: this.formatPrice(basePrice, baseCurrency),
      formattedCurrentPrice: this.formatPrice(currentPrice, currentCurrency),
      priceDifference: difference.absoluteDifference,
      priceDifferencePercentage: difference.percentageDifference,
      hasPriceDifference: true
    };
  }

  /**
   * Format price with currency
   * @param amount Price amount
   * @param currency Currency code
   * @returns Formatted price string (e.g., "10.50 USD")
   */
  static formatPrice(amount: number | null, currency: string | null): string {
    return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
  }

  /**
   * Format currency-aware price difference
   * @param difference Currency-aware price difference
   * @returns Formatted difference string
   */
  static formatPriceDifference(difference: CurrencyAwarePriceDifference): string {
    return CurrencyPriceCalculatorUtils.formatPriceDifference(difference);
  }
}
