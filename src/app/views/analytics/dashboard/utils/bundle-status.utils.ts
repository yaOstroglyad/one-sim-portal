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
