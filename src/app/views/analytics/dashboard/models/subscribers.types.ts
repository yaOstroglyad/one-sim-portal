/**
 * Subscribers Tab Types
 * Based on dashboard-hld.md specifications
 */

import { ChartConfig, TabData, BaseAnalytics, MetricCard } from './dashboard.types';

export interface SubscribersTabData extends TabData {
  metrics: SubscriberMetrics;
  customerJourney: CustomerJourney;
  bundleStatus: BundleStatus;
  geographic: GeographicDistribution;
}

/**
 * Subscriber Analytics Data Structure (alternative interface)
 */
export interface SubscriberAnalytics extends BaseAnalytics {
  kpis: MetricCard[];
  growth: SubscriberGrowth;
  demographics: SubscriberDemographics;
  lifecycle: SubscriberLifecycle;
  retention: RetentionAnalysis;
  churnAnalysis: ChurnAnalysis;
}

export interface SubscriberMetrics {
  newSubscribers: {
    count: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  downloadedSIMs: {
    count: number;
    change: number;
  };
  activeSubscribers: {
    count: number;
    change: number;
  };
  spentBundles: {
    count: number;
    totalGB: number;
  };
  avgBundleSize: {
    sizeGB: number;
    unit: 'GB' | 'MB';
  };
}

export interface CustomerJourney {
  stages: JourneyStage[];
  conversionRates: {
    overall: number;
    byStage: { [stage: string]: number };
  };
  chartConfig?: ChartConfig;
}

export interface JourneyStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  avgDuration: number;
  icon?: string;
}

export interface BundleStatus {
  statuses: {
    active: number;
    pending: number;
    expired: number;
    suspended: number;
  };
  distribution: {
    label: string;
    value: number;
    color: string;
  }[];
  chartConfig?: ChartConfig;
}

export interface GeographicDistribution {
  countries: CountryMetric[];
  totalCountries: number;
  chartConfig?: ChartConfig;
}

export interface CountryMetric {
  code: string;
  name: string;
  subscribers: number;
  revenue: number;
  percentage: number;
  growth: number;
  flag?: string;
}

/**
 * Additional interfaces for SubscriberAnalytics
 */
export interface SubscriberGrowth {
  summary: {
    totalSubscribers: number;
    newSubscribers: number;
    activeSubscribers: number;
    churnedSubscribers: number;
    growthRate: number;
    churnRate: number;
  };
  chartConfig?: ChartConfig;
  trends: {
    period: string;
    new: number;
    active: number;
    churned: number;
  }[];
}

export interface SubscriberDemographics {
  byCountry: {
    country: string;
    subscribers: number;
    percentage: number;
  }[];
  byAge: {
    ageRange: string;
    subscribers: number;
    percentage: number;
  }[];
  byGender: {
    gender: string;
    subscribers: number;
    percentage: number;
  }[];
  chartConfig?: ChartConfig;
}

export interface SubscriberLifecycle {
  stages: {
    stage: 'prospect' | 'trial' | 'active' | 'at_risk' | 'churned';
    subscribers: number;
    percentage: number;
    averageDuration: number; // in days
  }[];
  chartConfig?: ChartConfig;
}

export interface RetentionAnalysis {
  thirtyDay: number;
  sixtyDay: number;
  ninetyDay: number;
  cohortAnalysis: {
    cohort: string;
    month0: number;
    month1: number;
    month2: number;
    month3: number;
    month6: number;
    month12: number;
  }[];
  chartConfig?: ChartConfig;
}

export interface ChurnAnalysis {
  currentRate: number;
  previousRate: number;
  trend: 'up' | 'down' | 'stable';
  reasons: {
    label: string;
    count: number;
    percentage: number;
  }[];
  predictedChurn: {
    nextMonth: number;
    confidence: number;
    riskFactors: string[];
  };
}