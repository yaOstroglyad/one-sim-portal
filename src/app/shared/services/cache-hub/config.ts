import { InjectionToken } from '@angular/core';
import { CacheHubConfig, DataType } from './types';

/**
 * Default configuration for CacheHub
 */
export const DEFAULT_CACHE_HUB_CONFIG: CacheHubConfig = {
  defaults: {
    ttl: 5 * 60 * 1000,        // 5 minutes default TTL
    timeout: 30000,            // 30 second timeout
    retryCount: 1              // 1 retry attempt
  },
  maxCacheSize: 100,           // Maximum 100 cache entries
  maxSizeBytes: 50 * 1024 * 1024, // 50MB maximum cache size
  dataTypes: {
    [DataType.STATIC]: {
      ttl: 24 * 60 * 60 * 1000,    // 24 hours
      persistToStorage: true
    },
    [DataType.REFERENCE]: {
      ttl: 60 * 60 * 1000,         // 1 hour
      persistToStorage: true
    },
    [DataType.BUSINESS]: {
      ttl: 5 * 60 * 1000           // 5 minutes (default)
    },
    [DataType.VOLATILE]: {
      ttl: 60 * 1000               // 1 minute
    },
    [DataType.USER]: {
      ttl: 30 * 60 * 1000,         // 30 minutes
      persistToStorage: true
    },
    [DataType.TRANSIENT]: {
      ttl: 30 * 1000               // 30 seconds
    }
  }
};

/**
 * Injection token for CacheHub configuration
 */
export const CACHE_HUB_CONFIG = new InjectionToken<CacheHubConfig>('CacheHubConfig', {
  providedIn: 'root',
  factory: () => DEFAULT_CACHE_HUB_CONFIG
});

/**
 * Utility function to merge user config with defaults
 */
export function createCacheHubConfig(userConfig: Partial<CacheHubConfig> = {}): CacheHubConfig {
  return {
    defaults: {
      ...DEFAULT_CACHE_HUB_CONFIG.defaults,
      ...userConfig.defaults
    },
    maxCacheSize: userConfig.maxCacheSize ?? DEFAULT_CACHE_HUB_CONFIG.maxCacheSize,
    maxSizeBytes: userConfig.maxSizeBytes ?? DEFAULT_CACHE_HUB_CONFIG.maxSizeBytes,
    dataTypes: {
      ...DEFAULT_CACHE_HUB_CONFIG.dataTypes,
      ...userConfig.dataTypes
    }
  };
}