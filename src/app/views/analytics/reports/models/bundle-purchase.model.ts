/**
 * Transaction type for bundle purchases
 * Updated: 2025-11-26 - API now includes transaction type
 */
export type TransactionType = 'Purchase' | 'Refund';

/**
 * Bundle Purchase Report Model
 * Represents a single bundle purchase record from the reports API
 * Updated: 2025-11-26 - Added transactionType field
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
  transactionType: TransactionType;  // NEW: Purchase or Refund
  iccid: string;
  bundlePrice: string;  // String format: "10.25"
  priceCurrency: string;
  bundleCost: string;  // String format: "10.25"
  costCurrency: string;
}

/**
 * API Response wrapper for bundle purchases
 * Updated: 2025-11-26 - API now returns wrapped response with totals
 */
export interface BundlePurchasesResponse {
  totalRevenue: {
    amount: number;
    currency: string;
  };
  totalCost: {
    amount: number;
    currency: string;
  };
  records: BundlePurchase[];
}

/**
 * Extended BundlePurchase array with API metadata
 * Used to pass API totals along with records to components
 */
export interface BundlePurchaseWithMetadata extends Array<BundlePurchase> {
  __metadata?: {
    totalRevenue: { amount: number; currency: string };
    totalCost: { amount: number; currency: string };
  };
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
