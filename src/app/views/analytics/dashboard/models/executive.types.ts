/**
 * Executive Tab Types
 * Based on dashboard-hld.md specifications
 */

import { ChartConfig, TabData } from './dashboard.types';

/**
 * API Response Types for Real Backend
 */

// API #1: Bundle Revenue Report
// Updated: 2025-11-26 - API now returns purchaseSummary and refundSummary
export interface BundleRevenueApiResponse {
  dateFrom: string;
  dateTo: string;
  currency: string;

  // Purchase summary (previously root-level fields)
  purchaseSummary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    totalCount: number;
  };

  // Refund summary (new)
  refundSummary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    totalCount: number;
  };

  subscribersByBundle: Array<{
    bundle: string;
    subscribers: number;
    refunds: number;
  }>;
  revenueByBundle: Array<{
    bundle: string;
    revenue: number;
    refund: number;
  }>;
}

// API #2: Inventory Status Report
export interface InventoryStatusApiResponse {
  total: number;
  allocated: number;
  available: number;
}

/**
 * UI Data Types
 */

export interface ExecutiveTabData extends TabData {
  revenue: RevenueMetrics;
  subscribersByBundle: BundleMetrics;
  revenueByBundle: BundleMetrics;
  inventoryStatus: InventoryMetrics;
  // Flags for tracking data availability
  isRealData?: boolean;
  availableSections?: {
    revenueBreakdown: boolean;
    bundleCharts: boolean;
    inventory: boolean;
  };
}

export interface RevenueMetrics {
  total: number;
  currency: string;
  totalCost: number;
  totalMargin: number;

  // Refund metrics (new - from API)
  refunds?: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    totalCount: number;
  };

  breakdown: {
    new: number;
    recurring: number;
    churn: number;
  };
  trend: {
    daily: number[];
    labels: string[];
  };
}

export interface BundleMetrics {
  bundles: Bundle[];
  total: number;
  chartConfig?: ChartConfig;
}

export interface Bundle {
  id: string;
  name: string;
  code: string;
  subscribers: number;
  revenue: number;
  percentage: number;
  color?: string;
}

export interface InventoryMetrics {
  totalESIMs: number;
  available: number;
  allocated: number;
  expired: number;
  breakdown: {
    label: string;
    value: number;
    percentage: number;
    status: 'healthy' | 'warning' | 'critical';
  }[];
}