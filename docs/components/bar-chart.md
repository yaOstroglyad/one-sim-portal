# Bar Chart Component

The `os-bar-chart` component renders bar charts using Chart.js with support for stacked bars, custom legends, and automatic theming.

## Overview

Bar charts are used throughout the application for:
- Revenue breakdowns by bundle/country
- Subscriber statistics by status
- Time-series data visualization
- Comparative analysis

The component is built on Chart.js and follows Angular 19 signal-based patterns.

## Installation

The component is exported from `@shared` and can be imported directly:

```typescript
import { OsBarChartComponent, BarChartData, BarChartOptions, ChartLegendItem } from '@shared';
```

## Basic Usage

```html
<os-bar-chart [data]="chartData" [options]="chartOptions"></os-bar-chart>
```

```typescript
import { Component } from '@angular/core';
import { OsBarChartComponent, BarChartData } from '@shared';

@Component({
  standalone: true,
  selector: 'app-example',
  imports: [OsBarChartComponent],
  template: `<os-bar-chart [data]="chartData"></os-bar-chart>`
})
export class ExampleComponent {
  chartData: BarChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{
      label: 'Sales',
      data: [100, 200, 150, 300],
      backgroundColor: '#3b82f6'
    }]
  };
}
```

## API Reference

### Inputs (Signal-based)

All inputs use Angular's signal-based `input()` API for optimal change detection.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `data` | `BarChartData \| null` | `null` | Chart data with labels and datasets |
| `options` | `BarChartOptions` | `{}` | Chart.js options override |
| `width` | `number \| string` | `'100%'` | Chart width |
| `height` | `number \| string` | `400` | Chart height in pixels |
| `chartType` | `'bar' \| 'horizontalBar'` | `'bar'` | Bar orientation |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `legendItems` | `ChartLegendItem[]` | `[]` | Custom legend items |
| `legendMaxHeight` | `number` | `80` | Max height for scrollable legend |
| `showLegend` | `boolean` | `true` | Show/hide custom legend |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `legendItemsChange` | `ChartLegendItem[]` | Emits when legend item visibility changes |

### Data Interface

```typescript
interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderRadius?: number | { topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number };
    barThickness?: number;
    maxBarThickness?: number;
    stack?: string;  // For stacked bar charts
  }[];
}
```

### Legend Item Interface

