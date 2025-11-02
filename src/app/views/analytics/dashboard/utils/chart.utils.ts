/**
 * Chart configuration utilities
 */

import { ChartConfig } from '../models/dashboard.types';
import { CHART_COLORS } from '@shared';

/**
 * Create bar chart configuration for subscribers
 *
 * @param data - Array of bundle data with subscribers
 * @returns Chart.js configuration object
 */
export function createSubscriberChartConfig(
  data: Array<{ bundle: string; subscribers: number }>
): ChartConfig {
  return {
    type: 'bar',
    data: {
      labels: data.map(b => b.bundle),
      datasets: [{
        label: 'Subscribers',
        data: data.map(b => b.subscribers),
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderRadius: 4,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  };
}

/**
 * Create bar chart configuration for revenue
 *
 * @param data - Array of bundle data with revenue
 * @returns Chart.js configuration object
 */
export function createRevenueChartConfig(
  data: Array<{ bundle: string; revenue: number }>
): ChartConfig {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  return {
    type: 'bar',
    data: {
      labels: sortedData.map(b => b.bundle),
      datasets: [{
        label: 'Revenue',
        data: sortedData.map(b => b.revenue),
        backgroundColor: CHART_COLORS[0], // Use primary color
        borderRadius: 4,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  };
}
