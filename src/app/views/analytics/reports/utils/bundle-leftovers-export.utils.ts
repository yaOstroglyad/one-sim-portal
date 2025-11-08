import { BundleLeftover } from '../models/bundle-leftover.model';

/**
 * Column mapping for Bundle Leftovers Excel export
 * Maps BundleLeftover model keys to translation keys
 */
export const BUNDLE_LEFTOVERS_EXCEL_MAPPING: Record<keyof BundleLeftover, string> = {
  company: 'analytics.reports.bundleLeftovers.company',
  purchaseDate: 'analytics.reports.bundleLeftovers.purchaseDate',
  expirationDate: 'analytics.reports.bundleLeftovers.expirationDate',
  bundle: 'analytics.reports.bundleLeftovers.bundle',
  subscriber: 'analytics.reports.bundleLeftovers.subscriber',
  iccid: 'analytics.reports.bundleLeftovers.iccid',
  purchaseId: 'analytics.reports.bundleLeftovers.purchaseId',
  bundleStatus: 'analytics.reports.bundleLeftovers.bundleStatus',
  bundlePrice: 'analytics.reports.bundleLeftovers.bundlePrice',
  priceCurrency: 'analytics.reports.bundleLeftovers.priceCurrency',
  initialVolumeMb: 'analytics.reports.bundleLeftovers.initialVolumeMb',
  unusedVolumeMb: 'analytics.reports.bundleLeftovers.unusedVolumeMb',
  percentLeftovers: 'analytics.reports.bundleLeftovers.percentLeftovers',
  providerPriceMb: 'analytics.reports.bundleLeftovers.providerPriceMb',
  leftovers: 'analytics.reports.bundleLeftovers.leftovers'
};
