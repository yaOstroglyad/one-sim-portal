# Quick Start Guide

Get CacheHub working in your Angular app in under 5 minutes.

## Step 1: Basic Setup

### Add to Your Service
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CacheHubService, DataType } from '../shared/services/cache-hub';

@Injectable()
export class CustomerService {
  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService  // ← Add this
  ) {}

  getCustomers(): Observable<Customer[]> {
    // Replace this:
    // return this.http.get<Customer[]>('/api/customers');
    
    // With this:
    return this.cacheHub.get(
      'customers:all',
      () => this.http.get<Customer[]>('/api/customers'),
      { dataType: DataType.BUSINESS }
    );
  }
}
```

**That's it!** Your first call will hit the API, subsequent calls return cached data instantly.  
**No shareReplay needed** - CacheHub handles multiple subscriptions automatically using BehaviorSubject!

## Step 2: Understanding Data Types

CacheHub automatically chooses cache duration based on data type:

```typescript
export class DataService {
  constructor(private cacheHub: CacheHubService, private api: ApiService) {}

  // Static data - cached for 24 hours
  getCountries(): Observable<Country[]> {
    return this.cacheHub.get(
      'countries:all',
      () => this.api.getCountries(),
      { dataType: DataType.STATIC }
    );
  }

  // Business data - cached for 5 minutes (default)
  getProducts(): Observable<Product[]> {
    return this.cacheHub.get(
      'products:all',
      () => this.api.getProducts(),
      { dataType: DataType.BUSINESS }
    );
  }

  // User data - cached for 30 minutes
  getUserProfile(): Observable<User> {
    return this.cacheHub.get(
      'user:profile',
      () => this.api.getProfile(),
      { dataType: DataType.USER }
    );
  }

  // Volatile data - cached for 1 minute
  getMetrics(): Observable<Metrics> {
    return this.cacheHub.get(
      'metrics:dashboard',
      () => this.api.getMetrics(),
      { dataType: DataType.VOLATILE }
    );
  }
}
```

## Step 3: Updating Cached Data

### Optimistic Updates (No API Call)
```typescript
addCustomer(customer: Customer): void {
  // Update UI immediately
  this.hub.update<Customer[]>('customers', customers => [...customers, customer]);
  
  // Then save to server
  this.api.createCustomer(customer).subscribe();
}

editCustomer(id: string, changes: Partial<Customer>): void {
  // Update specific item
  this.hub.update<Customer[]>('customers', customers =>
    customers.map(c => c.id === id ? { ...c, ...changes } : c)
  );
}
```

### Force Refresh
```typescript
refreshData(): void {
  this.hub.invalidate('customers');  // Clear cache
  this.customers$ = this.hub.fetch('customers', this.api.getCustomers());
}
```

## Step 4: Namespace for Modules

Prevent cache key collisions between different modules:

```typescript
import { CacheNamespace } from '../shared/services/cache-hub';

@Injectable()
@CacheNamespace('orders')  // ← Automatic namespace
export class OrderService {
  constructor(private hub: CacheHubService) {}

  getOrders(): Observable<Order[]> {
    // Cache key becomes 'orders:list' automatically
    return this.hub.fetch('list', this.api.getOrders());
  }
}
```

## Step 5: Component Usage

No changes needed in components - multiple async pipes work automatically!

```typescript
@Component({
  selector: 'app-customer-list',
  template: `
    <div *ngFor="let customer of customers$ | async">
      {{ customer.name }}
    </div>
    <div>Total customers: {{ (customers$ | async)?.length }}</div>
    <div>Loading: {{ !(customers$ | async) }}</div>
    <button (click)="refresh()">Refresh</button>
  `
})
export class CustomerListComponent {
  customers$: Observable<Customer[]>;

  constructor(private customerService: CustomerService) {
    // Multiple subscriptions (3 async pipes above) = Only 1 HTTP request!
    this.customers$ = this.customerService.getCustomers();
  }

  refresh(): void {
    // This will now be instant if data is cached
    this.customers$ = this.customerService.getCustomers();
  }
}
```

**Key Benefits:**
- ✅ **Multiple async pipes** → Only 1 HTTP request  
- ✅ **No shareReplay needed** → CacheHub handles it internally
- ✅ **Component destruction/recreation** → Cache persists

## Common Patterns

### Dashboard with Tabs
Perfect for dashboards where users switch between tabs:

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
  customers$ = this.hub.fetch('customers', this.api.getCustomers());
  orders$ = this.hub.fetch('orders', this.api.getOrders());

  constructor(private hub: CacheHubService, private api: ApiService) {}
}
```

**Result:** First tab switch = API call, subsequent switches = instant!

### Master-Detail Navigation
Great for list → detail → list navigation:

```typescript
// List Component
export class ProductListComponent {
  products$ = this.hub.fetch('products', this.api.getProducts());
  
  viewProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }
}

// Detail Component
export class ProductDetailComponent {
  product$ = this.hub.fetch(`product-${this.id}`, this.api.getProduct(this.id));
  
  goBack(): void {
    this.router.navigate(['/products']); // List loads instantly!
  }
}
```

## Performance Tips

### 1. Use Specific Cache Keys
```typescript
// ❌ Too generic
this.hub.fetch('data', this.api.getData());

// ✅ Specific and descriptive
this.hub.fetch('customer-orders-2024', this.api.getCustomerOrders(2024));
```

### 2. Batch Related Data
```typescript
// Load related data together for better caching
loadCustomerData(customerId: string): void {
  this.customerDetails$ = this.hub.fetch(`customer-${customerId}`, this.api.getCustomer(customerId));
  this.customerOrders$ = this.hub.fetch(`customer-${customerId}-orders`, this.api.getCustomerOrders(customerId));
}
```

### 3. Invalidate Related Data
```typescript
updateCustomer(customer: Customer): Observable<Customer> {
  return this.api.updateCustomer(customer).pipe(
    tap(() => {
      // Invalidate related caches
      this.hub.invalidate(`customer-${customer.id}`);
      this.hub.invalidate('customers-list');
    })
  );
}
```

## Next Steps

- **[API Reference](./api-reference.md)** - Complete method documentation
- **[Migration Guide](./migration-guide.md)** - Migrate from existing caching patterns
- **[Signals Support](./future-signals.md)** - Future Angular Signals integration
- **[Dashboard Patterns](./patterns/dashboard.md)** - Advanced dashboard optimization
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Need Help?

- Check the [FAQ](./troubleshooting.md) for common issues
- Review [usage patterns](./patterns/) for your specific use case
- See [migration guide](./migration-guide.md) for step-by-step service conversion