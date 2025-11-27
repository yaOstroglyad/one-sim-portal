import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDateForAPI, TableFooterConfig, CurrencyPriceCalculatorUtils } from '@shared';
import { BundlePurchase, BundlePurchaseWithMetadata } from '../models/bundle-purchase.model';
import { ReportStrategy, ReportLoadParams } from '../models/report-strategy.interface';
import { BundlePurchasesDataService } from '../services/bundle-purchases-data.service';
import { BUNDLE_PURCHASES_EXCEL_MAPPING } from '../utils';
import { formatDateForExcel } from '@shared/utils/data';

/**
 * Strategy for Bundle Purchases Report
 * Handles data loading, export configuration for bundle purchases
 * Updated: 2025-11-26 - Use API totals attached to data array
 */
@Injectable({
  providedIn: 'root'
})
export class BundlePurchasesStrategy implements ReportStrategy<BundlePurchase> {
  private readonly dataService = inject(BundlePurchasesDataService);

  /**
   * Load bundle purchases data from API
   * Returns records array with metadata attached containing API totals
   * Updated: 2025-11-26 - Attach API totals to array instead of storing in strategy state
   */
  loadData(params: ReportLoadParams): Observable<BundlePurchase[]> {
    const apiParams = {
      dateFrom: formatDateForAPI(params.period.startDate),
      dateTo: formatDateForAPI(params.period.endDate),
      accountId: params.accountId
    };

    // Get full response and attach metadata to records array
    return this.dataService.getBundlePurchases(apiParams).pipe(
      map(response => {
        // Create enhanced array with metadata
        const enhancedData: BundlePurchaseWithMetadata = response.records as BundlePurchaseWithMetadata;
        enhancedData.__metadata = {
          totalRevenue: response.totalRevenue,
          totalCost: response.totalCost
        };
        return enhancedData;
      })
    );
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
   * Calculate footer values using API totals from metadata
   * Updated: 2025-11-26 - Use API totals attached to data array (no mutable state)
   * API already excludes REFUNDED items from totals
   */
  calculateFooterValues(data: BundlePurchase[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
    // Extract metadata from enhanced array
    const metadata = (data as BundlePurchaseWithMetadata).__metadata;

    // Use API totals from metadata if available
    if (metadata) {
      const formatWithCurrency = (amount: number, currency: string): string => {
        return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
      };

      return {
        values: {
          bundlePrice: formatWithCurrency(
            metadata.totalRevenue.amount,
            metadata.totalRevenue.currency
          ),
          bundleCost: formatWithCurrency(
            metadata.totalCost.amount,
            metadata.totalCost.currency
          )
        },
        tooltips: {
          bundlePrice: 'Total from API (excludes refunds)',
          bundleCost: 'Total from API (excludes refunds)'
        }
      };
    }

    // Fallback: if API totals not available (shouldn't happen in normal flow)
    console.warn('API totals metadata not found in data array, using empty values');
    return {
      values: {
        bundlePrice: '0.00',
        bundleCost: '0.00'
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
