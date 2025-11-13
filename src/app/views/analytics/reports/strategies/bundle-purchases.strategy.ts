import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDateForAPI, TableFooterConfig, ProductsDataService, CurrencyPriceCalculatorUtils } from '@shared';
import { BundlePurchase } from '../models/bundle-purchase.model';
import { ReportStrategy, ReportLoadParams } from '../models/report-strategy.interface';
import { BundlePurchasesDataService } from '../services/bundle-purchases-data.service';
import { BUNDLE_PURCHASES_EXCEL_MAPPING } from '../utils';
import { formatDateForExcel } from '@shared/utils/data';

/**
 * Strategy for Bundle Purchases Report
 * Handles data loading, export configuration for bundle purchases
 */
@Injectable({
  providedIn: 'root'
})
export class BundlePurchasesStrategy implements ReportStrategy<BundlePurchase> {
  private readonly dataService = inject(BundlePurchasesDataService);
  private readonly productsDataService = inject(ProductsDataService);
  private readonly baseCurrency = 'EUR'; // Base currency for reports

  /**
   * Load bundle purchases data from API
   */
  loadData(params: ReportLoadParams): Observable<BundlePurchase[]> {
    const apiParams = {
      dateFrom: formatDateForAPI(params.period.startDate),
      dateTo: formatDateForAPI(params.period.endDate),
      accountId: params.accountId
    };

    return this.dataService.getBundlePurchases(apiParams);
  }

  /**
   * Get column mapping for Excel export
   */
  getExportMapping(): Record<keyof BundlePurchase, string> {
    return BUNDLE_PURCHASES_EXCEL_MAPPING;
  }

  /**
   * Get transformers for Excel export
   * Updated: 2025-11-08 - API now uses camelCase
   */
  getExportTransformers(): Partial<Record<keyof BundlePurchase, (value: any) => any>> {
    return {
      purchaseDate: formatDateForExcel
    };
  }

  /**
   * Get description translation key
   */
  getDescriptionKey(): string {
    return 'analytics.reports.bundlePurchases.description';
  }

  /**
   * Get export file name prefix
   */
  getExportFilePrefix(): string {
    return 'bundle_purchases';
  }

  /**
   * Get sheet name translation key
   */
  getSheetNameKey(): string {
    return 'analytics.reports.bundlePurchases.title';
  }

  /**
   * Get empty state title translation key
   */
  getEmptyStateTitleKey(): string {
    return 'analytics.reports.bundlePurchases.emptyState.title';
  }

  /**
   * Get empty state description translation key
   */
  getEmptyStateDescriptionKey(): string {
    return 'analytics.reports.bundlePurchases.emptyState.description';
  }

  /**
   * Get footer configuration for Bundle Purchases table
   * Shows sum of Bundle Price and Bundle Cost
   */
  getFooterConfig(): TableFooterConfig {
    return {
      enabled: true,
      label: 'Total'
    };
  }

  /**
   * Calculate footer values with currency conversion and detailed breakdown
   * Converts all amounts to base currency (EUR) for consistent totals
   * Returns both converted totals and original currency breakdown for tooltips
   * Excludes REFUNDED items from calculations
   */
  calculateFooterValues(data: BundlePurchase[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
    // Filter out REFUNDED items
    const activeData = data.filter(item => item.bundleStatus !== 'REFUNDED');

    // Get exchange rates synchronously from cache (ProductsDataService uses cache)
    let exchangeRates: Record<string, number> = {};

    this.productsDataService.getExchangeRates().subscribe(rates => {
      exchangeRates = rates;
    });

    // Group and sum prices by original currency
    const priceByCurrency: Record<string, number> = {};
    let totalPriceInBaseCurrency = 0;

    activeData.forEach(item => {
      const price = parseFloat(item.bundlePrice) || 0;
      const currency = item.priceCurrency;

      // Track original currency totals
      priceByCurrency[currency] = (priceByCurrency[currency] || 0) + price;

      // Convert to base currency
      const conversion = CurrencyPriceCalculatorUtils.convertCurrency(
        price,
        currency,
        this.baseCurrency,
        exchangeRates
      );

      totalPriceInBaseCurrency += conversion.convertedAmount;
    });

    // Group and sum costs by original currency
    const costByCurrency: Record<string, number> = {};
    let totalCostInBaseCurrency = 0;

    activeData.forEach(item => {
      const cost = parseFloat(item.bundleCost) || 0;
      const currency = item.costCurrency;

      // Track original currency totals
      costByCurrency[currency] = (costByCurrency[currency] || 0) + cost;

      // Convert to base currency
      const conversion = CurrencyPriceCalculatorUtils.convertCurrency(
        cost,
        currency,
        this.baseCurrency,
        exchangeRates
      );

      totalCostInBaseCurrency += conversion.convertedAmount;
    });

    // Format totals in base currency
    const formatTotal = (amount: number): string => {
      return CurrencyPriceCalculatorUtils.formatPrice(amount, this.baseCurrency);
    };

    // Create breakdown tooltips
    const createBreakdown = (totals: Record<string, number>): string => {
      return Object.entries(totals)
        .map(([currency, value]) => `${value.toFixed(2)} ${currency}`)
        .join(' + ');
    };

    return {
      values: {
        bundlePrice: formatTotal(totalPriceInBaseCurrency),
        bundleCost: formatTotal(totalCostInBaseCurrency)
      },
      tooltips: {
        bundlePrice: createBreakdown(priceByCurrency),
        bundleCost: createBreakdown(costByCurrency)
      }
    };
  }
}
