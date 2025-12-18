# Data Model: Traffic Dashboard Tab

**Feature**: 015-traffic-dashboard
**Date**: 2025-12-16

## API Response Types

### Root Response

```typescript
/**
 * Response from GET /api/v1/reports/dashboards/trafic/traffic-usage-period
 */
export interface TrafficUsagePeriodResponse {
  /** Summary for current/latest period */
  currentPeriodTraffic: CurrentPeriodTraffic;

  /** Traffic per period with country breakdown */
  trafficByCountry: PeriodTrafficData[];

  /** Subscribers per period with country breakdown */
  subscribersByCountry: PeriodSubscriberData[];

  /** Average traffic per subscriber trend */
  subscriberAverageTraffic: AverageTrafficData[];
}
```

### Period Traffic Data

```typescript
/**
 * Current period summary with country breakdown
 */
export interface CurrentPeriodTraffic {
  /** Period date (ISO format) */
  period: string;

  /** Total traffic for the period (in bytes) */
  totalTraffic: number;

  /** Traffic breakdown by country */
  countryTraffics: CountryTraffic[];
}

/**
 * Traffic data for a single period
 */
export interface PeriodTrafficData {
  /** Period date (ISO format) */
  period: string;

  /** Total traffic for the period (in bytes) */
  totalTraffic: number;

  /** Traffic breakdown by country */
  countryTraffics: CountryTraffic[];
}

/**
 * Traffic amount for a specific country
 */
export interface CountryTraffic {
  /** Country name */
  country: string;

  /** Traffic amount (in bytes) */
  traffic: number;
}
```

### Period Subscriber Data

```typescript
/**
 * Subscriber data for a single period
 */
export interface PeriodSubscriberData {
  /** Period date (ISO format) */
  period: string;

  /** Total subscribers for the period */
  totalSubscribers: number;

  /** Subscriber breakdown by country */
  countrySubscribers: CountrySubscribers[];
}

/**
 * Subscriber count for a specific country
 */
export interface CountrySubscribers {
  /** Country name */
  country: string;

  /** Number of subscribers */
  subscribers: number;
}
```

### Average Traffic Data

```typescript
/**
 * Average traffic per subscriber for a single period
 */
export interface AverageTrafficData {
  /** Period date (ISO format) */
  period: string;

  /** Average traffic per subscriber (in bytes) */
  traffic: number;
}
```

## UI State Types

### KPI Card Values

```typescript
/**
 * Calculated KPI values for display
 */
export interface TrafficKpiValues {
  /** Total traffic formatted (e.g., "1.24 TB") */
  totalTraffic: string;

  /** Raw total traffic in bytes */
  totalTrafficRaw: number;

  /** Number of countries with traffic > 0 */
  activeCountries: number;

  /** Country name with highest traffic */
  topCountry: string;

  /** Average traffic per subscriber formatted (e.g., "2.4 GB") */
  avgTrafficPerSubscriber: string;

  /** Raw average traffic in bytes */
  avgTrafficPerSubscriberRaw: number;
}
```

### Chart Legend Item

```typescript
/**
 * Legend item for stacked bar charts
 */
export interface ChartLegendItem {
  /** Display label (country name) */
  label: string;

  /** Color from chart palette */
  color: string;

  /** Total value for this item */
  value: number;

  /** Formatted value for display */
  formattedValue: string;
}
```

### Chart Configuration

```typescript
/**
 * Stacked bar chart configuration
 */
export interface StackedBarChartConfig {
  /** Chart type */
  type: 'bar';

  /** Chart data */
  data: {
    /** X-axis labels (periods) */
    labels: string[];

    /** Datasets (one per country) */
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      stack: string;
    }>;
  };

  /** Legend items for custom legend */
  legendItems: ChartLegendItem[];

  /** Chart.js options */
  options: object;
}

/**
 * Line chart configuration
 */
export interface LineChartConfig {
  /** Chart type */
  type: 'line';

  /** Chart data */
  data: {
    /** X-axis labels (periods) */
    labels: string[];

    /** Single dataset */
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }>;
  };

  /** Chart.js options */
  options: object;
}
```

## Request Types

### API Request Parameters

```typescript
/**
 * Query parameters for traffic API
 */
export interface TrafficQueryParams {
  /** Company account UUID */
  accountId: string;

  /** Period grouping: DAY, WEEK, or MONTH */
  period: 'DAY' | 'WEEK' | 'MONTH';

  /** Start of date range (ISO datetime) */
  dateFrom: string;

  /** End of date range (ISO datetime) */
  dateTo: string;
}
```

## Type Relationships

```
TrafficUsagePeriodResponse
├── currentPeriodTraffic: CurrentPeriodTraffic
│   └── countryTraffics: CountryTraffic[]
├── trafficByCountry: PeriodTrafficData[]
│   └── countryTraffics: CountryTraffic[]
├── subscribersByCountry: PeriodSubscriberData[]
│   └── countrySubscribers: CountrySubscribers[]
└── subscriberAverageTraffic: AverageTrafficData[]

UI State
├── TrafficKpiValues (derived from currentPeriodTraffic + subscriberAverageTraffic)
├── StackedBarChartConfig (built from trafficByCountry/subscribersByCountry)
│   └── ChartLegendItem[]
└── LineChartConfig (built from subscriberAverageTraffic)
```

## Validation Rules

| Field | Rule |
|-------|------|
| period | Must be valid ISO date string |
| totalTraffic | Must be >= 0 |
| traffic | Must be >= 0 |
| totalSubscribers | Must be >= 0 |
| subscribers | Must be >= 0 |
| country | Non-empty string |

## Empty State Handling

| Condition | Behavior |
|-----------|----------|
| `trafficByCountry.length === 0` | Show "No traffic data" message |
| `countryTraffics.length === 0` | Show single "No data" bar |
| `totalTraffic === 0` | Show "0 KB" in KPI card |
| All arrays empty | Show full empty state with message |
