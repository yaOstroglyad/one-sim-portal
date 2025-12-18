/**
 * Traffic Dashboard Utility Functions
 */

import { DASHBOARD_CHART_COLORS, getChartColor } from './chart.utils';
import {
  TrafficUsagePeriodResponse,
  PeriodTrafficData,
  PeriodSubscriberData,
  AverageTrafficData,
  TrafficKpiValues,
  TrafficChartLegendItem,
  CountryTraffic
} from '../models/traffic.types';

const TRAFFIC_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Determine the best unit for displaying traffic values based on magnitude
 * Returns the unit index (0=B, 1=KB, 2=MB, 3=GB, etc.) and divisor
 */
function getBestTrafficUnit(maxBytes: number): { unitIndex: number; divisor: number; unit: string } {
  if (maxBytes === 0 || !isFinite(maxBytes) || isNaN(maxBytes)) {
    return { unitIndex: 0, divisor: 1, unit: 'B' };
  }

  // Find the appropriate unit so values are between 1 and 1000
  const absBytes = Math.abs(maxBytes);
  let unitIndex = 0;

  if (absBytes >= 1) {
    unitIndex = Math.floor(Math.log(absBytes) / Math.log(1024));
    unitIndex = Math.max(0, Math.min(unitIndex, TRAFFIC_UNITS.length - 1));
  }

  return {
    unitIndex,
    divisor: Math.pow(1024, unitIndex),
    unit: TRAFFIC_UNITS[unitIndex]
  };
}

/**
 * Format traffic value in bytes to human-readable format
 * Auto-selects appropriate unit (B, KB, MB, GB, TB, PB)
 */
export function formatTrafficValue(bytes: number): string {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '0 B';
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '-' + formatTrafficValue(Math.abs(bytes));
  if (bytes < 1) return `${bytes.toFixed(2)} B`;

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const index = Math.max(0, Math.min(i, TRAFFIC_UNITS.length - 1));
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(2)} ${TRAFFIC_UNITS[index]}`;
}

/**
 * Calculate KPI values from traffic API response
 */
export function calculateKpiValues(data: TrafficUsagePeriodResponse): TrafficKpiValues {
  const { currentPeriodTraffic, subscriberAverageTraffic } = data;

  return {
    totalTraffic: formatTrafficValue(currentPeriodTraffic?.totalTraffic || 0),
    totalTrafficRaw: currentPeriodTraffic?.totalTraffic || 0,
    activeCountries: currentPeriodTraffic?.countryTraffics?.length || 0,
    topCountry: getTopCountry(currentPeriodTraffic?.countryTraffics || []),
    avgTrafficPerSubscriber: formatTrafficValue(getLatestAvgTraffic(subscriberAverageTraffic)),
    avgTrafficPerSubscriberRaw: getLatestAvgTraffic(subscriberAverageTraffic)
  };
}

/**
 * Get country with highest traffic
 */
function getTopCountry(countryTraffics: CountryTraffic[]): string {
  if (!countryTraffics?.length) return '-';
  return countryTraffics.reduce((a, b) => a.traffic > b.traffic ? a : b).country;
}

/**
 * Get latest average traffic value
 */
function getLatestAvgTraffic(data: AverageTrafficData[]): number {
  if (!data?.length) return 0;
  return data[data.length - 1].traffic;
}

/**
 * Build stacked bar chart configuration for Traffic by Country
 * X-axis = periods, stacked by top 15 countries
 */
export function buildTrafficByCountryChartConfig(
  data: PeriodTrafficData[],
  maxCountries = 15
) {
  if (!data?.length) {
    return createEmptyChartConfig('Traffic');
  }

  // Get all unique countries and their totals
  const countryTotals = new Map<string, number>();

  data.forEach(period => {
    period.countryTraffics?.forEach(ct => {
      countryTotals.set(ct.country, (countryTotals.get(ct.country) || 0) + ct.traffic);
    });
  });

  // Find max value to determine best unit
  let maxTrafficInPeriod = 0;
  data.forEach(period => {
    const periodTotal = period.countryTraffics?.reduce((sum, ct) => sum + ct.traffic, 0) || 0;
    maxTrafficInPeriod = Math.max(maxTrafficInPeriod, periodTotal);
  });

  const { divisor, unit } = getBestTrafficUnit(maxTrafficInPeriod);

  // Sort and limit to top N
  const topCountries = Array.from(countryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCountries)
    .map(([country]) => country);

  // Build datasets using auto-detected unit
  const periods = data.map(d => formatPeriodLabel(d.period));
  const datasets = topCountries.map((country, index) => ({
    label: country,
    data: data.map(period => {
      const ct = period.countryTraffics?.find(c => c.country === country);
      return ct ? ct.traffic / divisor : 0;
    }),
    backgroundColor: getChartColor(index),
    stack: 'stack0',
    borderWidth: 0,
    borderRadius: 2
  }));

  // Build legend items
  const legendItems: TrafficChartLegendItem[] = topCountries.map((country, index) => ({
    label: country,
    color: getChartColor(index),
    value: countryTotals.get(country) || 0,
    formattedValue: formatTrafficValue(countryTotals.get(country) || 0)
  }));

  return {
    type: 'bar' as const,
    data: { labels: periods, datasets },
    legendItems,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Using custom legend
        },
        tooltip: {
          enabled: true,
          mode: 'index' as const,
          intersect: false,
          itemSort: (a: any, b: any) => (b.parsed.y || 0) - (a.parsed.y || 0),
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y || 0;
              if (value === 0) return null;
              return `${context.dataset.label}: ${value.toFixed(2)} ${unit}`;
            },
            footer: (items: any) => {
              const total = items.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
              return `Total: ${total.toFixed(2)} ${unit}`;
            }
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          title: { display: true, text: `Traffic (${unit})` },
          beginAtZero: true
        }
      }
    }
  };
}

/**
 * Build stacked bar chart configuration for Subscribers by Country
 * X-axis = periods, stacked by top 15 countries
 * Uses same color mapping as traffic chart for consistency
 */
export function buildSubscribersByCountryChartConfig(
  data: PeriodSubscriberData[],
  maxCountries = 15
) {
  if (!data?.length) {
    return createEmptyChartConfig('Subscribers');
  }

  // Get all unique countries and their totals
  const countryTotals = new Map<string, number>();

  data.forEach(period => {
    period.countrySubscribers?.forEach(cs => {
      countryTotals.set(cs.country, (countryTotals.get(cs.country) || 0) + cs.subscribers);
    });
  });

  // Sort and limit to top N
  const topCountries = Array.from(countryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCountries)
    .map(([country]) => country);

  // Build datasets
  const periods = data.map(d => formatPeriodLabel(d.period));
  const datasets = topCountries.map((country, index) => ({
    label: country,
    data: data.map(period => {
      const cs = period.countrySubscribers?.find(c => c.country === country);
      return cs ? cs.subscribers : 0;
    }),
    backgroundColor: getChartColor(index),
    stack: 'stack0',
    borderWidth: 0,
    borderRadius: 2
  }));

  // Build legend items
  const legendItems: TrafficChartLegendItem[] = topCountries.map((country, index) => ({
    label: country,
    color: getChartColor(index),
    value: countryTotals.get(country) || 0,
    formattedValue: (countryTotals.get(country) || 0).toLocaleString()
  }));

  return {
    type: 'bar' as const,
    data: { labels: periods, datasets },
    legendItems,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Using custom legend
        },
        tooltip: {
          enabled: true,
          mode: 'index' as const,
          intersect: false,
          itemSort: (a: any, b: any) => (b.parsed.y || 0) - (a.parsed.y || 0),
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y || 0;
              if (value === 0) return null;
              return `${context.dataset.label}: ${value.toLocaleString()}`;
            },
            footer: (items: any) => {
              const total = items.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
              return `Total: ${total.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          title: { display: true, text: 'Subscribers' },
          beginAtZero: true
        }
      }
    }
  };
}

