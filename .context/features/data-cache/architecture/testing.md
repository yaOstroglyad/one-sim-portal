# Testing CacheHub

Comprehensive testing strategies for CacheHub components, patterns, and integrations.

## Testing Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                         │
├─────────────────────────────────────────────────────────────┤
│  E2E Tests (Cypress/Playwright)                            │
│  ├── User workflows with caching                           │
│  ├── Offline/online transitions                            │
│  └── Performance under load                                │
├─────────────────────────────────────────────────────────────┤
│  Integration Tests (TestBed)                               │
│  ├── Service + CacheHub integration                        │
│  ├── Component + Service caching                           │
│  └── Real HTTP interceptors                                │
├─────────────────────────────────────────────────────────────┤
│  Unit Tests (Jasmine/Jest)                                 │
│  ├── CacheHub service methods                              │
│  ├── Memory management                                     │
│  ├── TTL expiration                                        │
│  └── Observable behavior                                   │
└─────────────────────────────────────────────────────────────┘
```

## Unit Testing CacheHub Service

### Basic Service Testing
```typescript
describe('CacheHubService', () => {
  let service: CacheHubService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CacheHubService,
        {
          provide: CACHE_HUB_CONFIG,
          useValue: {
            defaultTTL: 5000,
            maxCacheSize: 10,
            maxSizeBytes: 1024 * 1024
          }
        }
      ]
    });
    
    service = TestBed.inject(CacheHubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clear(); // Clean up cache between tests
  });

  describe('fetch()', () => {
    it('should cache API response', fakeAsync(() => {
      const testData = [{ id: 1, name: 'Test User' }];
      let result: any;

      // First call - should hit API
      service.fetch('users', http.get('/api/users')).subscribe(data => {
        result = data;
      });

      const req1 = httpMock.expectOne('/api/users');
      req1.flush(testData);
      tick();

      expect(result).toEqual(testData);

      // Second call - should use cache (no HTTP request)
      service.fetch('users', http.get('/api/users')).subscribe(data => {
        result = data;
      });

      httpMock.expectNone('/api/users');
      tick();

      expect(result).toEqual(testData);
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      let result: any;
      let error: any;

      service.fetch('users', http.get('/api/users')).subscribe({
        next: data => result = data,
        error: err => error = err
      });

      const req = httpMock.expectOne('/api/users');
      req.error(new ErrorEvent('Network error'));
      tick();

      expect(error).toBeDefined();
      expect(result).toBeUndefined();
    }));

    it('should respect TTL expiration', fakeAsync(() => {
      const testData = [{ id: 1, name: 'Test User' }];
      
      // First call
      service.fetch('users', http.get('/api/users'), { ttl: 1000 }).subscribe();
      const req1 = httpMock.expectOne('/api/users');
      req1.flush(testData);
      tick();

      // Wait for expiration
      tick(1001);

      // Second call after expiration - should hit API again
      service.fetch('users', http.get('/api/users')).subscribe();
      const req2 = httpMock.expectOne('/api/users');
      req2.flush(testData);
      tick();
    }));
  });

  describe('update()', () => {
    it('should update cached data', () => {
      const initialData = [{ id: 1, name: 'User 1' }];
      service.set('users', initialData);

      const updated = service.update<any[]>('users', users => [
        ...users,
        { id: 2, name: 'User 2' }
      ]);

      expect(updated).toBe(true);

      const result = service.getValue<any[]>('users');
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({ id: 2, name: 'User 2' });
    });

    it('should return false for non-existent key', () => {
      const updated = service.update('nonexistent', (data: any) => data);
      expect(updated).toBe(false);
    });
  });

  describe('invalidate()', () => {
    it('should remove specific key', () => {
      service.set('users', [{ id: 1 }]);
      service.set('products', [{ id: 1 }]);

      service.invalidate('users');

      expect(service.getValue('users')).toBeNull();
      expect(service.getValue('products')).toBeDefined();
    });

    it('should remove keys matching pattern', () => {
      service.set('user-1', { id: 1 });
      service.set('user-2', { id: 2 });
      service.set('product-1', { id: 1 });

      const removed = service.invalidate(/^user-/);

      expect(removed).toBe(2);
      expect(service.getValue('user-1')).toBeNull();
      expect(service.getValue('user-2')).toBeNull();
      expect(service.getValue('product-1')).toBeDefined();
    });
  });

  describe('memory management', () => {
    it('should evict LRU entries when size limit reached', () => {
      // Fill cache to limit
      for (let i = 0; i < 10; i++) {
        service.set(`item-${i}`, { data: `data-${i}` });
      }

      // Add one more item - should evict LRU
      service.set('item-10', { data: 'data-10' });

      const stats = service.getStats();
      expect(stats.size).toBe(10); // Should not exceed limit
      expect(service.getValue('item-0')).toBeNull(); // LRU item evicted
      expect(service.getValue('item-10')).toBeDefined(); // New item present
    });
  });

  describe('getStats()', () => {
    it('should return accurate cache statistics', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      
      // Generate some hits and misses
      service.getValue('key1'); // hit
      service.getValue('key1'); // hit
      service.getValue('nonexistent'); // miss

      const stats = service.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(66.67); // 2/3 * 100
    });
  });
});
```

### Testing Data Types
```typescript
describe('CacheHub Data Types', () => {
  let service: CacheHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheHubService]
    });
    service = TestBed.inject(CacheHubService);
  });

  it('should apply correct TTL for STATIC data', fakeAsync(() => {
    const spy = spyOn(service, 'fetch').and.callThrough();
    
    service.getStatic('countries', of(['US', 'CA'])).subscribe();
    tick();

    expect(spy).toHaveBeenCalledWith('countries', jasmine.any(Observable), {
      ttl: 24 * 60 * 60 * 1000 // 24 hours
    });
  }));

  it('should apply correct TTL for VOLATILE data', fakeAsync(() => {
    const spy = spyOn(service, 'get').and.callThrough();
    
    service.get('metrics', () => of({ count: 100 }), DataType.VOLATILE).subscribe();
    tick();

    expect(spy).toHaveBeenCalledWith('metrics', jasmine.any(Function), DataType.VOLATILE);
  }));
});
```

## Testing Service Integration

### Service with CacheHub Testing
```typescript
describe('CustomerService with CacheHub', () => {
  let service: CustomerService;
  let cacheHub: jasmine.SpyObj<CacheHubService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const hubSpy = jasmine.createSpyObj('CacheHubService', [
      'fetch', 'update', 'invalidate', 'getValue'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CustomerService,
        { provide: CacheHubService, useValue: hubSpy }
      ]
    });

    service = TestBed.inject(CustomerService);
    cacheHub = TestBed.inject(CacheHubService) as jasmine.SpyObj<CacheHubService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should cache customers list', () => {
    const testCustomers = [{ id: 1, name: 'Test Customer' }];
    cacheHub.fetch.and.returnValue(of(testCustomers));

    service.getCustomers().subscribe(customers => {
      expect(customers).toEqual(testCustomers);
    });

    expect(cacheHub.fetch).toHaveBeenCalledWith(
      'customers:list',
      jasmine.any(Observable)
    );
  });

  it('should update cache when creating customer', () => {
    const newCustomer = { name: 'New Customer', email: 'test@example.com' };
    const createdCustomer = { id: 1, ...newCustomer };
    
    cacheHub.update.and.returnValue(true);

    service.createCustomer(newCustomer).subscribe();

    const req = httpMock.expectOne('/api/customers');
    req.flush(createdCustomer);

    expect(cacheHub.update).toHaveBeenCalledWith(
      'customers:list',
      jasmine.any(Function)
    );
  });

  it('should invalidate cache when deleting customer', () => {
    service.deleteCustomer('1').subscribe();

    const req = httpMock.expectOne('/api/customers/1');
    req.flush({});

    expect(cacheHub.invalidate).toHaveBeenCalledWith('customers:detail-1');
    expect(cacheHub.invalidate).toHaveBeenCalledWith('customers:list');
  });
});
```

### Namespace Testing
```typescript
describe('@CacheNamespace decorator', () => {
  @CacheNamespace('test')
  class TestService {
    constructor(public hub: CacheHubService) {}

    getData(): Observable<any> {
      return this.hub.fetch('data', of({ test: true }));
    }
  }

  let service: TestService;
  let cacheHub: jasmine.SpyObj<CacheHubService>;

  beforeEach(() => {
    const hubSpy = jasmine.createSpyObj('CacheHubService', ['fetch']);
    
    TestBed.configureTestingModule({
      providers: [
        TestService,
        { provide: CacheHubService, useValue: hubSpy }
      ]
    });

    service = TestBed.inject(TestService);
    cacheHub = TestBed.inject(CacheHubService) as jasmine.SpyObj<CacheHubService>;
  });

  it('should automatically namespace cache keys', () => {
    cacheHub.fetch.and.returnValue(of({ test: true }));

    service.getData().subscribe();

    expect(cacheHub.fetch).toHaveBeenCalledWith(
      'test:data',
      jasmine.any(Observable)
    );
  });
});
```

## Component Testing

### Component with Cached Data
```typescript
describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('CustomerService', ['getCustomers']);

    TestBed.configureTestingModule({
      declarations: [CustomerListComponent],
      imports: [CommonModule],
      providers: [
        { provide: CustomerService, useValue: serviceSpy }
      ]
    });

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    customerService = TestBed.inject(CustomerService) as jasmine.SpyObj<CustomerService>;
  });

  it('should display cached customers', fakeAsync(() => {
    const testCustomers = [
      { id: 1, name: 'Customer 1' },
      { id: 2, name: 'Customer 2' }
    ];

    customerService.getCustomers.and.returnValue(of(testCustomers));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const customerElements = fixture.debugElement.queryAll(
      By.css('.customer-item')
    );
    
    expect(customerElements).toHaveLength(2);
    expect(customerElements[0].nativeElement.textContent).toContain('Customer 1');
  }));

  it('should handle loading states', fakeAsync(() => {
    customerService.getCustomers.and.returnValue(
      of([]).pipe(delay(1000))
    );

    component.ngOnInit();
    fixture.detectChanges();

    // Should show loading initially
    expect(fixture.debugElement.query(By.css('.loading'))).toBeTruthy();

    tick(1000);
    fixture.detectChanges();

    // Should hide loading after data loads
    expect(fixture.debugElement.query(By.css('.loading'))).toBeFalsy();
  }));
});
```

### Testing OnPush Components
```typescript
describe('CustomerListComponent with OnPush', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let cdr: ChangeDetectorRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerListComponent],
      providers: [CustomerService, CacheHubService]
    });

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should trigger change detection when cache updates', fakeAsync(() => {
    const spy = spyOn(cdr, 'markForCheck');
    
    component.ngOnInit();
    tick();

    // Simulate cache update
    component.refreshData();
    tick();

    expect(spy).toHaveBeenCalled();
  }));
});
```

## Performance Testing

### Load Testing
```typescript
describe('CacheHub Performance', () => {
  let service: CacheHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheHubService]
    });
    service = TestBed.inject(CacheHubService);
  });

  it('should handle concurrent requests efficiently', fakeAsync(() => {
    const testData = { data: 'test' };
    let completedRequests = 0;

    // Create 100 concurrent requests for same key
    const requests = Array.from({ length: 100 }, () =>
      service.fetch('test-key', of(testData)).subscribe(() => {
        completedRequests++;
      })
    );

    tick();

    expect(completedRequests).toBe(100);
    
    // Should only have made one actual API call (others served from cache)
    const stats = service.getStats();
    expect(stats.hits + stats.misses).toBe(100);
    expect(stats.hits).toBe(99); // First request is miss, rest are hits
  }));

  it('should maintain performance with large datasets', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      data: `item-${i}`,
      metadata: { timestamp: Date.now() }
    }));

    const startTime = performance.now();
    
    service.set('large-dataset', largeData);
    const retrieved = service.getValue('large-dataset');
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(retrieved).toEqual(largeData);
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should handle memory pressure gracefully', () => {
    // Fill cache with large objects
    for (let i = 0; i < 50; i++) {
      const largeObject = {
        id: i,
        data: 'x'.repeat(100000) // 100KB of data
      };
      service.set(`large-${i}`, largeObject);
    }

    const stats = service.getStats();
    
    // Should have triggered eviction
    expect(stats.size).toBeLessThanOrEqual(50);
    expect(stats.memoryPressure).not.toBe('high');
  });
});
```

### Memory Leak Testing
```typescript
describe('Memory Leak Prevention', () => {
  let service: CacheHubService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheHubService]
    });
    service = TestBed.inject(CacheHubService);
  });

  it('should clean up subscriptions on cache clear', () => {
    const subscriptions: Subscription[] = [];
    
    // Create multiple subscriptions
    for (let i = 0; i < 10; i++) {
      const sub = service.fetch(`key-${i}`, of(`data-${i}`)).subscribe();
      subscriptions.push(sub);
    }

    service.clear();

    // All subscriptions should be closed
    subscriptions.forEach(sub => {
      expect(sub.closed).toBe(true);
    });
  });

  it('should not accumulate expired entries', fakeAsync(() => {
    // Add entries with short TTL
    for (let i = 0; i < 100; i++) {
      service.set(`temp-${i}`, `data-${i}`, { ttl: 1000 });
    }

    expect(service.getStats().size).toBe(100);

    // Wait for expiration
    tick(1001);

    // Trigger cleanup
    tick(60000); // Automatic cleanup interval

    // Expired entries should be cleaned up
    expect(service.getStats().size).toBe(0);
  }));
});
```

## E2E Testing

### Cypress E2E Tests
```typescript
// cypress/integration/cache-performance.spec.ts
describe('Cache Performance E2E', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should load dashboard tabs instantly after first load', () => {
    // First tab load - measure time
    cy.get('[data-cy=customers-tab]').click();
    cy.get('[data-cy=customers-loading]').should('be.visible');
    cy.get('[data-cy=customers-data]').should('be.visible');
    
    // Switch to another tab
    cy.get('[data-cy=orders-tab]').click();
    cy.get('[data-cy=orders-data]').should('be.visible');
    
    // Return to customers tab - should be instant (cached)
    const startTime = performance.now();
    cy.get('[data-cy=customers-tab]').click().then(() => {
      const loadTime = performance.now() - startTime;
      expect(loadTime).to.be.lessThan(100); // Should be nearly instant
    });
    
    cy.get('[data-cy=customers-data]').should('be.visible');
    cy.get('[data-cy=customers-loading]').should('not.exist');
  });

  it('should work offline', () => {
    // Load data while online
    cy.get('[data-cy=customers-tab]').click();
    cy.get('[data-cy=customers-data]').should('be.visible');
    
    // Simulate offline
    cy.window().then(win => {
      win.navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    });
    
    cy.get('[data-cy=offline-indicator]').should('be.visible');
    
    // Navigate to different tab - should still work with cached data
    cy.get('[data-cy=orders-tab]').click();
    cy.get('[data-cy=orders-data]').should('be.visible');
    
    // Return to customers - should show cached data
    cy.get('[data-cy=customers-tab]').click();
    cy.get('[data-cy=customers-data]').should('be.visible');
  });
});
```

## Test Utilities

### Cache Testing Helpers
```typescript
export class CacheTestingUtils {
  static createMockCacheHub(): jasmine.SpyObj<CacheHubService> {
    const spy = jasmine.createSpyObj('CacheHubService', [
      'fetch', 'get', 'set', 'update', 'invalidate', 'clear',
      'getValue', 'getStats', 'has', 'keys'
    ]);

    // Default implementations
    spy.fetch.and.callFake((key: string, apiCall: Observable<any>) => apiCall);
    spy.get.and.callFake((key: string, fetchFn: () => Observable<any>) => fetchFn());
    spy.set.and.stub();
    spy.update.and.returnValue(true);
    spy.invalidate.and.returnValue(1);
    spy.clear.and.stub();
    spy.getValue.and.returnValue(null);
    spy.getStats.and.returnValue({
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      sizeBytes: 0,
      memoryPressure: 'low'
    });
    spy.has.and.returnValue(false);
    spy.keys.and.returnValue([]);

    return spy;
  }

