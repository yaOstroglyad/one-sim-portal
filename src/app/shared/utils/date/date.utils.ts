/**
 * Date Utility Functions
 *
 * Reusable date manipulation and formatting utilities
 * Used by datepicker and other date-related components
 */

/**
 * Parse ISO date string to Date object
 * @param isoString - Date string in ISO format (YYYY-MM-DD)
 * @returns Date object or null if invalid
 * @example parseISODate('2025-11-14') // Date object for Nov 14, 2025
 */
export function parseISODate(isoString: string): Date | null {
  const parts = isoString.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month, day);
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date - Date object to format
 * @returns ISO formatted string
 * @example formatDateISO(new Date(2025, 10, 14)) // '2025-11-14'
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (DD/MM/YYYY)
 * @param date - Date object to format
 * @returns Display formatted string
 * @example formatDateDisplay(new Date(2025, 10, 14)) // '14/11/2025'
 */
export function formatDateDisplay(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Check if two dates are the same day
 * Ignores time component
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates represent the same day
 * @example isSameDay(new Date(2025, 10, 14, 10, 30), new Date(2025, 10, 14, 15, 45)) // true
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 * @example isToday(new Date()) // true
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return compareDate.getTime() === today.getTime();
}

/**
 * Check if date is before another date
 * Compares only date part, ignores time
 * @param date - Date to check
 * @param compareWith - Date to compare against
 * @returns True if date is before compareWith
 * @example isDateBefore(new Date(2025, 10, 13), new Date(2025, 10, 14)) // true
 */
export function isDateBefore(date: Date, compareWith: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(compareWith.getFullYear(), compareWith.getMonth(), compareWith.getDate());
  return d1.getTime() < d2.getTime();
}

/**
 * Check if date is after another date
 * Compares only date part, ignores time
 * @param date - Date to check
 * @param compareWith - Date to compare against
 * @returns True if date is after compareWith
 * @example isDateAfter(new Date(2025, 10, 15), new Date(2025, 10, 14)) // true
 */
export function isDateAfter(date: Date, compareWith: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(compareWith.getFullYear(), compareWith.getMonth(), compareWith.getDate());
  return d1.getTime() > d2.getTime();
}

/**
 * Get first day of month
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Date object for first day of month
 * @example getFirstDayOfMonth(2025, 10) // Nov 1, 2025
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get last day of month
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Date object for last day of month
 * @example getLastDayOfMonth(2025, 10) // Nov 30, 2025
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Get number of days in month
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Number of days in the month
 * @example getDaysInMonth(2025, 10) // 30
 */
export function getDaysInMonth(year: number, month: number): number {
  return getLastDayOfMonth(year, month).getDate();
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 * @example addDays(new Date(2025, 10, 14), 7) // Nov 21, 2025
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param date - Starting date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 * @example addMonths(new Date(2025, 10, 14), 2) // Jan 14, 2026
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 * @param date - Starting date
 * @param years - Number of years to add (can be negative)
 * @returns New date with years added
 * @example addYears(new Date(2025, 10, 14), 1) // Nov 14, 2026
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}
