# Performance Optimization

Advanced techniques to maximize CacheHub performance and minimize memory usage.

## Memory Management

### Cache Size Monitoring
```typescript
@Injectable()
export class CachePerformanceService {
  constructor(private hub: CacheHubService) {
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring(): void {
    setInterval(() => {
      const stats = this.hub.getStats();
      
      console.log('Cache Performance:', {
        entries: stats.size,
        memoryMB: (stats.sizeBytes / 1024 / 1024).toFixed(2),
        hitRate: `${stats.hitRate}%`,
        pressure: stats.memoryPressure
      });

      // Alert if memory usage is high
      if (stats.memoryPressure === 'high') {
        this.handleHighMemoryPressure();
      }
    }, 60000); // Check every minute
  }

  private handleHighMemoryPressure(): void {
    // Clear volatile caches first
    this.hub.invalidate(/volatile/);
    
    // If still high, clear business data older than 10 minutes
    this.hub.clearExpired();
    
    // Last resort: clear all non-persistent data
    if (this.hub.getStats().memoryPressure === 'high') {
      this.hub.clear({ keepPersistent: true });
    }
  }
}
```

### Intelligent Preloading
```typescript
@Injectable()
export class PreloadingService {
  constructor(
    private hub: CacheHubService,
    private router: Router
  ) {
    this.setupIntelligentPreloading();
  }

  private setupIntelligentPreloading(): void {
    // Preload based on user behavior patterns
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      debounceTime(1000)
    ).subscribe(url => {
      this.preloadForRoute(url);
    });
  }

  private preloadForRoute(url: string): void {
    const predictions = this.predictNextRoutes(url);
    
    predictions.forEach(route => {
      this.preloadDataForRoute(route);
    });
  }

  private predictNextRoutes(currentUrl: string): string[] {
    // Simple prediction based on common navigation patterns
    if (currentUrl.includes('/customers')) {
      return ['/orders', '/products', '/dashboard'];
    }
    if (currentUrl.includes('/dashboard')) {
      return ['/customers', '/analytics'];
    }
    return [];
  }

  private preloadDataForRoute(route: string): void {
    switch (route) {
      case '/customers':
        this.hub.fetch('customers-preload', this.api.getCustomers()).subscribe();
        break;
      case '/orders':
        this.hub.fetch('orders-preload', this.api.getOrders()).subscribe();
        break;
    }
  }
}
```

## Compression & Serialization

### Large Object Optimization
```typescript
interface CacheOptions {
  compression?: boolean;
  compressionThreshold?: number; // Default: 1MB
}

// Usage for large datasets
this.hub.fetch('large-dataset', this.api.getLargeData(), {
  compression: true,
  compressionThreshold: 500 * 1024 // 500KB
});
```

### Custom Serialization
```typescript
interface CustomSerializable {
  serialize(): string;
  deserialize(data: string): this;
}

class OptimizedCustomer implements CustomSerializable {
  constructor(
    public id: string,
    public name: string,
    public metadata: any
  ) {}

  serialize(): string {
    // Custom compact serialization
    return JSON.stringify({
      i: this.id,
      n: this.name,
      m: this.metadata
    });
  }

  deserialize(data: string): this {
    const parsed = JSON.parse(data);
    this.id = parsed.i;
    this.name = parsed.n;
    this.metadata = parsed.m;
    return this;
  }
}
```

## Network Optimization

### Request Deduplication
```typescript
@Injectable()
export class DeduplicatedApiService {
  private pendingRequests = new Map<string, Observable<any>>();

  constructor(private hub: CacheHubService) {}

  getCustomers(): Observable<Customer[]> {
    const key = 'customers';
    
    // Check if request is already in flight
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const request$ = this.hub.fetch(key, this.api.getCustomers()).pipe(
      finalize(() => {
        // Clean up when request completes
        this.pendingRequests.delete(key);
      }),
      shareReplay(1)
    );

    this.pendingRequests.set(key, request$);
    return request$;
  }
}
```

### Batch Loading
```typescript
@Injectable()
export class BatchLoadingService {
  private loadQueue = new Map<string, Subject<any>>();
  private batchTimer: any;

  constructor(private hub: CacheHubService) {}

  loadCustomer(id: string): Observable<Customer> {
    // Add to batch queue
    if (!this.loadQueue.has(id)) {
      this.loadQueue.set(id, new Subject<Customer>());
    }

    // Schedule batch execution
    this.scheduleBatchLoad();

    return this.loadQueue.get(id)!.asObservable();
  }

  private scheduleBatchLoad(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.executeBatchLoad();
      this.batchTimer = null;
    }, 50); // 50ms batching window
  }

  private executeBatchLoad(): void {
    const idsToLoad = Array.from(this.loadQueue.keys());
    
    if (idsToLoad.length === 0) return;

    // Single API call for multiple IDs
    this.api.getCustomersBatch(idsToLoad).subscribe(customers => {
      customers.forEach(customer => {
        // Cache individual customers
        this.hub.set(`customer-${customer.id}`, customer);
        
        // Notify waiting subjects
        const subject = this.loadQueue.get(customer.id);
        if (subject) {
          subject.next(customer);
          subject.complete();
        }
      });

      // Clear queue
      this.loadQueue.clear();
    });
  }
}
```

