/**
 * Color constants and palettes
 * All colors match global SCSS variables defined in src/scss/_variables.scss
 *
 * @see /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/scss/_variables.scss
 */

/**
 * Chart color palette for data visualizations
 *
 * These colors are optimized for Chart.js and canvas rendering.
 * Colors are in HEX format (required by Chart.js).
 *
 * Usage:
 * ```typescript
 * import { CHART_COLORS } from '@shared/utils/color';
 *
 * const chartConfig = {
 *   backgroundColor: CHART_COLORS[0], // Primary orange
 *   borderColor: CHART_COLORS[1]      // Blue
 * };
 * ```
 */
export const CHART_COLORS = [
  '#f9a743', // --os-color-primary (Orange)
  '#3b82f6', // --os-color-blue
  '#10b981', // --os-color-emerald
  '#8b5cf6', // --os-color-violet
  '#ef4444', // --os-color-red
  '#ec4899', // --os-color-pink
  '#f59e0b', // --os-color-amber
  '#14b8a6'  // --os-color-teal
] as const;

/**
 * Semantic color mappings from SCSS variables
 * Use these for consistent theming across the application
 */
export const SEMANTIC_COLORS = {
  primary: '#f9a743',
  secondary: '#3dc2ff',
  tertiary: '#f9a743',
  success: '#2dd36f',
  warning: '#ffc409',
  danger: '#eb445a',
  info: '#06b6d4',
  dark: '#222428',
  medium: '#92949c',
  light: '#f4f5f8'
} as const;

/**
 * Tailwind-inspired extended color palette
 * Matches --os-color-* CSS variables
 */
export const EXTENDED_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
  zinc: '#71717a'
} as const;

/**
 * Type-safe color palette type
 */
export type ChartColor = typeof CHART_COLORS[number];
export type SemanticColorName = keyof typeof SEMANTIC_COLORS;
export type ExtendedColorName = keyof typeof EXTENDED_COLORS;
