import { Observable } from 'rxjs';
import { PeriodDateRange } from '@shared';

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
}
