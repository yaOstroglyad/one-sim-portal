# Troubleshooting & FAQ

Common issues and solutions when using CacheHub.

## Quick Diagnosis

Use these commands in browser console to diagnose issues:

```javascript
// Check cache status
window.__CACHE_HUB__.getStats()

// View all cached keys
window.__CACHE_HUB__.getKeys()

// Check specific key
window.__CACHE_HUB__.getValue('your-key')

// Clear specific key
window.__CACHE_HUB__.invalidate('your-key')
```

## Common Issues

### 🟢 Multiple HTTP Requests (FIXED)

**Problem:** Every subscription to the same Observable triggers a new HTTP request.

**Symptoms:**
- Multiple identical network requests in DevTools
- Happens when using multiple `async` pipes with the same Observable
- Component destruction/recreation triggers new requests

**✅ SOLUTION:** This is now **automatically handled** by CacheHub v2.0+!

```typescript
// ✅ This works perfectly now - no additional steps needed
@Component({
  template: `
    <div *ngFor="let item of data$ | async">{{ item.name }}</div>
    <div>Total: {{ (data$ | async)?.length }}</div>
    <div>First item: {{ (data$ | async)?.[0]?.name }}</div>
  `
})
export class MyComponent {
  // Only 1 HTTP request, even with 3 async pipes!
  data$ = this.service.getData();
}
```

**How it works:**
- CacheHub creates a `BehaviorSubject` on first call
- All subsequent subscriptions connect to the same `BehaviorSubject`
- No need for `shareReplay()` or manual Observable caching

### 🔴 Data Not Updating

**Problem:** Cache returns stale data even after server updates.

**Symptoms:**
- Form submissions succeed but UI shows old data
- Data changes in admin panel don't reflect in app
- Manual refresh fixes the issue

**Solutions:**

1. **Invalidate cache after updates:**
```typescript
updateCustomer(customer: Customer): Observable<Customer> {
  return this.api.updateCustomer(customer).pipe(
    tap(() => {
      this.hub.invalidate(`customer-${customer.id}`);
      this.hub.invalidate('customers-list');
    })
  );
}
```

2. **Use optimistic updates:**
```typescript
updateCustomer(customer: Customer): Observable<Customer> {
  // Update UI immediately
  this.hub.update<Customer[]>('customers-list', customers =>
    customers.map(c => c.id === customer.id ? customer : c)
  );
  
  // Then sync with server
  return this.api.updateCustomer(customer);
}
```

3. **Check TTL settings:**
```typescript
// Wrong - caching dynamic data too long
this.hub.fetch('live-data', this.api.getData()); // 5 minutes default

// Right - use appropriate TTL
this.hub.get('live-data', () => this.api.getData(), DataType.VOLATILE); // 1 minute
```

### 🔴 Memory Leaks

**Problem:** Memory usage grows continuously.

**Symptoms:**
- Browser becomes slow over time
- Memory usage in dev tools keeps increasing
- Application crashes after extended use

**Solutions:**

1. **Check cache size:**
```typescript
const stats = this.hub.getStats();
console.log(`Cache size: ${stats.sizeBytes / 1024 / 1024} MB`);
console.log(`Entries: ${stats.size}`);
```

2. **Implement cleanup in components:**
```typescript
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.data$ = this.hub.fetch('data', this.api.getData()).pipe(
      takeUntil(this.destroy$) // Important: unsubscribe on destroy
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

3. **Review cache key strategy:**
```typescript
// Wrong - unique keys for every request
const key = `data-${Date.now()}-${Math.random()}`;

// Right - reusable keys
const key = `user-data-${userId}`;
```

### 🔴 Cache Key Collisions

**Problem:** Different services overwrite each other's cached data.

**Symptoms:**
- Customers list shows orders data
- Wrong data appears in components
- Inconsistent behavior across modules

**Solutions:**

1. **Use namespace decorators:**
```typescript
@Injectable()
@CacheNamespace('customers')
export class CustomerService {
  getCustomers() {
    return this.hub.fetch('list', this.api.getCustomers()); // Key: 'customers:list'
  }
}

