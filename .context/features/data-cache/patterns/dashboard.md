# Dashboard Optimization

Eliminate slow tab switching and repeated API calls in multi-tab dashboards.

## Problem

Dashboard with multiple tabs making 3-5 API calls each. Every tab switch triggers new HTTP requests, causing:
- 1-2 second delays when switching tabs
- Unnecessary server load
- Poor user experience
- Wasted bandwidth

## Solution

Cache each tab's data independently with appropriate TTL for metrics vs details.

## Basic Implementation

### Dashboard Component
```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <mat-tab-group (selectedTabChange)="onTabChange($event)">
      <mat-tab label="Executive">
        <app-executive-dashboard [metrics$]="executiveMetrics$" />
      </mat-tab>
      <mat-tab label="Subscribers">
        <app-subscriber-dashboard [data$]="subscriberData$" />
      </mat-tab>
      <mat-tab label="Traffic">
        <app-traffic-dashboard [data$]="trafficData$" />
      </mat-tab>
      <mat-tab label="Finance">
        <app-finance-dashboard [data$]="financeData$" />
      </mat-tab>
    </mat-tab-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  executiveMetrics$: Observable<ExecutiveMetrics>;
  subscriberData$: Observable<SubscriberData>;
  trafficData$: Observable<TrafficData>;
  financeData$: Observable<FinanceData>;
  
  currentTab = 0;

  constructor(
    private hub: CacheHubService,
    private dashboardApi: DashboardApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load initial tab data
    this.loadTabData(0);
    
    // Prefetch next tab for smooth UX
    this.prefetchNextTab();
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.currentTab = event.index;
    this.loadTabData(event.index);
    this.prefetchNextTab();
  }

  private loadTabData(tabIndex: number): void {
    const period = this.getCurrentPeriod();
    
    switch (tabIndex) {
      case 0: // Executive
        this.executiveMetrics$ = this.hub.get(
          `executive-${this.serializePeriod(period)}`,
          () => this.dashboardApi.getExecutiveMetrics(period),
          DataType.VOLATILE // 1 minute cache for fresh metrics
        );
        break;
        
      case 1: // Subscribers
        this.subscriberData$ = this.hub.get(
          `subscribers-${this.serializePeriod(period)}`,
          () => this.dashboardApi.getSubscriberData(period),
          { ttl: 5 * 60 * 1000 } // 5 minutes for subscriber data
        );
        break;
        
      case 2: // Traffic
        this.trafficData$ = this.hub.get(
          `traffic-${this.serializePeriod(period)}`,
          () => this.dashboardApi.getTrafficData(period),
          DataType.BUSINESS // 5 minutes default
        );
        break;
        
      case 3: // Finance
        this.financeData$ = this.hub.get(
          `finance-${this.serializePeriod(period)}`,
          () => this.dashboardApi.getFinanceData(period),
          { ttl: 10 * 60 * 1000 } // 10 minutes for financial data
        );
        break;
    }
  }

  private prefetchNextTab(): void {
    // Prefetch adjacent tabs for instant switching
    const nextTab = (this.currentTab + 1) % 4;
    const prevTab = this.currentTab > 0 ? this.currentTab - 1 : 3;
    
    // Load in background without assigning to component properties
    const period = this.getCurrentPeriod();
    
    setTimeout(() => {
      this.prefetchTabData(nextTab, period);
      this.prefetchTabData(prevTab, period);
    }, 100); // Small delay to not interfere with current tab
  }

  private prefetchTabData(tabIndex: number, period: DateRange): void {
    switch (tabIndex) {
      case 0:
        this.hub.get(`executive-${this.serializePeriod(period)}`, 
          () => this.dashboardApi.getExecutiveMetrics(period), DataType.VOLATILE).subscribe();
        break;
      case 1:
        this.hub.get(`subscribers-${this.serializePeriod(period)}`, 
          () => this.dashboardApi.getSubscriberData(period)).subscribe();
        break;
      case 2:
        this.hub.get(`traffic-${this.serializePeriod(period)}`, 
          () => this.dashboardApi.getTrafficData(period)).subscribe();
        break;
      case 3:
        this.hub.get(`finance-${this.serializePeriod(period)}`, 
          () => this.dashboardApi.getFinanceData(period)).subscribe();
        break;
    }
  }
}
```

