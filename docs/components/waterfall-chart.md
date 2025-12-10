# Waterfall Chart Component

The `os-waterfall-chart` component visualizes cumulative data flows using floating bars. Each bar shows how values increase or decrease from a running total.

## Overview

Waterfall charts are commonly used to:
- Show how an initial value is affected by a series of positive and negative values
- Visualize revenue breakdowns (sales, refunds, fees, final total)
- Display status lifecycle progression (e.g., bundle statuses)

The component is built on Chart.js using native floating bar support and follows Angular standalone component patterns.

## Installation

The component is exported from `@shared` and can be imported directly:

```typescript
import { OsWaterfallChartComponent, WaterfallDataPoint } from '@shared';
```

## Basic Usage

```html
<os-waterfall-chart [data]="waterfallData"></os-waterfall-chart>
```

```typescript
import { Component } from '@angular/core';
import { OsWaterfallChartComponent, WaterfallDataPoint } from '@shared';

@Component({
  standalone: true,
  selector: 'app-example',
  imports: [OsWaterfallChartComponent],
  template: `<os-waterfall-chart [data]="waterfallData"></os-waterfall-chart>`
})
export class ExampleComponent {
  waterfallData: WaterfallDataPoint[] = [
    { label: 'Starting Balance', value: 1000, type: 'total' },
    { label: 'Revenue', value: 500 },
    { label: 'Expenses', value: -200 },
    { label: 'Taxes', value: -100 },
    { label: 'Final Balance', value: 0, type: 'total' }
  ];
}
```

## API Reference

### Inputs (Signal-based)

All inputs use Angular's signal-based `input()` API for optimal change detection.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `data` | `WaterfallDataPoint[]` | **required** | Array of data points to visualize |
| `options` | `WaterfallChartOptions` | `{}` | Chart.js options override |
| `colors` | `Partial<WaterfallColors>` | CSS variables | Custom color overrides |
| `height` | `number \| string` | `400` | Chart height in pixels |
| `responsive` | `boolean` | `true` | Enable responsive sizing |

### Data Point Interface

```typescript
interface WaterfallDataPoint {
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
```

### Colors Interface

```typescript
interface WaterfallColors {
  increase: string;  // Color for positive values (default: green)
  decrease: string;  // Color for negative values (default: red)
  total: string;     // Color for total bars (default: blue)
}
```

## Usage Examples

### Example 1: Financial Breakdown

```typescript
const financialData: WaterfallDataPoint[] = [
  { label: 'Gross Revenue', value: 10000, type: 'total' },
  { label: 'Product Sales', value: 5000 },
  { label: 'Services', value: 3000 },
  { label: 'Refunds', value: -800 },
  { label: 'Discounts', value: -500 },
  { label: 'Net Revenue', value: 0, type: 'total' }
];
```

```html
<os-waterfall-chart
  [data]="financialData"
  [height]="350">
</os-waterfall-chart>
```

### Example 2: Bundle Status with Custom Colors

```typescript
import { getBundleStatusColor, BUNDLE_STATUS_LIFECYCLE_ORDER } from '@views/analytics/dashboard/utils';

const bundleStatusData: WaterfallDataPoint[] = [
  { label: 'PAID', value: 1500, color: '#3b82f6' },        // Blue
  { label: 'FAILED_ACTIVATE', value: 50, color: '#f97316' }, // Orange
  { label: 'REFUNDED', value: 100, color: '#ef4444' },     // Red
  { label: 'ACTIVE', value: 800, color: '#22c55e' },       // Green
  { label: 'SPENT', value: 400, color: '#8b5cf6' },        // Purple
  { label: 'EXPIRED', value: 100, color: '#6b7280' }       // Gray
];
```

```html
<os-waterfall-chart [data]="bundleStatusData"></os-waterfall-chart>
```

## Color Customization

### Per-Bar Custom Colors

Each data point can have its own color via the `color` property:

