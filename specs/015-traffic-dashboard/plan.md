# Implementation Plan: Traffic Dashboard Tab

**Branch**: `015-traffic-dashboard` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-traffic-dashboard/spec.md`

## Summary

Implement the Traffic tab in the dashboard with real API integration, replacing the existing mock-based implementation. The feature includes:
- 4 KPI cards (Total Traffic, Active Countries, Top Country, Avg Traffic/Subscriber)
- 2 stacked bar charts (Traffic by Country, Subscribers by Country)
- 1 line chart (Average Traffic per Subscriber trend)
- Full integration with existing dashboard account/period selection

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5 (Zoneless)
**Primary Dependencies**: Angular HttpClient, RxJS, Chart.js, Angular Material
**Storage**: N/A (read-only API integration)
**Testing**: Manual testing (no automated tests requested per spec)
**Target Platform**: Web (Desktop, Tablet, Mobile responsive)
**Project Type**: Web application (Angular SPA)
**Performance Goals**: 3 seconds page load, 100ms tooltip response
**Constraints**: Top 15 countries limit, handle 100 countries and 365 periods
**Scale/Scope**: Single dashboard tab with 4 visualizations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| I. Absolute Paths Only | ✅ PASS | Will use absolute paths in all file operations |
| II. Component Architecture | ✅ PASS | Standalone, OnPush, inject(), signals, @if/@for, os- prefix |
| III. HTTP Error Handling | ✅ PASS | Will use handleObjectError from @shared/utils |
| IV. Models Organization | ✅ PASS | Domain models in /views/analytics/dashboard/models/ |
| V. Services Organization | ✅ PASS | Domain service in /views/analytics/dashboard/services/ |
| VI. Utility Functions | ✅ PASS | Dashboard utils in /views/analytics/dashboard/utils/ |
| VII. SCSS Architecture | ✅ PASS | @use syntax, CSS variables, BEM naming |
| VIII. Icons & SVG | ✅ PASS | Use existing CoreUI icons for tab navigation |
| IX. Documentation Language | ✅ PASS | English only |
| X. Search Before Creating | ✅ PASS | Reuse existing chart components and patterns |
| XI. TypeScript Configuration | ✅ PASS | ES2022, strictNullChecks: false |
| XII. Quality Gates | ✅ PASS | All gates will be followed |

**Gate Result: PASS** — No violations, proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/015-traffic-dashboard/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: TypeScript interfaces
├── quickstart.md        # Phase 1: Quick implementation guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/app/views/analytics/dashboard/
├── dashboard.component.ts          # Main dashboard (MODIFY: enable traffic tab)
├── dashboard.component.html        # Dashboard template (MODIFY: update traffic pane)
├── models/
│   └── traffic.types.ts            # NEW: Traffic API response types
├── services/
│   ├── dashboard-data.service.ts   # MODIFY: add getTrafficData method
│   └── traffic-data.service.ts     # NEW: Traffic API service
├── tabs/
│   └── traffic/
│       ├── traffic-tab.component.ts    # NEW: Traffic tab component
│       ├── traffic-tab.component.html  # NEW: Traffic tab template
│       ├── traffic-tab.component.scss  # NEW: Traffic tab styles
│       └── index.ts                    # NEW: Barrel export
└── utils/
    ├── config.utils.ts             # MODIFY: add traffic endpoint
    └── traffic.utils.ts            # NEW: Traffic formatting utilities
```

**Structure Decision**: Feature-specific code in dashboard domain folder following existing Finance/Subscribers tab patterns. Reuse existing shared chart components (OsBarChartComponent, OsLineChartComponent).

## Complexity Tracking

> No violations requiring justification. Implementation follows established patterns.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Single API call | Fetch all traffic data in one request | API returns complete dataset, no need for multiple calls |
| Reuse chart components | Use existing OsBarChartComponent, OsLineChartComponent | Components already support required features |
| Same color palette | Use DASHBOARD_CHART_COLORS from chart.utils.ts | Consistency with other tabs |

## Implementation Phases

### Phase 0: Cleanup (Prerequisites)

1. Delete legacy Traffic tab files:
   - `/src/app/views/analytics/dashboard/tabs/traffic/` (entire directory)
   - `/src/app/views/analytics/dashboard/services/traffic-data.service.ts`
   - `/src/app/views/analytics/dashboard/models/traffic.types.ts`

