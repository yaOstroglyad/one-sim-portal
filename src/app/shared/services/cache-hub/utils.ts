import { DataType, CacheOptions, CacheHubConfig } from './types';

/**
 * Utility functions for CacheHub
 */
export class CacheUtils {
  /**
   * Calculate approximate size of an object in bytes
   */
  static calculateSize(value: any): number {
    if (value === null || value === undefined) {
      return 8;
    }
    
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16 encoding
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return 8;
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).length * 2;
      } catch {
        return 1024; // Fallback for circular references
      }
    }
    
    return 8;
  }

  /**
   * Generate a cache key with namespace
   */
  static buildFullKey(key: string, namespace: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Parse namespace and key from full key
   */
  static parseFullKey(fullKey: string): { namespace: string; key: string } {
    const parts = fullKey.split(':');
    if (parts.length > 1) {
      return {
        namespace: parts[0],
        key: parts.slice(1).join(':')
      };
    }
    return {
      namespace: '',
      key: fullKey
    };
  }

  /**
   * Merge cache options with data type defaults
   */
  static mergeOptions(
    options: Partial<CacheOptions> = {},
    config: CacheHubConfig,
    dataType?: DataType
  ): CacheOptions {
    const defaults = config.defaults;
    const typeDefaults = dataType ? config.dataTypes[dataType] : {};
    
    return {
      ttl: options.ttl ?? typeDefaults.ttl ?? defaults.ttl,
      timeout: options.timeout ?? typeDefaults.timeout ?? defaults.timeout,
      retryCount: options.retryCount ?? typeDefaults.retryCount ?? defaults.retryCount,
      retryDelay: options.retryDelay ?? typeDefaults.retryDelay ?? 1000,
      compression: options.compression ?? typeDefaults.compression ?? false,
      persistToStorage: options.persistToStorage ?? typeDefaults.persistToStorage ?? false,
      dataType: dataType ?? DataType.BUSINESS
    };
  }

  /**
   * Generate a unique ID for actions/requests
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if a value should be compressed
   */
  static shouldCompress(value: any, threshold: number = 1024 * 1024): boolean {
    return this.calculateSize(value) > threshold;
  }

  /**
   * Serialize cache key parameters for consistent caching
   */
  static serializeParams(params: any): string {
    if (!params || typeof params !== 'object') {
      return String(params || '');
    }

    try {
      // Sort keys for consistent serialization
      const sortedKeys = Object.keys(params).sort();
      const sortedParams = sortedKeys.reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as any);

      return btoa(JSON.stringify(sortedParams)).replace(/[^a-zA-Z0-9]/g, '');
    } catch {
      return String(params);
    }
  }

  /**
   * Create a cache key for paginated results
   */
  static createPageKey(baseKey: string, page: number, size: number, filters?: any): string {
    const parts = [baseKey, `page-${page}`, `size-${size}`];
    
    if (filters) {
      const filterStr = this.serializeParams(filters);
      if (filterStr) {
        parts.push(`filters-${filterStr}`);
      }
    }
    
    return parts.join('_');
  }

  /**
   * Check if browser supports localStorage
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const test = '__cache_hub_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if browser supports IndexedDB
   */
  static isIndexedDBAvailable(): boolean {
    try {
      return !!window.indexedDB;
    } catch {
      return false;
    }
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: any;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  /**
   * Deep clone an object (for cache entry isolation)
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const copy = {} as T;
      Object.keys(obj).forEach(key => {
        (copy as any)[key] = this.deepClone((obj as any)[key]);
      });
      return copy;
    }

    return obj;
  }

  /**
   * Check if two objects are equal (for change detection)
   */
  static isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      
      if (aKeys.length !== bKeys.length) return false;
      
      return aKeys.every(key => this.isEqual(a[key], b[key]));
    }

    return false;
  }

  /**
   * Format bytes for human-readable display
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Format duration for human-readable display
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }
}