# Data Model: Waterfall Chart Component

**Feature**: 012-waterfall-chart
**Date**: 2025-12-10

## Entities

### WaterfallDataPoint

Represents a single data point in the waterfall chart.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Display label for the bar |
| `value` | `number` | Yes | Numeric value (positive or negative) |
| `type` | `'increase' \| 'decrease' \| 'total'` | No | Determines bar coloring; auto-detected from value sign if not specified |

**Validation Rules**:
- `label` must be non-empty string
- `value` must be a finite number
- `type` defaults to `'increase'` if value >= 0, `'decrease'` if value < 0

### WaterfallChartData

Internal representation after transformation for Chart.js.

| Field | Type | Description |
|-------|------|-------------|
| `labels` | `string[]` | X-axis labels |
| `datasets` | `WaterfallDataset[]` | Chart.js compatible datasets |

### WaterfallDataset

Single dataset for Chart.js floating bar chart.

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Dataset label |
| `data` | `[number, number][]` | Array of [start, end] values for floating bars |
| `backgroundColor` | `string[]` | Colors per bar |
| `borderRadius` | `number` | Bar corner radius |

### WaterfallColors

Color configuration for waterfall chart.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `increase` | `string` | CSS var `--os-color-success` | Color for positive values |
| `decrease` | `string` | CSS var `--os-color-danger` | Color for negative values |
| `total` | `string` | CSS var `--os-color-primary` | Color for total bars |

### WaterfallChartOptions

Extends Chart.js BarChartOptions with waterfall-specific settings.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `showConnectors` | `boolean` | `false` | Show connecting lines between bars |
| `showValues` | `boolean` | `true` | Show value labels on bars |
| `valueFormat` | `(value: number) => string` | identity | Value formatting function |

### BundleStatusLifecycle

Constant defining the order of bundle statuses.

```typescript
export const BUNDLE_STATUS_LIFECYCLE_ORDER = [
  'PAID',
  'FAILED_ACTIVATE',
  'REFUNDED',
  'ACTIVE',
  'SPENT',
  'EXPIRED'
] as const;

export type BundleStatus = typeof BUNDLE_STATUS_LIFECYCLE_ORDER[number];
```

## State Transitions

### Bundle Status Lifecycle

```
PAID ──┬──> FAILED_ACTIVATE ──> REFUNDED
       │
       └──> ACTIVE ──> SPENT ──> EXPIRED
                  │
                  └──> REFUNDED
```

**Transition Rules**:
- `PAID` is the initial state after purchase
- `FAILED_ACTIVATE` occurs if activation fails
- `REFUNDED` can occur from PAID, FAILED_ACTIVATE, or ACTIVE
- `ACTIVE` means bundle is in use
- `SPENT` means data quota exhausted
- `EXPIRED` means validity period ended

## Relationships

```
WaterfallDataPoint[] ──[transform]──> WaterfallChartData
                                            │
                                            v
                                      Chart.js Bar Chart
                                      (floating bars)
```

## Data Volume Assumptions

- Maximum 50 data points per waterfall chart (performance target)
- Bundle status chart typically shows 6 statuses × 12 periods = 72 data points
- Transformation should complete in < 10ms for datasets under 100 points