  static simulateApiDelay<T>(data: T, delay: number = 1000): Observable<T> {
    return of(data).pipe(delay(delay));
  }

  static simulateApiError(errorMessage: string = 'API Error'): Observable<never> {
    return throwError(() => new Error(errorMessage));
  }

  static measurePerformance<T>(operation: () => T): { result: T; duration: number } {
    const startTime = performance.now();
    const result = operation();
    const duration = performance.now() - startTime;
    
    return { result, duration };
  }

  static async measureAsyncPerformance<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;
    
    return { result, duration };
  }

  static createLargeTestData(size: number): any[] {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`,
      data: 'x'.repeat(100) // Add some bulk
    }));
  }

  static expectCacheHit(cacheHub: jasmine.SpyObj<CacheHubService>, key: string): void {
    expect(cacheHub.getValue).toHaveBeenCalledWith(key);
  }

  static expectCacheMiss(cacheHub: jasmine.SpyObj<CacheHubService>, key: string): void {
    expect(cacheHub.fetch).toHaveBeenCalledWith(key, jasmine.any(Observable));
  }
}
```

### Test Data Factories
```typescript
export class TestDataFactory {
  static createCustomer(overrides: Partial<Customer> = {}): Customer {
    return {
      id: '1',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+1234567890',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createCustomers(count: number): Customer[] {
    return Array.from({ length: count }, (_, i) =>
      this.createCustomer({
        id: (i + 1).toString(),
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`
      })
    );
  }

  static createPagedResult<T>(items: T[], page: number = 1, size: number = 20): PagedResult<T> {
    return {
      items,
      totalCount: items.length,
      page,
      size,
      totalPages: Math.ceil(items.length / size)
    };
  }
}
```

## Best Practices for Testing

### ✅ DO

1. **Test cache behavior explicitly**
   ```typescript
   expect(cacheHub.fetch).toHaveBeenCalledTimes(1); // First call hits API
   expect(cacheHub.getValue).toHaveBeenCalledTimes(1); // Second call uses cache
   ```

2. **Test TTL expiration**
   ```typescript
   tick(ttlDuration + 1);
   expect(cacheHub.fetch).toHaveBeenCalledTimes(2); // Expired, hits API again
   ```

3. **Test memory management**
   ```typescript
   // Fill cache beyond limit and verify eviction
   expect(service.getStats().size).toBeLessThanOrEqual(maxSize);
   ```

4. **Mock external dependencies**
   ```typescript
   const mockApi = jasmine.createSpyObj('ApiService', ['getData']);
   mockApi.getData.and.returnValue(of(testData));
   ```

5. **Test error scenarios**
   ```typescript
   mockApi.getData.and.returnValue(throwError('API Error'));
   // Verify graceful degradation
   ```

### ❌ DON'T

1. **Don't test implementation details**
   ```typescript
   // Wrong - testing internal cache structure
   expect(service['cache'].has('key')).toBe(true);
   
   // Right - testing public behavior
   expect(service.getValue('key')).toBeDefined();
   ```

2. **Don't forget to clean up**
   ```typescript
   afterEach(() => {
     service.clear(); // Prevent test interference
   });
   ```

3. **Don't rely on timing in unit tests**
   ```typescript
   // Wrong - unreliable
   setTimeout(() => expect(something).toBe(true), 1000);
   
   // Right - use fakeAsync
   tick(1000);
   expect(something).toBe(true);
   ```

## Performance Benchmarks

Set up benchmarks to ensure CacheHub maintains performance:

```typescript
describe('Performance Benchmarks', () => {
  it('should fetch 1000 cached items in under 10ms', () => {
    // Setup cache with 1000 items
    for (let i = 0; i < 1000; i++) {
      service.set(`item-${i}`, { id: i, data: `data-${i}` });
    }

    const startTime = performance.now();
    
    // Fetch all items
    for (let i = 0; i < 1000; i++) {
      service.getValue(`item-${i}`);
    }
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(10);
  });
});
```

This testing approach ensures CacheHub works correctly, performs well, and handles edge cases gracefully across all layers of your application.