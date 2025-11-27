/**
 * Chart configuration utilities
 */

import { ChartConfig } from '../models/dashboard.types';
import { CHART_COLORS } from '@shared';

// Colors for charts
const COLORS = {
  primary: '#f9a825',    // Orange - main data
  refund: '#ef4444',     // Red - refunds
  subscribers: CHART_COLORS // Multi-color for subscribers
};

/**
 * Create stacked bar chart configuration for subscribers
 * Shows subscribers and refunds as stacked bars
 *
 * @param data - Array of bundle data with subscribers and refunds
 * @returns Chart.js configuration object
 */
export function createSubscriberChartConfig(
  data: Array<{ bundle: string; subscribers: number; refunds: number }>
): ChartConfig {
  const hasRefunds = data.some(b => b.refunds > 0);

  return {
    type: 'bar',
    data: {
      labels: data.map(b => b.bundle),
      datasets: [
        // Refunds dataset (bottom of stack)
        ...(hasRefunds ? [{
          label: 'Refunds',
          data: data.map(b => b.refunds),
          backgroundColor: COLORS.refund,
          borderRadius: 0,
          borderWidth: 1,
          borderColor: '#dc2626',
          stack: 'stack0'
        }] : []),
        // Subscribers dataset (top of stack)
        {
          label: 'Subscribers',
          data: data.map(b => b.subscribers),
          backgroundColor: COLORS.subscribers.slice(0, data.length),
          borderRadius: hasRefunds ? { topLeft: 4, topRight: 4 } : 4,
          borderWidth: 1,
          stack: 'stack0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: hasRefunds,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (items: any) => items[0]?.label || '',
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${value}`;
            },
            footer: (items: any) => {
              if (!hasRefunds) return '';
              const total = items.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
              return `Total: ${total}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          }
        }
      }
    }
  };
}

/**
 * Create stacked bar chart configuration for revenue
 * Shows revenue and refunds as stacked bars
 *
 * @param data - Array of bundle data with revenue and refund
 * @returns Chart.js configuration object
 */
export function createRevenueChartConfig(
  data: Array<{ bundle: string; revenue: number; refund: number }>
): ChartConfig {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  const hasRefunds = sortedData.some(b => b.refund > 0);

  return {
    type: 'bar',
    data: {
      labels: sortedData.map(b => b.bundle),
      datasets: [
        // Refunds dataset (bottom of stack)
        ...(hasRefunds ? [{
          label: 'Refunds',
          data: sortedData.map(b => b.refund),
          backgroundColor: COLORS.refund,
          borderRadius: 0,
          borderWidth: 1,
          borderColor: '#dc2626',
          stack: 'stack0'
        }] : []),
        // Revenue dataset (top of stack)
        {
          label: 'Revenue',
          data: sortedData.map(b => b.revenue),
          backgroundColor: COLORS.primary,
          borderRadius: hasRefunds ? { topLeft: 4, topRight: 4 } : 4,
          borderWidth: 1,
          stack: 'stack0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: hasRefunds,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (items: any) => items[0]?.label || '',
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              // Format as currency
              return `${label}: €${value.toFixed(2)}`;
            },
            footer: (items: any) => {
              if (!hasRefunds) return '';
              const total = items.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
              return `Total: €${total.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    }
  };
}
