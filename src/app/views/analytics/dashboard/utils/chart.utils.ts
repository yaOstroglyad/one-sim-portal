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
 * Dashboard chart colors with rgba support
 * Extended palette (20 colors) to support charts with many data series
 * Colors are designed to be visually distinct and work well together
 */
export const DASHBOARD_CHART_COLORS = [
  // Primary colors (high contrast)
  'rgba(54, 162, 235, 0.8)',   // Blue
  'rgba(255, 99, 132, 0.8)',   // Red/Pink
  'rgba(255, 206, 86, 0.8)',   // Yellow
  'rgba(75, 192, 192, 0.8)',   // Teal
  'rgba(153, 102, 255, 0.8)',  // Purple
  'rgba(255, 159, 64, 0.8)',   // Orange
  'rgba(46, 204, 113, 0.8)',   // Green
  'rgba(52, 73, 94, 0.8)',     // Dark gray
  // Secondary colors (variations)
  'rgba(41, 128, 185, 0.8)',   // Dark blue
  'rgba(231, 76, 60, 0.8)',    // Dark red
  'rgba(241, 196, 15, 0.8)',   // Gold
  'rgba(26, 188, 156, 0.8)',   // Turquoise
  'rgba(142, 68, 173, 0.8)',   // Dark purple
  'rgba(230, 126, 34, 0.8)',   // Dark orange
  'rgba(39, 174, 96, 0.8)',    // Dark green
  'rgba(127, 140, 141, 0.8)',  // Gray
  // Tertiary colors (lighter variations)
  'rgba(52, 152, 219, 0.8)',   // Light blue
  'rgba(155, 89, 182, 0.8)',   // Amethyst
  'rgba(22, 160, 133, 0.8)',   // Sea green
  'rgba(211, 84, 0, 0.8)'      // Pumpkin
] as const;

/**
 * Get chart color by index (cycles through colors if index exceeds array length)
 */
export function getChartColor(index: number): string {
  return DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length];
}

/**
 * Get array of chart colors for a given count
 */
export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i));
}

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
 * Currency symbol mapping
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  ILS: '₪',
  GBP: '£'
};

/**
 * Get currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Create stacked bar chart configuration for revenue
 * Shows revenue and refunds as stacked bars
 *
 * @param data - Array of bundle data with revenue and refund
 * @param currency - Currency code (EUR, USD, ILS, etc.)
 * @returns Chart.js configuration object
 */
export function createRevenueChartConfig(
  data: Array<{ bundle: string; revenue: number; refund: number }>,
  currency: string = 'EUR'
): ChartConfig {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  const hasRefunds = sortedData.some(b => b.refund > 0);
  const currencySymbol = getCurrencySymbol(currency);

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
              // Format as currency with dynamic symbol
              return `${label}: ${currencySymbol}${value.toFixed(2)}`;
            },
            footer: (items: any) => {
              if (!hasRefunds) return '';
              const total = items.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
              return `Total: ${currencySymbol}${total.toFixed(2)}`;
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
