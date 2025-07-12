/**
 * Core Dashboard Types and Interfaces
 * Following the project's architecture patterns
 */

// Base types for all dashboard data
export interface DashboardResponse<T> {
  data: T;
  status: 'success' | 'error' | 'loading';
  message?: string;
  timestamp: Date;
}

export interface DashboardError {
  code: string;
  message: string;
  details?: any;
  timestamp?: Date;
}

// Time period selection
export interface DashboardPeriod {
  startDate: Date;
  endDate: Date;
  label: string;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'lastMonth' | 'custom';
}

// Chart configuration interfaces
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartData;
  options?: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderRadius?: number;
  barThickness?: number;
  maxBarThickness?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  indexAxis?: 'x' | 'y'; // For horizontal/vertical bar charts
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: any;
    y?: any;
  };
}

// Metric card interface
export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percentage' | 'bytes';
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    label?: string;
  };
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  loading?: boolean;
  error?: string;
}

// Base analytics interface
export interface BaseAnalytics {
  period: DashboardPeriod;
  lastUpdated: Date;
  loading: LoadingStatus;
  error?: DashboardError;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStatus {
  state: LoadingState;
  message?: string;
  progress?: number;
}

// Tab configuration
export interface DashboardTab {
  id: 'executive' | 'subscribers' | 'traffic' | 'finance';
  label: string;
  icon?: string;
  permissions?: string[];
  active?: boolean;
}

// Base interface for tab data
export interface TabData {
  period: DashboardPeriod;
  lastUpdated: Date;
  loading: LoadingStatus;
  error?: DashboardError;
}

// Export all sub-types
export * from './executive.types';
export * from './subscribers.types';
export * from './traffic.types';
export * from './finance.types';