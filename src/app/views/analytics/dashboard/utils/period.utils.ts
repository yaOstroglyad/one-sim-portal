import { DashboardPeriod } from '../models/dashboard.types';

/**
 * Period preset type
 */
export type PeriodPreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'lastMonth' | 'custom';

/**
 * Period preset configuration
 */
export interface PeriodPresetConfig {
  label: string;
  value: PeriodPreset;
}

/**
 * Default period presets for dashboard
 */
export const DEFAULT_PERIOD_PRESETS: PeriodPresetConfig[] = [
  { label: 'shared.periods.today', value: 'today' },
  { label: 'shared.periods.yesterday', value: 'yesterday' },
  { label: 'shared.periods.last7days', value: 'last7days' },
  { label: 'shared.periods.last30days', value: 'last30days' },
  { label: 'shared.periods.lastMonth', value: 'lastMonth' },
  { label: 'shared.periods.custom', value: 'custom' }
];

/**
 * Create DashboardPeriod from preset string
 *
 * @param preset - Period preset identifier
 * @returns DashboardPeriod object with start/end dates and label
 *
 * @example
 * ```typescript
 * const period = createPeriodFromPreset('last7days');
 * // Returns period for last 7 days
 * ```
 */
export function createPeriodFromPreset(preset: PeriodPreset | string): DashboardPeriod {
  const endDate = new Date();
  const startDate = new Date();
  let label = '';

  switch (preset) {
    case 'today':
      // Today: 00:00:00 to 23:59:59
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      label = 'Today';
      break;

    case 'yesterday':
      // Yesterday: full day (00:00:00 to 23:59:59)
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      label = 'Yesterday';
      break;

    case 'last7days':
      // Last 7 days: 7 days ago 00:00:00 to now
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      // endDate stays as current time
      label = 'Last 7 Days';
      break;

    case 'last30days':
      // Last 30 days: 30 days ago 00:00:00 to now
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      // endDate stays as current time
      label = 'Last 30 Days';
      break;

    case 'lastMonth':
      // Last Month: from 1st of current month 00:00:00 to now
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      // endDate stays as current time (today)
      label = 'Last Month';
      break;

    default:
      // Default to last 30 days if unknown preset
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      label = 'Last 30 Days';
  }

  return {
    startDate,
    endDate,
    label,
    preset: preset as any
  };
}

/**
 * Create custom period from date range
 *
 * @param startDate - Start date (Date object or string)
 * @param endDate - End date (Date object or string)
 * @param label - Optional custom label (defaults to 'Custom Period')
 * @returns DashboardPeriod object
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
): DashboardPeriod {
  return {
    startDate: typeof startDate === 'string' ? new Date(startDate) : startDate,
    endDate: typeof endDate === 'string' ? new Date(endDate) : endDate,
    label,
    preset: 'custom'
  };
}

/**
 * Get default period (last 30 days)
 *
 * @returns DashboardPeriod for last 30 days
 */
export function getDefaultPeriod(): DashboardPeriod {
  return createPeriodFromPreset('last30days');
}
