import { Observable } from 'rxjs';
import { PeriodDateRange, TableFooterConfig } from '@shared';

/**
 * Parameters for loading report data
 */
export interface ReportLoadParams {
  /** Date range for the report */
  period: PeriodDateRange;

  /** Optional account ID (for admin users) */
  accountId?: string;
}

/**
 * Strategy interface for different report types
 * Implements the Strategy pattern for dynamic report behavior
 *
 * Each report tab has its own strategy implementation that defines:
 * - How to load data from API
 * - How to map data for Excel export
 * - Column mappings for the table
 */
export interface ReportStrategy<T = any> {
  /**
   * Load report data from API
   * @param params - Report parameters (period, accountId)
   * @returns Observable of report data array
   */
  loadData(params: ReportLoadParams): Observable<T[]>;

  /**
   * Get column mapping for Excel export
   * Maps data model keys to translation keys
   * @returns Record mapping model keys to translation keys
   */
  getExportMapping(): Record<keyof T, string>;

  /**
   * Get transformers for Excel export
   * Defines how to format specific columns (dates, numbers, etc.)
   * @returns Optional transformers for columns
   */
  getExportTransformers?(): Partial<Record<keyof T, (value: any) => any>>;

  /**
   * Get translation key for description
   * @returns Translation key for the report description
   */
  getDescriptionKey(): string;

  /**
   * Get file name prefix for export
   * @returns Prefix for the exported file name
   */
  getExportFilePrefix(): string;

  /**
   * Get translation key for sheet name
   * @returns Translation key for Excel sheet name
   */
  getSheetNameKey(): string;

  /**
   * Get translation key for empty state title
   * @returns Translation key for the empty state title
   */
  getEmptyStateTitleKey(): string;

  /**
   * Get translation key for empty state description
   * @returns Translation key for the empty state description
   */
  getEmptyStateDescriptionKey(): string;

  /**
   * Get footer configuration for table aggregations
   * @returns Footer configuration or undefined if no footer needed
   */
  getFooterConfig?(): TableFooterConfig | undefined;

  /**
   * Calculate custom footer values from data
   * Use this for complex cases like currency conversion, custom formatting, etc.
   * If this method is implemented, it takes precedence over simple aggregations
   *
   * @param data - Array of data items to calculate footer from
   * @returns Object with values and optional tooltips for detailed breakdown
   *
   * @example
   * // Group by currency and show totals with tooltip breakdown
   * calculateFooterValues(data: BundlePurchase[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
   *   const totals = data.reduce((acc, item) => {
   *     const currency = item.priceCurrency;
   *     acc[currency] = (acc[currency] || 0) + parseFloat(item.bundlePrice);
   *     return acc;
   *   }, {} as Record<string, number>);
   *
   *   const breakdown = Object.entries(totals)
   *     .map(([curr, val]) => `${val.toFixed(2)} ${curr}`)
   *     .join(' + ');
   *
   *   return {
   *     values: {
   *       bundlePrice: '€123.45' // Converted total
   *     },
   *     tooltips: {
   *       bundlePrice: breakdown // Original currencies
   *     }
   *   };
   * }
   */
  calculateFooterValues?(data: T[]): { values: Record<string, string>, tooltips?: Record<string, string> };
}
