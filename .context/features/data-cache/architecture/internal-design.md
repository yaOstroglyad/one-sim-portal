# Internal Architecture

Deep dive into CacheHub's internal design, data structures, and implementation patterns.

## Core Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CacheHubService                          │
├─────────────────────────────────────────────────────────────┤
│  Public API Layer                                           │
│  ├── fetch() / get() / set() / update()                    │
│  ├── getStatic() / getReference() / getUserData()          │
│  └── invalidate() / clear() / getStats()                   │
├─────────────────────────────────────────────────────────────┤
│  Cache Management Layer                                     │
│  ├── CacheManager (namespace isolation)                    │
│  ├── TTLManager (expiration handling)                      │
│  ├── MemoryManager (size limits & LRU)                     │
│  └── CompressionManager (large object handling)            │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                              │
│  ├── InMemoryStore (primary cache)                         │
│  ├── PersistentStore (localStorage/IndexedDB)              │
│  └── ReactiveStore (RxJS Subject management)               │
├─────────────────────────────────────────────────────────────┤
│  Foundation Layer                                           │
│  ├── ObservableManager (subscription lifecycle)           │
│  ├── ErrorHandler (failure recovery)                       │
│  └── MetricsCollector (performance tracking)               │
└─────────────────────────────────────────────────────────────┘
```

## Core Data Structures

### CacheEntry<T>
```typescript
interface CacheEntry<T> {
  // Core data
  value: T;
  key: string;
  namespace: string;
  
  // Metadata
  createdAt: number;
  lastAccessed: number;
  expiration: number;
  size: number;
  
  // Performance tracking
  hits: number;
  misses: number;
  
  // State management
  isLoading: boolean;
  loadingObservable?: Observable<T>;
  error?: Error;
  
  // Advanced features
  compressed: boolean;
  persistent: boolean;
  dataType: DataType;
  
