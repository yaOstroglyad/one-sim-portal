import { PeriodPreset, PeriodPresets, PeriodDateRange } from '@models';

/**
 * Create PeriodDateRange from preset string
 *
 * @param preset - Period preset identifier
 * @returns PeriodDateRange object with start/end dates and label
 *
 * @example
 * ```typescript
 * const period = createPeriodFromPreset('last7days');
 * // Returns period for last 7 days
 * ```
 */
export function createPeriodFromPreset(preset: PeriodPreset | string): PeriodDateRange {
  const endDate = new Date();
  const startDate = new Date();
  let label = '';

  switch (preset) {
    case PeriodPresets.TODAY:
      // Today: 00:00:00 to 23:59:59
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      label = 'Today';
      break;

    case PeriodPresets.LAST_7_DAYS:
      // Last 7 days: 7 days ago 00:00:00 to now
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      label = 'Last 7 Days';
      break;

    case PeriodPresets.CURRENT_MONTH:
      // Current Month: from 1st of current month 00:00:00 to now
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      label = 'Current Month';
      break;

    case PeriodPresets.LAST_3_MONTHS:
      // Last 3 months: 3 months ago 00:00:00 to now
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      label = 'Last 3 Months';
      break;

    default:
      // Default to current month if unknown preset
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      label = 'Current Month';
  }

  return {
    startDate,
    endDate,
    label,
    preset: preset as PeriodPreset
  };
}

/**
 * Create custom period from date range
 *
 * @param startDate - Start date (Date object or string)
 * @param endDate - End date (Date object or string)
 * @param label - Optional custom label (defaults to 'Custom Period')
 * @returns PeriodDateRange object
 *
 * @example
 * ```typescript
 * const period = createCustomPeriod('2024-01-01', '2024-01-31', 'January 2024');
 * ```
 */
export function createCustomPeriod(
  startDate: Date | string,
  endDate: Date | string,
  label: string = 'Custom Period'
): PeriodDateRange {
  return {
    startDate: typeof startDate === 'string' ? new Date(startDate) : startDate,
    endDate: typeof endDate === 'string' ? new Date(endDate) : endDate,
    label,
    preset: PeriodPresets.CUSTOM
  };
}

/**
 * Get default period (current month)
 *
 * @returns PeriodDateRange for current month
 */
export function getDefaultPeriod(): PeriodDateRange {
  return createPeriodFromPreset(PeriodPresets.CURRENT_MONTH);
}

/**
 * Format date for API (ISO string)
 *
 * @param date - Date to format
 * @returns ISO string or empty string if invalid
 */
export function formatDateForAPI(date: Date | string | null): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString();
  } catch {
    return '';
  }
}
