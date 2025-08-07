import { Injectable, inject, OnDestroy } from '@angular/core';
import { Observable, of, throwError, timer, BehaviorSubject } from 'rxjs';
import { map, timeout, retry, retryWhen, delay, take, tap, catchError, finalize, filter } from 'rxjs/operators';

import { 
  CacheEntry, 
  CacheOptions, 
  CacheStats, 
  DataType, 
  CacheHubConfig,
  PagedResult,
  SelectOption,
  ValidationResult,
  ValidationContext,
  FormValidationState 
} from './types';

import { CACHE_HUB_CONFIG } from './config';
import { CacheUtils } from './utils';
import { MemoryManager } from './memory-manager';
import { TTLManager } from './ttl-manager';
import { CompressionManager } from './compression-manager';
import { ObservableManager } from './observable-manager';
import { MetricsCollector } from './metrics-collector';
import { CacheDecorators } from './namespace.decorator';

/**
 * Main CacheHub service - intelligent caching system for Angular applications
 * 
 * Features:
 * - Automatic TTL management based on data types
 * - Memory pressure monitoring with LRU eviction
 * - Request deduplication 
 * - Reactive updates with BehaviorSubject
 * - Compression for large objects
 * - Persistent storage integration
 * - Namespace isolation
 * - Performance metrics collection
 */
@Injectable({
  providedIn: 'root'
})
export class CacheHubService implements OnDestroy {
  private readonly config = inject(CACHE_HUB_CONFIG);
  private readonly memoryManager = inject(MemoryManager);
  private readonly ttlManager = inject(TTLManager);
  private readonly compressionManager = inject(CompressionManager);
  private readonly observableManager = inject(ObservableManager);
  private readonly metricsCollector = inject(MetricsCollector);

  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultNamespace = 'default';

  constructor() {
    this.setupPeriodicMaintenance();
    this.setupMemoryPressureMonitoring();
  }

  /**
   * Get data from cache or execute factory function
   * 
   * @example
   * const users = await this.cacheHub.get('users', () => this.api.getUsers(), {
   *   dataType: DataType.REFERENCE,
   *   ttl: 30 * 60 * 1000 // 30 minutes
   * });
   */
  get<T>(
    key: string,
    factory: () => Observable<T>,
    options: Partial<CacheOptions> = {},
    namespace?: string
  ): Observable<T> {
    const startTime = Date.now();
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(key, effectiveNamespace);
    const mergedOptions = CacheUtils.mergeOptions(options, this.config, options.dataType);

    // Check cache first
    const cached = this.cache.get(fullKey);
    
    if (cached && !this.ttlManager.isExpired(cached)) {
      // Cache hit - return the same BehaviorSubject as Observable
      cached.lastAccessed = Date.now();
      cached.hits++;
      
      const responseTime = Date.now() - startTime;
      this.metricsCollector.recordHit(cached.dataType, responseTime);
      this.metricsCollector.recordNamespaceOperation(effectiveNamespace, 'hit');
      
      return cached.subject.asObservable();
    }

    // Cache miss or expired - but first check if there's already a BehaviorSubject we can reuse
    if (cached && this.ttlManager.isExpired(cached)) {
      // Keep the same subject, just refresh the data
      cached.isLoading = true;
      this.executeFactory(factory, mergedOptions).subscribe({
        next: (data) => {
          this.handleFactorySuccess(fullKey, data, mergedOptions, effectiveNamespace, startTime);
        },
        error: (error) => {
          this.handleFactoryError(fullKey, error, mergedOptions, effectiveNamespace);
        }
      });
      return cached.subject.asObservable();
    }

    // True cache miss - no entry exists
    this.metricsCollector.recordMiss(mergedOptions.dataType);
    this.metricsCollector.recordNamespaceOperation(effectiveNamespace, 'miss');

    // Create new cache entry with BehaviorSubject immediately
    const now = Date.now();
    const newEntry: CacheEntry<T> = {
      value: null as any, // Will be updated when data arrives
      key: CacheUtils.parseFullKey(fullKey).key,
      namespace: effectiveNamespace,
      createdAt: now,
      lastAccessed: now,
      expiration: now + mergedOptions.ttl!,
      size: 0, // Will be updated when data arrives
      hits: 0,
      misses: 1,
      isLoading: true,
      compressed: false,
      persistent: mergedOptions.persistToStorage || false,
      dataType: mergedOptions.dataType!,
      subject: this.observableManager.createSubject(null as any)
    };

    this.cache.set(fullKey, newEntry);

    // Execute factory and update the existing BehaviorSubject
    this.executeFactory(factory, mergedOptions).subscribe({
      next: (data) => {
        this.handleFactorySuccess(fullKey, data, mergedOptions, effectiveNamespace, startTime);
      },
      error: (error) => {
        this.handleFactoryError(fullKey, error, mergedOptions, effectiveNamespace);
      }
    });

    return newEntry.subject.asObservable().pipe(
      // Skip the initial null value and wait for real data
      filter(data => data !== null)
    );
  }

