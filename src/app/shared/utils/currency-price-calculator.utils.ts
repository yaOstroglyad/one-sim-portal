import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductsDataService } from '../services/products-data.service';

/**
 * Interface for price with currency
 */
export interface PriceWithCurrency {
  amount: number;
  currency: string;
}

/**
 * Interface for price difference calculation result with currency conversion
 */
export interface CurrencyAwarePriceDifference {
  absoluteDifference: number;
  percentageDifference: number;
  baseCurrency: string;
  isIncrease: boolean;
  isDecrease: boolean;
  convertedFromPrice: number;
  convertedToPrice: number;
  exchangeRateUsed?: number;
  currencyConverted: boolean;
}

/**
 * Interface for currency conversion result
 */
export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  isConverted: boolean;
}

/**
 * Centralized utility for price calculations with currency conversion support
 */
export class CurrencyPriceCalculatorUtils {

  /**
   * Convert amount from one currency to another
   */
  static convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRates: Record<string, number>
  ): CurrencyConversion {

    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        exchangeRate: 1,
        isConverted: false
      };
    }

    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
      console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}, using original amount`);
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        exchangeRate: 1,
        isConverted: false
      };
    }

    // Convert via USD base
    // fromCurrency -> USD -> toCurrency
    const usdAmount = amount / fromRate;
    const convertedAmount = usdAmount * toRate;
    const exchangeRate = toRate / fromRate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      targetCurrency: toCurrency,
      exchangeRate: parseFloat(exchangeRate.toFixed(4)),
      isConverted: true
    };
  }

  /**
   * Calculate price difference with currency conversion
   */
  static calculateCurrencyAwarePriceDifference(
    fromPrice: PriceWithCurrency,
    toPrice: PriceWithCurrency,
    exchangeRates: Record<string, number>,
    baseCurrency: string = 'USD'
  ): CurrencyAwarePriceDifference {

    // Convert both prices to base currency for comparison
    const fromConversion = this.convertCurrency(
      fromPrice.amount,
      fromPrice.currency,
      baseCurrency,
      exchangeRates
    );

    const toConversion = this.convertCurrency(
      toPrice.amount,
      toPrice.currency,
      baseCurrency,
      exchangeRates
    );

    const convertedFromPrice = fromConversion.convertedAmount;
    const convertedToPrice = toConversion.convertedAmount;

    // Calculate difference in base currency
    const absoluteDifference = convertedToPrice - convertedFromPrice;
    const percentageDifference = convertedFromPrice === 0 ? 0 : (absoluteDifference / convertedFromPrice) * 100;

    return {
      absoluteDifference: parseFloat(absoluteDifference.toFixed(2)),
      percentageDifference: parseFloat(percentageDifference.toFixed(2)),
      baseCurrency,
      isIncrease: absoluteDifference > 0,
      isDecrease: absoluteDifference < 0,
      convertedFromPrice,
      convertedToPrice,
      exchangeRateUsed: fromConversion.isConverted ? fromConversion.exchangeRate : undefined,
      currencyConverted: fromConversion.isConverted || toConversion.isConverted
    };
  }

  /**
   * Create reactive price difference calculation
   */
  static createReactivePriceDifference(
    fromPrice: PriceWithCurrency,
    toPrice: PriceWithCurrency,
    productsDataService: ProductsDataService,
    baseCurrency: string = 'USD'
  ): Observable<CurrencyAwarePriceDifference> {

    return productsDataService.getExchangeRates().pipe(
      map(exchangeRates =>
        this.calculateCurrencyAwarePriceDifference(
          fromPrice,
          toPrice,
          exchangeRates,
          baseCurrency
        )
      )
    );
  }

  /**
   * Format price with currency
   */
  static formatPrice(amount: number | null, currency: string | null): string {
    if (amount == null || currency == null) {
      return 'N/A';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage change
   */
  static formatPercentageChange(percentage: number, showSign: boolean = true): string {
    const sign = showSign && percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  }

  /**
   * Format price difference with context
   */
  static formatPriceDifference(
    difference: CurrencyAwarePriceDifference,
    showCurrency: boolean = true
  ): string {
    const sign = difference.absoluteDifference > 0 ? '+' : '';
    const currencySymbol = showCurrency ? ` ${difference.baseCurrency}` : '';
    const conversionNote = difference.currencyConverted ? ' (converted)' : '';

    return `${sign}${difference.absoluteDifference.toFixed(2)}${currencySymbol} (${this.formatPercentageChange(difference.percentageDifference)})${conversionNote}`;
  }

  /**
   * Create price object from separate amount and currency
   */
  static createPrice(amount: number | null, currency: string | null): PriceWithCurrency | null {
    if (amount == null || currency == null) {
      return null;
    }

    return { amount, currency };
  }
}