## Advanced: Service-based Approach

### Dashboard Service
```typescript
@Injectable({ providedIn: 'root' })
@CacheNamespace('dashboard')
export class DashboardService {
  constructor(
    private hub: CacheHubService,
    private api: DashboardApiService
  ) {}

  // Executive metrics with short TTL
  getExecutiveMetrics(period: DateRange): Observable<ExecutiveMetrics> {
    const key = `executive-${this.serializePeriod(period)}`;
    return this.hub.get(key, () => this.api.getExecutiveMetrics(period), DataType.VOLATILE);
  }

  // Subscriber growth chart
  getSubscriberGrowth(period: DateRange): Observable<ChartData> {
    const key = `subscriber-growth-${this.serializePeriod(period)}`;
    return this.hub.get(key, () => this.api.getSubscriberGrowth(period), {
      ttl: 5 * 60 * 1000 // 5 minutes for charts
    });
  }

  // Demographics data
  getDemographics(period: DateRange): Observable<DemographicsData> {
    const key = `demographics-${this.serializePeriod(period)}`;
    return this.hub.get(key, () => this.api.getDemographics(period), {
      ttl: 15 * 60 * 1000 // 15 minutes - demographics change slowly
    });
  }

  // Traffic by country
  getTrafficByCountry(period: DateRange): Observable<TrafficData[]> {
    const key = `traffic-country-${this.serializePeriod(period)}`;
    return this.hub.get(key, () => this.api.getTrafficByCountry(period));
  }

  // Financial summary
  getFinancialSummary(period: DateRange): Observable<FinancialSummary> {
    const key = `finance-summary-${this.serializePeriod(period)}`;
    return this.hub.get(key, () => this.api.getFinancialSummary(period), {
      ttl: 10 * 60 * 1000 // 10 minutes for financial data
    });
  }

  // Bulk prefetch for a tab
  prefetchTabData(tab: DashboardTab, period: DateRange): Observable<void> {
    const requests: Observable<any>[] = [];
    
    switch (tab) {
      case 'executive':
        requests.push(
          this.getExecutiveMetrics(period),
          this.getSubscriberGrowth(period)
        );
        break;
      case 'subscribers':
        requests.push(
          this.getSubscriberGrowth(period),
          this.getDemographics(period)
        );
        break;
      case 'traffic':
        requests.push(
          this.getTrafficByCountry(period)
        );
        break;
      case 'finance':
        requests.push(
          this.getFinancialSummary(period)
        );
        break;
    }
    
    return forkJoin(requests).pipe(map(() => void 0));
  }

  // Invalidate when period changes
  invalidatePeriod(period: DateRange): void {
    const periodStr = this.serializePeriod(period);
    this.hub.invalidate(new RegExp(`-${periodStr}$`));
  }

  private serializePeriod(period: DateRange): string {
    return `${period.start.getTime()}-${period.end.getTime()}`;
  }
}
```

### Simplified Component
```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-header">
      <app-date-range-picker (periodChange)="onPeriodChange($event)" />
    </div>
    
    <mat-tab-group (selectedTabChange)="onTabChange($event)">
      <mat-tab label="Executive">
        <app-executive-dashboard 
          [metrics$]="dashboardService.getExecutiveMetrics(currentPeriod)"
          [growth$]="dashboardService.getSubscriberGrowth(currentPeriod)">
        </app-executive-dashboard>
      </mat-tab>
      
      <mat-tab label="Subscribers">
        <app-subscriber-dashboard 
          [growth$]="dashboardService.getSubscriberGrowth(currentPeriod)"
          [demographics$]="dashboardService.getDemographics(currentPeriod)">
        </app-subscriber-dashboard>
      </mat-tab>
      
      <mat-tab label="Traffic">
        <app-traffic-dashboard 
          [data$]="dashboardService.getTrafficByCountry(currentPeriod)">
        </app-traffic-dashboard>
      </mat-tab>
      
      <mat-tab label="Finance">
        <app-finance-dashboard 
          [summary$]="dashboardService.getFinancialSummary(currentPeriod)">
        </app-finance-dashboard>
      </mat-tab>
    </mat-tab-group>
  `
})
export class DashboardComponent {
  currentPeriod: DateRange = this.getDefaultPeriod();
  currentTab = 0;

