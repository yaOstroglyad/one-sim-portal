# CacheHub Migration Guide

Complete guide for migrating from traditional caching patterns to CacheHub with intelligent subscription management.

## CacheHub Features

### 🎉 Intelligent Subscription Management
- **No shareReplay() needed** - CacheHub handles multiple subscriptions internally
- **BehaviorSubject-based** - All subscriptions share the same data stream  
- **Component lifecycle safe** - Cache persists through component destruction/recreation

### 🔄 Migration Patterns

#### From Direct HTTP Calls
```typescript
// ❌ Before: Direct HTTP calls
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users');
}

// ✅ After: Cached with CacheHub
getUsers(): Observable<User[]> {
  return this.cacheHub.get(
    'users:all',
    () => this.http.get<User[]>('/api/users'),
    { dataType: DataType.BUSINESS }
  );
}
```

#### From Manual shareReplay Patterns
```typescript
// ❌ Before: Manual shareReplay management
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users').pipe(
    shareReplay(1)
  );
}

// ✅ After: Automatic subscription management
getUsers(): Observable<User[]> {
  return this.cacheHub.get(
    'users:all',
    () => this.http.get<User[]>('/api/users'),
    { dataType: DataType.BUSINESS }
  );
}
```

## Migration Steps

### Step 1: Remove shareReplay from Services

**Before:**
```typescript
@Injectable()
export class UserService {
  getUsers(): Observable<User[]> {
    return this.cacheHub.get(
      'users:all',
      () => this.http.get<User[]>('/api/users'),
      { dataType: DataType.BUSINESS }
    ).pipe(
      shareReplay(1)  // ❌ Remove this
    );
  }
}
```

**After:**
```typescript
@Injectable()
export class UserService {
  getUsers(): Observable<User[]> {
    return this.cacheHub.get(
      'users:all',
      () => this.http.get<User[]>('/api/users'),
      { dataType: DataType.BUSINESS }
    );
    // ✅ No shareReplay needed!
  }
}
```

### Step 2: Remove Observable Caching

**Before:**
```typescript
@Injectable()
export class DataService {
  private data$: Observable<Data[]> | null = null;

  getData(): Observable<Data[]> {
    if (this.data$) {
      return this.data$;
    }

    this.data$ = this.cacheHub.get(
      'data:all',
      () => this.http.get<Data[]>('/api/data'),
      { dataType: DataType.BUSINESS }
    ).pipe(shareReplay(1));

    return this.data$;
  }
}
```

**After:**
```typescript
@Injectable()
export class DataService {
  getData(): Observable<Data[]> {
    return this.cacheHub.get(
      'data:all',
      () => this.http.get<Data[]>('/api/data'),
      { dataType: DataType.BUSINESS }
    );
    // ✅ CacheHub handles everything internally!
  }
}
```

### Step 3: Update Components with Multiple Async Pipes

**Before (required workarounds):**
```typescript
@Component({
  template: `
    <div *ngFor="let item of items$ | async">{{ item.name }}</div>
    <div>Count: {{ itemCount$ | async }}</div>
  `
})
export class ListComponent implements OnInit {
  items$!: Observable<Item[]>;
  itemCount$!: Observable<number>;

  ngOnInit() {
    // Had to share the same observable to prevent multiple requests
    const shared$ = this.service.getItems().pipe(shareReplay(1));
    this.items$ = shared$;
    this.itemCount$ = shared$.pipe(map(items => items.length));
  }
}
```

**After (works automatically):**
```typescript
@Component({
  template: `
    <div *ngFor="let item of items$ | async">{{ item.name }}</div>
    <div>Count: {{ (items$ | async)?.length }}</div>
    <div>First: {{ (items$ | async)?.[0]?.name }}</div>
  `
})
export class ListComponent {
  // ✅ Multiple async pipes = Only 1 HTTP request!
  items$ = this.service.getItems();
}
```

### Step 4: Update Method Calls

**Before:**
```typescript
// Various old patterns
this.hub.fetch('key', this.http.get('/api'))
this.hub.getStatic('key', () => this.http.get('/api'))
this.hub.getReference('key', () => this.http.get('/api'))
this.hub.getUserData('key', () => this.http.get('/api'))
```

**After:**
```typescript
// Unified API with explicit dataType
this.cacheHub.get('key', () => this.http.get('/api'), { dataType: DataType.STATIC })
this.cacheHub.get('key', () => this.http.get('/api'), { dataType: DataType.REFERENCE })
this.cacheHub.get('key', () => this.http.get('/api'), { dataType: DataType.USER })
this.cacheHub.get('key', () => this.http.get('/api'), { dataType: DataType.BUSINESS })
```

## Testing Your Migration

### Verify Single HTTP Requests

1. **Open DevTools Network tab**
2. **Navigate between components** that use the same cached data
3. **Verify only 1 HTTP request** occurs for each cache key

```typescript
// This should only make 1 HTTP request total
@Component({
  template: `
    <div>Users: {{ (users$ | async)?.length }}</div>
    <div>First user: {{ (users$ | async)?.[0]?.name }}</div>
    <div>Last user: {{ (users$ | async)?.slice(-1)[0]?.name }}</div>
  `
})
export class TestComponent {
  users$ = this.userService.getUsers(); // Only 1 request despite 3 async pipes!
}
```

### Test Component Lifecycle

1. **Navigate to a page** that loads cached data
2. **Navigate away** (component destroyed)
3. **Navigate back** (component recreated)  
4. **Verify data loads instantly** from cache

### Test Concurrent Requests

```typescript
// This should deduplicate to 1 HTTP request
@Component({})
export class TestComponent implements OnInit {
  users1$ = this.userService.getUsers();
  users2$ = this.userService.getUsers(); 
  users3$ = this.userService.getUsers();
  
  ngOnInit() {
    // Even subscribing at the same time should only make 1 request
    this.users1$.subscribe();
    this.users2$.subscribe(); 
    this.users3$.subscribe();
  }
}
```

## Migration Checklist

- [ ] Remove all `shareReplay()` operators from caching services
- [ ] Remove manual Observable caching (`private data$: Observable`)
- [ ] Update method calls to use unified `cacheHub.get()` API
- [ ] Test multiple async pipes work without multiple HTTP requests
- [ ] Test component destruction/recreation doesn't clear cache
- [ ] Test concurrent requests are deduplicated
- [ ] Verify cache TTL and invalidation still work correctly

## Benefits After Migration

### Performance Improvements
- **Reduced memory usage** - No duplicate Observable streams
- **Faster rendering** - Multiple async pipes don't block each other
- **Better UX** - Instant navigation between cached pages

### Code Quality
- **Simpler services** - No manual shareReplay management
- **Cleaner components** - Multiple async pipes work naturally
- **Less boilerplate** - No manual Observable caching logic

### Developer Experience
- **Fewer bugs** - No forgotten shareReplay causing duplicate requests
- **Easier debugging** - Single source of truth for each cache key
- **Future-proof** - Ready for Angular Signals migration

## Rollback Plan

If issues arise, you can temporarily rollback by:

1. **Re-adding shareReplay** to affected services
2. **Using the old method signatures** (still supported)
3. **Gradual migration** - migrate one service at a time

The old API remains functional during transition period.