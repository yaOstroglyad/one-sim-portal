/**
 * Period preset constants
 * Use these constants instead of string literals
 *
 * @example
 * ```typescript
 * const period = PeriodPresets.TODAY;
 * const isToday = selectedPeriod === PeriodPresets.TODAY;
 * ```
 */
export const PeriodPresets = {
  TODAY: 'today',
  LAST_7_DAYS: 'last7days',
  CURRENT_MONTH: 'currentMonth',
  LAST_3_MONTHS: 'last3months',
  CUSTOM: 'custom'
} as const;

/**
 * Period preset type for period selector
 * Derived from PeriodPresets values
 */
export type PeriodPreset = typeof PeriodPresets[keyof typeof PeriodPresets];

/**
 * Period preset configuration for UI display
 */
export interface PeriodPresetConfig {
  label: string;
  value: PeriodPreset;
}

/**
 * Period date range
 */
export interface PeriodDateRange {
  startDate: Date;
  endDate: Date;
  label?: string;
  preset?: PeriodPreset;
}

/**
 * Default period presets for all components
 */
export const DEFAULT_PERIOD_PRESETS: PeriodPresetConfig[] = [
  { label: 'common.periods.today', value: PeriodPresets.TODAY },
  { label: 'common.periods.last7days', value: PeriodPresets.LAST_7_DAYS },
  { label: 'common.periods.currentMonth', value: PeriodPresets.CURRENT_MONTH },
  { label: 'common.periods.last3months', value: PeriodPresets.LAST_3_MONTHS },
  { label: 'common.periods.custom', value: PeriodPresets.CUSTOM }
];