2. Remove Traffic references from existing files:
   - `dashboard.component.ts` - remove TrafficTabComponent import
   - `dashboard.component.html` - remove traffic tab pane
   - `dashboard-data.service.ts` - remove traffic methods
   - `mock-data.service.ts` - remove getTrafficData method
   - `config.utils.ts` - remove traffic from mock config

### Phase 1: Models & Types

Create `/src/app/views/analytics/dashboard/models/traffic.types.ts`:
- TrafficUsagePeriodResponse (root API response)
- CurrentPeriodTraffic
- PeriodTrafficData
- PeriodSubscriberData
- AverageTrafficData
- CountryTraffic
- CountrySubscribers

### Phase 2: Service Layer

Create `/src/app/views/analytics/dashboard/services/traffic-data.service.ts`:
- Injectable service with HttpClient
- `getTrafficData(params)` method calling API endpoint
- Error handling with handleObjectError

Update `/src/app/views/analytics/dashboard/services/dashboard-data.service.ts`:
- Inject TrafficDataService
- Add `getTrafficData()` facade method

### Phase 3: Utility Functions

Create `/src/app/views/analytics/dashboard/utils/traffic.utils.ts`:
- `formatTrafficValue(bytes)` - convert to KB/MB/GB/TB/PB
- `buildTrafficByCountryChartConfig(data)` - stacked bar chart config
- `buildSubscribersByCountryChartConfig(data)` - stacked bar chart config
- `buildAverageTrafficChartConfig(data)` - line chart config
- `calculateKpiValues(data)` - extract KPI card values

### Phase 4: Component Implementation

Create `/src/app/views/analytics/dashboard/tabs/traffic/`:
- `traffic-tab.component.ts` - standalone, OnPush, signals
- `traffic-tab.component.html` - KPI cards, charts, loading/error states
- `traffic-tab.component.scss` - responsive layout, dashboard mixins
- `index.ts` - barrel export

### Phase 5: Integration

Update `/src/app/views/analytics/dashboard/dashboard.component.ts`:
- Import TrafficTabComponent
- Enable traffic tab (disabled: false)

Update `/src/app/views/analytics/dashboard/dashboard.component.html`:
- Add traffic tab pane with conditional rendering

Update `/src/app/views/analytics/dashboard/utils/config.utils.ts`:
- Add traffic API endpoint path

### Phase 6: Testing & Verification

- Verify Traffic tab is enabled in navigation
- Verify API integration returns data
- Verify all 4 visualizations render correctly
- Verify account/period filtering works
- Verify loading/error states display properly

## Dependencies

### Existing Components to Reuse
- `OsBarChartComponent` - stacked bar charts
- `OsLineChartComponent` - line chart
- `CardComponent` - KPI card wrappers
- `LoadingIndicatorComponent` - loading state
- `ErrorDisplayComponent` - error state

### Existing Services to Reuse
- `DashboardStateService` - period/account state
- `DashboardDataService` - data facade pattern

### Existing Utilities to Reuse
- `DASHBOARD_CHART_COLORS` - color palette
- `getChartColor()`, `getChartColors()` - color helpers
- `handleObjectError()` - HTTP error handling

## API Contract

**Endpoint**: `GET /api/v1/reports/dashboards/trafic/traffic-usage-period`

**Request Parameters**:
```typescript
{
  accountId: string;    // UUID
  period: string;       // 'DAY' | 'WEEK' | 'MONTH'
  dateFrom: string;     // ISO datetime
  dateTo: string;       // ISO datetime
}
```

**Response Schema**:
```typescript
{
  currentPeriodTraffic: {
    period: string;
    totalTraffic: number;
    countryTraffics: Array<{ country: string; traffic: number }>;
  };
  trafficByCountry: Array<{
    period: string;
    totalTraffic: number;
    countryTraffics: Array<{ country: string; traffic: number }>;
  }>;
  subscribersByCountry: Array<{
    period: string;
    totalSubscribers: number;
    countrySubscribers: Array<{ country: string; subscribers: number }>;
  }>;
  subscriberAverageTraffic: Array<{
    period: string;
    traffic: number;
  }>;
}
```
