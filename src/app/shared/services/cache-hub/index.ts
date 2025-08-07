/**
 * CacheHub - Intelligent Caching System for Angular Applications
 * 
 * A comprehensive caching solution with automatic TTL management,
 * memory pressure monitoring, request deduplication, and reactive updates.
 * 
 * @example
 * // Modern Angular usage with inject()
 * import { inject } from '@angular/core';
 * import { HttpClient } from '@angular/common/http';
 * import { CacheHubService, DataType } from './cache-hub';
 * 
 * @Injectable({ providedIn: 'root' })
 * export class UserService {
 *   private readonly http = inject(HttpClient);
 *   private readonly cacheHub = inject(CacheHubService);
 * 
 *   getUsers() {
 *     return this.cacheHub.get('users', () => this.http.get('/api/users'), {
 *       dataType: DataType.REFERENCE,
 *       ttl: 30 * 60 * 1000 // 30 minutes
 *     });
 *   }
 * }
 * 
 * @example
 * // Legacy constructor injection (still supported)
 * constructor(
 *   private cacheHub: CacheHubService,
 *   private http: HttpClient
 * ) {}
 */

// Core Service
export { CacheHubService } from './cache-hub.service';

// Types and Interfaces
export {
  DataType,
  CacheOptions,
  CacheEntry,
  CacheStats,
  MemoryStats,
  CacheHubConfig,
  CacheMetrics,
  SelectOption,
  PagedResult,
  FormValidationState,
  ValidationContext,
  ValidationResult
} from './types';

// Configuration
export {
  DEFAULT_CACHE_HUB_CONFIG,
  CACHE_HUB_CONFIG,
  createCacheHubConfig
} from './config';

// Utilities
export { CacheUtils } from './utils';

// Decorators
export {
  CacheNamespace,
  CacheMethod,
  InvalidateOn,
  CacheDecorators,
  hasCacheNamespace,
  CacheableService,
  DEFAULT_CACHE_OPTIONS
} from './namespace.decorator';

// Storage Services
export {
  PersistentStorage,
  LocalStorageService
} from './storage/local-storage.service';
export { IndexedDBService } from './storage/indexed-db.service';

// Management Services
export { MemoryManager } from './memory-manager';
export { TTLManager } from './ttl-manager';
export { CompressionManager } from './compression-manager';
export { ObservableManager } from './observable-manager';
export { MetricsCollector } from './metrics-collector';

// Testing Utilities - Available only in test environment
// export {
//   MockCacheHubService,
//   createMockCacheHub,
//   CacheHubTestUtils
// } from './testing/cache-hub.mock';
// export {
//   CacheHubSpecHelper,
//   CacheHubTestPatterns,
//   CacheHubTestConfig
// } from './testing/cache-hub.spec-helper';

// Usage Example
export { ExampleUsageService } from './usage-example.service';

/**
 * CacheHub Module Configuration
 * 
 * To use CacheHub with custom configuration:
 * 
 * @example
 * import { CACHE_HUB_CONFIG, createCacheHubConfig } from './cache-hub';
 * 
 * @NgModule({
 *   providers: [
 *     {
 *       provide: CACHE_HUB_CONFIG,
 *       useValue: createCacheHubConfig({
 *         maxCacheSize: 200,
 *         maxSizeBytes: 100 * 1024 * 1024, // 100MB
 *         defaults: {
 *           ttl: 10 * 60 * 1000 // 10 minutes
 *         }
 *       })
 *     }
 *   ]
 * })
 * export class AppModule {}
 */

/**
 * Namespace Decorator Usage with inject()
 * 
 * @example
 * import { inject } from '@angular/core';
 * import { HttpClient } from '@angular/common/http';
 * import { CacheNamespace, CacheMethod, CacheHubService } from './cache-hub';
 * 
 * @CacheNamespace('products')
 * @Injectable({ providedIn: 'root' })
 * export class ProductService {
 *   private readonly http = inject(HttpClient);
 *   private readonly cacheHub = inject(CacheHubService);
 *   
 *   @CacheMethod('products-list')
 *   getProducts() {
 *     return this.cacheHub.get('list', () => this.http.get('/api/products'));
 *   }
 * }
 */

/**
 * Testing with CacheHub
 * 
 * For testing purposes, you can mock the CacheHubService:
 * 
 * @example
 * // Create a simple mock in your test
 * const mockCacheHub = {
 *   get: jasmine.createSpy('get').and.returnValue(of(mockData)),
 *   set: jasmine.createSpy('set'),
 *   invalidate: jasmine.createSpy('invalidate')
 * };
 * 
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: CacheHubService, useValue: mockCacheHub }
 *   ]
 * });
 */

/**
 * Performance Patterns
 * 
 * @example
 * // Preload critical data
 * this.cacheHub.preload('critical-data', () => this.api.getCriticalData());
 * 
 * // Warm up multiple endpoints
 * this.cacheHub.warmUp([
 *   { key: 'users', factory: () => this.api.getUsers() },
 *   { key: 'settings', factory: () => this.api.getSettings() }
 * ]);
 * 
 * // Paginated data caching
 * this.cacheHub.getPaginated('products', page, size, 
 *   () => this.api.getProducts(page, size)
 * );
 */

/**
 * Memory Management
 * 
 * CacheHub automatically manages memory with:
 * - LRU eviction when memory pressure is high
 * - Automatic cleanup of expired entries
 * - Compression of large objects
 * - Configurable memory limits
 * 
 * Monitor performance with:
 * - cacheHub.getStats() - Cache hit rates and performance
 * - cacheHub.getMemoryStats() - Memory usage and pressure
 * - cacheHub.exportConfig() - Complete configuration dump
 */

/**
 * Data Type Best Practices
 * 
 * Choose appropriate DataType for optimal performance:
 * - STATIC: Configuration, countries, currencies (24h TTL)
 * - REFERENCE: Categories, providers, lookups (1h TTL)
 * - BUSINESS: Products, orders, regular data (5m TTL)
 * - VOLATILE: Metrics, counts, frequently changing (1m TTL)
 * - USER: Profile, settings, user-specific (30m TTL)
 * - TRANSIENT: Temporary data, form states (30s TTL)
 */