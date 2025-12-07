/**
 * Subscribers Tab API Response Types
 * Based on Swagger documentation from SubscriberReports API
 */

/**
 * Response from /api/v1/reports/dashboards/subscribers/subscriber-summary
 */
export interface SubscriberSummaryResponse {
  newSubscribers: number;
  downloadedSims: number;
  activeSubscribers: number;
  spentBundles: number;
  avrBundleSize: number;
}

/**
 * Shared types for period-based status responses
 */
export interface StatusCount {
  status: string;
  count: number;
}

export interface PeriodStatus {
  period: string;
  totalCount: number;
  statuses: StatusCount[];
}

/**
 * Response from /api/v1/reports/dashboards/subscribers/network-statuses
 * and /api/v1/reports/dashboards/subscribers/bundle-statuses
 */
export interface PeriodStatusesResponse {
  periodStatuses: PeriodStatus[];
}

/**
 * Response from /api/v1/reports/dashboards/subscribers/bundle-subscribers
 */
export interface BundleGroup {
  groupName: string;
  subscribers: number;
  statuses: StatusCount[];
}

export interface BundleSubscribersResponse {
  subscribersByBundle: BundleGroup[];
  subscribersByCountry: BundleGroup[];
}