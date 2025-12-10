/**
 * Dashboard configuration utilities
 */

/**
 * API endpoints configuration
 */
export const DASHBOARD_API_CONFIG = {
  baseUrl: '/api/v1/dashboard',
  endpoints: {
    executive: {
      bundleRevenue: '/api/v1/reports/dashboards/executive/bundle-revenue',
      inventoryStatus: '/api/v1/reports/dashboards/executive/inventory-status'
    },
    subscribers: {
      subscriberSummary: '/api/v1/reports/dashboards/subscribers/subscriber-summary',
      networkStatuses: '/api/v1/reports/dashboards/subscribers/network-statuses',
      bundleSubscribers: '/api/v1/reports/dashboards/subscribers/bundle-subscribers',
      bundleStatuses: '/api/v1/reports/dashboards/subscribers/bundle-statuses'
    },
    traffic: '/api/v1/dashboard/traffic',
    finance: '/api/v1/reports/dashboards/finance/period-revenue-summary'
  }
} as const;

/**
 * Mock data configuration per tab
 */
export interface MockDataConfig {
  executive: boolean;
  subscribers: boolean;
  traffic: boolean;
  finance: boolean;
}

export const DEFAULT_MOCK_CONFIG: MockDataConfig = {
  executive: false,
  subscribers: false,
  traffic: true,
  finance: false
};

/**
 * Mock delay configuration (in milliseconds)
 */
export const MOCK_DELAYS = {
  executive: 1000,
  subscribers: 800,
  traffic: 900,
  finance: 1100,
  subscriberAnalytics: 1000
} as const;
