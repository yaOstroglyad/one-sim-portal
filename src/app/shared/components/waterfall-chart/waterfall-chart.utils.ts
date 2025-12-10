import {
  WaterfallDataPoint,
  WaterfallChartData,
  WaterfallColors
} from './waterfall-chart.types';

/**
 * Default colors for waterfall chart using CSS variable fallbacks.
 */
export const DEFAULT_WATERFALL_COLORS: WaterfallColors = {
  increase: '#22c55e',  // --os-color-success fallback (green)
  decrease: '#ef4444',  // --os-color-danger fallback (red)
  total: '#3b82f6'      // --os-color-primary fallback (blue)
};

// Cache for CSS colors to avoid repeated getComputedStyle calls
let cachedCSSColors: WaterfallColors | null = null;

/**
 * Loads colors from CSS variables if available.
 * Results are cached for performance.
 */
export function getWaterfallColorsFromCSS(): WaterfallColors {
  // Return cached colors if available
  if (cachedCSSColors) {
    return cachedCSSColors;
  }

  if (typeof document === 'undefined') {
    return { ...DEFAULT_WATERFALL_COLORS };
  }

  const style = getComputedStyle(document.documentElement);

  const getColorOrDefault = (cssVar: string, fallback: string): string => {
    const value = style.getPropertyValue(cssVar).trim();
    return value || fallback;
  };

  cachedCSSColors = {
    increase: getColorOrDefault('--os-color-success', DEFAULT_WATERFALL_COLORS.increase),
    decrease: getColorOrDefault('--os-color-danger', DEFAULT_WATERFALL_COLORS.decrease),
    total: getColorOrDefault('--os-color-primary', DEFAULT_WATERFALL_COLORS.total)
  };

  return cachedCSSColors;
}

/**
 * Determines the type of a data point based on its value.
 * Used when explicit type is not provided.
 */
export function getDataPointType(point: WaterfallDataPoint): 'increase' | 'decrease' | 'total' {
  if (point.type) {
    return point.type;
  }
  return point.value >= 0 ? 'increase' : 'decrease';
}

/**
 * Gets the color for a data point based on its type.
 */
export function getColorForType(
  type: 'increase' | 'decrease' | 'total',
  colors: WaterfallColors
): string {
  return colors[type];
}

/**
 * T005: Transforms WaterfallDataPoint[] into Chart.js compatible floating bar data.
 *
 * Algorithm:
 * 1. Initialize runningTotal = 0
 * 2. For each point:
 *    - If type === 'total': bar = [0, runningTotal] (shows cumulative from zero)
 *    - Else: bar = [runningTotal, runningTotal + value], runningTotal += value
 * 3. Output: floating bar data with colors
 *
 * @param dataPoints - Array of waterfall data points
 * @param colors - Color configuration (optional, uses CSS variables by default)
 * @returns Chart.js compatible data structure
 */
export function transformToWaterfallData(
  dataPoints: WaterfallDataPoint[],
  colors?: Partial<WaterfallColors>
): WaterfallChartData {
  if (!dataPoints || dataPoints.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  // Merge provided colors with defaults from CSS
  const resolvedColors: WaterfallColors = {
    ...getWaterfallColorsFromCSS(),
    ...colors
  };

  const labels: string[] = [];
  const floatingBarData: [number, number][] = [];
  const backgroundColors: string[] = [];

  let runningTotal = 0;

  for (const point of dataPoints) {
    labels.push(point.label);
    const type = getDataPointType(point);

    if (type === 'total') {
      // Total bars always start from 0 and show the cumulative total
      floatingBarData.push([0, runningTotal]);
    } else {
      // Regular bars show the change from current total
      const start = runningTotal;
      const end = runningTotal + point.value;

      // For negative values, start > end which creates a downward bar
      floatingBarData.push([Math.min(start, end), Math.max(start, end)]);

      // Update running total
      runningTotal += point.value;
    }

    // Use custom color if provided, otherwise use type-based color
    const barColor = point.color || getColorForType(type, resolvedColors);
    backgroundColors.push(barColor);
  }

  return {
    labels,
    datasets: [{
      label: 'Values',
      data: floatingBarData,
      backgroundColor: backgroundColors,
      borderRadius: 4
    }]
  };
}