@Injectable()
@CacheNamespace('orders')
export class OrderService {
  getOrders() {
    return this.hub.fetch('list', this.api.getOrders()); // Key: 'orders:list'
  }
}
```

2. **Use descriptive cache keys:**
```typescript
// Wrong - generic keys
this.hub.fetch('data', this.api.getData());
this.hub.fetch('list', this.api.getList());

// Right - specific keys
this.hub.fetch('customer-data', this.api.getCustomerData());
this.hub.fetch('product-list', this.api.getProducts());
```

### 🔴 API Still Being Called

**Problem:** Expected cached data but API is called every time.

**Symptoms:**
- Network tab shows repeated requests
- No performance improvement
- Loading indicators appear unnecessarily

**Solutions:**

1. **Check cache key consistency:**
```typescript
// Wrong - different keys for same data
this.hub.fetch('users-1', this.api.getUsers());
this.hub.fetch('users-2', this.api.getUsers());

// Right - consistent key
this.hub.fetch('users', this.api.getUsers());
```

2. **Verify TTL hasn't expired:**
```typescript
// Check when cache expires
const stats = this.hub.getStats();
console.log('Cache entries:', stats);

// Increase TTL if needed
this.hub.fetch('data', this.api.getData(), { ttl: 10 * 60 * 1000 }); // 10 minutes
```

3. **Use same Observable instance:**
```typescript
// Wrong - creates new Observable each time
getUsers() {
  return this.hub.fetch('users', this.api.getUsers());
}

// Right - reuse Observable
users$ = this.hub.fetch('users', this.api.getUsers());
```

### 🔴 Performance Issues

**Problem:** App becomes slower after adding CacheHub.

**Symptoms:**
- Increased memory usage
- Slower navigation
- UI freezes

**Solutions:**

1. **Monitor cache size:**
```typescript
setInterval(() => {
  const stats = this.hub.getStats();
  if (stats.memoryPressure === 'high') {
    console.warn('High memory pressure, consider cache cleanup');
    this.hub.clear({ keepPersistent: true });
  }
}, 60000);
```

2. **Optimize large objects:**
```typescript
// Enable compression for large data
this.hub.fetch('large-dataset', this.api.getLargeData(), {
  compression: true
});
```

3. **Use appropriate data types:**
```typescript
// Don't cache everything for hours
this.hub.get('metrics', () => this.api.getMetrics(), DataType.VOLATILE); // 1 minute
```

### 🔴 Error Handling Issues

**Problem:** Errors not handled properly with cached data.

**Symptoms:**
- White screen when API fails
- No fallback data shown
- Error messages not user-friendly

**Solutions:**

1. **Provide fallbacks:**
```typescript
this.hub.fetch('data', this.api.getData()).pipe(
  catchError(error => {
    console.error('API failed:', error);
    return of([]); // Empty array fallback
  })
);
```

2. **Handle stale data:**
```typescript
this.hub.fetch('critical-data', this.api.getData()).pipe(
  catchError(error => {
    // Try to get stale data from cache
    const stale = this.hub.getValue('critical-data');
    if (stale) {
      console.warn('Using stale data due to API error');
      return of(stale);
    }
    throw error;
  })
);
```

## Frequently Asked Questions

### Q: How do I know if caching is working?

**A:** Check the Network tab in DevTools:
1. First navigation should show API calls
2. Subsequent navigations should show no API calls for cached data
3. Use `this.hub.getStats()` to see hit rate

### Q: When should I invalidate cache?

**A:** Invalidate when:
- Data is updated (POST, PUT, DELETE operations)
- User performs actions that change server state
- Time-sensitive data needs refresh
- User explicitly requests refresh

```typescript
// After creating/updating data
this.api.createCustomer(customer).pipe(
  tap(() => this.hub.invalidate('customers-list'))
).subscribe();
```

### Q: How much memory does CacheHub use?

**A:** Default limits:
- Max 100 cache entries
- Max 50MB total size
- Automatic cleanup when limits exceeded

Check usage:
```typescript
const stats = this.hub.getStats();
console.log(`Memory: ${stats.sizeBytes / 1024 / 1024} MB`);
```

### Q: Can I use CacheHub with server-side rendering (SSR)?

**A:** Yes, but with considerations:
- Cache is client-side only (not shared between server/client)
- Use `isPlatformBrowser()` to check environment
- Provide SSR-safe fallbacks

```typescript
constructor(
  private hub: CacheHubService,
  @Inject(PLATFORM_ID) private platformId: object
) {}

