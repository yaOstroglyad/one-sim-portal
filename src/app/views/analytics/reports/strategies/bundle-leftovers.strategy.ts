import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { formatDateForAPI } from '@shared';
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
}