  // Reactive layer
  subject: BehaviorSubject<T>;
  subscription?: Subscription;
}
```

### CacheManager Implementation
```typescript
@Injectable({ providedIn: 'root' })
export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private namespaces = new Map<string, Set<string>>();
  private accessOrder = new DoublyLinkedList<string>();
  
  constructor(
    private config: CacheHubConfig,
    private ttlManager: TTLManager,
    private memoryManager: MemoryManager,
    private compressionManager: CompressionManager,
    private metricsCollector: MetricsCollector
  ) {
    this.setupAutomaticCleanup();
  }

  get<T>(key: string, namespace: string): CacheEntry<T> | undefined {
    const fullKey = this.buildFullKey(key, namespace);
    const entry = this.cache.get(fullKey);
    
    if (!entry) {
      this.metricsCollector.recordMiss(fullKey);
      return undefined;
    }

    // Check expiration
    if (this.ttlManager.isExpired(entry)) {
      this.remove(fullKey);
      this.metricsCollector.recordMiss(fullKey);
      return undefined;
    }

    // Update access tracking
    this.updateAccessTracking(entry, fullKey);
    this.metricsCollector.recordHit(fullKey);
    
    return entry;
  }

  set<T>(
    key: string, 
    namespace: string, 
    value: T, 
    options: CacheOptions
  ): CacheEntry<T> {
    const fullKey = this.buildFullKey(key, namespace);
    
    // Check memory limits before adding
    if (this.memoryManager.shouldEvict(value)) {
      this.memoryManager.evictLRU();
    }

    // Compress if needed
    const processedValue = this.compressionManager.maybeCompress(value);
    
    const entry: CacheEntry<T> = {
      value: processedValue,
      key,
      namespace,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiration: Date.now() + (options.ttl || this.config.defaultTTL),
      size: this.calculateSize(processedValue),
      hits: 0,
      misses: 0,
      isLoading: false,
      compressed: processedValue !== value,
      persistent: options.persistToStorage || false,
      dataType: options.dataType || DataType.BUSINESS,
      subject: new BehaviorSubject<T>(value)
    };

    // Store in cache
    this.cache.set(fullKey, entry);
    this.addToNamespace(namespace, fullKey);
    this.accessOrder.addToEnd(fullKey);
    
    // Schedule expiration
    this.ttlManager.scheduleExpiration(fullKey, entry.expiration);
    
    // Persist if needed
    if (entry.persistent) {
      this.persistToStorage(fullKey, entry);
    }

    this.metricsCollector.recordSet(fullKey, entry.size);
    
    return entry;
  }

  update<T>(
    key: string,
    namespace: string,
    updater: (current: T) => T
  ): boolean {
    const fullKey = this.buildFullKey(key, namespace);
    const entry = this.cache.get(fullKey);
    
    if (!entry || this.ttlManager.isExpired(entry)) {
      return false;
    }

    const currentValue = this.compressionManager.maybeDecompress(entry.value);
    const newValue = updater(currentValue);
    
    // Update entry
    entry.value = this.compressionManager.maybeCompress(newValue);
    entry.lastAccessed = Date.now();
    entry.size = this.calculateSize(entry.value);
    
    // Notify reactive subscribers
    entry.subject.next(newValue);
    
    // Update persistent storage
    if (entry.persistent) {
      this.persistToStorage(fullKey, entry);
    }

    this.updateAccessTracking(entry, fullKey);
    this.metricsCollector.recordUpdate(fullKey);
    
    return true;
  }

  invalidate(pattern: string | RegExp, namespace?: string): number {
    let removedCount = 0;
    const keysToRemove: string[] = [];

    if (typeof pattern === 'string') {
      // Single key invalidation
      const fullKey = namespace 
        ? this.buildFullKey(pattern, namespace)
        : pattern;
      
      if (this.cache.has(fullKey)) {
        keysToRemove.push(fullKey);
      }
    } else {
      // Pattern-based invalidation
      for (const [fullKey, entry] of this.cache.entries()) {
        const keyToMatch = namespace ? entry.key : fullKey;
        if (pattern.test(keyToMatch)) {
          keysToRemove.push(fullKey);
        }
      }
    }

    // Remove entries
    keysToRemove.forEach(fullKey => {
      this.remove(fullKey);
      removedCount++;
    });

    this.metricsCollector.recordInvalidation(removedCount);
    
    return removedCount;
  }

  private remove(fullKey: string): void {
    const entry = this.cache.get(fullKey);
    if (!entry) return;

    // Clean up reactive subscriptions
    if (entry.subscription) {
      entry.subscription.unsubscribe();
    }
    entry.subject.complete();

    // Remove from data structures
    this.cache.delete(fullKey);
    this.removeFromNamespace(entry.namespace, fullKey);
    this.accessOrder.remove(fullKey);
    this.ttlManager.cancelExpiration(fullKey);

    // Remove from persistent storage
    if (entry.persistent) {
      this.removeFromStorage(fullKey);
    }

    this.metricsCollector.recordRemoval(fullKey);
  }

  private buildFullKey(key: string, namespace: string): string {
    return `${namespace}:${key}`;
  }

  private addToNamespace(namespace: string, fullKey: string): void {
    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, new Set());
    }
    this.namespaces.get(namespace)!.add(fullKey);
  }

  private removeFromNamespace(namespace: string, fullKey: string): void {
    const namespaceKeys = this.namespaces.get(namespace);
    if (namespaceKeys) {
      namespaceKeys.delete(fullKey);
      if (namespaceKeys.size === 0) {
        this.namespaces.delete(namespace);
      }
    }
  }

  private updateAccessTracking(entry: CacheEntry<any>, fullKey: string): void {
    entry.lastAccessed = Date.now();
    entry.hits++;
    
    // Move to end of LRU list
    this.accessOrder.moveToEnd(fullKey);
  }

  private calculateSize(value: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(value).length * 2; // 2 bytes per character for UTF-16
  }

  private setupAutomaticCleanup(): void {
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000);

    // Memory pressure monitoring every 30 seconds
    setInterval(() => {
      this.memoryManager.checkMemoryPressure();
    }, 30000);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [fullKey, entry] of this.cache.entries()) {
      if (now > entry.expiration) {
        expiredKeys.push(fullKey);
      }
    }

    expiredKeys.forEach(key => this.remove(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }
}
```

## TTL Management System

### TTLManager Implementation
```typescript
@Injectable()
export class TTLManager {
  private expirationTimers = new Map<string, number>();
  private expirationQueue = new PriorityQueue<ExpirationItem>();

