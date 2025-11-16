import { TranslateService } from '@ngx-translate/core';

/**
 * Maps raw data to Excel-friendly format with translated headers
 *
 * @param data - Array of objects to map
 * @param columnMapping - Mapping of data keys to translation keys
 * @param translateService - Translation service instance
 * @param transformers - Optional transformers for specific columns
 * @param numericFields - Optional list of fields that should be converted to numbers
 * @returns Array of objects with translated keys and transformed values
 *
 * @example
 * ```typescript
 * const columnMapping = {
 *   name: 'customers.name',
 *   email: 'customers.email',
 *   createdAt: 'customers.createdDate',
 *   price: 'customers.price'
 * };
 *
 * const transformers = {
 *   createdAt: (value: string) => new Date(value).toLocaleDateString()
 * };
 *
 * const numericFields = ['price'];
 *
 * const exportData = mapDataForExcel(
 *   customers,
 *   columnMapping,
 *   translateService,
 *   transformers,
 *   numericFields
 * );
 * ```
 */
export function mapDataForExcel<T extends Record<string, any>>(
  data: T[],
  columnMapping: Record<keyof T, string>,
  translateService: TranslateService,
  transformers?: Partial<Record<keyof T, (value: any) => any>>,
  numericFields?: (keyof T)[]
): Record<string, any>[] {
  const numericFieldsSet = new Set(numericFields || []);

  return data.map(item => {
    const mappedItem: Record<string, any> = {};

    for (const [dataKey, translationKey] of Object.entries(columnMapping)) {
      const translatedHeader = translateService.instant(translationKey as string);
      let value = item[dataKey];

      // Apply transformer if exists
      const transformer = transformers?.[dataKey as keyof T];
      if (transformer) {
        value = transformer(value);
      }

      // Convert to number if field is in numericFields list
      if (numericFieldsSet.has(dataKey as keyof T) && !transformer) {
        if (typeof value === 'string' && value.trim() !== '') {
          const numValue = Number(value);
          if (!isNaN(numValue) && isFinite(numValue)) {
            value = numValue;
          }
        }
      }

      mappedItem[translatedHeader] = value ?? '';
    }

    return mappedItem;
  });
}

/**
 * Common date formatter for Excel export
 * Converts date string/Date object to localized date string
 *
 * @param value - Date value (string, Date, or null/undefined)
 * @returns Formatted date string or empty string
 *
 * @example
 * ```typescript
 * formatDateForExcel('2025-01-15T10:30:00Z'); // "15/01/2025"
 * formatDateForExcel(new Date());             // "15/01/2025"
 * formatDateForExcel(null);                   // ""
 * ```
 */
export function formatDateForExcel(value: string | Date | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

/**
 * Common number formatter for Excel export
 * Formats number with specified decimal places
 *
 * @param value - Number value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string or empty string
 *
 * @example
 * ```typescript
 * formatNumberForExcel(1234.567);      // "1234.57"
 * formatNumberForExcel(1234.567, 0);   // "1235"
 * formatNumberForExcel(null);          // ""
 * ```
 */
export function formatNumberForExcel(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '';
  return value.toFixed(decimals);
}

/**
 * Common currency formatter for Excel export
 * Formats number as currency with symbol
 *
 * @param value - Number value
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string or empty string
 *
 * @example
 * ```typescript
 * formatCurrencyForExcel(1234.56);           // "$1,234.56"
 * formatCurrencyForExcel(1234.56, 'EUR');    // "€1,234.56"
 * formatCurrencyForExcel(null);              // ""
 * ```
 */
export function formatCurrencyForExcel(
  value: number | null | undefined,
  currency: string = 'USD'
): string {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}
