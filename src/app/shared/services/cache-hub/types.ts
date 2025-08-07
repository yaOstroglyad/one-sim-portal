import { Observable, BehaviorSubject, Subscription } from 'rxjs';

/**
 * Data types for automatic TTL configuration
 */
export enum DataType {
  STATIC = 'static',           // 24 hours - rarely changes (countries, currencies)
  REFERENCE = 'reference',     // 1 hour - occasionally changes (categories, providers)
  BUSINESS = 'business',       // 5 minutes - regular business data (products, orders)
  VOLATILE = 'volatile',       // 1 minute - frequently changing (metrics, counts)
  USER = 'user',              // 30 minutes - user-specific data (profile, settings)
  TRANSIENT = 'transient'     // 30 seconds - temporary data
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  ttl?: number;                // Time to live in milliseconds
  timeout?: number;            // Request timeout (default: 30000)
  retryCount?: number;         // Retry attempts (default: 1)
  retryDelay?: number;         // Delay between retries (default: 1000)
  compression?: boolean;       // Compress large objects (default: false)
  persistToStorage?: boolean;  // Save to localStorage (default: false)
  dataType?: DataType;         // Auto-configure based on data type
}

/**
 * Cache entry internal structure
 */
export interface CacheEntry<T> {
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

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  size: number;              // Number of entries
  sizeBytes: number;         // Total size in bytes
  hits: number;              // Total cache hits
  misses: number;            // Total cache misses
  hitRate: number;           // Hit rate percentage
  oldestEntry: Date;         // Oldest cache entry
  memoryPressure: 'low' | 'medium' | 'high';
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  currentSizeBytes: number;
  maxSizeBytes: number;
  usagePercentage: number;
  pressure: 'low' | 'medium' | 'high';
  entryCount: number;
  maxEntryCount: number;
}

/**
 * Global CacheHub configuration
 */
export interface CacheHubConfig {
  defaults: {
    ttl: number;
    timeout: number;
    retryCount: number;
  };
  maxCacheSize: number;
  maxSizeBytes: number;
  dataTypes: {
    [key in DataType]: Partial<CacheOptions>;
  };
}

/**
 * Cache metrics for performance monitoring
 */
export interface CacheMetrics {
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

/**
 * Select option for form dropdowns
 */
export interface SelectOption {
  value: any;
  label: string;
  data?: any;
}

/**
 * Paginated result wrapper
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: { [field: string]: string[] };
  timestamp: number;
}

/**
 * Validation context for cached validation
 */
export interface ValidationContext {
  formType: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}