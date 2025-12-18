# Quickstart: Traffic Dashboard Tab

**Feature**: 015-traffic-dashboard
**Date**: 2025-12-16

## Prerequisites

- Angular 21.0.5 (Zoneless) environment running
- Access to `/api/v1/reports/dashboards/trafic/traffic-usage-period` endpoint
- Existing dashboard infrastructure (DashboardStateService, chart components)

## Implementation Order

### Step 1: Cleanup Legacy Code

```bash
# Delete old traffic tab files
rm -rf src/app/views/analytics/dashboard/tabs/traffic/
rm -f src/app/views/analytics/dashboard/services/traffic-data.service.ts
rm -f src/app/views/analytics/dashboard/models/traffic.types.ts
```

Remove imports and references from:
- `dashboard.component.ts`
- `dashboard.component.html`
- `dashboard-data.service.ts`
- `mock-data.service.ts`
- `config.utils.ts`

### Step 2: Create Types

**File**: `src/app/views/analytics/dashboard/models/traffic.types.ts`

```typescript
export interface TrafficUsagePeriodResponse {
  currentPeriodTraffic: CurrentPeriodTraffic;
  trafficByCountry: PeriodTrafficData[];
  subscribersByCountry: PeriodSubscriberData[];
  subscriberAverageTraffic: AverageTrafficData[];
}

export interface CurrentPeriodTraffic {
  period: string;
  totalTraffic: number;
  countryTraffics: CountryTraffic[];
}

export interface PeriodTrafficData {
  period: string;
  totalTraffic: number;
  countryTraffics: CountryTraffic[];
}

export interface CountryTraffic {
  country: string;
  traffic: number;
}

export interface PeriodSubscriberData {
  period: string;
  totalSubscribers: number;
  countrySubscribers: CountrySubscribers[];
}

export interface CountrySubscribers {
  country: string;
  subscribers: number;
}

export interface AverageTrafficData {
  period: string;
  traffic: number;
}
```

### Step 3: Create Traffic Service

**File**: `src/app/views/analytics/dashboard/services/traffic-data.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleObjectError } from '@shared/utils';
import { TrafficUsagePeriodResponse } from '../models/traffic.types';
import { DASHBOARD_API_CONFIG } from '../utils/config.utils';

@Injectable({ providedIn: 'root' })
export class TrafficDataService {
  private readonly http = inject(HttpClient);

  getTrafficData(
    accountId: string,
    period: string,
    dateFrom: string,
    dateTo: string
  ): Observable<TrafficUsagePeriodResponse | null> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('period', period)
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);

    return this.http
      .get<TrafficUsagePeriodResponse>(DASHBOARD_API_CONFIG.endpoints.traffic, { params })
      .pipe(catchError(handleObjectError<TrafficUsagePeriodResponse>('fetching traffic data')));
  }
}
```

### Step 4: Create Traffic Utilities

**File**: `src/app/views/analytics/dashboard/utils/traffic.utils.ts`