See [ChartLegendItem](./chart-legend.md#chartlegenditem-interface) in the Chart Legend documentation.

## Usage Examples

### Example 1: Simple Bar Chart

```typescript
const simpleData: BarChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [{
    label: 'Revenue',
    data: [12000, 19000, 15000, 22000],
    backgroundColor: '#3b82f6'
  }]
};
```

```html
<os-bar-chart [data]="simpleData" [height]="300"></os-bar-chart>
```

### Example 2: Stacked Bar Chart with Custom Legend

```typescript
const stackedData: BarChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Product A',
      data: [100, 150, 200],
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      stack: 'stack0',
      borderWidth: 0
    },
    {
      label: 'Product B',
      data: [80, 120, 90],
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      stack: 'stack0',
      borderWidth: 0
    }
  ]
};

const legendItems: ChartLegendItem[] = [
  { label: 'Product A', color: 'rgba(54, 162, 235, 0.8)', value: 450 },
  { label: 'Product B', color: 'rgba(255, 99, 132, 0.8)', value: 290 }
];

const stackedOptions: BarChartOptions = {
  scales: {
    x: { stacked: true },
    y: { stacked: true }
  }
};
```

```html
<os-bar-chart
  [data]="stackedData"
  [options]="stackedOptions"
  [legendItems]="legendItems"
  [legendMaxHeight]="80">
</os-bar-chart>
```

### Example 3: Horizontal Bar Chart

```typescript
const horizontalData: BarChartData = {
  labels: ['USA', 'Germany', 'France', 'UK', 'Italy'],
  datasets: [{
    label: 'Users',
    data: [1200, 900, 750, 600, 450],
    backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']
  }]
};
```

```html
<os-bar-chart
  [data]="horizontalData"
  [chartType]="'horizontalBar'"
  [height]="250">
</os-bar-chart>
```

### Example 4: Handling Legend Item Clicks

```typescript
@Component({
  template: `
    <os-bar-chart
      [data]="chartData"
      [legendItems]="legendItems"
      (legendItemsChange)="onLegendChange($event)">
    </os-bar-chart>
  `
})
export class ExampleComponent {
  legendItems: ChartLegendItem[] = [...];

  onLegendChange(updatedItems: ChartLegendItem[]): void {
    this.legendItems = updatedItems;
    // Items now have updated `hidden` property
  }
}
```

## Custom Legend Integration

The component integrates [ChartLegendComponent](./chart-legend.md) for a scrollable, interactive legend that replaces the native Chart.js legend.

- When `legendItems` is provided and has items, the native Chart.js legend is automatically disabled
- Legend items are clickable to toggle dataset visibility
- Legend scrolls when content exceeds `legendMaxHeight`

For styling options, see the [Chart Legend documentation](./chart-legend.md#styling).

## Default Styling

The component applies these defaults to datasets:

| Property | Default Value | Notes |
|----------|---------------|-------|
| `borderWidth` | `0` | No borders on bars |
| `borderRadius` | `4` | Rounded corners |
| `backgroundColor` | Auto from palette | If not specified |

## Color Palette

The component includes a built-in color palette that can be customized:

```typescript
// Default colors (can be overridden via CSS variables)
const colors = {
  primary: '#f9a743',
  secondary: '#3dc2ff',
  success: '#2dd36f',
  danger: '#eb445a',
  warning: '#ffc409',
  info: '#3dc2ff',
  // + Tailwind colors: red, orange, amber, yellow, lime, green, etc.
};
```

### Customizing Colors

```typescript
@ViewChild(OsBarChartComponent) barChart!: OsBarChartComponent;

customizeColors(): void {
  this.barChart.updateColors({
    primary: '#6366f1',
    success: '#10b981'
  });
}
```

## Public Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getChartInstance()` | `Chart \| null` | Get the underlying Chart.js instance |
| `exportAsImage(format)` | `string \| null` | Export chart as base64 image |
| `downloadChart(filename, format)` | `void` | Download chart as image file |
| `updateColors(colors)` | `void` | Update color palette |
| `getCurrentColors()` | `object` | Get current color palette |

## Integration with Dashboard

The bar chart is used extensively in the Dashboard module:

### Finance Tab

```typescript
// finance-data.service.ts
private buildStackedBarChartByPeriod(data: PeriodRevenueData[], currency: string, label: string) {
  // Build stacked chart with proper negative value handling
  const datasets = sortedGroups.map((groupName, index) => ({
    label: `${label}, ${groupName}`,
    data: allValues,
    backgroundColor: DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
    borderWidth: 0,
    stack: hasAnyNegative ? (isNegative ? 'negative' : 'positive') : 'stack0'
  }));

  const legendItems = sortedGroups.map((groupName, index) => ({
    label: groupName,
    color: DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
    value: groupTotals.get(groupName) || 0,
    hidden: false
  }));

  return { data: { labels, datasets }, legendItems, options };
}
```

### Subscribers Tab

```typescript
// subscribers-tab.component.ts
private buildNetworkStatusChartConfig(data: PeriodStatusesResponse): void {
  const datasets = statusList.map((status, index) => ({
    label: status,
    data: data.periodStatuses.map(period => {
      const found = period.statuses.find(s => s.status === status);
      return found ? found.count : 0;
    }),
    backgroundColor: getChartColor(index),
    borderWidth: 0
  }));

  const legendItems: ChartLegendItem[] = statusList.map((status, index) => ({
    label: status,
    color: getChartColor(index),
    value: statusTotals.get(status) || 0,
    hidden: false
  }));

  this.networkStatusChartData.set({ labels, datasets });
  this.networkStatusLegendItems.set(legendItems);
}
```

## Styling

The component uses shared chart mixins:

```scss
// os-bar-chart.component.scss
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;

.os-bar-chart {
  @include mixins.chart-complete('os-bar-chart', '📊');

  &__container {
    overflow: hidden;
  }
}

@include mixins.chart-canvas('os-bar-chart');
@include mixins.chart-responsive('os-bar-chart');
@include mixins.chart-accessibility('os-bar-chart');
```

## Related Components

- `os-waterfall-chart` - Waterfall chart for cumulative flows
- `os-line-chart` - Line chart component
- `app-chart-legend` - Custom scrollable legend (integrated)

## Technical Details

- **Framework**: Angular 19+ (standalone component)
- **Chart Library**: Chart.js
- **Change Detection**: OnPush with signal-based inputs
- **Reactivity**: Uses `effect()` for efficient updates (replaces `ngOnChanges`)
- **Inputs**: Signal-based via `input()`, `output()`, `viewChild()`
- **DI**: Uses `inject()` for dependency injection
- **Styling**: Uses shared chart mixins
