# Research: Waterfall Chart Component

**Feature**: 012-waterfall-chart
**Date**: 2025-12-10

## Research Topics

### 1. Chart.js Floating Bars Implementation

**Decision**: Use Chart.js native floating bar support via `[start, end]` data format

**Rationale**:
- Chart.js 3.x+ natively supports floating bars by providing data as arrays of `[min, max]` values
- No external plugins required
- Same library already used for `os-bar-chart` and `os-line-chart`
- Well-documented and stable API

**Alternatives Considered**:
- `chartjs-chart-waterfall` plugin - Abandoned, not actively maintained
- `chartjs-plugin-waterfall` - Limited customization options
- D3.js - Would require adding new dependency, overkill for this use case
- Custom Canvas rendering - High effort, reinventing the wheel

**Implementation Pattern**:
```typescript
// Data format for floating bars
datasets: [{
  data: [
    [0, 100],      // Bar from 0 to 100 (positive)
    [100, 150],    // Bar from 100 to 150 (positive)
    [150, 120],    // Bar from 150 to 120 (negative - goes down)
    [0, 120]       // Total bar from 0 to final value
  ]
}]
```

### 2. Color Coding Strategy

**Decision**: Use semantic CSS variables for consistent theming

**Rationale**:
- Aligns with constitution requirement for CSS variables
- Supports future dark mode implementation
- Consistent with existing chart components

**Color Mapping**:
| Type | Color Variable | Fallback |
|------|---------------|----------|
| Increase (positive) | `--os-color-success` | `#22c55e` (green) |
| Decrease (negative) | `--os-color-danger` | `#ef4444` (red) |
| Total | `--os-color-primary` | `#3b82f6` (blue) |
| Neutral | `--os-color-medium` | `#6b7280` (gray) |

### 3. Bundle Status Lifecycle Order

**Decision**: Define explicit ordering constant matching business logic

**Rationale**:
- Bundle lifecycle follows predictable flow: purchase → activation → usage → expiration
- Order from screenshot: PAID → FAILED_ACTIVATE → REFUNDED → ACTIVE → SPENT → EXPIRED
- Provides visual coherence for analysts tracking bundle flows

**Implementation**:
```typescript
export const BUNDLE_STATUS_LIFECYCLE_ORDER = [
  'PAID',
  'FAILED_ACTIVATE',
  'REFUNDED',
  'ACTIVE',
  'SPENT',
  'EXPIRED'
] as const;
```

### 4. Data Transformation for Waterfall

**Decision**: Create utility function to transform raw values to floating bar format

**Rationale**:
- Keeps component API simple (accepts raw values)
- Transformation logic reusable across different data sources
- Easier to test transformation separately

**Algorithm**:
```
Input: [{ label: 'A', value: 100 }, { label: 'B', value: -30 }, { label: 'Total', value: 70, type: 'total' }]

1. Initialize runningTotal = 0
2. For each point:
   - If type === 'total': bar = [0, runningTotal]
   - Else: bar = [runningTotal, runningTotal + value], runningTotal += value
3. Output: floating bar data with colors

Output: {
  labels: ['A', 'B', 'Total'],
  data: [[0, 100], [100, 70], [0, 70]],
  colors: ['green', 'red', 'blue']
}
```

### 5. Component API Design

**Decision**: Mirror `os-bar-chart` API with waterfall-specific additions

**Rationale**:
- Familiar API for developers already using chart components
- Consistent with existing codebase patterns
- Minimal learning curve

**Proposed Inputs**:
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `data` | `WaterfallDataPoint[]` | required | Array of data points |
| `options` | `WaterfallChartOptions` | `{}` | Chart.js options override |
| `colors` | `WaterfallColors` | theme defaults | Custom color overrides |
| `showConnectors` | `boolean` | `false` | Show connecting lines |
| `height` | `number \| string` | `400` | Chart height |
| `responsive` | `boolean` | `true` | Enable responsiveness |

### 6. Translation Keys

**Decision**: Use existing i18n structure under `dashboard.subscribers`

**Verification Required**:
- `dashboard.subscribers.bundleStatuses` - exists but may need fixing
- Status labels (PAID, ACTIVE, etc.) - verify if translated or use raw API values

**Missing Translations Identified** (from prior context):
- Russian: Need to verify `dashboard.subscribers.bundleStatuses`
- Ukrainian: Need to verify `dashboard.subscribers.bundleStatuses`
- Hebrew: Need to verify `dashboard.subscribers.bundleStatuses`

## Conclusions

All research topics resolved. No NEEDS CLARIFICATION items remain.

**Key Decisions Summary**:
1. Use Chart.js native floating bars (no plugins)
2. Use CSS variables for colors (theme-aware)
3. Define explicit lifecycle ordering constant
4. Transform data in utility function, not component
5. Mirror os-bar-chart API patterns
6. Verify and fix translations in all 4 language files