  constructor(public dashboardService: DashboardService) {}

  onTabChange(event: MatTabChangeEvent): void {
    this.currentTab = event.index;
    
    // Prefetch adjacent tabs
    const nextTab = (event.index + 1) % 4;
    const prevTab = event.index > 0 ? event.index - 1 : 3;
    
    this.dashboardService.prefetchTabData(this.getTabName(nextTab), this.currentPeriod).subscribe();
    this.dashboardService.prefetchTabData(this.getTabName(prevTab), this.currentPeriod).subscribe();
  }

  onPeriodChange(period: DateRange): void {
    this.currentPeriod = period;
    
    // Invalidate old period data
    this.dashboardService.invalidatePeriod(period);
    
    // Prefetch current tab data for new period
    const currentTabName = this.getTabName(this.currentTab);
    this.dashboardService.prefetchTabData(currentTabName, period).subscribe();
  }
}
```

## Performance Results

### Before CacheHub
```
Initial load: 2.1s (all tabs make API calls)
Tab switch 1: 1.8s (Subscribers → Executive)
Tab switch 2: 1.5s (Executive → Traffic)  
Tab switch 3: 1.9s (Traffic → Finance)
Return to tab: 1.7s (Finance → Subscribers)
```

### After CacheHub
```
Initial load: 2.1s (same - first load always hits API)
Tab switch 1: 0ms (cached)
Tab switch 2: 0ms (prefetched)
Tab switch 3: 0ms (prefetched)
Return to tab: 0ms (cached)
```

**Improvement:** 95%+ reduction in tab switching time.

## Best Practices

### 1. Cache Key Strategy
```typescript
// ✅ Include all relevant parameters
const key = `metrics-${userId}-${period}-${filters}`;

// ❌ Too generic
const key = 'metrics';
```

### 2. TTL by Data Freshness
```typescript
// Real-time metrics - 1 minute
DataType.VOLATILE

// Historical charts - 5 minutes  
{ ttl: 5 * 60 * 1000 }

// Demographics - 15 minutes
{ ttl: 15 * 60 * 1000 }
```

### 3. Smart Prefetching
```typescript
// Prefetch adjacent tabs only
const adjacentTabs = [currentTab - 1, currentTab + 1].filter(t => t >= 0 && t < totalTabs);
adjacentTabs.forEach(tab => this.prefetchTab(tab));
```

### 4. Period Change Handling
```typescript
onPeriodChange(newPeriod: DateRange): void {
  // Clear cache for old period
  this.dashboardService.invalidatePeriod(this.currentPeriod);
  
  // Update period
  this.currentPeriod = newPeriod;
  
  // Prefetch current tab data
  this.prefetchCurrentTab();
}
```

## Common Pitfalls

### ❌ Caching Too Long
```typescript
// Wrong - metrics cached for 1 hour
this.hub.get('live-metrics', this.api.getMetrics(), DataType.REFERENCE);
```

### ❌ Not Including Parameters in Key
```typescript
// Wrong - different periods overwrite each other
this.hub.fetch('revenue', this.api.getRevenue(period));
```

### ❌ Over-prefetching
```typescript
// Wrong - prefetching all tabs wastes bandwidth
this.prefetchAllTabs();
```

## Troubleshooting

### Stale Data in Metrics
**Problem:** Metrics show old values
**Solution:** Use `DataType.VOLATILE` or shorter TTL

### Memory Usage Growing
**Problem:** Too many cached period combinations
**Solution:** Limit period cache with invalidation

### Slow Initial Load
**Problem:** All tabs load on first visit
**Solution:** Only load current tab, prefetch on demand

## Next Steps

- **[Lists & Pagination](./lists-pagination.md)** - Cache paginated data
- **[Real-time Updates](./real-time.md)** - Sync WebSocket data with cache
- **[Performance Tuning](../advanced/performance.md)** - Advanced optimization techniques