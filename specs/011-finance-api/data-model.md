# Data Model: Finance Dashboard API Integration

**Feature**: 011-finance-api
**Date**: 2025-12-10

## API Response Types (New)

### PeriodRevenueSummaryResponse

Main API response from `/api/v1/reports/dashboards/finance/period-revenue-summary`

```typescript
interface PeriodRevenueSummaryResponse {
  currency: string;
  revenueByBundle: PeriodRevenueData[];
  revenueByCountry: PeriodRevenueData[];
  marginByCountry: PeriodRevenueData[];
}
```

### PeriodRevenueData

Single period entry with grouped revenue data

```typescript
interface PeriodRevenueData {
  period: string;           // ISO date "2025-12-10"
  totalRevenue: number;
  revenueByGroup: RevenueGroup[];
}
```

### RevenueGroup

Individual group within a period (bundle name or country name)

```typescript
interface RevenueGroup {
  name: string;
  revenue: number;
}
```

## Existing Types (No Changes Needed)

### FinanceAnalytics (existing)

Located at `/src/app/views/analytics/dashboard/models/finance.types.ts`

The service will transform `PeriodRevenueSummaryResponse` → `FinanceAnalytics` to maintain UI compatibility.

## Entity Relationships

```
PeriodRevenueSummaryResponse
├── revenueByBundle[]
│   └── PeriodRevenueData
│       └── revenueByGroup[] → RevenueGroup
├── revenueByCountry[]
│   └── PeriodRevenueData
│       └── revenueByGroup[] → RevenueGroup
└── marginByCountry[]
    └── PeriodRevenueData
        └── revenueByGroup[] → RevenueGroup
```

## Transformation Logic

### API → Chart Data Mapping

| API Array | Target Chart | Aggregation |
|-----------|--------------|-------------|
| `revenueByBundle[].revenueByGroup[]` | Top Bundles Bar Chart | Sum revenue by bundle name |
| `revenueByCountry[].revenueByGroup[]` | Top Countries Bar Chart | Sum revenue by country name |
| `marginByCountry[]` | Margin Line Chart | Plot totalRevenue by period |

### Sample Transformation

```typescript
// Input: API response
{
  "revenueByBundle": [
    {
      "period": "2025-01",
      "totalRevenue": 15000,
      "revenueByGroup": [
        { "name": "Bundle A", "revenue": 10000 },
        { "name": "Bundle B", "revenue": 5000 }
      ]
    }
  ]
}

// Output: Chart data for topBundles
{
  labels: ["Bundle A", "Bundle B"],
  datasets: [{
    data: [10000, 5000],
    backgroundColor: [...]
  }]
}
```

## File Locations

| Type | Location |
|------|----------|
| New API types | `/src/app/views/analytics/dashboard/models/finance.types.ts` |
| Existing FinanceAnalytics | Same file (no changes) |
| Transformation logic | `/src/app/views/analytics/dashboard/services/finance-data.service.ts` |
