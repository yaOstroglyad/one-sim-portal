import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductsDataService } from '@shared';
import {
  CurrencyPriceCalculatorUtils,
  PriceWithCurrency,
  CurrencyAwarePriceDifference
} from '@shared';

/**
 * Create reactive price difference calculation
 * Domain-specific utility for product-constructor module
 *
 * @param fromPrice - Starting price with currency
 * @param toPrice - Target price with currency
 * @param productsDataService - Service to fetch exchange rates
 * @param baseCurrency - Base currency for comparison (default: 'USD')
 * @returns Observable of currency-aware price difference
 *
 * @example
 * ```typescript
 * createReactivePriceDifference(
 *   { amount: 100, currency: 'EUR' },
 *   { amount: 110, currency: 'USD' },
 *   this.productsDataService
 * ).subscribe(diff => console.log(diff));
 * ```
 */
export function createReactivePriceDifference(
  fromPrice: PriceWithCurrency,
  toPrice: PriceWithCurrency,
  productsDataService: ProductsDataService,
  baseCurrency: string = 'USD'
): Observable<CurrencyAwarePriceDifference> {

  return productsDataService.getExchangeRates().pipe(
    map(exchangeRates =>
      CurrencyPriceCalculatorUtils.calculateCurrencyAwarePriceDifference(
        fromPrice,
        toPrice,
        exchangeRates,
        baseCurrency
      )
    )
  );
}
