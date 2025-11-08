/**
 * Report tab configuration model
 * Defines the structure and metadata for each report tab
 */
export interface ReportTab {
  /** Unique identifier for the tab */
  id: string;

  /** Translation key for tab label */
  label: string;

  /** Translation key for tab description */
  descriptionKey: string;

  /** Icon name for the tab */
  icon: string;

  /** Whether the tab is disabled */
  disabled?: boolean;
}

/**
 * Available report tab IDs
 */
export enum ReportTabId {
  BUNDLE_PURCHASES = 'bundlePurchases',
  BUNDLE_LEFTOVERS = 'bundleLeftovers'
}

/**
 * Default report tabs configuration
 */
export const DEFAULT_REPORT_TABS: ReportTab[] = [
  {
    id: ReportTabId.BUNDLE_PURCHASES,
    label: 'analytics.reports.tabs.bundlePurchases',
    descriptionKey: 'analytics.reports.bundlePurchases.description',
    icon: 'cart',
    disabled: false
  },
  {
    id: ReportTabId.BUNDLE_LEFTOVERS,
    label: 'analytics.reports.tabs.bundleLeftovers',
    descriptionKey: 'analytics.reports.bundleLeftovers.description',
    icon: 'chart-line',
    disabled: false // Now implemented
  }
];
