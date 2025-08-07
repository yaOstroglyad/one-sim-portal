import { Injectable } from '@angular/core';
import { PersistentStorage } from './local-storage.service';
import { CacheUtils } from '../utils';

/**
 * IndexedDB item structure
 */
interface IndexedDBItem<T> {
  key: string;
  value: T;
  expiration: number;
  createdAt: number;
  size: number;
  compressed: boolean;
}

/**
 * IndexedDB implementation of persistent storage
 * Better for larger datasets and more complex queries
 */
@Injectable({
  providedIn: 'root'
})
export class IndexedDBService implements PersistentStorage {
  private readonly dbName = 'CacheHubDB';
  private readonly dbVersion = 1;
  private readonly storeName = 'cache_entries';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB().then(() => {
      this.cleanup();
    });
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    if (!CacheUtils.isIndexedDBAvailable()) {
      throw new Error('IndexedDB is not available');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          
          // Create indexes for efficient queries
          store.createIndex('expiration', 'expiration', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  /**
   * Get value from IndexedDB
   */
  async get<T>(key: string): Promise<T | null> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const item: IndexedDBItem<T> | undefined = request.result;
        
        if (!item) {
          resolve(null);
          return;
        }

        // Check expiration
        if (Date.now() > item.expiration) {
          this.remove(key); // Async cleanup
          resolve(null);
          return;
        }

        resolve(item.value);
      };

      request.onerror = () => {
        console.warn('IndexedDB get error:', request.error);
        resolve(null);
      };
    });
  }

  /**
   * Set value in IndexedDB
   */
  async set<T>(key: string, value: T, expiration: number = Date.now() + 24 * 60 * 60 * 1000): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const item: IndexedDBItem<T> = {
        key,
        value,
        expiration,
        createdAt: Date.now(),
        size: CacheUtils.calculateSize(value),
        compressed: false
      };

      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.warn('IndexedDB set error:', request.error);
        reject(new Error('Failed to store in IndexedDB'));
      };
    });
  }

  /**
   * Remove value from IndexedDB
   */
  async remove(key: string): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.warn('IndexedDB remove error:', request.error);
        resolve(); // Don't fail on remove errors
      };
    });
  }

  /**
   * Clear all data from IndexedDB
   */
  async clear(): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.warn('IndexedDB clear error:', request.error);
        resolve();
      };
    });
  }

  /**
   * Get all keys from IndexedDB
   */
  async keys(): Promise<string[]> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.warn('IndexedDB keys error:', request.error);
        resolve([]);
      };
    });
  }

  /**
   * Get approximate size of stored data
   */
  async size(): Promise<number> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: IndexedDBItem<any>[] = request.result;
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        resolve(totalSize);
      };

      request.onerror = () => {
        console.warn('IndexedDB size error:', request.error);
        resolve(0);
      };
    });
  }

  /**
   * Get detailed statistics about stored data
   */
  async getStats(): Promise<{
    itemCount: number;
    totalSize: number;
    expiredCount: number;
    averageItemSize: number;
    oldestItem: Date | null;
    newestItem: Date | null;
    sizeDistribution: { [range: string]: number };
  }> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: IndexedDBItem<any>[] = request.result;
        const now = Date.now();

        let totalSize = 0;
        let expiredCount = 0;
        let oldestDate: number | null = null;
        let newestDate: number | null = null;
        const sizeDistribution: { [range: string]: number } = {
          'small (< 1KB)': 0,
          'medium (1KB - 100KB)': 0,
          'large (100KB - 1MB)': 0,
          'huge (> 1MB)': 0
        };

        items.forEach(item => {
          totalSize += item.size;

          if (now > item.expiration) {
            expiredCount++;
          }

          if (oldestDate === null || item.createdAt < oldestDate) {
            oldestDate = item.createdAt;
          }

          if (newestDate === null || item.createdAt > newestDate) {
            newestDate = item.createdAt;
          }

          // Size distribution
          if (item.size < 1024) {
            sizeDistribution['small (< 1KB)']++;
          } else if (item.size < 100 * 1024) {
            sizeDistribution['medium (1KB - 100KB)']++;
          } else if (item.size < 1024 * 1024) {
            sizeDistribution['large (100KB - 1MB)']++;
          } else {
            sizeDistribution['huge (> 1MB)']++;
          }
        });

        resolve({
          itemCount: items.length,
          totalSize,
          expiredCount,
          averageItemSize: items.length > 0 ? totalSize / items.length : 0,
          oldestItem: oldestDate ? new Date(oldestDate) : null,
          newestItem: newestDate ? new Date(newestDate) : null,
          sizeDistribution
        });
      };

      request.onerror = () => {
        console.warn('IndexedDB stats error:', request.error);
        resolve({
          itemCount: 0,
          totalSize: 0,
          expiredCount: 0,
          averageItemSize: 0,
          oldestItem: null,
          newestItem: null,
          sizeDistribution: {}
        });
      };
    });
  }

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<number> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiration');
      
      // Get all expired items
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      let removedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          cursor.delete();
          removedCount++;
          cursor.continue();
        } else {
          resolve(removedCount);
        }
      };

      request.onerror = () => {
        console.warn('IndexedDB cleanup error:', request.error);
        resolve(0);
      };
    });
  }

  /**
   * Query items by expiration date
   */
  async getExpiredItems(): Promise<string[]> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiration');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.getAllKeys(range);

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.warn('IndexedDB getExpiredItems error:', request.error);
        resolve([]);
      };
    });
  }

  /**
   * Get items older than specified date
   */
  async getItemsOlderThan(date: Date): Promise<string[]> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('createdAt');
      
      const range = IDBKeyRange.upperBound(date.getTime());
      const request = index.getAllKeys(range);

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.warn('IndexedDB getItemsOlderThan error:', request.error);
        resolve([]);
      };
    });
  }

  /**
   * Get largest items for space optimization
   */
  async getLargestItems(limit: number = 10): Promise<Array<{ key: string; size: number }>> {
    await this.ensureDB();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: IndexedDBItem<any>[] = request.result;
        
        const sortedBySize = items
          .map(item => ({ key: item.key, size: item.size }))
          .sort((a, b) => b.size - a.size)
          .slice(0, limit);

        resolve(sortedBySize);
      };

      request.onerror = () => {
        console.warn('IndexedDB getLargestItems error:', request.error);
        resolve([]);
      };
    });
  }

  /**
   * Check if IndexedDB is available
   */
  isAvailable(): boolean {
    return CacheUtils.isIndexedDBAvailable();
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
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

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }
}