## Browser Storage Optimization

### Storage Quota Management
```typescript
@Injectable()
export class StorageQuotaService {
  async checkStorageQuota(): Promise<StorageInfo> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
      };
    }
    
    return { used: 0, available: 0, percentage: 0 };
  }

  async manageStorageQuota(): Promise<void> {
    const info = await this.checkStorageQuota();
    
    if (info.percentage > 80) {
      // Clear old cache entries
      this.hub.clearExpired();
      
      // Clear non-essential data
      this.hub.invalidate(/^temp-/);
    }
  }
}
```

### IndexedDB Integration
```typescript
interface PersistentCacheOptions {
  persistToIndexedDB?: boolean;
  indexedDBVersion?: number;
}

@Injectable()
export class IndexedDBCacheService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CacheHub', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiration', 'expiration');
        }
      };
    });
  }

  async persistToIndexedDB<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    const cacheEntry = {
      key,
      data,
      expiration: Date.now() + ttl,
      timestamp: Date.now()
    };

    await store.put(cacheEntry);
  }

  async getFromIndexedDB<T>(key: string): Promise<T | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (result && result.expiration > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  }
}
```

## Performance Metrics

### Real-time Performance Dashboard
```typescript
@Component({
  selector: 'app-cache-performance',
  template: `
    <div class="performance-dashboard">
      <div class="metric-card">
        <h3>Cache Hit Rate</h3>
        <div class="metric-value">{{ hitRate }}%</div>
      </div>
      
      <div class="metric-card">
        <h3>Memory Usage</h3>
        <div class="metric-value">{{ memoryUsage }} MB</div>
      </div>
      
      <div class="metric-card">
        <h3>Active Entries</h3>
        <div class="metric-value">{{ activeEntries }}</div>
      </div>
      
      <div class="performance-chart">
        <canvas #performanceChart></canvas>
      </div>
    </div>
  `
})
export class CachePerformanceComponent implements OnInit {
  hitRate = 0;
  memoryUsage = 0;
  activeEntries = 0;

  constructor(private hub: CacheHubService) {}

  ngOnInit(): void {
    this.startPerformanceMonitoring();
  }

  private startPerformanceMonitoring(): void {
    interval(1000).subscribe(() => {
      const stats = this.hub.getStats();
      
      this.hitRate = Math.round(stats.hitRate);
      this.memoryUsage = Math.round(stats.sizeBytes / 1024 / 1024);
      this.activeEntries = stats.size;
    });
  }
}
```

## Best Practices Summary

### ✅ DO
1. **Monitor memory usage** regularly
2. **Use compression** for large objects
3. **Batch API requests** when possible
4. **Preload predictable data**
5. **Clean up expired entries** periodically

### ❌ DON'T
1. **Cache everything** indefinitely
2. **Ignore memory pressure** warnings
3. **Use blocking operations** in cache logic
4. **Store sensitive data** in cache
5. **Forget to test** cache performance under load

## Performance Testing

### Load Testing
```typescript
describe('CacheHub Performance', () => {
  it('should handle 1000 concurrent requests', async () => {
    const requests = Array.from({ length: 1000 }, (_, i) =>
      hub.fetch(`test-${i}`, of(`data-${i}`)).toPromise()
    );

    const startTime = performance.now();
    await Promise.all(requests);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
  });

  it('should maintain hit rate above 80%', () => {
    // Simulate real usage patterns
    for (let i = 0; i < 100; i++) {
      hub.fetch('popular-data', of('data')).subscribe();
    }

    const stats = hub.getStats();
    expect(stats.hitRate).toBeGreaterThan(80);
  });
});
```

## Memory Profiling

### Browser DevTools Integration
```typescript
// Add to development builds only
if (!environment.production) {
  // Expose cache stats to global scope for debugging
  (window as any).__CACHE_HUB__ = {
    getStats: () => this.hub.getStats(),
    getKeys: () => this.hub.keys(),
    clear: () => this.hub.clear(),
    getValue: (key: string) => this.hub.getValue(key)
  };
}