  constructor(private cacheManager: CacheManager) {
    this.setupBatchExpiration();
  }

  scheduleExpiration(key: string, expirationTime: number): void {
    // Cancel existing timer if any
    this.cancelExpiration(key);

    const delay = expirationTime - Date.now();
    
    if (delay <= 0) {
      // Already expired
      this.cacheManager.remove(key);
      return;
    }

    if (delay <= 300000) { // 5 minutes or less - use timer
      const timerId = window.setTimeout(() => {
        this.cacheManager.remove(key);
        this.expirationTimers.delete(key);
      }, delay);
      
      this.expirationTimers.set(key, timerId);
    } else {
      // Longer delays - use batch processing
      this.expirationQueue.enqueue({
        key,
        expirationTime,
        priority: expirationTime
      });
    }
  }

  cancelExpiration(key: string): void {
    const timerId = this.expirationTimers.get(key);
    if (timerId) {
      clearTimeout(timerId);
      this.expirationTimers.delete(key);
    }

    // Remove from queue (less efficient but necessary)
    this.expirationQueue.remove(item => item.key === key);
  }

  isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiration;
  }

  private setupBatchExpiration(): void {
    // Process expiration queue every minute
    setInterval(() => {
      this.processBatchExpirations();
    }, 60000);
  }

  private processBatchExpirations(): void {
    const now = Date.now();
    const itemsToExpire: string[] = [];

    // Process items that should expire within next 5 minutes
    while (!this.expirationQueue.isEmpty()) {
      const item = this.expirationQueue.peek();
      if (item.expirationTime > now + 300000) {
        break; // Future items
      }

      const expired = this.expirationQueue.dequeue();
      if (expired.expirationTime <= now) {
        itemsToExpire.push(expired.key);
      } else {
        // Schedule with timer for precise timing
        this.scheduleExpiration(expired.key, expired.expirationTime);
      }
    }

    // Remove expired items
    itemsToExpire.forEach(key => this.cacheManager.remove(key));
  }
}

interface ExpirationItem {
  key: string;
  expirationTime: number;
  priority: number;
}
```

## Memory Management

### MemoryManager Implementation
```typescript
@Injectable()
export class MemoryManager {
  private readonly maxCacheSize: number;
  private readonly maxSizeBytes: number;
  private currentSizeBytes = 0;
  private memoryPressure: 'low' | 'medium' | 'high' = 'low';

  constructor(
    private config: CacheHubConfig,
    private cacheManager: CacheManager
  ) {
    this.maxCacheSize = config.maxCacheSize || 100;
    this.maxSizeBytes = config.maxSizeBytes || 50 * 1024 * 1024; // 50MB
  }

  shouldEvict(newValue: any): boolean {
    const estimatedSize = this.estimateSize(newValue);
    const wouldExceedSize = this.currentSizeBytes + estimatedSize > this.maxSizeBytes;
    const wouldExceedCount = this.cacheManager.size >= this.maxCacheSize;

    return wouldExceedSize || wouldExceedCount;
  }

  evictLRU(): void {
    const entriesToEvict = this.selectLRUEntries();
    
    entriesToEvict.forEach(entry => {
      this.cacheManager.remove(entry.fullKey);
    });

    console.log(`🗑️ Evicted ${entriesToEvict.length} LRU cache entries`);
  }

  updateSize(delta: number): void {
    this.currentSizeBytes += delta;
    this.updateMemoryPressure();
  }

  checkMemoryPressure(): void {
    this.updateMemoryPressure();
    
    if (this.memoryPressure === 'high') {
      this.handleHighMemoryPressure();
    }
  }

