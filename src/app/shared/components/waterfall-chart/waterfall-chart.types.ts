import { ChartOptions } from 'chart.js/auto';

/**
 * Represents a single data point in the waterfall chart.
 *
 * T002: WaterfallDataPoint interface
 */
export interface WaterfallDataPoint {
  /** Display label for the bar (X-axis) */
  label: string;
  /** Numeric value (positive or negative) */
  value: number;
  /**
   * Determines bar coloring:
   * - 'increase': green (positive change)
   * - 'decrease': red (negative change)
   * - 'total': blue (cumulative total, starts from zero)
   * Auto-detected from value sign if not specified.
   */
  type?: 'increase' | 'decrease' | 'total';
  /**
   * Custom color for this specific bar.
   * Overrides the type-based color if provided.
   */
  color?: string;
}

/**
 * Color configuration for waterfall chart.
 * Uses CSS variables by default for theme support.
 *
 * T003: WaterfallColors interface
 */
export interface WaterfallColors {
  /** Color for positive values (default: green) */
  increase: string;
  /** Color for negative values (default: red) */
  decrease: string;
  /** Color for total bars (default: blue) */
  total: string;
}

/**
 * Chart options specific to waterfall chart.
 * Extends Chart.js BarChartOptions.
 *
 * T004: WaterfallChartOptions interface
 */
export interface WaterfallChartOptions extends ChartOptions<'bar'> {
  /** Show connecting lines between bars (not implemented in v1) */
  showConnectors?: boolean;
  /** Show value labels on bars (default: true via tooltips) */
  showValues?: boolean;
  /** Value formatting function for labels */
  valueFormat?: (value: number) => string;
}

/**
 * Internal representation after transformation for Chart.js.
 * Used internally by the component.
 */
export interface WaterfallChartData {
  /** X-axis labels */
  labels: string[];
  /** Chart.js compatible datasets with floating bars */
  datasets: WaterfallDataset[];
}

/**
 * Single dataset for Chart.js floating bar chart.
 */
export interface WaterfallDataset {
  /** Dataset label */
  label: string;
  /** Array of [start, end] values for floating bars */
  data: [number, number][];
  /** Colors per bar */
  backgroundColor: string[];
  /** Bar corner radius */
  borderRadius?: number;
}