```typescript
import { DASHBOARD_CHART_COLORS, getChartColor } from './chart.utils';
import {
  TrafficUsagePeriodResponse,
  PeriodTrafficData,
  PeriodSubscriberData,
  AverageTrafficData
} from '../models/traffic.types';

const TRAFFIC_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatTrafficValue(bytes: number): string {
  if (bytes === 0) return '0 B';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  return `${value.toFixed(2)} ${TRAFFIC_UNITS[i]}`;
}

export function calculateKpiValues(data: TrafficUsagePeriodResponse) {
  const { currentPeriodTraffic, subscriberAverageTraffic } = data;

  return {
    totalTraffic: formatTrafficValue(currentPeriodTraffic?.totalTraffic || 0),
    totalTrafficRaw: currentPeriodTraffic?.totalTraffic || 0,
    activeCountries: currentPeriodTraffic?.countryTraffics?.length || 0,
    topCountry: getTopCountry(currentPeriodTraffic?.countryTraffics || []),
    avgTrafficPerSubscriber: formatTrafficValue(getLatestAvgTraffic(subscriberAverageTraffic)),
    avgTrafficPerSubscriberRaw: getLatestAvgTraffic(subscriberAverageTraffic)
  };
}

function getTopCountry(countryTraffics: Array<{ country: string; traffic: number }>): string {
  if (!countryTraffics?.length) return '-';
  return countryTraffics.reduce((a, b) => a.traffic > b.traffic ? a : b).country;
}

function getLatestAvgTraffic(data: AverageTrafficData[]): number {
  if (!data?.length) return 0;
  return data[data.length - 1].traffic;
}

export function buildTrafficByCountryChartConfig(
  data: PeriodTrafficData[],
  maxCountries = 15
) {
  // Get all unique countries and their totals
  const countryTotals = new Map<string, number>();

  data.forEach(period => {
    period.countryTraffics.forEach(ct => {
      countryTotals.set(ct.country, (countryTotals.get(ct.country) || 0) + ct.traffic);
    });
  });

  // Sort and limit to top N
  const topCountries = Array.from(countryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCountries)
    .map(([country]) => country);

  // Build datasets
  const periods = data.map(d => formatPeriodLabel(d.period));
  const datasets = topCountries.map((country, index) => ({
    label: country,
    data: data.map(period => {
      const ct = period.countryTraffics.find(c => c.country === country);
      return ct ? ct.traffic / (1024 * 1024 * 1024) : 0; // Convert to GB
    }),
    backgroundColor: getChartColor(index),
    stack: 'stack0'
  }));

  // Build legend items
  const legendItems = topCountries.map((country, index) => ({
    label: country,
    color: getChartColor(index),
    value: countryTotals.get(country) || 0,
    formattedValue: formatTrafficValue(countryTotals.get(country) || 0)
  }));

  return {
    type: 'bar' as const,
    data: { labels: periods, datasets },
    legendItems,
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: 'Traffic (GB)' } }
      }
    }
  };
}

export function buildSubscribersByCountryChartConfig(
  data: PeriodSubscriberData[],
  maxCountries = 15
) {
  // Similar pattern to traffic chart
  const countryTotals = new Map<string, number>();

  data.forEach(period => {
    period.countrySubscribers.forEach(cs => {
      countryTotals.set(cs.country, (countryTotals.get(cs.country) || 0) + cs.subscribers);
    });
  });

  const topCountries = Array.from(countryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCountries)
    .map(([country]) => country);

  const periods = data.map(d => formatPeriodLabel(d.period));
  const datasets = topCountries.map((country, index) => ({
    label: country,
    data: data.map(period => {
      const cs = period.countrySubscribers.find(c => c.country === country);
      return cs ? cs.subscribers : 0;
    }),
    backgroundColor: getChartColor(index),
    stack: 'stack0'
  }));

  const legendItems = topCountries.map((country, index) => ({
    label: country,
    color: getChartColor(index),
    value: countryTotals.get(country) || 0,
    formattedValue: (countryTotals.get(country) || 0).toLocaleString()
  }));

  return {
    type: 'bar' as const,
    data: { labels: periods, datasets },
    legendItems,
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: 'Subscribers' } }
      }
    }
  };
}

export function buildAverageTrafficChartConfig(data: AverageTrafficData[]) {
  const periods = data.map(d => formatPeriodLabel(d.period));
  const values = data.map(d => d.traffic / (1024 * 1024 * 1024)); // Convert to GB

  return {
    type: 'line' as const,
    data: {
      labels: periods,
      datasets: [{
        label: 'Avg Traffic/Subscriber',
        data: values,
        borderColor: DASHBOARD_CHART_COLORS[0],
        backgroundColor: DASHBOARD_CHART_COLORS[0].replace('0.8', '0.2'),
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { title: { display: true, text: 'Traffic (GB)' } }
      }
    }
  };
}

function formatPeriodLabel(period: string): string {
  const date = new Date(period);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
```

### Step 5: Create Traffic Tab Component