  /**
   * Set value in cache directly
   */
  set<T>(
    key: string,
    value: T,
    options: Partial<CacheOptions> = {},
    namespace?: string
  ): void {
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(key, effectiveNamespace);
    const mergedOptions = CacheUtils.mergeOptions(options, this.config, options.dataType);

    this.storeInCache(fullKey, value, mergedOptions, effectiveNamespace);
  }

  /**
   * Update existing cache entry
   */
  update<T>(
    key: string,
    value: T,
    namespace?: string
  ): boolean {
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(key, effectiveNamespace);
    const entry = this.cache.get(fullKey);

    if (!entry) return false;

    const oldSize = entry.size;
    const newSize = CacheUtils.calculateSize(value);

    entry.value = value;
    entry.size = newSize;
    entry.lastAccessed = Date.now();
    
    this.observableManager.updateEntry(entry, value);
    this.memoryManager.updateSize(newSize - oldSize);
    this.metricsCollector.recordUpdate(oldSize, newSize, entry.dataType);
    this.metricsCollector.recordNamespaceOperation(effectiveNamespace, 'update');

    return true;
  }

  /**
   * Remove specific key from cache
   */
  invalidate(key: string, namespace?: string): boolean {
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(key, effectiveNamespace);
    
    return this.removeFromCache(fullKey, 'invalidation');
  }

  /**
   * Clear entire namespace
   */
  invalidateNamespace(namespace: string): number {
    let removedCount = 0;
    const keysToRemove: string[] = [];

    for (const [fullKey] of this.cache) {
      const { namespace: entryNamespace } = CacheUtils.parseFullKey(fullKey);
      if (entryNamespace === namespace) {
        keysToRemove.push(fullKey);
      }
    }

    keysToRemove.forEach(key => {
      if (this.removeFromCache(key, 'invalidation')) {
        removedCount++;
      }
    });

    return removedCount;
  }

  /**
   * Clear cache entries matching pattern (e.g., 'countries:*')
   */
  invalidatePattern(pattern: string): number {
    let removedCount = 0;
    const keysToRemove: string[] = [];
    
    // Convert simple pattern to regex
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);

    for (const [fullKey] of this.cache) {
      if (regex.test(fullKey)) {
        keysToRemove.push(fullKey);
      }
    }

    keysToRemove.forEach(key => {
      if (this.removeFromCache(key, 'invalidation')) {
        removedCount++;
      }
    });

