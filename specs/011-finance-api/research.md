# Research: Finance Dashboard API Integration

**Feature**: 011-finance-api
**Date**: 2025-12-10

## 1. API Endpoint Analysis

### Decision: Use GET method with query parameters

**Rationale**: The API endpoint `/api/v1/reports/dashboards/finance/period-revenue-summary` follows the same pattern as subscribers endpoints which use GET with query params.

**Alternatives considered**:
- POST with body — rejected because subscribers endpoints use GET and this maintains consistency

### API Contract

```
GET /api/v1/reports/dashboards/finance/period-revenue-summary
Query Parameters:
  - accountId: UUID (required)
  - period: string (e.g., "LAST_MONTH", "LAST_QUARTER")
  - dateFrom: ISO 8601 datetime
  - dateTo: ISO 8601 datetime

Response:
{
  "currency": "string",
  "revenueByBundle": [
    {
      "period": "2025-12-10",
      "totalRevenue": number,
      "revenueByGroup": [
        { "name": "string", "revenue": number }
      ]
    }
  ],
  "revenueByCountry": [...same structure...],
  "marginByCountry": [...same structure...]
}
```

## 2. Data Mapping Strategy

### Decision: Transform API response to FinanceAnalytics in service layer

**Rationale**: The existing `FinanceAnalytics` interface expects a different structure (with chartConfig, loading states). The service should:
1. Fetch raw API response
2. Transform to `FinanceAnalytics` format
3. Build chart configurations from data

**Alternatives considered**:
- Transform in component — rejected because it violates separation of concerns
- Create new interface — rejected because existing UI depends on FinanceAnalytics

### Mapping Details

| API Field | Maps To | Notes |
|-----------|---------|-------|
| `currency` | `FinanceAnalytics.currency` | New field to add |
| `revenueByBundle` | `topBundles.data` | Aggregate by bundle name |
| `revenueByCountry` | `topCountries.data` | Aggregate by country name |
| `marginByCountry` | `marginByMonth.data` | Transform period data |

## 3. Existing Pattern Analysis

### Decision: Follow subscribers-data.service.ts pattern

**Rationale**: The subscribers service already implements the correct pattern for dashboard API calls:
- Uses `DashboardStateService` for period/accountId
- Uses `buildSubscriberReportParams()` for query params
- Uses retry and shareReplay operators
- Returns typed response directly

**Key patterns to replicate**:
```typescript
// From subscribers-data.service.ts
private buildSubscriberReportParams(period: DashboardPeriod): Record<string, string> {
  const params: Record<string, string> = {
    dateFrom: period.startDate.toISOString(),
    dateTo: period.endDate.toISOString(),
    period: this.stateService.mapPeriodToApiEnum(period.preset)
  };
  const currentAccountId = this.stateService.getAccountId();
  if (currentAccountId) {
    params['accountId'] = currentAccountId;
  }
  return params;
}
```

## 4. Error Handling

### Decision: Use catchError with createErrorResponse for wrapped response

**Rationale**: Current finance-data.service.ts already uses `wrapResponse()` and `createErrorResponse()` pattern. This should be maintained for consistency with error display component.

**Alternatives considered**:
- Return raw response like subscribers — would require UI changes, rejected

## 5. Config Change

### Decision: Set `finance: false` in DEFAULT_MOCK_CONFIG

**Rationale**: Simple boolean flag in `config.utils.ts` controls mock vs real API. Same pattern used for executive and subscribers tabs.

**Location**: `/src/app/views/analytics/dashboard/utils/config.utils.ts`

```typescript
export const DEFAULT_MOCK_CONFIG: MockDataConfig = {
  executive: false,
  subscribers: false,
  traffic: true,
  finance: false  // Change from true to false
};
```

## 6. Endpoint Configuration

### Decision: Add finance endpoint to DASHBOARD_API_CONFIG

**Rationale**: Currently finance endpoint is `/api/v1/dashboard/finance` (mock). Need to update to real endpoint.

**Change**:
```typescript
endpoints: {
  // ... existing
  finance: '/api/v1/reports/dashboards/finance/period-revenue-summary'
}
```

## Summary

All technical decisions resolved. No NEEDS CLARIFICATION items remain. Ready for Phase 1.