  getMemoryStats(): MemoryStats {
    return {
      currentSizeBytes: this.currentSizeBytes,
      maxSizeBytes: this.maxSizeBytes,
      usagePercentage: (this.currentSizeBytes / this.maxSizeBytes) * 100,
      pressure: this.memoryPressure,
      entryCount: this.cacheManager.size,
      maxEntryCount: this.maxCacheSize
    };
  }

  private selectLRUEntries(): Array<{ fullKey: string; lastAccessed: number }> {
    const allEntries = Array.from(this.cacheManager.entries())
      .map(([fullKey, entry]) => ({
        fullKey,
        lastAccessed: entry.lastAccessed,
        size: entry.size,
        dataType: entry.dataType
      }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Prefer evicting larger, older, and less critical entries
    const scoredEntries = allEntries.map(entry => ({
      ...entry,
      evictionScore: this.calculateEvictionScore(entry)
    })).sort((a, b) => b.evictionScore - a.evictionScore);

    // Evict enough entries to get below 80% capacity
    const targetSize = this.maxSizeBytes * 0.8;
    const targetCount = this.maxCacheSize * 0.8;
    
    const toEvict: Array<{ fullKey: string; lastAccessed: number }> = [];
    let freedSize = 0;
    let freedCount = 0;

    for (const entry of scoredEntries) {
      if (freedSize >= (this.currentSizeBytes - targetSize) && 
          freedCount >= (this.cacheManager.size - targetCount)) {
        break;
      }
      
      toEvict.push(entry);
      freedSize += entry.size;
      freedCount++;
    }

    return toEvict;
  }

  private calculateEvictionScore(entry: {
    size: number;
    lastAccessed: number;
    dataType: DataType;
  }): number {
    const age = Date.now() - entry.lastAccessed;
    const sizeWeight = entry.size / 1024; // KB
    const ageWeight = age / 1000 / 60; // Minutes
    
    // Priority by data type (lower values = higher priority = lower eviction score)
    const dataTypePriority = {
      [DataType.STATIC]: 1,
      [DataType.REFERENCE]: 2,
      [DataType.USER]: 3,
      [DataType.BUSINESS]: 4,
      [DataType.VOLATILE]: 5,
      [DataType.TRANSIENT]: 6
    };
    
    const typeWeight = dataTypePriority[entry.dataType] || 4;
    
    // Higher score = more likely to be evicted
    return (sizeWeight * 0.3) + (ageWeight * 0.4) + (typeWeight * 0.3);
  }

  private updateMemoryPressure(): void {
    const usagePercentage = (this.currentSizeBytes / this.maxSizeBytes) * 100;
    const countPercentage = (this.cacheManager.size / this.maxCacheSize) * 100;
    
    const maxPercentage = Math.max(usagePercentage, countPercentage);
    
    if (maxPercentage > 90) {
      this.memoryPressure = 'high';
    } else if (maxPercentage > 70) {
      this.memoryPressure = 'medium';
    } else {
      this.memoryPressure = 'low';
    }
  }

  private handleHighMemoryPressure(): void {
    console.warn('🔥 High memory pressure detected, initiating aggressive cleanup');
    
    // 1. Clear all transient data
    this.cacheManager.invalidate(/.*/, 'transient');
    
    // 2. Clear expired entries
    this.cacheManager.cleanupExpired();
    
    // 3. Evict LRU entries
    this.evictLRU();
    
    // 4. If still high pressure, clear volatile data
    if (this.memoryPressure === 'high') {
      this.cacheManager.invalidate(/.*/, 'volatile');
    }
  }

  private estimateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    }
    
    return 8; // Rough estimate for primitives
  }
}
```

## Reactive Layer

### Observable Management
```typescript
@Injectable()
export class ObservableManager {
  private activeObservables = new Map<string, Observable<any>>();
  private subscriptionTracker = new Map<string, Set<Subscription>>();

  constructor() {
    this.setupSubscriptionCleanup();
  }

