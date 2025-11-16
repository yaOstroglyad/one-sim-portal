import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDateForAPI, TableFooterConfig, CurrencyPriceCalculatorUtils } from '@shared';
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
   * Calculate footer values in original currencies
   * Excludes REFUNDED items from calculations
   * Since each account uses single currency, no conversion needed
   */
  calculateFooterValues(data: BundlePurchase[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
    // Filter out REFUNDED items
    const activeData = data.filter(item => item.bundleStatus !== 'REFUNDED');

    if (activeData.length === 0) {
      return {
        values: {
          bundlePrice: '0.00',
          bundleCost: '0.00'
        }
      };
    }

    // Sum bundle prices in original currency
    let totalPrice = 0;
    let priceCurrency = '';

    activeData.forEach(item => {
      const price = parseFloat(item.bundlePrice) || 0;
      totalPrice += price;

      // Get currency from first item
      if (!priceCurrency && item.priceCurrency) {
        priceCurrency = item.priceCurrency;
      }
    });

    // Sum bundle costs in original currency
    let totalCost = 0;
    let costCurrency = '';

    activeData.forEach(item => {
      const cost = parseFloat(item.bundleCost) || 0;
      totalCost += cost;

      // Get currency from first item
      if (!costCurrency && item.costCurrency) {
        costCurrency = item.costCurrency;
      }
    });

    // Format with currency symbol
    const formatWithCurrency = (amount: number, currency: string): string => {
      return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
    };

    return {
      values: {
        bundlePrice: formatWithCurrency(totalPrice, priceCurrency),
        bundleCost: formatWithCurrency(totalCost, costCurrency)
      }
    };
  }

  /**
   * Get list of numeric fields for Excel export
   * Only these fields will be converted from strings to numbers
   */
  getNumericFields(): (keyof BundlePurchase)[] {
    return ['bundlePrice', 'bundleCost'];
  }
}
