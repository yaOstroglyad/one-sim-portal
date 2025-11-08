import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDateForAPI } from '@shared';
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
}