```typescript
const data: WaterfallDataPoint[] = [
  { label: 'Item A', value: 100, color: '#3b82f6' },
  { label: 'Item B', value: -30, color: '#ef4444' },
  { label: 'Item C', value: 50, color: '#22c55e' }
];
```

### Using CSS Variables (Default)

The component uses CSS variables for theming by default (cached for performance):

| Type | CSS Variable | Fallback |
|------|--------------|----------|
| Increase | `--os-color-success` | `#22c55e` (green) |
| Decrease | `--os-color-danger` | `#ef4444` (red) |
| Total | `--os-color-primary` | `#3b82f6` (blue) |

### Global Color Override via Input

```typescript
customColors = {
  increase: '#10b981',  // Emerald
  decrease: '#f59e0b',  // Amber
  total: '#6366f1'      // Indigo
};
```

```html
<os-waterfall-chart
  [data]="data"
  [colors]="customColors">
</os-waterfall-chart>
```

### Overriding via CSS Variables

Define the CSS variables in your global styles:

```scss
:root {
  --os-color-success: #22c55e;
  --os-color-danger: #ef4444;
  --os-color-primary: #3b82f6;
}
```

## Automatic Type Detection

If `type` is not explicitly specified on a data point:
- `value >= 0` -> `'increase'` (green bar)
- `value < 0` -> `'decrease'` (red bar)

For "total" bars that should always start from zero, explicitly set `type: 'total'`.

## Public Methods

The component exposes these public methods:

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getChartInstance()` | `Chart \| null` | Get the underlying Chart.js instance |
| `exportAsImage(format)` | `string \| null` | Export chart as base64 image |
| `downloadChart(filename, format)` | `void` | Download chart as image file |

### Example: Exporting Chart

```typescript
@ViewChild(OsWaterfallChartComponent) waterfallChart!: OsWaterfallChartComponent;

exportChart(): void {
  this.waterfallChart.downloadChart('bundle-status-report', 'png');
}
```

## Integration with Dashboard

The waterfall chart is integrated in the Subscribers tab to display bundle status distribution:

```typescript
// In subscribers-tab.component.ts
import { getBundleStatusColor, BUNDLE_STATUS_LIFECYCLE_ORDER } from '../../utils';

private buildBundleStatusWaterfallData(data: PeriodStatusesResponse): void {
  const statusTotals = new Map<string, number>();

  // Calculate totals per status
  data.periodStatuses.forEach(period => {
    period.statuses.forEach(s => {
      const current = statusTotals.get(s.status) || 0;
      statusTotals.set(s.status, current + s.count);
    });
  });

  // Build waterfall data with lifecycle ordering and unique colors
  const points: WaterfallDataPoint[] = [];

  for (const status of BUNDLE_STATUS_LIFECYCLE_ORDER) {
    const count = statusTotals.get(status);
    if (count !== undefined && count > 0) {
      points.push({
        label: status,
        value: count,
        color: getBundleStatusColor(status)
      });
    }
  }

  this.bundleStatusWaterfallData.set(points);
}
```

## Styling

The component uses shared chart mixins for consistent styling across all chart components:

```scss
// os-waterfall-chart.component.scss
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;

.os-waterfall-chart {
  @include mixins.chart-complete('os-waterfall-chart', '📊');

  &__container {
    overflow: hidden;
  }
}

@include mixins.chart-canvas('os-waterfall-chart');
@include mixins.chart-responsive('os-waterfall-chart');
@include mixins.chart-accessibility('os-waterfall-chart');
```

## Related Components

- `os-bar-chart` - Standard bar chart component
- `os-line-chart` - Line chart component

## Technical Details

- **Framework**: Angular 19+ (standalone component)
- **Chart Library**: Chart.js (floating bars)
- **Change Detection**: OnPush with signal-based inputs
- **Reactivity**: Uses `effect()` for efficient updates
- **Performance**: CSS colors are cached to avoid repeated `getComputedStyle` calls
- **Styling**: Uses shared chart mixins (`chart-complete`, `chart-canvas`, etc.)
