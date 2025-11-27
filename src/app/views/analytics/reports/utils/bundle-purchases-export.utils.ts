import { BundlePurchase } from '../models/bundle-purchase.model';

/**
 * Column mapping for Bundle Purchases Excel export
 * Maps BundlePurchase model keys to translation keys
 * Updated: 2025-11-26 - Added transactionType field
 */
export const BUNDLE_PURCHASES_EXCEL_MAPPING: Record<keyof BundlePurchase, string> = {
  company: 'analytics.reports.bundlePurchases.company',
  purchaseDate: 'analytics.reports.bundlePurchases.purchaseDate',
  bundle: 'analytics.reports.bundlePurchases.bundle',
  subscriber: 'analytics.reports.bundlePurchases.subscriber',
  purchaseId: 'analytics.reports.bundlePurchases.purchaseId',
  bundleStatus: 'analytics.reports.bundlePurchases.bundleStatus',
  transactionId: 'analytics.reports.bundlePurchases.transactionId',
  transactionStatus: 'analytics.reports.bundlePurchases.transactionStatus',
  transactionType: 'analytics.reports.bundlePurchases.transactionType', // NEW
  iccid: 'analytics.reports.bundlePurchases.iccid',
  bundlePrice: 'analytics.reports.bundlePurchases.bundlePrice',
  priceCurrency: 'analytics.reports.bundlePurchases.priceCurrency',
  bundleCost: 'analytics.reports.bundlePurchases.bundleCost',
  costCurrency: 'analytics.reports.bundlePurchases.costCurrency'
};
