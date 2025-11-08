/**
 * Bundle Leftover Report Model
 * Represents a single bundle leftover record from the reports API
 * Created: 2025-11-08 - API returns camelCase fields
 */
export interface BundleLeftover {
  company: string;
  purchaseDate: string;  // ISO date format (YYYY-MM-DD)
  expirationDate: string;  // ISO date format (YYYY-MM-DD)
  bundle: string;
  subscriber: string;
  iccid: string;
  purchaseId: string;
  bundleStatus: string;
  bundlePrice: string;  // String format: "10.25"
  priceCurrency: string;
  initialVolumeMb: number;
  unusedVolumeMb: number;
  percentLeftovers: number;
  providerPriceMb: string;  // String format: "1.2E-4"
  leftovers: string;  // String format: "10.25"
}

/**
 * Filter parameters for bundle leftovers report
 */
export interface BundleLeftoverFilterParams {
  dateFrom: string;
  dateTo: string;
  accountId?: string;
}