**File**: `src/app/views/analytics/dashboard/tabs/traffic/traffic-tab.component.ts`

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { TrafficDataService } from '../../services/traffic-data.service';
import {
  calculateKpiValues,
  buildTrafficByCountryChartConfig,
  buildSubscribersByCountryChartConfig,
  buildAverageTrafficChartConfig
} from '../../utils/traffic.utils';
// Import required components...

@Component({
  selector: 'os-traffic-tab',
  standalone: true,
  templateUrl: './traffic-tab.component.html',
  styleUrls: ['./traffic-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, /* other imports */]
})
export class TrafficTabComponent {
  private readonly dashboardState = inject(DashboardStateService);
  private readonly trafficService = inject(TrafficDataService);

  // State signals
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly kpiValues = signal<any>(null);
  readonly trafficChartConfig = signal<any>(null);
  readonly subscribersChartConfig = signal<any>(null);
  readonly avgTrafficChartConfig = signal<any>(null);

  constructor() {
    effect(() => {
      const period = this.dashboardState.period();
      const accountId = this.dashboardState.accountId();

      if (accountId) {
        this.loadData();
      }
    });
  }

  private loadData(): void {
    const period = this.dashboardState.period();
    const accountId = this.dashboardState.accountId();

    if (!accountId || !period) return;

    this.loading.set(true);
    this.error.set(null);

    this.trafficService.getTrafficData(
      accountId,
      this.dashboardState.mapPeriodToApiEnum(period.preset),
      period.startDate.toISOString(),
      period.endDate.toISOString()
    ).subscribe({
      next: (data) => {
        if (data) {
          this.kpiValues.set(calculateKpiValues(data));
          this.trafficChartConfig.set(buildTrafficByCountryChartConfig(data.trafficByCountry));
          this.subscribersChartConfig.set(buildSubscribersByCountryChartConfig(data.subscribersByCountry));
          this.avgTrafficChartConfig.set(buildAverageTrafficChartConfig(data.subscriberAverageTraffic));
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load traffic data');
        this.loading.set(false);
      }
    });
  }

  onRetry(): void {
    this.loadData();
  }
}
```

### Step 6: Enable Traffic Tab

**In `dashboard.component.ts`**, change traffic tab to enabled:

```typescript
tabs = signal<DashboardTab[]>([
  { id: 'executive', label: 'dashboard.tabs.executive', icon: 'cilChartPie', disabled: false },
  { id: 'subscribers', label: 'dashboard.tabs.subscribers', icon: 'cilPeople', disabled: false },
  { id: 'traffic', label: 'dashboard.tabs.traffic', icon: 'cilSpeedometer', disabled: false }, // Changed!
  { id: 'finance', label: 'dashboard.tabs.finance', icon: 'cilDollar', disabled: false }
]);
```

### Step 7: Add API Endpoint

**In `config.utils.ts`**, add traffic endpoint:

```typescript
export const DASHBOARD_API_CONFIG = {
  endpoints: {
    executive: { /* ... */ },
    subscribers: { /* ... */ },
    traffic: '/api/v1/reports/dashboards/trafic/traffic-usage-period', // Add this
    finance: '/api/v1/reports/dashboards/finance/period-revenue-summary'
  }
};
```

## Verification Checklist

- [ ] Old traffic files deleted
- [ ] Old traffic references removed from existing files
- [ ] New types created in `traffic.types.ts`
- [ ] TrafficDataService created and working
- [ ] Traffic utilities created and tested
- [ ] TrafficTabComponent created with all visualizations
- [ ] Traffic tab enabled in dashboard navigation
- [ ] API endpoint configured
- [ ] All 4 visualizations render correctly
- [ ] Loading/error states work properly
- [ ] Account/period filtering triggers data refresh

## Common Issues

### API Returns Empty Data
- Check accountId is correct
- Verify date range has data
- Check API logs for errors

### Charts Not Rendering
- Verify Chart.js is imported
- Check console for errors
- Ensure data format matches expected schema

### Colors Not Consistent
- Ensure same country list is used for both charts
- Use index-based color assignment from sorted list