getData() {
  if (isPlatformBrowser(this.platformId)) {
    return this.hub.fetch('data', this.api.getData());
  }
  return this.api.getData(); // Direct call on server
}
```

### Q: How do I handle authentication with CacheHub?

**A:** Clear cache on auth changes:

```typescript
@Injectable()
export class AuthService {
  login(credentials: LoginData): Observable<AuthResult> {
    return this.api.login(credentials).pipe(
      tap(() => {
        // Clear cache on login
        this.hub.clear();
      })
    );
  }

  logout(): void {
    this.api.logout().subscribe(() => {
      // Clear cache on logout
      this.hub.clear();
    });
  }
}
```

### Q: Can I use CacheHub offline?

**A:** Yes, see [Offline Support guide](./advanced/offline.md) for details.

### Q: How do I test components that use CacheHub?

**A:** Mock the CacheHub service:

```typescript
const mockHub = {
  fetch: jasmine.createSpy('fetch').and.returnValue(of(mockData)),
  update: jasmine.createSpy('update'),
  invalidate: jasmine.createSpy('invalidate')
};

TestBed.configureTestingModule({
  providers: [
    { provide: CacheHubService, useValue: mockHub }
  ]
});
```

### Q: What happens during route changes?

**A:** Cache persists across route changes. This is a feature - returning to previous routes is instant.

To clear cache on route change:
```typescript
export class AppComponent {
  constructor(private router: Router, private hub: CacheHubService) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Clear volatile cache on navigation
      this.hub.invalidate(/volatile/);
    });
  }
}
```

## Performance Optimization

For advanced performance tuning, memory management, and optimization techniques, see:

**→ [Performance Optimization Guide](./advanced/performance.md)**

Key areas covered:
- Memory management and monitoring
- Intelligent preloading strategies  
- Network optimization (deduplication, batching)
- Browser storage quota management
- Real-time performance dashboards

## Getting Help

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('cache-hub-debug', 'true');
```

### Community Support
- Check existing [GitHub issues](internal-link)
- Review [patterns documentation](./patterns/)
- Ask in team Slack channel

### Reporting Issues
Include in bug reports:
1. Cache stats: `this.hub.getStats()`
2. Cache keys: `this.hub.keys()`
3. Browser console errors
4. Steps to reproduce
5. Expected vs actual behavior

## Migration Support

If migrating from existing solutions:
- **[Migration Guide](./migration-guide.md)** - Step-by-step migration
- **[API Reference](./api-reference.md)** - Complete method documentation
- **[Patterns](./patterns/)** - Common usage patterns

## Performance Monitoring

Set up monitoring dashboard:
```typescript
@Injectable()
export class CacheMonitoringService {
  constructor(private hub: CacheHubService) {
    this.setupMonitoring();
  }

  private setupMonitoring() {
    setInterval(() => {
      const stats = this.hub.getStats();
      
      // Log to analytics
      console.log('CacheHub Stats:', {
        hitRate: stats.hitRate,
        memoryMB: stats.sizeBytes / 1024 / 1024,
        entries: stats.size,
        pressure: stats.memoryPressure
      });
      
      // Alert on issues
      if (stats.hitRate < 50) {
        console.warn('Low cache hit rate:', stats.hitRate);
      }
      
      if (stats.memoryPressure === 'high') {
        console.warn('High memory pressure, consider cleanup');
      }
    }, 60000);
  }
}
```