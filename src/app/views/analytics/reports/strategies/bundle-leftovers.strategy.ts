import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDateForAPI, TableFooterConfig, AggregationType, ProductsDataService, CurrencyPriceCalculatorUtils } from '@shared';
import { BundleLeftover } from '../models/bundle-leftover.model';
import { ReportStrategy, ReportLoadParams } from '../models/report-strategy.interface';
import { BundleLeftoversDataService } from '../services/bundle-leftovers-data.service';
import { BUNDLE_LEFTOVERS_EXCEL_MAPPING } from '../utils';
import { formatDateForExcel } from '@shared/utils/data';

/**
 * Strategy for Bundle Leftovers Report
 * Handles data loading, export configuration for bundle leftovers
 */
@Injectable({
  providedIn: 'root'
})
export class BundleLeftoversStrategy implements ReportStrategy<BundleLeftover> {
  private readonly dataService = inject(BundleLeftoversDataService);
  private readonly productsDataService = inject(ProductsDataService);
  private readonly baseCurrency = 'EUR'; // Base currency for reports

  /**
   * Load bundle leftovers data from API
   */
  loadData(params: ReportLoadParams): Observable<BundleLeftover[]> {
    const apiParams = {
      dateFrom: formatDateForAPI(params.period.startDate),
      dateTo: formatDateForAPI(params.period.endDate),
      accountId: params.accountId
    };

    return this.dataService.getBundleLeftovers(apiParams);
  }

  /**
   * Get column mapping for Excel export
   */
  getExportMapping(): Record<keyof BundleLeftover, string> {
    return BUNDLE_LEFTOVERS_EXCEL_MAPPING;
  }

  /**
   * Get transformers for Excel export
   */
  getExportTransformers(): Partial<Record<keyof BundleLeftover, (value: any) => any>> {
    return {
      purchaseDate: formatDateForExcel,
      expirationDate: formatDateForExcel
    };
  }

  /**
   * Get description translation key
   */
  getDescriptionKey(): string {
    return 'analytics.reports.bundleLeftovers.description';
  }

  /**
   * Get export file name prefix
   */
  getExportFilePrefix(): string {
    return 'bundle_leftovers';
  }

  /**
   * Get sheet name translation key
   */
  getSheetNameKey(): string {
    return 'analytics.reports.bundleLeftovers.title';
  }

  /**
   * Get empty state title translation key
   */
  getEmptyStateTitleKey(): string {
    return 'analytics.reports.bundleLeftovers.emptyState.title';
  }

  /**
   * Get empty state description translation key
   */
  getEmptyStateDescriptionKey(): string {
    return 'analytics.reports.bundleLeftovers.emptyState.description';
  }

  /**
   * Get footer configuration for Bundle Leftovers table
   * Shows sum of Bundle Price and Leftovers Value
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
  calculateFooterValues(data: BundleLeftover[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
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

    // Group and sum leftovers by original currency
    const leftoversByCurrency: Record<string, number> = {};
    let totalLeftoversInBaseCurrency = 0;

    activeData.forEach(item => {
      const leftovers = parseFloat(item.leftovers) || 0;
      const currency = item.priceCurrency; // Leftovers use same currency as price

      // Track original currency totals
      leftoversByCurrency[currency] = (leftoversByCurrency[currency] || 0) + leftovers;

      // Convert to base currency
      const conversion = CurrencyPriceCalculatorUtils.convertCurrency(
        leftovers,
        currency,
        this.baseCurrency,
        exchangeRates
      );

      totalLeftoversInBaseCurrency += conversion.convertedAmount;
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
        leftovers: formatTotal(totalLeftoversInBaseCurrency)
      },
      tooltips: {
        bundlePrice: createBreakdown(priceByCurrency),
        leftovers: createBreakdown(leftoversByCurrency)
      }
    };
  }
}