  createCachedObservable<T>(
    key: string,
    factory: () => Observable<T>,
    cacheEntry: CacheEntry<T>
  ): Observable<T> {
    // Return existing observable if in progress
    if (cacheEntry.isLoading && cacheEntry.loadingObservable) {
      return cacheEntry.loadingObservable;
    }

    // Return cached value immediately, then refresh if needed
    const cached$ = cacheEntry.subject.asObservable();
    
    if (this.shouldRefresh(cacheEntry)) {
      const refresh$ = this.createRefreshObservable(key, factory, cacheEntry);
      
      return merge(
        cached$.pipe(take(1)), // Immediate cached value
        refresh$ // Updated value when available
      ).pipe(
        distinctUntilChanged(),
        shareReplay(1)
      );
    }

    return cached$;
  }

  private createRefreshObservable<T>(
    key: string,
    factory: () => Observable<T>,
    cacheEntry: CacheEntry<T>
  ): Observable<T> {
    cacheEntry.isLoading = true;
    
    const refresh$ = factory().pipe(
      tap(newValue => {
        // Update cache entry
        cacheEntry.value = newValue;
        cacheEntry.lastAccessed = Date.now();
        cacheEntry.isLoading = false;
        cacheEntry.error = undefined;
        
        // Notify subscribers
        cacheEntry.subject.next(newValue);
      }),
      catchError(error => {
        cacheEntry.isLoading = false;
        cacheEntry.error = error;
        
        // Return cached value on error, or rethrow if no cache
        if (cacheEntry.value !== undefined) {
          console.warn(`API failed for ${key}, using cached data:`, error);
          return of(cacheEntry.value);
        }
        
        throw error;
      }),
      finalize(() => {
        cacheEntry.isLoading = false;
        cacheEntry.loadingObservable = undefined;
        this.activeObservables.delete(key);
      }),
      shareReplay(1)
    );

    cacheEntry.loadingObservable = refresh$;
    this.activeObservables.set(key, refresh$);
    
    return refresh$;
  }

  private shouldRefresh(cacheEntry: CacheEntry<any>): boolean {
    // Don't refresh if already loading
    if (cacheEntry.isLoading) return false;
    
    // Refresh if expired
    if (Date.now() > cacheEntry.expiration) return true;
    
    // Refresh if has error and enough time passed
    if (cacheEntry.error && Date.now() - cacheEntry.lastAccessed > 30000) {
      return true;
    }
    
    return false;
  }

  trackSubscription(key: string, subscription: Subscription): void {
    if (!this.subscriptionTracker.has(key)) {
      this.subscriptionTracker.set(key, new Set());
    }
    
    this.subscriptionTracker.get(key)!.add(subscription);
  }

  untrackSubscription(key: string, subscription: Subscription): void {
    const subscriptions = this.subscriptionTracker.get(key);
    if (subscriptions) {
      subscriptions.delete(subscription);
      
      if (subscriptions.size === 0) {
        this.subscriptionTracker.delete(key);
      }
    }
  }

  cleanupSubscriptions(key: string): void {
    const subscriptions = this.subscriptionTracker.get(key);
    if (subscriptions) {
      subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptionTracker.delete(key);
    }
  }

  private setupSubscriptionCleanup(): void {
    // Clean up orphaned subscriptions every 5 minutes
    setInterval(() => {
      this.cleanupOrphanedSubscriptions();
    }, 5 * 60 * 1000);
  }

