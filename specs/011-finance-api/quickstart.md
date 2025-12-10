# Quickstart: Finance Dashboard API Integration

**Feature**: 011-finance-api
**Date**: 2025-12-10

## Overview

This feature replaces mock data in the Finance Dashboard tab with real API calls to `/api/v1/reports/dashboards/finance/period-revenue-summary`.

## Files to Modify

| File | Change |
|------|--------|
| `dashboard/models/finance.types.ts` | Add `PeriodRevenueSummaryResponse` interface |
| `dashboard/services/finance-data.service.ts` | Implement real API call + data transformation |
| `dashboard/utils/config.utils.ts` | Set `finance: false` in mock config |

## Implementation Steps

### Step 1: Add API Response Interface

Add to `finance.types.ts`:

```typescript
// API Response from period-revenue-summary endpoint
export interface PeriodRevenueSummaryResponse {
  currency: string;
  revenueByBundle: PeriodRevenueData[];
  revenueByCountry: PeriodRevenueData[];
  marginByCountry: PeriodRevenueData[];
}

export interface PeriodRevenueData {
  period: string;
  totalRevenue: number;
  revenueByGroup: RevenueGroup[];
}

export interface RevenueGroup {
  name: string;
  revenue: number;
}
```

### Step 2: Update Finance Data Service

Replace mock call with real API:

```typescript
getPeriodRevenueSummary(): Observable<PeriodRevenueSummaryResponse> {
  const period = this.stateService.getCurrentPeriod();
  const params = this.buildReportParams(period);

  return this.http.get<PeriodRevenueSummaryResponse>(
    DASHBOARD_API_CONFIG.endpoints.finance,
    { params }
  ).pipe(
    retry(HTTP_RETRY_CONFIG.retries),
    shareReplay(HTTP_RETRY_CONFIG.shareReplay)
  );
}
```

### Step 3: Update Config

In `config.utils.ts`:

```typescript
export const DEFAULT_MOCK_CONFIG: MockDataConfig = {
  executive: false,
  subscribers: false,
  traffic: true,
  finance: false  // ← Change from true
};
```

### Step 4: Update Endpoint

In `config.utils.ts`:

```typescript
finance: '/api/v1/reports/dashboards/finance/period-revenue-summary'
```

## Testing

1. Start dev server: `npm start`
2. Navigate to Dashboard → Finance tab
3. Verify charts load with real data
4. Change period filter → verify data refreshes
5. Test error state by disconnecting network

## Reference

- Pattern: `subscribers-data.service.ts`
- Types: `dashboard.types.ts`
- Charts: Uses existing `OsBarChartComponent`, `OsLineChartComponent`
