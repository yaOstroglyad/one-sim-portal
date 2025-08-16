# 💰 Currency-Aware Price Calculator System

## 🎯 Overview

Centralized system for price calculations with currency conversion support using real exchange rates.

## 📁 Files Created

### 1. **Currency Price Calculator Utils** 
`src/app/shared/utils/currency-price-calculator.utils.ts`

Centralized utility for all price calculations with currency awareness:

```typescript
// Convert between currencies
const conversion = CurrencyPriceCalculatorUtils.convertCurrency(
  100, 'EUR', 'USD', exchangeRates
);

// Calculate price differences with currency conversion
const difference = CurrencyPriceCalculatorUtils.calculateCurrencyAwarePriceDifference(
  { amount: 100, currency: 'EUR' },
  { amount: 120, currency: 'USD' },
  exchangeRates
);

// Reactive calculations
const difference$ = CurrencyPriceCalculatorUtils.createReactivePriceDifference(
  fromPrice, toPrice, productsDataService
);
```

### 2. **Exchange Rates Service**
Added to `src/app/shared/services/products-data.service.ts`:

```typescript
// Get current exchange rates (cached for 1 hour)
productsDataService.getExchangeRates().subscribe(rates => {
  console.log('USD to EUR:', rates['EUR']); // 0.93
});
```

### 3. **Enhanced Price Utils**
Updated `modify-price-dialog/utils/price-calculation.utils.ts`:

```typescript
// Currency-aware price difference
PriceCalculationUtils.calculateCurrencyAwareBasePriceDifference(
  priceData, productsDataService, 'USD'
);

// Format with proper currency symbols
PriceCalculationUtils.formatCurrencyPrice(100, 'EUR'); // "€100.00"
```

### 4. **Price Display Utils**
New `selected-tariff-offer-details/utils/price-display.utils.ts`:

```typescript
// Create reactive price comparison
PriceDisplayUtils.createCurrencyAwarePriceComparison(
  priceData, productsDataService
);

// Handle pending price changes
PriceDisplayUtils.createPendingPriceDifference(
  currentPrice, currentCurrency, pendingPrice, pendingCurrency, service
);
```

## 🌍 Exchange Rates

### Current Rates (Mock Data - December 2024)
Base currency: **USD**

| Currency | Rate | Currency | Rate |
|----------|------|----------|------|
| EUR | 0.93 | CAD | 1.39 |
| GBP | 0.79 | AUD | 1.52 |
| JPY | 149.50 | CHF | 0.88 |
| RUB | 95.0 | UAH | 41.0 |
| ILS | 3.65 | SEK | 10.85 |

**Note**: In production, replace with real exchange rate API.

## 🔧 API Changes

### Before (Hardcoded Currencies)
```typescript
type Currency = 'usd' | 'eur' | 'gbp' | 'ils' | 'rub' | 'uah';
```

### After (API-Driven)
```typescript
type Currency = string; // Any currency from API

// Use real API
productsDataService.getCurrencies().subscribe(currencies => {
  // ['USD', 'EUR', 'GBP', 'JPY', 'CAD', ...]
});
```

## 📊 Features

### ✅ **Currency Conversion**
- Real-time exchange rates (cached 1 hour)
- USD base currency conversion
- Automatic fallback handling

### ✅ **Price Calculations**
- Currency-aware percentage differences
- Absolute differences in base currency
- Smart price comparison across currencies

### ✅ **Reactive Streams**
- Observable-based calculations
- Real-time updates when rates change
- Memory-efficient caching

### ✅ **Formatting**
- Proper currency symbols (€, $, £, ¥)
- Localized number formatting
- Conversion indicators

## 🎨 Usage Examples

### Basic Currency Conversion
```typescript
const rates = await productsDataService.getExchangeRates().toPromise();
const conversion = CurrencyPriceCalculatorUtils.convertCurrency(
  100, 'EUR', 'USD', rates
);

console.log(`€100 = $${conversion.convertedAmount}`); // €100 = $107.53
```

### Price Difference with Currency Awareness
```typescript
const fromPrice = { amount: 100, currency: 'EUR' };
const toPrice = { amount: 120, currency: 'USD' };

const difference$ = CurrencyPriceCalculatorUtils.createReactivePriceDifference(
  fromPrice, toPrice, productsDataService, 'USD'
);

difference$.subscribe(diff => {
  console.log(`Difference: $${diff.absoluteDifference} (${diff.percentageDifference}%)`);
  // Difference: $12.47 (11.6%)
});
```

### Reactive Price Display
```typescript
// In component
const priceData = PriceDisplayUtils.extractPriceDisplayData(tariffOffer);
const comparison$ = PriceDisplayUtils.createCurrencyAwarePriceComparison(
  priceData, productsDataService
);

// In template
<ng-container *ngIf="comparison$ | async as comp">
  <div *ngIf="comp.hasModifiedPrice">
    Original: {{ comp.formattedOriginalPrice }}
    Current: {{ comp.formattedCurrentPrice }}
    Markup: {{ comp.markupDisplay }}
  </div>
</ng-container>
```

## 🔄 Migration Guide

### Step 1: Replace Manual Calculations
```typescript
// Before
getPriceDifference(): number {
  return this.currentPrice - this.basePrice;
}

// After
getPriceDifference(): Observable<CurrencyAwarePriceDifference> {
  return PriceCalculationUtils.calculateCurrencyAwareBasePriceDifference(
    this.priceData, this.productsDataService
  );
}
```

### Step 2: Use Reactive Streams
```typescript
// Before
get markupPercentage(): number {
  return ((this.currentPrice - this.basePrice) / this.basePrice) * 100;
}

// After
markupPercentage$ = this.getPriceDifference().pipe(
  map(diff => diff.percentageDifference)
);
```

### Step 3: Currency-Aware Formatting
```typescript
// Before
formatPrice(amount: number, currency: string): string {
  return `${amount} ${currency}`;
}

// After
formatPrice(amount: number, currency: string): string {
  return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
  // Result: "€100.00" instead of "100 EUR"
}
```

## 🚀 Benefits

1. **🌍 Multi-Currency Support** - Accurate calculations across all currencies
2. **📈 Real Exchange Rates** - Current market rates (mock data for now)
3. **⚡ Performance** - Cached rates, reactive calculations
4. **🔧 Centralized** - Single source of truth for all price logic
5. **🧪 Testable** - Pure functions, easy to unit test
6. **📱 Reactive** - Observable-based, works with OnPush
7. **🎨 Professional** - Proper currency formatting

## 📋 Next Steps

1. **🔗 Real API Integration** - Replace mock exchange rates with real service
2. **🧪 Unit Tests** - Add comprehensive test coverage
3. **📊 Analytics** - Track currency conversion usage
4. **🔄 Migration** - Update all components to use new system
5. **📚 Documentation** - Add JSDoc comments
6. **⚡ Optimizations** - Add more caching strategies

---

**💡 This system provides a solid foundation for accurate, currency-aware price calculations across the entire application!**