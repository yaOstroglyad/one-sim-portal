/**
 * Executive Tab Types
 * Based on dashboard-hld.md specifications
 */

import { MetricCard, ChartConfig, TabData } from './dashboard.types';

export interface ExecutiveTabData extends TabData {
  revenue: RevenueMetrics;
  subscribersByBundle: BundleMetrics;
  revenueByBundle: BundleMetrics;
  macroKPI: MacroKPIMetrics;
  inventoryStatus: InventoryMetrics;
}

export interface RevenueMetrics {
  total: number;
  currency: string;
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

export interface MacroKPIMetrics {
  cards: MetricCard[];
  summary: {
    totalRevenue: number;
    activeSubscribers: number;
    averageRevenue: number;
    churnRate: number;
  };
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