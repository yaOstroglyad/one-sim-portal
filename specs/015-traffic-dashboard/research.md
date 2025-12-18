# Research: Traffic Dashboard Tab

**Feature**: 015-traffic-dashboard
**Date**: 2025-12-16

## Research Summary

No NEEDS CLARIFICATION items were identified in the Technical Context. All technical decisions are clear based on existing codebase patterns and API documentation.

## Decisions Made

### 1. Chart Components

**Decision**: Reuse existing OsBarChartComponent and OsLineChartComponent

**Rationale**:
- Components already support stacked bar charts with custom legends
- Finance and Subscribers tabs use same components successfully
- No modifications needed to chart components

**Alternatives Considered**:
- Create new chart components → Rejected (unnecessary duplication)
- Use raw Chart.js → Rejected (lose existing abstractions)

### 2. API Integration Pattern

**Decision**: Single API call returning complete dataset

**Rationale**:
- API endpoint `/api/v1/reports/dashboards/trafic/traffic-usage-period` returns all required data
- Similar to Finance tab pattern
- Simpler than multiple parallel requests

**Alternatives Considered**:
- Multiple endpoint calls with forkJoin → Rejected (single endpoint provides everything)
- GraphQL query → Rejected (backend uses REST)

### 3. State Management

**Decision**: Use Angular Signals with effect() for reactive updates

**Rationale**:
- Consistent with other dashboard tabs (Finance, Subscribers, Executive)
- Works well with zoneless Angular
- DashboardStateService already provides period() and accountId() signals

**Alternatives Considered**:
- RxJS Observables only → Rejected (signals are preferred in Angular 21)
- NgRx store → Rejected (overkill for read-only dashboard)

### 4. Traffic Value Formatting

**Decision**: Create new formatTrafficValue() utility function

**Rationale**:
- Need to convert raw bytes to human-readable format (KB/MB/GB/TB/PB)
- Existing formatters don't handle traffic-specific formatting
- Function will auto-select appropriate unit based on magnitude

**Alternatives Considered**:
- Use existing currency formatter → Rejected (different domain, wrong formatting)
- Always display in GB → Rejected (loses precision for small values)

### 5. Color Consistency

**Decision**: Use same colors for same country across all charts

**Rationale**:
- Users can visually correlate Traffic chart with Subscribers chart
- Improves chart readability and comparison
- Use country index in sorted list to assign consistent colors

**Alternatives Considered**:
- Independent colors per chart → Rejected (confusing UX)
- Country-specific colors → Rejected (100+ countries exceed color palette)

### 6. Top 15 Countries Limit

**Decision**: Limit stacked bar charts to top 15 countries by total value

**Rationale**:
- More than 15 stacks makes chart unreadable
- Top 15 typically covers 90%+ of traffic
- Consistent with Finance tab approach

**Alternatives Considered**:
- Show all countries → Rejected (too many colors, unreadable)
- Top 10 → Rejected (may miss significant countries)
- Top 20 → Rejected (chart becomes cluttered)

## Existing Code Analysis

### Finance Tab (Reference Implementation)

Location: `/src/app/views/analytics/dashboard/tabs/finance/`

Key patterns to follow:
- Effect-based data loading on period/account change
- Signal-based state (loading, error, data)
- Custom legend building with color + label + value
- Stacked bar chart configuration builder

### Subscribers Tab (Reference Implementation)

Location: `/src/app/views/analytics/dashboard/tabs/subscribers/`

Key patterns to follow:
- Multiple API calls combined with forkJoin
- KPI cards from summary data
- Waterfall chart for statuses (not needed for Traffic)

### Chart Utilities

Location: `/src/app/views/analytics/dashboard/utils/chart.utils.ts`

Available functions:
- `DASHBOARD_CHART_COLORS` - 20 color palette
- `getChartColor(index)` - get color by index
- `getChartColors(count)` - get N colors

### Error Handling

Location: `/src/app/shared/utils/http/`

Available handlers:
- `handleObjectError<T>(context)` - returns null on error
- `handleArrayError<T>(context)` - returns [] on error

## API Research

### Endpoint Details

**URL**: `/api/v1/reports/dashboards/trafic/traffic-usage-period`

**Method**: GET

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | UUID | Yes | Company account identifier |
| period | string | Yes | DAY, WEEK, or MONTH grouping |
| dateFrom | datetime | Yes | Start of date range |
| dateTo | datetime | Yes | End of date range |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| currentPeriodTraffic | object | Summary for current/latest period |
| trafficByCountry | array | Traffic per period with country breakdown |
| subscribersByCountry | array | Subscribers per period with country breakdown |
| subscriberAverageTraffic | array | Average traffic per subscriber trend |

### Traffic Units

Based on API documentation, traffic values are numeric without specified unit.
Assumption: Values are in bytes (standard for traffic APIs).
Will implement auto-scaling: KB → MB → GB → TB → PB based on magnitude.

## Conclusions

All research complete. No blockers identified. Ready to proceed with implementation following established patterns from Finance and Subscribers tabs.
