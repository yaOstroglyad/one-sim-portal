# Future: Angular Signals Support

CacheHub roadmap for Angular Signals integration when your project upgrades to Angular 16+.

## Migration Strategy

CacheHub is designed for **zero breaking changes** when migrating to Signals. All existing Observable-based code will continue working while new Signals API becomes available.

### Current Observable API (Maintained)
```typescript
// This approach will remain fully supported
users$ = this.hub.fetch('users', this.http.get<User[]>('/api/users'));
```

### Future Signals API (Added)
```typescript
// New Signals support (Angular 16+)
users = this.hub.fetchSignal('users', this.http.get<User[]>('/api/users'));

// Computed signals with cache dependencies
userCount = computed(() => this.users().length);
activeUsers = computed(() => this.users().filter(u => u.active));
```

## Migration Timeline

### Phase 1: Dual API Support
```typescript
interface CacheHubService {
  // Current Observable methods (maintained)
  fetch<T>(key: string, apiCall: Observable<T>): Observable<T>;
  
  // New Signals methods (added)
  fetchSignal<T>(key: string, apiCall: Observable<T>): Signal<T>;
  updateSignal<T>(key: string, updater: (current: T) => T): void;
}
```

### Phase 2: Component Migration
```typescript
// Before (Observable)
@Component({
  template: `<div *ngFor="let user of users$ | async">{{ user.name }}</div>`
})
export class UserListComponent {
  users$ = this.hub.fetch('users', this.api.getUsers());
}

// After (Signals)
@Component({
  template: `<div *ngFor="let user of users()">{{ user.name }}</div>`
})
export class UserListComponent {
  users = this.hub.fetchSignal('users', this.api.getUsers());
}
```

### Phase 3: Advanced Signals Features
```typescript
export class DashboardService {
  // Cached signals
  private customers = this.hub.fetchSignal('customers', this.api.getCustomers());
  private orders = this.hub.fetchSignal('orders', this.api.getOrders());
  
  // Computed signals from cached data
  activeCustomers = computed(() => 
    this.customers().filter(c => c.status === 'active')
  );
  
  todayOrders = computed(() => 
    this.orders().filter(o => isToday(o.createdAt))
  );
  
  // Combined metrics
  dashboardMetrics = computed(() => ({
    totalCustomers: this.customers().length,
    activeCustomers: this.activeCustomers().length,
    todayRevenue: this.todayOrders().reduce((sum, o) => sum + o.total, 0)
  }));
}
```

## Backward Compatibility

**Zero Breaking Changes:**
- All existing Observable-based code continues to work
- CacheHub maintains dual API support
- Migration is opt-in and gradual

**Migration Tools:**
```typescript
// Utility to convert Observable cache to Signal
function toSignal<T>(observable$: Observable<T>): Signal<T> {
  return toSignal(observable$, { initialValue: undefined });
}

// Service helper for dual support
@Injectable()
export class UserService {
  // Observable API (existing)
  getUsers(): Observable<User[]> {
    return this.hub.fetch('users', this.api.getUsers());
  }
  
  // Signals API (new)
  getUsersSignal(): Signal<User[]> {
    return this.hub.fetchSignal('users', this.api.getUsers());
  }
}
```

## Performance Benefits with Signals

1. **Automatic Change Detection:** No need for OnPush strategy
2. **Fine-grained Updates:** Only affected components re-render
3. **Computed Efficiency:** Automatic dependency tracking
4. **Memory Efficiency:** Automatic cleanup of unused signals

## Configuration

```typescript
// Future configuration
@NgModule({
  providers: [
    {
      provide: CACHE_HUB_CONFIG,
      useValue: {
        signalsEnabled: true,          // Enable Signals API
        defaultMode: 'observable',     // Keep Observable as default
        autoMigrationWarnings: true    // Warn about available Signal alternatives
      }
    }
  ]
})
```

## Implementation Roadmap

- **Phase 1:** Core CacheHub implementation (Current)
- **Phase 2:** Observable API stabilization
- **Phase 3:** Signals API addition (Angular 16+ projects)
- **Phase 4:** Migration tools and documentation

This future-proof design ensures your investment in CacheHub patterns and knowledge transfers seamlessly to Angular Signals when you're ready to migrate.