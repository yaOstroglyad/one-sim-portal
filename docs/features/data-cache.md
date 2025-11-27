# CacheHub — Intelligent Caching System

> **Status:** Ready for Implementation
> **Last Updated:** 2025-11-26

Intelligent caching system for Angular applications with automatic TTL, memory management, and reactive data flow.

---

## Overview

Eliminate repetitive API calls and improve user experience with zero-configuration smart caching.

**Before:** Every navigation triggers new API calls
**After:** First call loads data, subsequent calls are instant

```typescript
// Transform this slow pattern:
this.customers$ = this.http.get('/api/customers'); // 500ms every time

// Into this fast pattern:
this.customers$ = this.cacheHub.get(
  'customers:all',
  () => this.http.get('/api/customers'),
  { dataType: DataType.BUSINESS }
); // 500ms → 0ms
```

## Key Benefits

- **Zero Setup** - Works out of the box with smart defaults
- **Instant Navigation** - Cached data loads in 0ms
- **Smart TTL** - Automatic cache duration by data type
- **Subscription Safe** - No need for shareReplay - handles multiple subscriptions automatically
- **Memory Safe** - LRU eviction prevents memory bloat

## Performance Impact

| Scenario | Before | After |
|----------|--------|-------|
| Dashboard tab switching | 1.5s | 0ms |
| List → detail → list | 800ms | 0ms |
| Repeated searches | 600ms | 0ms |

---

## Quick Start

### Step 1: Add to Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CacheHubService, DataType } from '@shared/services/cache-hub';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);

  getCustomers(): Observable<Customer[]> {
    return this.cacheHub.get(
      'customers:all',
      () => this.http.get<Customer[]>('/api/customers'),
      { dataType: DataType.BUSINESS }
    );
  }
}
```

**No shareReplay needed** - CacheHub handles multiple subscriptions automatically!

### Step 2: Choose Data Type

```typescript
// Static data - cached for 24 hours
{ dataType: DataType.STATIC }    // Countries, currencies, config

// Reference data - cached for 1 hour
{ dataType: DataType.REFERENCE } // Categories, product types

// Business data - cached for 5 minutes (default)
{ dataType: DataType.BUSINESS }  // Products, orders, customers

// User data - cached for 30 minutes
{ dataType: DataType.USER }      // User profile, preferences

// Volatile data - cached for 1 minute
{ dataType: DataType.VOLATILE }  // Metrics, dashboard stats
```

### Step 3: Use in Component

```typescript
@Component({
  template: `
    <div *ngFor="let customer of customers$ | async">{{ customer.name }}</div>
    <div>Total: {{ (customers$ | async)?.length }}</div>
  `
})
export class CustomerListComponent {
  // Multiple async pipes = Only 1 HTTP request!
  customers$ = this.customerService.getCustomers();
}
```

---

## API Reference

### Core Method: `get<T>()`

```typescript
cacheHub.get<T>(
  key: string,                    // Unique cache identifier
  factory: () => Observable<T>,   // Called only on cache miss
  options?: { dataType, ttl },    // Cache configuration
  namespace?: string              // Optional namespace
): Observable<T>
```

### Cache Management

```typescript
// Update cached data without API call
cacheHub.update<User[]>('users', users => [...users, newUser]);

// Force refresh
cacheHub.invalidate('customers');

// Clear with pattern
cacheHub.invalidatePattern('default:customers:');

// Get current value synchronously
const users = cacheHub.getValue<User[]>('users');

// Check if cached
if (cacheHub.has('users')) { ... }
```

### DataType TTL Values

| DataType | TTL | Use For |
|----------|-----|---------|
| STATIC | 24 hours | Countries, currencies |
| REFERENCE | 1 hour | Categories, lookups |
| BUSINESS | 5 minutes | Products, orders |
| USER | 30 minutes | Profile, preferences |
| VOLATILE | 1 minute | Metrics, counts |
| TRANSIENT | 30 seconds | Real-time data |

---

## Common Patterns

### Dashboard with Tabs

```typescript
@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="Customers">
        <customer-list [data$]="customers$"></customer-list>
      </mat-tab>
      <mat-tab label="Orders">
        <order-list [data$]="orders$"></order-list>
      </mat-tab>
    </mat-tab-group>
  `
})
export class DashboardComponent {
  customers$ = this.customerService.getCustomers();
  orders$ = this.orderService.getOrders();
}
```

First tab switch = API call, subsequent switches = instant!

### Master-Detail Navigation

```typescript
// List loads instantly when returning from detail
products$ = this.productService.getProducts();

// Detail is cached too
product$ = this.productService.getById(this.id);
```

### Cache Invalidation on Update

```typescript
updateCustomer(customer: Customer): Observable<Customer> {
  return this.http.put(`/api/customers/${customer.id}`, customer).pipe(
    tap(() => {
      this.cacheHub.invalidatePattern(`default:customers:`);
    })
  );
}
```

---

## Migration from Direct HTTP

```typescript
// Before
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users');
}

// After
getUsers(): Observable<User[]> {
  return this.cacheHub.get(
    'users:all',
    () => this.http.get<User[]>('/api/users'),
    { dataType: DataType.BUSINESS }
  );
}
```

## Migration from shareReplay

```typescript
// Before - manual shareReplay management
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users').pipe(
    shareReplay(1)  // Remove this!
  );
}

// After - CacheHub handles it
getUsers(): Observable<User[]> {
  return this.cacheHub.get(
    'users:all',
    () => this.http.get<User[]>('/api/users'),
    { dataType: DataType.BUSINESS }
  );
}
```

---

## Best Practices

1. **Use descriptive cache keys:** `customer-orders-2024` not `data`
2. **Include namespace in invalidation:** `'default:resource:'` not `'resource:'`
3. **Choose appropriate data types:** Don't cache volatile data for hours
4. **Invalidate related data:** When updating, clear dependent caches
5. **Handle errors gracefully:** Use `handleArrayError`/`handleObjectError`

## Troubleshooting

### Cache not updating after mutation
```typescript
// Always invalidate after POST/PUT/DELETE
tap(() => this.cacheHub.invalidatePattern('default:resource:'))
```

### Multiple HTTP requests despite caching
- Check cache key is exactly the same
- Ensure you're using the same service instance (providedIn: 'root')
- Verify dataType is set

### Memory growing too large
- Use appropriate TTL (don't cache everything for 24 hours)
- Call `cacheHub.clear()` on logout
- Check for cache key collisions

---

**Location:** `/src/app/shared/services/cache-hub/`
