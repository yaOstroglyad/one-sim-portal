/**
 * Finance Analytics Types
 * Based on finance_traffic_dashboard-hld.md specifications
 */

import { TabData, ChartConfig, MetricCard } from './dashboard.types';

// Margin by Month (line chart)
export interface MarginByMonth {
  month: string; // "2025-03"
  margin: number; // percentage
}

// Top 10 Countries (horizontal bar chart)
export interface TopCountryRevenue {
  country: string;
  revenue: number; // USD
  percentage?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// Top 10 Bundles (horizontal bar chart)
export interface TopBundleRevenue {
  bundle: string;
  revenue: number; // USD
  percentage?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// Revenue by Month (line chart)
export interface RevenueByMonth {
  month: string; // "2025-04"
  revenue: number; // USD
}

// Balance for Invoice (table)
export interface BalanceForInvoice {
  company: string;
  amount: number; // USD
  dueDate: string; // "2025-07-10"
  status?: 'pending' | 'overdue' | 'paid';
  daysPending?: number;
}

// Bundle Purchases to be Invoiced (table)
export interface BundlePurchaseInvoice {
  bundle: string;
  quantity: number;
  customer: string;
  total: number; // USD
  date?: string;
  status?: 'pending' | 'invoiced';
}

// Main Finance Analytics interface
export interface FinanceAnalytics extends TabData {
  // KPI Metrics
  kpiMetrics: MetricCard[];
  
  // Margin by Month (line chart)
  marginByMonth: {
    data: MarginByMonth[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Top 10 Countries (horizontal bar chart)
  topCountries: {
    data: TopCountryRevenue[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Top 10 Bundles (horizontal bar chart)
  topBundles: {
    data: TopBundleRevenue[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Revenue (line chart)
  revenue: {
    data: RevenueByMonth[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Balance for Invoice (table)
  balanceForInvoice: {
    data: BalanceForInvoice[];
    loading: boolean;
    error?: string;
  };
  
  // Bundle Purchases to be Invoiced (table)
  bundlePurchases: {
    data: BundlePurchaseInvoice[];
    loading: boolean;
    error?: string;
  };
}

// API Response types
export interface FinanceApiResponse {
  marginByMonth: MarginByMonth[];
  topCountries: TopCountryRevenue[];
  topBundles: TopBundleRevenue[];
  revenue: RevenueByMonth[];
  balanceForInvoice: BalanceForInvoice[];
  bundlePurchases: BundlePurchaseInvoice[];
}

// Mock data structure
export interface FinanceMockData {
  marginByMonth: MarginByMonth[];
  topCountries: TopCountryRevenue[];
  topBundles: TopBundleRevenue[];
  revenue: RevenueByMonth[];
  balanceForInvoice: BalanceForInvoice[];
  bundlePurchases: BundlePurchaseInvoice[];
}