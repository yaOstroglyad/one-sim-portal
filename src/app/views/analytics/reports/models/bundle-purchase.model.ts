/**
 * Bundle Purchase Report Model
 * Represents a single bundle purchase record from the reports API
 * Updated: 2025-11-08 - API now returns camelCase fields with string prices
 */
export interface BundlePurchase {
  company: string;
  purchaseDate: string;  // ISO date format (YYYY-MM-DD)
  bundle: string;
  subscriber: string;
  purchaseId: string;
  bundleStatus: string;
  transactionId: string;
  transactionStatus: string;
  iccid: string;
  bundlePrice: string;  // String format: "10.25"
  priceCurrency: string;
  bundleCost: string;  // String format: "10.25"
  costCurrency: string;
}

/**
 * Filter parameters for bundle purchases report
 */
export interface BundlePurchaseFilterParams {
  dateFrom: string;
  dateTo: string;
  accountId?: string;
  page?: number;
  size?: number;
}
