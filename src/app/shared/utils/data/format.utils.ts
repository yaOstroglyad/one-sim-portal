/**
 * Data formatting utilities
 *
 * Provides functions for formatting data for display:
 * - Byte conversion (bytes → MB/GB)
 * - File size formatting
 * - Number formatting
 */

import { Balance } from '@shared/models';

/**
 * Convert data usage from bytes to MB/GB with proper formatting
 *
 * Automatically selects appropriate unit based on size:
 * - >= 1GB: converts to GB (3 decimal places)
 * - >= 1MB: converts to MB (2 decimal places)
 * - < 1MB: keeps original bytes
 *
 * @param balance - Balance object with total, used, and remaining bytes
 * @returns Balance object with converted values and unitType
 *
 * @example
 * ```typescript
 * const usage = {
 *   total: 5368709120,    // 5GB in bytes
 *   used: 2684354560,     // 2.5GB in bytes
 *   remaining: 2684354560 // 2.5GB in bytes
 * };
 *
 * const converted = convertUsage(usage);
 * // {
 * //   unitType: 'GB',
 * //   total: 5.000,
 * //   used: 2.500,
 * //   remaining: 2.500
 * // }
 * ```
 */
export function convertUsage(balance: Balance): Balance {
  const BYTES_IN_MB = 1024 * 1024;
  const BYTES_IN_GB = 1024 * 1024 * 1024;

  // Use raw bytes from API
  const totalBytes = balance.total;
  const usedBytes = balance.used;
  const remainingBytes = totalBytes - usedBytes;

  const newUsage = { ...balance };

  if (totalBytes >= BYTES_IN_GB) {
    // Convert to GB with 3 decimal places
    newUsage.unitType = 'GB';
    newUsage.total = +((totalBytes / BYTES_IN_GB).toFixed(3));
    newUsage.used = +((usedBytes / BYTES_IN_GB).toFixed(3));
    newUsage.remaining = +((remainingBytes / BYTES_IN_GB).toFixed(3));
  } else if (totalBytes >= BYTES_IN_MB) {
    // Convert to MB with 2 decimal places
    newUsage.unitType = 'MB';
    newUsage.total = +((totalBytes / BYTES_IN_MB).toFixed(2));
    newUsage.used = +((usedBytes / BYTES_IN_MB).toFixed(2));
    newUsage.remaining = +((remainingBytes / BYTES_IN_MB).toFixed(2));
  }

  return newUsage;
}

/**
 * Format file size from bytes to human-readable string
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with appropriate unit
 *
 * @example
 * ```typescript
 * formatFileSize(1024);           // "1.00 KB"
 * formatFileSize(1536);           // "1.50 KB"
 * formatFileSize(1048576);        // "1.00 MB"
 * formatFileSize(5368709120);     // "5.00 GB"
 * formatFileSize(1234567, 1);     // "1.2 MB"
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format number with thousands separator
 *
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1234567);           // "1,234,567"
 * formatNumber(1234567.89);        // "1,234,567.89"
 * formatNumber(1234567, 'de-DE');  // "1.234.567" (German format)
 * ```
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency value
 *
 * @param value - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56);                    // "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE');    // "1.234,56 €"
 * formatCurrency(1234.56, 'GBP', 'en-GB');    // "£1,234.56"
 * ```
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
}

/**
 * Format percentage value
 *
 * @param value - Value to format (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 *
 * @example
 * ```typescript
 * formatPercentage(75);        // "75%"
 * formatPercentage(75.5);      // "76%"
 * formatPercentage(75.5, 1);   // "75.5%"
 * formatPercentage(0.755, 2);  // "0.76%"
 * ```
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return value.toFixed(decimals) + '%';
}

/**
 * Truncate string with ellipsis
 *
 * @param text - String to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated string
 *
 * @example
 * ```typescript
 * truncateString('Hello World', 8);           // "Hello..."
 * truncateString('Hello World', 20);          // "Hello World"
 * truncateString('Hello World', 8, '…');      // "Hello W…"
 * ```
 */
export function truncateString(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

// =============================================================================
// Product/Usage Formatting
// =============================================================================

/**
 * Usage unit interface for formatting
 */
export interface UsageUnitFormatInput {
  value: number;
  unitType?: string;
  type?: string;
}

/**
 * Validity period interface for formatting
 */
export interface ValidityPeriodFormatInput {
  period: number;
  timeUnit: string;
}

/**
 * Format usage unit value with proper handling of unlimited (-1)
 *
 * @param unit - Usage unit object with value, unitType, and type
 * @returns Formatted string
 *
 * @example
 * ```typescript
 * formatUsageUnit({ value: 5, unitType: 'GB', type: 'data' });   // "5 GB"
 * formatUsageUnit({ value: -1, unitType: 'GB', type: 'data' });  // "Unlimited"
 * formatUsageUnit({ value: 100, unitType: 'min', type: 'voice' }); // "100 min"
 * ```
 */
export function formatUsageUnit(unit: UsageUnitFormatInput | null | undefined): string {
  if (!unit) {
    return '';
  }

  if (unit.value === -1) {
    return 'Unlimited';
  }

  const value = unit.value ?? 0;
  const unitType = unit.unitType ?? '';

  return `${value} ${unitType}`.trim();
}

/**
 * Format validity period
 *
 * @param period - Validity period object with period and timeUnit
 * @returns Formatted string
 *
 * @example
 * ```typescript
 * formatValidityPeriod({ period: 30, timeUnit: 'days' });  // "30 days"
 * formatValidityPeriod({ period: 1, timeUnit: 'year' });   // "1 year"
 * ```
 */
export function formatValidityPeriod(period: ValidityPeriodFormatInput | null | undefined): string {
  if (!period) {
    return '';
  }

  return `${period.period} ${period.timeUnit}`;
}
