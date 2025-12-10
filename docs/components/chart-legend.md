# Chart Legend Component

The `app-chart-legend` component provides a custom, scrollable legend for Chart.js charts with interactive item toggling.

## Overview

The chart legend component is used to:
- Display chart series with color indicators
- Toggle visibility of chart datasets
- Provide a scrollable container when many items exist
- Enhance UX compared to native Chart.js legends

The component is primarily integrated into `OsBarChartComponent` but can be used standalone.

## Installation

The component is exported from `@shared` and can be imported directly:

```typescript
import { ChartLegendComponent, ChartLegendItem } from '@shared';
```

## Basic Usage

### Integrated with OsBarChartComponent (Recommended)

The legend is automatically displayed when `legendItems` is provided:

```html
<os-bar-chart
  [data]="chartData"
  [legendItems]="legendItems"
  [legendMaxHeight]="80">
</os-bar-chart>
```

### Standalone Usage

```html
<app-chart-legend
  [items]="legendItems"
  [maxHeight]="100"
  (itemClick)="onLegendItemClick($event)">
</app-chart-legend>
```

```typescript
import { Component } from '@angular/core';
import { ChartLegendComponent, ChartLegendItem } from '@shared';

@Component({
  standalone: true,
  selector: 'app-example',
  imports: [ChartLegendComponent],
  template: `
    <app-chart-legend
      [items]="legendItems"
      [maxHeight]="100"
      (itemClick)="onItemClick($event)">
    </app-chart-legend>
  `
})
export class ExampleComponent {
  legendItems: ChartLegendItem[] = [
    { label: 'Product A', color: '#3b82f6', value: 1200 },
    { label: 'Product B', color: '#ef4444', value: 800 },
    { label: 'Product C', color: '#22c55e', value: 450 }
  ];

  onItemClick(event: { index: number; item: ChartLegendItem }): void {
    console.log('Clicked item:', event.item.label);
  }
}
```

## API Reference

### Inputs (Signal-based)

All inputs use Angular's signal-based `input()` API.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `ChartLegendItem[]` | **required** | Legend items to display |
| `maxHeight` | `number` | `100` | Maximum height in pixels before scrolling |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `itemClick` | `{ index: number; item: ChartLegendItem }` | Emits when a legend item is clicked |

### ChartLegendItem Interface

```typescript
interface ChartLegendItem {
  label: string;      // Display text for the item
  color: string;      // Color indicator (CSS color value)
  value?: number;     // Optional associated value
  hidden?: boolean;   // Whether the item is currently hidden
}
```

## Features

### Automatic Scrolling

The component automatically enables scrolling when content exceeds `maxHeight`:

```typescript
// Internal calculation (approximate)
needsScroll = computed(() => {
  const estimatedHeight = Math.ceil(this.items().length / 3) * 28;
  return estimatedHeight > this.maxHeight();
});
```

### Hidden State

Items can be toggled to a hidden state, which:
- Reduces opacity to 40%
- Changes color indicator to gray
- Applies strikethrough to the label

```typescript
// Item with hidden state
const item: ChartLegendItem = {
  label: 'Hidden Series',
  color: '#3b82f6',
  hidden: true  // Will show as hidden/disabled
};
```

### Interactive Toggle

When integrated with `OsBarChartComponent`, clicking legend items toggles dataset visibility. The parent component receives click events via `itemClick` output and handles Chart.js dataset visibility updates.

See [OsBarChartComponent](./bar-chart.md) for integration details.

## Usage Examples

### Example 1: Finance Dashboard

```typescript
const revenueByBundle: ChartLegendItem[] = [
  { label: 'Bundle Premium', color: '#f9a743', value: 45000 },
  { label: 'Bundle Standard', color: '#3dc2ff', value: 32000 },
  { label: 'Bundle Basic', color: '#2dd36f', value: 18000 }
];
```

### Example 2: Subscriber Statistics

```typescript
const statusLegend: ChartLegendItem[] = [
  { label: 'Active', color: '#22c55e', value: 1250, hidden: false },
  { label: 'Suspended', color: '#f59e0b', value: 340, hidden: false },
  { label: 'Terminated', color: '#ef4444', value: 85, hidden: true }
];
```

## Styling

### CSS Variables

The component uses CSS variables for theming:

| Element | CSS Variable | Fallback |
|---------|--------------|----------|
| Background | `--os-color-bg-secondary` | `#f9fafb` |
| Hover | `--os-color-bg-tertiary` | `#f3f4f6` |
| Text | `--os-color-text-secondary` | `#4b5563` |
| Border | `--os-color-border` | `#e5e7eb` |
| Hidden color | `--os-color-text-tertiary` | `#9ca3af` |

### Custom Scrollbar

The scrollbar is styled for a minimal appearance:

```scss
.chart-legend--scrollable {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--os-color-border, #e5e7eb) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
}
```

### Item Layout

Items are displayed in a flexible wrap layout:

```scss
.chart-legend__items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.chart-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  max-width: 200px;
}

.chart-legend__label {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
```

## Related Components

- `os-bar-chart` - Bar chart with integrated legend support
- `os-waterfall-chart` - Waterfall chart component
- `os-line-chart` - Line chart component

## Technical Details

- **Framework**: Angular 19+ (standalone component)
- **Change Detection**: OnPush
- **Inputs**: Signal-based via `input()`, `input.required()`
- **Outputs**: Signal-based via `output()`
- **Computed**: Uses `computed()` for derived state