/**
 * Build line chart configuration for Average Traffic per Subscriber trend
 */
export function buildAverageTrafficChartConfig(data: AverageTrafficData[]) {
  if (!data?.length) {
    return {
      type: 'line' as const,
      data: {
        labels: [],
        datasets: [{
          label: 'Avg Traffic/Subscriber',
          data: [],
          borderColor: DASHBOARD_CHART_COLORS[0],
          backgroundColor: DASHBOARD_CHART_COLORS[0].replace('0.8', '0.2'),
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: 'Traffic' },
            beginAtZero: true
          }
        }
      }
    };
  }

  // Find max value to determine best unit
  const maxTraffic = Math.max(...data.map(d => d.traffic));
  const { divisor, unit } = getBestTrafficUnit(maxTraffic);

  const periods = data.map(d => formatPeriodLabel(d.period));
  const values = data.map(d => d.traffic / divisor);

  return {
    type: 'line' as const,
    data: {
      labels: periods,
      datasets: [{
        label: 'Avg Traffic/Subscriber',
        data: values,
        borderColor: DASHBOARD_CHART_COLORS[0],
        backgroundColor: DASHBOARD_CHART_COLORS[0].replace('0.8', '0.2'),
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y || 0;
              return `Avg Traffic: ${value.toFixed(2)} ${unit}`;
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: `Traffic (${unit})` },
          beginAtZero: true
        }
      }
    }
  };
}

/**
 * Format period label for display (e.g., "2025-01-01" -> "Jan 2025")
 */
function formatPeriodLabel(period: string): string {
  try {
    const date = new Date(period);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return period;
  }
}

/**
 * Create empty chart configuration for when no data is available
 */
function createEmptyChartConfig(yAxisLabel: string) {
  return {
    type: 'bar' as const,
    data: { labels: [], datasets: [] },
    legendItems: [],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          title: { display: true, text: yAxisLabel },
          beginAtZero: true
        }
      }
    }
  };
}
