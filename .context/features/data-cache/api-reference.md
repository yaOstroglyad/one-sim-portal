# API Reference

Complete reference for all CacheHub methods and configuration options.

## Table of Contents

- [Core Methods](#core-methods)
- [Data Type Methods](#data-type-methods)
- [Cache Management](#cache-management)
- [Configuration](#configuration)
- [Types & Interfaces](#types--interfaces)
- [Decorators](#decorators)

## Core Methods

### `get<T>(key, factory, options?, namespace?)`

Primary caching method with BehaviorSubject-based subscription management.

```typescript
get<T>(
  key: string,
  factory: () => Observable<T>,
  options?: Partial<CacheOptions>,
  namespace?: string
): Observable<T>
```

**Parameters:**
- `key` - Unique cache identifier
- `factory` - Function that returns Observable (called only on cache miss)
- `options` - Cache configuration including dataType and ttl
- `namespace` - Optional namespace for cache isolation

**Example:**
```typescript
// Basic usage with data type
this.cacheHub.get(
  'users:all',
  () => this.http.get<User[]>('/api/users'),
  { dataType: DataType.BUSINESS }
)

// With custom TTL
this.cacheHub.get(
  'metrics:dashboard',
  () => this.http.get('/api/metrics'),
  { 
    dataType: DataType.VOLATILE,
    ttl: 30 * 1000  // 30 seconds
  }
)

// With namespace
this.cacheHub.get(
  'list',
  () => this.http.get('/api/orders'),
  { dataType: DataType.BUSINESS },
  'orders'  // Cache key becomes 'orders:list'
)
```

**Key Features:**
- ✅ **BehaviorSubject-based** - Multiple subscriptions = 1 HTTP request
- ✅ **Automatic deduplication** - Concurrent calls to same key share result
- ✅ **Subscription safe** - No need for shareReplay()
- ✅ **Cache persistence** - Survives component destruction/recreation

## Data Type Methods

Pre-configured methods for common data types with optimal TTL settings.

### `getStatic<T>(key, fetchFn)`

For static data that rarely changes (24-hour TTL).

```typescript
getStatic<T>(key: string, fetchFn: () => Observable<T>): Observable<T>
```

**Use for:** Countries, currencies, app configuration
```typescript
this.hub.getStatic('countries', () => this.api.getCountries())
this.hub.getStatic('app-config', () => this.api.getConfig())
```

### `getReference<T>(key, fetchFn)`

For reference data that changes occasionally (1-hour TTL).

```typescript
getReference<T>(key: string, fetchFn: () => Observable<T>): Observable<T>
```

**Use for:** Categories, product types, lookup tables
```typescript
this.hub.getReference('categories', () => this.api.getCategories())
this.hub.getReference('providers', () => this.api.getProviders())
```

### `getUserData<T>(key, fetchFn)`

For user-specific data (30-minute TTL).

```typescript
getUserData<T>(key: string, fetchFn: () => Observable<T>): Observable<T>
```

**Use for:** User profiles, preferences, permissions
```typescript
this.hub.getUserData('profile', () => this.api.getUserProfile())
this.hub.getUserData('settings', () => this.api.getUserSettings())
```

## Cache Management

### `update<T>(key, updater)`

Update cached data without API call.

```typescript
update<T>(key: string, updater: (current: T) => T): boolean
```

**Returns:** `true` if update succeeded, `false` if key not found

**Example:**
```typescript
// Add item to array
this.hub.update<User[]>('users', users => [...users, newUser])

// Update specific item
this.hub.update<User[]>('users', users =>
  users.map(u => u.id === userId ? { ...u, ...changes } : u)
)

// Update object property
this.hub.update<UserProfile>('profile', profile => ({
  ...profile,
  lastLogin: new Date()
}))
```

### `set<T>(key, value, options?)`

Set cache value directly.

```typescript
set<T>(key: string, value: T, options?: Partial<CacheOptions>): void
```

**Example:**
```typescript
// Cache computed data
const processedData = this.processData(rawData);
this.hub.set('processed-data', processedData);

// Cache with custom TTL
this.hub.set('temp-data', data, { ttl: 60000 }); // 1 minute
```

### `getValue<T>(key)`

Get current cached value synchronously.

```typescript
getValue<T>(key: string): T | undefined
```

**Example:**
```typescript
const cachedUsers = this.hub.getValue<User[]>('users');
if (cachedUsers) {
  console.log(`${cachedUsers.length} users in cache`);
}
```

### `invalidate(key)`

Remove specific key from cache.

```typescript
invalidate(key: string | RegExp): void
```

**Example:**
```typescript
// Remove specific key
this.hub.invalidate('users');

// Remove all keys matching pattern
this.hub.invalidate(/^user-/); // Removes 'user-123', 'user-456', etc.
```

### `clear(options?)`

Clear entire cache or specific types.

```typescript
clear(options?: { keepPersistent?: boolean }): void
```

**Example:**
```typescript
// Clear everything
this.hub.clear();

// Keep persistent data (localStorage)
this.hub.clear({ keepPersistent: true });
```

## Configuration

### `DataType` Enum

Pre-defined cache strategies:

```typescript
enum DataType {
  STATIC = 'static',           // 24 hours
  REFERENCE = 'reference',     // 1 hour
  BUSINESS = 'business',       // 5 minutes (default)
  VOLATILE = 'volatile',       // 1 minute
  USER = 'user',              // 30 minutes
  TRANSIENT = 'transient'     // 30 seconds
}
```

### `CacheOptions` Interface

```typescript
interface CacheOptions {
  ttl?: number;                // Time to live in milliseconds
  timeout?: number;            // Request timeout (default: 30000)
  retryCount?: number;         // Retry attempts (default: 1)
  retryDelay?: number;         // Delay between retries (default: 1000)
  compression?: boolean;       // Compress large objects (default: false)
  persistToStorage?: boolean;  // Save to localStorage (default: false)
}
```

### Global Configuration

```typescript
// app.module.ts
import { CACHE_HUB_CONFIG } from './shared/services/cache-hub';

@NgModule({
  providers: [
    {
      provide: CACHE_HUB_CONFIG,
      useValue: {
        defaults: {
          ttl: 3 * 60 * 1000,     // 3 minutes default
          timeout: 20000,         // 20 second timeout
          retryCount: 2           // 2 retries
        },
        maxCacheSize: 200,        // 200 entries max
        maxSizeBytes: 100 * 1024 * 1024, // 100MB max
        dataTypes: {
          [DataType.STATIC]: { ttl: 48 * 60 * 60 * 1000 }, // 48 hours
          [DataType.BUSINESS]: { ttl: 2 * 60 * 1000 }      // 2 minutes
        }
      }
    }
  ]
})
```

## Types & Interfaces

### `CacheEntry<T>`

Internal cache entry structure:

```typescript
interface CacheEntry<T> {
  value: CacheValue<T>;        // Reactive value wrapper
  expiration: number;          // Expiration timestamp
  size: number;               // Size in bytes
  hits: number;               // Access count
  lastAccess: number;         // Last access timestamp
  compressed?: boolean;        // Is data compressed
}
```

### `CacheValue<T>`

Reactive value wrapper:

```typescript
interface CacheValue<T> {
  get(): T | undefined;                    // Get current value
  set(value: T): void;                     // Set new value
  update(updater: (prev: T) => T): void;   // Update with function
  observe(): Observable<T>;                // Get as Observable
  destroy(): void;                         // Cleanup resources
}
```

### `CacheStats`

Cache statistics:

```typescript
interface CacheStats {
  size: number;              // Number of entries
  sizeBytes: number;         // Total size in bytes
  hits: number;              // Total cache hits
  misses: number;            // Total cache misses
  hitRate: number;           // Hit rate percentage
  oldestEntry: Date;         // Oldest cache entry
  memoryPressure: 'low' | 'medium' | 'high';
}
```

## Decorators

### `@CacheNamespace(namespace)`

Automatic namespace for service methods:

```typescript
import { CacheNamespace } from './shared/services/cache-hub';

@Injectable()
@CacheNamespace('products')
export class ProductService {
  constructor(private hub: CacheHubService) {}

  getProducts(): Observable<Product[]> {
    // Cache key becomes 'products:list'
    return this.hub.fetch('list', this.api.getProducts());
  }

  getProduct(id: string): Observable<Product> {
    // Cache key becomes 'products:detail-123'
    return this.hub.fetch(`detail-${id}`, this.api.getProduct(id));
  }
}
```

## Utility Methods

### `getStats()`

Get cache performance statistics:

```typescript
getStats(): CacheStats
```

**Example:**
```typescript
const stats = this.hub.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Memory usage: ${stats.sizeBytes / 1024 / 1024} MB`);
```

### `has(key)`

Check if key exists in cache:

```typescript
has(key: string): boolean
```

**Example:**
```typescript
if (this.hub.has('users')) {
  console.log('Users are cached');
}
```

### `keys(pattern?)`

Get all cache keys, optionally filtered:

```typescript
keys(pattern?: RegExp): string[]
```

**Example:**
```typescript
// All keys
const allKeys = this.hub.keys();

// Only user-related keys
const userKeys = this.hub.keys(/^user-/);
```

## Error Handling

CacheHub handles errors gracefully:

```typescript
// If API fails, cached data is returned if available
this.hub.fetch('data', this.api.getData()).pipe(
  catchError(error => {
    // CacheHub already tried to return stale data
    console.error('Both API and cache failed:', error);
    return of([]); // Fallback to empty array
  })
)
```

## Performance Considerations

### Cache Size Limits
- **Default max entries:** 100
- **Default max size:** 50MB
- **Automatic cleanup:** LRU eviction when limits exceeded

### Memory Usage
- Objects over 1MB are automatically compressed
- Use `getValue()` for synchronous access to avoid Observable overhead
- Large arrays benefit from pagination patterns

### TTL Guidelines
- **Static data (countries, config):** 24+ hours
- **Reference data (categories):** 1-4 hours  
- **Business data (products, orders):** 2-10 minutes
- **User data (profile, preferences):** 15-60 minutes
- **Volatile data (metrics, counts):** 30 seconds - 2 minutes

## Best Practices

1. **Use descriptive cache keys:** `customer-orders-2024` vs `data`
2. **Namespace by module:** Use `@CacheNamespace` decorator
3. **Choose appropriate data types:** Don't cache volatile data for hours
4. **Invalidate related data:** When updating, clear dependent caches
5. **Handle errors gracefully:** Always provide fallbacks
6. **Monitor cache performance:** Use `getStats()` to optimize

## Migration Examples

### From Direct HTTP
```typescript
// Before
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users');
}

// After  
getUsers(): Observable<User[]> {
  return this.hub.fetch('users', this.http.get<User[]>('/api/users'));
}
```

### From BehaviorSubject
```typescript
// Before
private usersSubject = new BehaviorSubject<User[]>([]);
users$ = this.usersSubject.asObservable();

loadUsers(): void {
  this.http.get<User[]>('/api/users').subscribe(users => {
    this.usersSubject.next(users);
  });
}

// After
users$ = this.hub.fetch('users', this.http.get<User[]>('/api/users'));
// No loadUsers() method needed!
```

## Future Roadmap

- **Angular Signals Support** - Zero-breaking-changes migration path → **[Future Signals Guide](./future-signals.md)**
- **Enhanced Performance** - Advanced memory management and compression
- **Offline-First** - Complete offline synchronization capabilities