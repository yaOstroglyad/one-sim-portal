import { Injectable } from '@angular/core';
import { CacheUtils } from '../utils';

/**
 * Persistent storage interface
 */
export interface PersistentStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, expiration?: number): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

/**
 * Stored item with metadata
 */
interface StoredItem<T> {
  value: T;
  expiration: number;
  createdAt: number;
  size: number;
  compressed: boolean;
}

/**
 * LocalStorage implementation of persistent storage
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements PersistentStorage {
  private readonly prefix = 'cachehub_';
  private readonly maxItemSize = 1024 * 1024 * 5; // 5MB limit for localStorage
  
  constructor() {
    this.cleanup();
  }

  /**
   * Get value from localStorage
   */
  async get<T>(key: string): Promise<T | null> {
    if (!CacheUtils.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const fullKey = this.getFullKey(key);
      const stored = localStorage.getItem(fullKey);
      
      if (!stored) {
        return null;
      }

      const item: StoredItem<T> = JSON.parse(stored);
      
      // Check expiration
      if (Date.now() > item.expiration) {
        await this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('LocalStorage get error:', error);
      return null;
    }
  }

  /**
   * Set value in localStorage
   */
  async set<T>(key: string, value: T, expiration: number = Date.now() + 24 * 60 * 60 * 1000): Promise<void> {
    if (!CacheUtils.isLocalStorageAvailable()) {
      return;
    }

    try {
      const size = CacheUtils.calculateSize(value);
      
      // Check size limit
      if (size > this.maxItemSize) {
        console.warn(`Value too large for localStorage: ${CacheUtils.formatBytes(size)}`);
        return;
      }

      const item: StoredItem<T> = {
        value,
        expiration,
        createdAt: Date.now(),
        size,
        compressed: false
      };

      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(item);
      
      // Try to store, handle quota exceeded
      try {
        localStorage.setItem(fullKey, serialized);
      } catch (quotaError) {
        // Clear some space and try again
        await this.freeUpSpace(serialized.length);
        localStorage.setItem(fullKey, serialized);
      }
    } catch (error) {
      console.warn('LocalStorage set error:', error);
      throw error;
    }
  }

  /**
   * Remove value from localStorage
   */
  async remove(key: string): Promise<void> {
    if (!CacheUtils.isLocalStorageAvailable()) {
      return;
    }

    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.warn('LocalStorage remove error:', error);
    }
  }

  /**
   * Clear all CacheHub data from localStorage
   */
  async clear(): Promise<void> {
    if (!CacheUtils.isLocalStorageAvailable()) {
      return;
    }

    try {
      const keys = await this.keys();
      keys.forEach(key => localStorage.removeItem(this.getFullKey(key)));
    } catch (error) {
      console.warn('LocalStorage clear error:', error);
    }
  }

  /**
   * Get all CacheHub keys from localStorage
   */
  async keys(): Promise<string[]> {
    if (!CacheUtils.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const keys: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      
      return keys;
    } catch (error) {
      console.warn('LocalStorage keys error:', error);
      return [];
    }
  }

  /**
   * Get approximate size of stored data
   */
  async size(): Promise<number> {
    if (!CacheUtils.isLocalStorageAvailable()) {
      return 0;
    }

    try {
      let totalSize = 0;
      const keys = await this.keys();
      
      for (const key of keys) {
        const fullKey = this.getFullKey(key);
        const item = localStorage.getItem(fullKey);
        if (item) {
          totalSize += item.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.warn('LocalStorage size error:', error);
      return 0;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    itemCount: number;
    totalSize: number;
    expiredCount: number;
    oldestItem: Date | null;
    newestItem: Date | null;
  }> {
    const keys = await this.keys();
    let expiredCount = 0;
    let oldestDate: number | null = null;
    let newestDate: number | null = null;
    const totalSize = await this.size();

    for (const key of keys) {
      try {
        const fullKey = this.getFullKey(key);
        const stored = localStorage.getItem(fullKey);
        
        if (stored) {
          const item: StoredItem<any> = JSON.parse(stored);
          
          if (Date.now() > item.expiration) {
            expiredCount++;
          }
          
          if (oldestDate === null || item.createdAt < oldestDate) {
            oldestDate = item.createdAt;
          }
          
          if (newestDate === null || item.createdAt > newestDate) {
            newestDate = item.createdAt;
          }
        }
      } catch (error) {
        // Skip corrupted items
      }
    }

    return {
      itemCount: keys.length,
      totalSize,
      expiredCount,
      oldestItem: oldestDate ? new Date(oldestDate) : null,
      newestItem: newestDate ? new Date(newestDate) : null
    };
  }

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<number> {
    const keys = await this.keys();
    let removedCount = 0;

    for (const key of keys) {
      try {
        const fullKey = this.getFullKey(key);
        const stored = localStorage.getItem(fullKey);
        
        if (stored) {
          const item: StoredItem<any> = JSON.parse(stored);
          
          if (Date.now() > item.expiration) {
            localStorage.removeItem(fullKey);
            removedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted items
        localStorage.removeItem(this.getFullKey(key));
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Check if localStorage is available and working
   */
  isAvailable(): boolean {
    return CacheUtils.isLocalStorageAvailable();
  }

  /**
   * Get the remaining storage quota
   */
  async getRemainingQuota(): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      // Estimate localStorage quota (usually 5-10MB)
      const totalQuota = 5 * 1024 * 1024; // 5MB estimate
      const usedSpace = await this.size();
      
      return Math.max(0, totalQuota - usedSpace);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Import data from another storage implementation
   */
  async importData(data: { [key: string]: any }): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value);
    }
  }

  /**
   * Export all data for backup/migration
   */
  async exportData(): Promise<{ [key: string]: any }> {
    const keys = await this.keys();
    const data: { [key: string]: any } = {};

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        data[key] = value;
      }
    }

    return data;
  }

  private getFullKey(key: string): string {
    return this.prefix + key;
  }

  private async freeUpSpace(requiredSpace: number): Promise<void> {
    const keys = await this.keys();
    const items: Array<{ key: string; createdAt: number; size: number }> = [];

    // Collect item metadata
    for (const key of keys) {
      try {
        const fullKey = this.getFullKey(key);
        const stored = localStorage.getItem(fullKey);
        
        if (stored) {
          const item: StoredItem<any> = JSON.parse(stored);
          items.push({
            key,
            createdAt: item.createdAt,
            size: stored.length
          });
        }
      } catch (error) {
        // Skip corrupted items
      }
    }

    // Sort by oldest first
    items.sort((a, b) => a.createdAt - b.createdAt);

    // Remove oldest items until we have enough space
    let freedSpace = 0;
    for (const item of items) {
      if (freedSpace >= requiredSpace) {
        break;
      }

      await this.remove(item.key);
      freedSpace += item.size;
    }
  }
}