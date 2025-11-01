/**
 * Data mapping utilities
 * Transforms API responses to UI-friendly formats
 */

import { CHART_COLORS } from '../../../../shared';

/**
 * Bundle data with UI properties
 */
export interface MappedBundle {
  id: string;
  name: string;
  code: string;
  subscribers: number;
  revenue: number;
  percentage: number;
  color: string;
}

/**
 * Map subscriber bundles from API to UI format
 *
 * @param data - Array of bundle data with subscribers
 * @param total - Total subscribers across all bundles
 * @returns Array of mapped bundles with UI properties
 *
 * @example
 * ```typescript
 * const mapped = mapSubscriberBundles(
 *   [{ bundle: 'Basic', subscribers: 100 }],
 *   500
 * );
 * // Returns: [{ id: 'bundle-0', name: 'Basic', subscribers: 100, percentage: 20, color: '#f9a743', ... }]
 * ```
 */
export function mapSubscriberBundles(
  data: Array<{ bundle: string; subscribers: number }>,
  total: number
): MappedBundle[] {
  return data.map((item, index) => ({
    id: `bundle-${index}`,
    name: item.bundle,
    code: item.bundle,
    subscribers: item.subscribers,
    revenue: 0, // Not provided in subscriber endpoint
    percentage: total > 0 ? (item.subscribers / total) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));
}

/**
 * Map revenue bundles from API to UI format
 *
 * @param data - Array of bundle data with revenue
 * @param total - Total revenue across all bundles
 * @returns Array of mapped bundles sorted by revenue (descending)
 *
 * @example
 * ```typescript
 * const mapped = mapRevenueBundles(
 *   [{ bundle: 'Premium', revenue: 5000 }],
 *   10000
 * );
 * // Returns: [{ id: 'bundle-0', name: 'Premium', revenue: 5000, percentage: 50, color: '#f9a743', ... }]
 * ```
 */
export function mapRevenueBundles(
  data: Array<{ bundle: string; revenue: number }>,
  total: number
): MappedBundle[] {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  return sortedData.map((item, index) => ({
    id: `bundle-${index}`,
    name: item.bundle,
    code: item.bundle,
    subscribers: 0, // Not provided in revenue endpoint
    revenue: item.revenue,
    percentage: total > 0 ? (item.revenue / total) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));
}
