# Quickstart: Waterfall Chart Component

**Feature**: 012-waterfall-chart
**Date**: 2025-12-10

## Overview

The `os-waterfall-chart` component visualizes cumulative data flows using floating bars. Each bar shows how values increase or decrease from a running total.

## Basic Usage

```html
<os-waterfall-chart [data]="waterfallData"></os-waterfall-chart>
```

```typescript
import { OsWaterfallChartComponent, WaterfallDataPoint } from '@shared';

waterfallData: WaterfallDataPoint[] = [
  { label: 'Starting', value: 100, type: 'total' },
  { label: 'Sales', value: 50 },
  { label: 'Returns', value: -20 },
  { label: 'Fees', value: -10 },
  { label: 'Final', value: 120, type: 'total' }
];
```

## Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `data` | `WaterfallDataPoint[]` | required | Data points to visualize |
| `options` | `WaterfallChartOptions` | `{}` | Chart.js options |
| `colors` | `WaterfallColors` | theme defaults | Custom colors |
| `height` | `number \| string` | `400` | Chart height |
| `responsive` | `boolean` | `true` | Responsive sizing |

## Data Point Structure

```typescript
interface WaterfallDataPoint {
  label: string;                              // X-axis label
  value: number;                              // Value (positive or negative)
  type?: 'increase' | 'decrease' | 'total';   // Optional explicit type
}
```

## Color Customization

```html
<os-waterfall-chart
  [data]="data"
  [colors]="customColors">
</os-waterfall-chart>
```

```typescript
customColors = {
  increase: '#22c55e',  // Green for positive
  decrease: '#ef4444',  // Red for negative
  total: '#3b82f6'      // Blue for totals
};
```

## Automatic Type Detection

If `type` is not specified:
- `value >= 0` → `'increase'` (green)
- `value < 0` → `'decrease'` (red)
- Explicit `type: 'total'` → Always starts from zero (blue)

## Bundle Status Example

```typescript
// Transform bundle status data for waterfall visualization
buildBundleStatusWaterfallData(data: PeriodStatusesResponse): WaterfallDataPoint[] {
  const points: WaterfallDataPoint[] = [];

  // Order by lifecycle
  const orderedStatuses = ['PAID', 'FAILED_ACTIVATE', 'REFUNDED', 'ACTIVE', 'SPENT', 'EXPIRED'];

  for (const status of orderedStatuses) {
    const count = data.totals[status] || 0;
    points.push({
      label: status,
      value: count,
      type: status === 'REFUNDED' || status === 'FAILED_ACTIVATE' ? 'decrease' : 'increase'
    });
  }

  return points;
}
```

## Integration Checklist

- [ ] Import `OsWaterfallChartComponent` from `@shared`
- [ ] Add component to `imports` array (standalone)
- [ ] Prepare data as `WaterfallDataPoint[]`
- [ ] Add `<os-waterfall-chart>` to template
- [ ] Optionally customize colors and options

## Related Components

- `os-bar-chart` - Standard bar chart
- `os-line-chart` - Line chart
- See `docs/components/waterfall-chart.md` for detailed documentation
