/**
 * Traffic Usage Record Model
 * Represents a single traffic usage record from the reports API
 */
export interface TrafficUsage {
  country: string;
  company: string;
  usageMb: string;     // String format: "123.123"
  totalCost: string;   // String format: "10.25"
  costPerMb: string;   // String format: "1.2E-4"
}

/**
 * API Response wrapper for traffic usage
 * Contains currency, total cost sum, and records array
 */
export interface TrafficUsageResponse {
  currency: string;
  totalCostSum: number;
  records: TrafficUsage[];
}

/**
 * Extended TrafficUsage array with API metadata
 * Used to pass API totals along with records to components
 */
export interface TrafficUsageWithMetadata extends Array<TrafficUsage> {
  __metadata?: {
    currency: string;
    totalCostSum: number;
  };
}

/**
 * Filter parameters for traffic usage report
 */
export interface TrafficUsageFilterParams {
  dateFrom: string;
  dateTo: string;
  accountId?: string;
}
