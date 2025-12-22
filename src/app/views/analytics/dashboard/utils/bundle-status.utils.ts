import { WaterfallDataPoint } from '@shared/components/waterfall-chart';

/**
 * Bundle status lifecycle utilities
 *
 * Defines the lifecycle order for bundle statuses and provides utilities
 * for sorting data according to this order.
 */

/**
 * T015: Bundle status lifecycle order constant.
 *
 * Represents the natural progression of a bundle through its lifecycle:
 * 1. PAID - Initial state after purchase
 * 2. FAILED_ACTIVATE - Activation failed (terminal state)
 * 3. REFUNDED - Bundle was refunded (terminal state)
 * 4. ACTIVE - Bundle is in use
 * 5. SPENT - Data quota exhausted
 * 6. EXPIRED - Validity period ended
 */
export const BUNDLE_STATUS_LIFECYCLE_ORDER = [
  'PAID',
  'FAILED_ACTIVATE',
  'REFUNDED',
  'ACTIVE',
  'SPENT',
  'EXPIRED'
] as const;

/** Type representing valid bundle status values */
export type BundleStatus = typeof BUNDLE_STATUS_LIFECYCLE_ORDER[number];

/**
 * Waterfall chart order for bundle statuses.
 * Excludes PAID (it's the starting total), lists statuses that subtract from it.
 */
export const BUNDLE_STATUS_WATERFALL_ORDER: BundleStatus[] = [
  'REFUNDED',
  'FAILED_ACTIVATE',
  'ACTIVE',
  'SPENT',
  'EXPIRED'
];

/**
 * Color mapping for bundle statuses.
 * Each status has a unique color for better visualization.
 */
export const BUNDLE_STATUS_COLORS: Record<BundleStatus, string> = {
  PAID: '#3b82f6',           // Blue - initial payment
  FAILED_ACTIVATE: '#f97316', // Orange - warning state
  REFUNDED: '#ef4444',       // Red - refund/loss
  ACTIVE: '#22c55e',         // Green - active/good
  SPENT: '#8b5cf6',          // Purple - data consumed
  EXPIRED: '#6b7280'         // Gray - terminal state
};

/**
 * Get the color for a bundle status.
 *
 * @param status - Bundle status
 * @returns Hex color string
 */
export function getBundleStatusColor(status: string): string {
  return BUNDLE_STATUS_COLORS[status as BundleStatus] || '#6b7280';
}

/**
 * T016: Sort an array of statuses by lifecycle order.
 *
 * @param statuses - Array of status strings to sort
 * @returns Sorted array according to lifecycle order
 */
export function sortByLifecycleOrder(statuses: string[]): string[] {
  return [...statuses].sort((a, b) => {
    const indexA = BUNDLE_STATUS_LIFECYCLE_ORDER.indexOf(a as BundleStatus);
    const indexB = BUNDLE_STATUS_LIFECYCLE_ORDER.indexOf(b as BundleStatus);

    // Unknown statuses go to the end
    const orderA = indexA === -1 ? BUNDLE_STATUS_LIFECYCLE_ORDER.length : indexA;
    const orderB = indexB === -1 ? BUNDLE_STATUS_LIFECYCLE_ORDER.length : indexB;

    return orderA - orderB;
  });
}

/** i18n key prefix for bundle status labels */
export const BUNDLE_STATUS_I18N_PREFIX = 'bundleStatuses';

/**
 * Get i18n key for a bundle status label.
 */
export function getBundleStatusI18nKey(status: string): string {
  return `${BUNDLE_STATUS_I18N_PREFIX}.${status}`;
}

/**
 * Builds waterfall chart data from status totals map.
 *
 * Waterfall logic:
 * 1. PAID = total sold (sum of all statuses) - starting point, type: 'total'
 * 2. All other statuses subtract from total (negative values)
 *
 * @param statusTotals - Map of status -> count
 * @param translateFn - Optional function to translate status labels
 * @returns Array of WaterfallDataPoint for chart visualization
 */
export function buildBundleStatusWaterfallData(
  statusTotals: Map<string, number>,
  translateFn?: (key: string) => string
): WaterfallDataPoint[] {
  // Calculate total sold (sum of all known statuses)
  let totalSold = 0;
  for (const status of BUNDLE_STATUS_LIFECYCLE_ORDER) {
    totalSold += statusTotals.get(status) || 0;
  }

  if (totalSold === 0) {
    return [];
  }

  const getLabel = (status: string): string => {
    if (translateFn) {
      return translateFn(getBundleStatusI18nKey(status));
    }
    return status;
  };

  const points: WaterfallDataPoint[] = [];

  // First point: PAID = total (starting point)
  points.push({
    label: getLabel('PAID'),
    value: totalSold,
    type: 'total',
    color: getBundleStatusColor('PAID')
  });

  // Remaining statuses: subtract from total (in waterfall order)
  for (const status of BUNDLE_STATUS_WATERFALL_ORDER) {
    const count = statusTotals.get(status) || 0;
    if (count > 0) {
      points.push({
        label: getLabel(status),
        value: -count,
        type: 'decrease',
        color: getBundleStatusColor(status)
      });
    }
  }

  return points;
}