  private cleanupOrphanedSubscriptions(): void {
    let cleanedCount = 0;
    
    for (const [key, subscriptions] of this.subscriptionTracker.entries()) {
      const activeSubscriptions = new Set<Subscription>();
      
      subscriptions.forEach(sub => {
        if (!sub.closed) {
          activeSubscriptions.add(sub);
        } else {
          cleanedCount++;
        }
      });
      
      if (activeSubscriptions.size === 0) {
        this.subscriptionTracker.delete(key);
      } else {
        this.subscriptionTracker.set(key, activeSubscriptions);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} closed subscriptions`);
    }
  }
}
```

## Performance Metrics

### MetricsCollector Implementation
```typescript
@Injectable()
export class MetricsCollector {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    updates: 0,
    invalidations: 0,
    evictions: 0,
    totalBytesStored: 0,
    averageResponseTime: 0,
    hitRate: 0
  };

  private responseTimeSamples: number[] = [];
  private readonly maxSamples = 1000;

  recordHit(key: string): void {
    this.metrics.hits++;
    this.updateHitRate();
  }

  recordMiss(key: string): void {
    this.metrics.misses++;
    this.updateHitRate();
  }

  recordSet(key: string, size: number): void {
    this.metrics.sets++;
    this.metrics.totalBytesStored += size;
  }

  recordUpdate(key: string): void {
    this.metrics.updates++;
  }

  recordInvalidation(count: number): void {
    this.metrics.invalidations += count;
  }

  recordResponseTime(timeMs: number): void {
    this.responseTimeSamples.push(timeMs);
    
    // Keep only recent samples
    if (this.responseTimeSamples.length > this.maxSamples) {
      this.responseTimeSamples = this.responseTimeSamples.slice(-this.maxSamples);
    }
    
    this.updateAverageResponseTime();
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      updates: 0,
      invalidations: 0,
      evictions: 0,
      totalBytesStored: 0,
      averageResponseTime: 0,
      hitRate: 0
    };
    this.responseTimeSamples = [];
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private updateAverageResponseTime(): void {
    if (this.responseTimeSamples.length === 0) {
      this.metrics.averageResponseTime = 0;
      return;
    }
    
    const sum = this.responseTimeSamples.reduce((acc, time) => acc + time, 0);
    this.metrics.averageResponseTime = sum / this.responseTimeSamples.length;
  }
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  updates: number;
  invalidations: number;
  evictions: number;
  totalBytesStored: number;
  averageResponseTime: number;
  hitRate: number;
}
```

## Namespace Management

### Automatic Namespace Detection
```typescript
export function CacheNamespace(namespace: string) {
  return function <T extends new(...args: any[]) => any>(constructor: T) {
    // Store namespace metadata
    Reflect.defineMetadata('cache:namespace', namespace, constructor);
    
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        
        // Inject namespace into CacheHubService calls
        this.setupNamespaceInjection(namespace);
      }
      
      private setupNamespaceInjection(ns: string): void {
        const hub = this.hub || this.cacheHub;
        if (!hub) return;
        
        // Wrap CacheHub methods to automatically inject namespace
        const originalFetch = hub.fetch.bind(hub);
        const originalGet = hub.get.bind(hub);
        const originalSet = hub.set.bind(hub);
        const originalUpdate = hub.update.bind(hub);
        const originalInvalidate = hub.invalidate.bind(hub);
        
        hub.fetch = (key: string, ...args: any[]) => {
          return originalFetch(`${ns}:${key}`, ...args);
        };
        
        hub.get = (key: string, ...args: any[]) => {
          return originalGet(`${ns}:${key}`, ...args);
        };
        
        hub.set = (key: string, ...args: any[]) => {
          return originalSet(`${ns}:${key}`, ...args);
        };
        
        hub.update = (key: string, ...args: any[]) => {
          return originalUpdate(`${ns}:${key}`, ...args);
        };
        
        hub.invalidate = (pattern: string | RegExp) => {
          if (typeof pattern === 'string') {
            return originalInvalidate(`${ns}:${pattern}`);
          } else {
            // For RegExp, invalidate within namespace
            return originalInvalidate(pattern, ns);
          }
        };
      }
    };
  };
}
```

This internal architecture provides:

1. **Modular Design** - Each component has a single responsibility
2. **Memory Efficiency** - LRU eviction and size limits prevent memory bloat
3. **Performance Monitoring** - Built-in metrics collection for optimization
4. **Reactive Integration** - Seamless RxJS integration with proper subscription management
5. **Namespace Isolation** - Prevents cache key collisions between modules
6. **Automatic Cleanup** - TTL management and memory pressure handling
7. **Error Recovery** - Graceful fallback to cached data when APIs fail

The architecture is designed to be maintainable, testable, and extensible while providing excellent performance characteristics for Angular applications.