    return removedCount;
  }

  /**
   * Clear all cache data
   */
  clear(): void {
    const entries = Array.from(this.cache.entries());
    
    entries.forEach(([key, entry]) => {
      this.ttlManager.cancelExpiration(key);
      this.observableManager.completeSubject(entry.subject);
      this.metricsCollector.recordInvalidation(entry.size, entry.dataType);
    });

    this.cache.clear();
    this.memoryManager.reset();
  }

  /**
   * Check if key exists in cache
   */
  has(key: string, namespace?: string): boolean {
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(key, effectiveNamespace);
    const entry = this.cache.get(fullKey);
    
    return entry ? !this.ttlManager.isExpired(entry) : false;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.metricsCollector.generateReport();
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return this.memoryManager.getMemoryStats(this.cache.size);
  }

  /**
   * Subscribe to cache changes for a specific key
   */
  subscribe<T>(
    key: string,
    callback: (value: T) => void,
    namespace?: string
  ): () => void {
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(key, effectiveNamespace);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      return () => {}; // No-op unsubscribe
    }

    const subscription = this.observableManager.subscribeToEntry(entry, callback);
    
    return () => subscription.unsubscribe();
  }

  // ================== SPECIALIZED METHODS ==================

  /**
   * Cache paginated results with intelligent key generation
   */
  getPaginated<T>(
    baseKey: string,
    page: number,
    size: number,
    factory: () => Observable<PagedResult<T>>,
    filters?: any,
    options: Partial<CacheOptions> = {},
    namespace?: string
  ): Observable<PagedResult<T>> {
    const pageKey = CacheUtils.createPageKey(baseKey, page, size, filters);
    
    return this.get(pageKey, factory, {
      dataType: DataType.BUSINESS,
      ...options
    }, namespace);
  }

  /**
   * Cache select options for dropdowns
   */
  getSelectOptions(
    key: string,
    factory: () => Observable<SelectOption[]>,
    options: Partial<CacheOptions> = {},
    namespace?: string
  ): Observable<SelectOption[]> {
    return this.get(key, factory, {
      dataType: DataType.REFERENCE,
      ttl: 60 * 60 * 1000, // 1 hour default for reference data
      ...options
    }, namespace);
  }

  /**
   * Cache form validation results
   */
  getValidation(
    formType: string,
    data: any,
    validator: (data: any) => Observable<ValidationResult>,
    context?: ValidationContext,
    namespace?: string
  ): Observable<ValidationResult> {
    const validationKey = `validation_${formType}_${CacheUtils.serializeParams(data)}`;
    
    return this.get(validationKey, () => validator(data), {
      dataType: DataType.VOLATILE,
      ttl: 2 * 60 * 1000 // 2 minutes for validation
    }, namespace);
  }

  /**
   * Cache form state
   */
  cacheFormState(
    formId: string,
    state: FormValidationState,
    namespace?: string
  ): void {
    this.set(`form_state_${formId}`, state, {
      dataType: DataType.USER,
      ttl: 30 * 60 * 1000 // 30 minutes
    }, namespace);
  }

  /**
   * Get cached form state
   */
  getFormState(
    formId: string,
    namespace?: string
  ): FormValidationState | null {
    const effectiveNamespace = this.resolveNamespace(namespace);
    const fullKey = CacheUtils.buildFullKey(`form_state_${formId}`, effectiveNamespace);
    const entry = this.cache.get(fullKey);
    
    if (entry && !this.ttlManager.isExpired(entry)) {
      return entry.value;
    }
    
    return null;
  }

  // ================== UTILITY METHODS ==================

  /**
   * Preload data into cache
   */
  preload<T>(
    key: string,
    factory: () => Observable<T>,
    options: Partial<CacheOptions> = {},
    namespace?: string
  ): void {
    // Fire and forget preload
    this.get(key, factory, options, namespace).subscribe({
      next: () => {}, // Data is now cached
      error: () => {} // Ignore preload errors
    });
  }

  /**
   * Warm up cache with multiple keys
   */
  warmUp(
    warmUpConfig: Array<{
      key: string;
      factory: () => Observable<any>;
      options?: Partial<CacheOptions>;
      namespace?: string;
    }>
  ): Observable<any[]> {
    const requests = warmUpConfig.map(config =>
      this.get(config.key, config.factory, config.options, config.namespace)
    );

    return new Observable(subscriber => {
      // Execute all requests in parallel
      const results: any[] = [];
      let completed = 0;

      requests.forEach((req, index) => {
        req.subscribe({
          next: (data) => {
            results[index] = data;
          },
          error: (error) => {
            results[index] = { error };
          },
          complete: () => {
            completed++;
            if (completed === requests.length) {
              subscriber.next(results);
              subscriber.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Export cache configuration for debugging
   */
  exportConfig(): any {
    return {
      config: this.config,
      cacheSize: this.cache.size,
      memoryStats: this.getMemoryStats(),
      metrics: this.getStats(),
      activeRequests: this.observableManager.getActiveRequestStats(),
      ttlStats: this.ttlManager.getStats()
    };
  }

  ngOnDestroy(): void {
    this.clear();
    this.ttlManager.destroy();
    this.observableManager.cancelAllRequests();
  }

  // ================== PRIVATE METHODS ==================

  private resolveNamespace(namespace?: string): string {
    if (namespace) return namespace;
    
    // Try to get namespace from call stack context
    const caller = this.getCallerContext();
    if (caller && CacheDecorators.hasCacheNamespace(caller)) {
      return CacheDecorators.getNamespace(caller) || this.defaultNamespace;
    }
    
    return this.defaultNamespace;
  }

  private getCallerContext(): any {
    // This would need to be implemented based on specific Angular patterns
    // For now, return null and rely on explicit namespace passing
    return null;
  }

  private executeFactory<T>(
    factory: () => Observable<T>,
    options: CacheOptions
  ): Observable<T> {
    return factory().pipe(
      timeout(options.timeout!),
      retryWhen(errors =>
        errors.pipe(
          delay(options.retryDelay || 1000),
          take(options.retryCount!)
        )
      )
    );
  }

  private handleFactorySuccess<T>(
    fullKey: string,
    data: T,
    options: CacheOptions,
    namespace: string,
    startTime: number
  ): void {
    const responseTime = Date.now() - startTime;
    
    // Get existing entry (should exist since we created it in get())
    const entry = this.cache.get(fullKey);
    if (entry) {
      // Update the existing entry
      entry.value = data;
      entry.size = CacheUtils.calculateSize(data);
      entry.lastAccessed = Date.now();
      entry.expiration = Date.now() + options.ttl!;
      entry.isLoading = false;
      delete entry.error;
      
      // Notify all subscribers via BehaviorSubject
      entry.subject.next(data);
    } else {
      // Fallback - create new entry (shouldn't happen with new logic)
      this.storeInCache(fullKey, data, options, namespace);
    }
    
    this.metricsCollector.recordNamespaceOperation(namespace, 'set');
    
    // Update metrics with response time
    this.metricsCollector.recordOperationTime(responseTime);
  }

  private handleFactoryError(
    fullKey: string,
    error: any,
    options: CacheOptions,
    namespace: string
  ): void {
    // Store error in cache entry if it exists
    const entry = this.cache.get(fullKey);
    if (entry) {
      entry.error = error;
      entry.isLoading = false;
    }
    
    console.error(`Cache factory error for key ${fullKey}:`, error);
  }

  private storeInCache<T>(
    fullKey: string,
    value: T,
    options: CacheOptions,
    namespace: string
  ): void {
    const now = Date.now();
    const size = CacheUtils.calculateSize(value);
    const expiration = now + options.ttl!;

    // Check memory limits before storing
    if (this.memoryManager.shouldEvict(value, this.cache.size)) {
      this.performEviction();
    }

    // Handle compression if needed
    let finalValue = value;
    let compressed = false;
    
    if (options.compression || this.compressionManager.shouldCompress(value)) {
      try {
        const compressionResult = this.compressionManager.compress(value);
        if (compressionResult.compressed) {
          finalValue = compressionResult as any;
          compressed = true;
        }
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
      }
    }

    // Get existing entry or create new one
    let entry = this.cache.get(fullKey);
    const isUpdate = !!entry;
    
    if (!entry) {
      entry = {
        value: finalValue,
        key: CacheUtils.parseFullKey(fullKey).key,
        namespace,
        createdAt: now,
        lastAccessed: now,
        expiration,
        size,
        hits: 0,
        misses: 0,
        isLoading: false,
        compressed,
        persistent: options.persistToStorage || false,
        dataType: options.dataType!,
        subject: this.observableManager.createSubject(value)
      };
      
      this.cache.set(fullKey, entry);
      this.metricsCollector.recordSet(size, entry.dataType);
    } else {
      // Update existing entry
      const oldSize = entry.size;
      entry.value = finalValue;
      entry.size = size;
      entry.lastAccessed = now;
      entry.expiration = expiration;
      entry.compressed = compressed;
      entry.isLoading = false;
      delete entry.error;
      
      this.observableManager.updateEntry(entry, value);
      this.metricsCollector.recordUpdate(oldSize, size, entry.dataType);
    }

    // Update memory tracking
    this.memoryManager.updateSize(isUpdate ? 0 : size);
    
    // Schedule expiration
    this.ttlManager.scheduleExpiration(
      fullKey,
      expiration,
      (expiredKey) => this.removeFromCache(expiredKey, 'eviction')
    );
  }

  private removeFromCache(fullKey: string, reason: 'invalidation' | 'eviction'): boolean {
    const entry = this.cache.get(fullKey);
    if (!entry) return false;

    // Cancel TTL management
    this.ttlManager.cancelExpiration(fullKey);
    
    // Complete subject
    this.observableManager.completeSubject(entry.subject);
    
    // Update memory
    this.memoryManager.updateSize(-entry.size);
    
    // Update metrics
    if (reason === 'eviction') {
      this.metricsCollector.recordEviction(entry.size, entry.dataType);
    } else {
      this.metricsCollector.recordInvalidation(entry.size, entry.dataType);
    }
    
    // Remove from cache
    this.cache.delete(fullKey);
    
    return true;
  }

  private performEviction(): void {
    const allEntries = Array.from(this.cache.entries());
    const keysToEvict = this.memoryManager.selectEntriesForEviction(allEntries);
    
    keysToEvict.forEach(key => {
      this.removeFromCache(key, 'eviction');
    });
  }

  private setupPeriodicMaintenance(): void {
    // Run maintenance every 5 minutes
    timer(0, 5 * 60 * 1000).subscribe(() => {
      this.performMaintenance();
    });
  }

  private setupMemoryPressureMonitoring(): void {
    // Check memory pressure every minute
    timer(0, 60 * 1000).subscribe(() => {
      this.memoryManager.checkMemoryPressure(this.cache.size);
      
      if (this.memoryManager.needsAggressiveCleanup()) {
        this.performAggressiveCleanup();
      }
    });
  }

  private performMaintenance(): void {
    // Clean up expired entries
    const expiredKeys = this.ttlManager.getExpiredKeys(this.cache);
    expiredKeys.forEach(key => this.removeFromCache(key, 'eviction'));
    
    // Observable manager maintenance
    this.observableManager.performMaintenanceCleanup();
    
    // Check for stale TTL timers
    this.ttlManager.cleanupStaleRequests();
  }

  private performAggressiveCleanup(): void {
    
    // Clear all transient data
    const transientKeys: string[] = [];
    this.cache.forEach((entry, key) => {
      if (entry.dataType === DataType.TRANSIENT) {
        transientKeys.push(key);
      }
    });
    
    transientKeys.forEach(key => this.removeFromCache(key, 'eviction'));
    
    // If still under pressure, evict more entries
    if (this.memoryManager.needsAggressiveCleanup()) {
      this.performEviction();
    }
  }
}