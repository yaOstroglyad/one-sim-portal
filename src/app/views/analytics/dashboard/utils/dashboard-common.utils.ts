/**
 * Common dashboard utilities shared across all tabs
 */

import { transformHttpError } from '@shared';
import { DashboardError, PeriodStatusesResponse } from '../models/dashboard.types';

/**
 * Parse error into DashboardError format.
 * Used by all tab components for consistent error handling.
 *
 * @param error - Error from HTTP or other source
 * @param fallbackMessage - Fallback message if error doesn't have one
 */
export function parseDashboardError(error: any, fallbackMessage?: string): DashboardError {
  // Already formatted as DashboardError
  if (error && typeof error === 'object' && error.code) {
    return error;
  }

  const transformed = transformHttpError(error);
  return {
    code: transformed.code,
    message: transformed.message || fallbackMessage || 'An unexpected error occurred',
    details: transformed.details,
    timestamp: transformed.timestamp
  };
}

/**
 * Calculate status totals from period statuses response.
 * Aggregates counts across all periods for each status.
 *
 * Used by:
 * - Network status chart (subscribers tab)
 * - Bundle status waterfall (subscribers tab)
 * - Any other period-based status aggregation
 */
export function calculateStatusTotals(data: PeriodStatusesResponse): Map<string, number> {
  const totals = new Map<string, number>();

  if (!data.periodStatuses?.length) {
    return totals;
  }

  data.periodStatuses.forEach(period => {
    period.statuses.forEach(s => {
      totals.set(s.status, (totals.get(s.status) || 0) + s.count);
    });
  });

  return totals;
}
