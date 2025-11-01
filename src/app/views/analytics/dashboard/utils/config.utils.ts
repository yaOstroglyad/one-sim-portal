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
    subscribers: '/api/v1/dashboard/subscribers',
    traffic: '/api/v1/dashboard/traffic',
    finance: '/api/v1/dashboard/finance',
    subscriberAnalytics: '/api/v1/dashboard/subscriber-analytics'
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
  subscribers: true,
  traffic: true,
  finance: true
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
