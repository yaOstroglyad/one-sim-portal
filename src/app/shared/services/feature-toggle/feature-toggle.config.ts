/**
 * Feature Toggle Configuration
 *
 * This file contains the default configuration for feature toggles.
 * These values are used until the real values are loaded from the API.
 *
 * IMPORTANT: When adding a new feature toggle:
 * 1. Add it to DEFAULT_FEATURE_TOGGLES with a safe default (usually false)
 * 2. Document what the toggle controls
 * 3. Ensure backend returns the same toggle key
 */

export interface FeatureToggleConfig {
  key: string;
  defaultValue: boolean;
  description: string;
}

export const FEATURE_TOGGLE_CONFIG: FeatureToggleConfig[] = [
  {
    key: 'new-ui',
    defaultValue: false,
    description: 'Enable new UI design'
  },
  {
    key: 'advanced-search',
    defaultValue: false,
    description: 'Enable advanced search functionality'
  },
  {
    key: 'bulk-operations',
    defaultValue: false,
    description: 'Enable bulk operations support'
  },
  {
    key: 'email-notifications',
    defaultValue: false,
    description: 'Enable email notification system'
  },
  {
    key: 'test',
    defaultValue: false,
    description: 'Test feature toggle'
  },
  {
    key: 'addSubscriberButtonToggle',
    defaultValue: false,
    description: 'Show/hide add subscriber button in customer details'
  },
  {
    key: 'dashboard',
    defaultValue: true,
    description: 'Enable new analytics dashboard feature'
  }
];

/**
 * Convert config to Map for easy access
 */
export function getDefaultTogglesMap(): Map<string, boolean> {
  const map = new Map<string, boolean>();
  FEATURE_TOGGLE_CONFIG.forEach(config => {
    map.set(config.key, config.defaultValue);
  });
  return map;
}

/**
 * API endpoint for feature toggles
 */
export const FEATURE_TOGGLES_API_URL = '/api/v1/feature-toggles';
