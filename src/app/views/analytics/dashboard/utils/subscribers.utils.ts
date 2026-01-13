/**
 * Subscribers tab chart and data utilities
 */

import { MetricCard, BarChartData, ChartLegendItem } from '@shared';
import {
  SubscriberSummaryResponse,
  PeriodStatusesResponse,
  BundleSubscribersResponse
} from '../models/dashboard.types';
import { getChartColor, getChartColors, applyDefaultVisibility } from './chart.utils';
import { calculateStatusTotals } from './dashboard-common.utils';

/**
 * Build KPI cards from subscriber summary response
 */
export function buildSubscriberKpiCards(summary: SubscriberSummaryResponse): MetricCard[] {
  return [
    {
      id: 'new-subscribers',
      title: 'dashboard.subscribers.newSubscribers',
      value: summary.newSubscribers,
      format: 'number',
      icon: 'cilUserFollow'
    },
    {
      id: 'downloaded-sims',
      title: 'dashboard.subscribers.downloadedSims',
      value: summary.downloadedSims,
      format: 'number',
      icon: 'cilCloudDownload'
    },
    {
      id: 'active-subscribers',
      title: 'dashboard.subscribers.activeSubscribers',
      value: summary.activeSubscribers,
      format: 'number',
      icon: 'cilPeople'
    },
    {
      id: 'spent-bundles',
      title: 'dashboard.subscribers.spentBundles',
      value: summary.spentBundles,
      format: 'number',
      icon: 'cilLayers'
    },
    {
      id: 'avg-bundle-size',
      title: 'dashboard.subscribers.avgBundleSize',
      value: summary.avrBundleSize,
      format: 'number',
      unit: 'GB',
      icon: 'cilChart'
    }
  ];
}

/**
 * Result type for chart config builders
 */
export interface ChartConfigResult {
  chartData: BarChartData;
  legendItems: ChartLegendItem[];
}

/**
 * Build stacked bar chart config for period-based status data.
 * Creates one dataset per status, with periods on X-axis.
 */
export function buildPeriodStatusesChartConfig(data: PeriodStatusesResponse): ChartConfigResult {
  const empty: ChartConfigResult = {
    chartData: { labels: [], datasets: [] },
    legendItems: []
  };

  if (!data.periodStatuses?.length) {
    return empty;
  }

  // Collect all unique statuses
  const allStatuses = new Set<string>();
  data.periodStatuses.forEach(period => {
    period.statuses.forEach(s => allStatuses.add(s.status));
  });

  const statusList = Array.from(allStatuses);
  const labels = data.periodStatuses.map(p => p.period);
  const statusTotals = calculateStatusTotals(data);

  // Create dataset for each status
  const datasets = statusList.map((status, index) => ({
    label: status,
    data: data.periodStatuses.map(period => {
      const found = period.statuses.find(s => s.status === status);
      return found ? found.count : 0;
    }),
    backgroundColor: getChartColor(index),
    borderWidth: 0
  }));

  // Build legend items
  const legendItems: ChartLegendItem[] = statusList.map((status, index) => ({
    label: status,
    color: getChartColor(index),
    value: statusTotals.get(status) || 0,
    hidden: false
  }));

  return {
    chartData: { labels, datasets },
    legendItems
  };
}

/**
 * Generic grouped item for chart building
 */
interface GroupedItem {
  groupName: string;
  subscribers: number;
}

/**
 * Build bar chart config from grouped data (bundles or countries).
 * Applies default visibility (top 3 visible).
 *
 * @param items - Array of grouped items with groupName and subscribers
 * @param datasetLabel - Label for the dataset (translated)
 */
export function buildGroupedChartConfig(
  items: GroupedItem[] | undefined,
  datasetLabel: string
): ChartConfigResult {
  const empty: ChartConfigResult = {
    chartData: { labels: [], datasets: [] },
    legendItems: []
  };

  if (!items?.length) {
    return empty;
  }

  const labels = items.map(item => item.groupName);
  const values = items.map(item => item.subscribers);
  const colors = getChartColors(labels.length);

  const chartData: BarChartData = {
    labels,
    datasets: [{
      label: datasetLabel,
      data: values,
      backgroundColor: colors,
      borderWidth: 0
    }]
  };

  const legendItems = applyDefaultVisibility(
    labels.map((label, index) => ({
      label,
      color: colors[index],
      value: values[index]
    }))
  );

  return { chartData, legendItems };
}

/**
 * Build bundle subscribers chart config
 */
export function buildBundleSubscribersChartConfig(
  data: BundleSubscribersResponse,
  subscribersLabel: string
): ChartConfigResult {
  return buildGroupedChartConfig(data.subscribersByBundle, subscribersLabel);
}

/**
 * Build country subscribers chart config
 */
export function buildCountrySubscribersChartConfig(
  data: BundleSubscribersResponse,
  subscribersLabel: string
): ChartConfigResult {
  return buildGroupedChartConfig(data.subscribersByCountry, subscribersLabel);
}
