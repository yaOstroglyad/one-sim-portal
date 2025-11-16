import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDateForAPI, TableFooterConfig, CurrencyPriceCalculatorUtils } from '@shared';
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
   * Calculate footer values in original currencies
   * Excludes REFUNDED items from calculations
   * Since each account uses single currency, no conversion needed
   */
  calculateFooterValues(data: BundleLeftover[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
    // Filter out REFUNDED items
    const activeData = data.filter(item => item.bundleStatus !== 'REFUNDED');

    if (activeData.length === 0) {
      return {
        values: {
          bundlePrice: '0.00',
          leftovers: '0.00'
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

    // Sum leftovers in original currency
    let totalLeftovers = 0;

    activeData.forEach(item => {
      const leftovers = parseFloat(item.leftovers) || 0;
      totalLeftovers += leftovers;
    });

    // Format with currency symbol
    const formatWithCurrency = (amount: number, currency: string): string => {
      return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
    };

    return {
      values: {
        bundlePrice: formatWithCurrency(totalPrice, priceCurrency),
        leftovers: formatWithCurrency(totalLeftovers, priceCurrency)
      }
    };
  }

  /**
   * Get list of numeric fields for Excel export
   * Only these fields will be converted from strings to numbers
   * Note: initialVolumeMb, unusedVolumeMb, percentLeftovers are already numbers in the model
   */
  getNumericFields(): (keyof BundleLeftover)[] {
    return ['bundlePrice', 'initialVolumeMb', 'unusedVolumeMb', 'percentLeftovers', 'providerPriceMb', 'leftovers'];
  }
}
