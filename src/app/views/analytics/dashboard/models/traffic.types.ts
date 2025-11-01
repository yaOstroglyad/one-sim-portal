/**
 * Traffic Analytics Types
 * Based on finance_traffic_dashboard-hld.md specifications
 */

import { TabData, ChartConfig, MetricCard } from './dashboard.types';

// Traffic data by country (horizontal bar chart)
export interface TrafficByCountry {
  country: string;
  traffic: number; // GB
  percentage?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// Traffic shares for pie chart
export interface TrafficShare {
  country: string;
  share: number; // percentage
  traffic?: number; // GB
  color?: string;
}

// Active users by country (horizontal bar chart)
export interface ActiveUsersByCountry {
  country: string;
  users: number;
  percentage?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// Average traffic metrics (KPI block)
export interface AverageTrafficMetrics {
  averageTrafficGB: number;
  totalTrafficGB?: number;
  activeCountries?: number;
  topCountry?: string;
}

// Main Traffic Analytics interface
export interface TrafficAnalytics extends TabData {
  // KPI Metrics
  kpiMetrics: MetricCard[];
  
  // Traffic by Country (horizontal bar chart)
  trafficByCountry: {
    data: TrafficByCountry[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Traffic Shares (pie chart)
  trafficShares: {
    data: TrafficShare[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Active Users by Country (horizontal bar chart)
  activeUsersByCountry: {
    data: ActiveUsersByCountry[];
    chartConfig?: ChartConfig;
    loading: boolean;
    error?: string;
  };
  
  // Average Traffic KPI
  averageTraffic: {
    data: AverageTrafficMetrics;
    loading: boolean;
    error?: string;
  };
}

// API Response types
export interface TrafficApiResponse {
  trafficByCountry: TrafficByCountry[];
  trafficShares: TrafficShare[];
  activeUsersByCountry: ActiveUsersByCountry[];
  averageTraffic: AverageTrafficMetrics;
}

// Mock data structure
export interface TrafficMockData {
  trafficByCountry: TrafficByCountry[];
  trafficShares: TrafficShare[];
  activeUsersByCountry: ActiveUsersByCountry[];
  averageTraffic: AverageTrafficMetrics;
}