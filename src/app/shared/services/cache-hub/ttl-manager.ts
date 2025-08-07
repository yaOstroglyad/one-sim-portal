import { Injectable } from '@angular/core';
import { CacheEntry } from './types';

/**
 * Item in the expiration queue
 */
interface ExpirationItem {
  key: string;
  expirationTime: number;
}

/**
 * Simple priority queue implementation for TTL management
 */
class PriorityQueue<T extends { expirationTime: number }> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
    this.items.sort((a, b) => a.expirationTime - b.expirationTime);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  remove(predicate: (item: T) => boolean): boolean {
    const index = this.items.findIndex(predicate);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  clear(): void {
    this.items = [];
  }

  size(): number {
    return this.items.length;
  }
}

/**
 * Manages TTL expiration for cache entries
 */
@Injectable({
  providedIn: 'root'
})
export class TTLManager {
  private expirationTimers = new Map<string, number>();
  private expirationQueue = new PriorityQueue<ExpirationItem>();
  private batchProcessingInterval?: number;

  constructor() {
    this.setupBatchExpiration();
  }

  /**
   * Schedule expiration for a cache entry
   */
  scheduleExpiration(key: string, expirationTime: number, onExpire: (key: string) => void): void {
    // Cancel existing timer if any
    this.cancelExpiration(key);

    const delay = expirationTime - Date.now();
    
    if (delay <= 0) {
      // Already expired
      onExpire(key);
      return;
    }

    if (delay <= 300000) { // 5 minutes or less - use timer for precision
      const timerId = window.setTimeout(() => {
        onExpire(key);
        this.expirationTimers.delete(key);
      }, delay);
      
      this.expirationTimers.set(key, timerId);
    } else {
      // Longer delays - use batch processing for efficiency
      this.expirationQueue.enqueue({
        key,
        expirationTime
      });
    }
  }

  /**
   * Cancel scheduled expiration for a key
   */
  cancelExpiration(key: string): void {
    // Cancel timer if exists
    const timerId = this.expirationTimers.get(key);
    if (timerId) {
      clearTimeout(timerId);
      this.expirationTimers.delete(key);
    }

    // Remove from queue
    this.expirationQueue.remove(item => item.key === key);
  }

  /**
   * Check if an entry has expired
   */
  isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiration;
  }

  /**
   * Get time until expiration (in milliseconds)
   */
  getTimeToExpiration(entry: CacheEntry<any>): number {
    return Math.max(0, entry.expiration - Date.now());
  }

  /**
   * Check if entry will expire soon (within next 5 minutes)
   */
  isExpiringSoon(entry: CacheEntry<any>, threshold: number = 5 * 60 * 1000): boolean {
    return this.getTimeToExpiration(entry) <= threshold;
  }

  /**
   * Update expiration time for an existing entry
   */
  updateExpiration(key: string, newExpirationTime: number, onExpire: (key: string) => void): void {
    this.cancelExpiration(key);
    this.scheduleExpiration(key, newExpirationTime, onExpire);
  }

  /**
   * Get all entries that are expired or expiring soon
   */
  getExpiredKeys(allEntries: Map<string, CacheEntry<any>>): string[] {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of allEntries.entries()) {
      if (now > entry.expiration) {
        expiredKeys.push(key);
      }
    }

    return expiredKeys;
  }

  /**
   * Clean up all timers and intervals
   */
  destroy(): void {
    // Clear all timers
    this.expirationTimers.forEach(timerId => clearTimeout(timerId));
    this.expirationTimers.clear();
    
    // Clear batch processing
    if (this.batchProcessingInterval) {
      clearInterval(this.batchProcessingInterval);
      this.batchProcessingInterval = undefined;
    }
    
    // Clear queue
    this.expirationQueue.clear();
  }

  /**
   * Get statistics about TTL management
   */
  getStats(): {
    activeTimers: number;
    queuedItems: number;
    totalManaged: number;
  } {
    return {
      activeTimers: this.expirationTimers.size,
      queuedItems: this.expirationQueue.size(),
      totalManaged: this.expirationTimers.size + this.expirationQueue.size()
    };
  }

  /**
   * Setup batch processing for long-term expirations
   */
  private setupBatchExpiration(): void {
    // Process expiration queue every minute
    this.batchProcessingInterval = window.setInterval(() => {
      this.processBatchExpirations();
    }, 60000);
  }

  /**
   * Process items in the expiration queue
   */
  private processBatchExpirations(): void {
    const now = Date.now();
    const itemsToSchedule: ExpirationItem[] = [];

    // Process items that should expire within next 5 minutes
    while (!this.expirationQueue.isEmpty()) {
      const item = this.expirationQueue.peek();
      if (!item || item.expirationTime > now + 300000) {
        break; // Future items
      }

      const expiredItem = this.expirationQueue.dequeue()!;
      
      if (expiredItem.expirationTime <= now) {
        // Already expired - would be handled by the main cleanup
        continue;
      } else {
        // Schedule with timer for precise timing
        itemsToSchedule.push(expiredItem);
      }
    }

    // Schedule items with timers
    itemsToSchedule.forEach(item => {
      const delay = item.expirationTime - now;
      const timerId = window.setTimeout(() => {
        // This will be handled by the cache service
        this.expirationTimers.delete(item.key);
      }, delay);
      
      this.expirationTimers.set(item.key, timerId);
    });
  }

  /**
   * Force process all scheduled expirations (for testing)
   */
  processAllExpirations(onExpire: (key: string) => void): void {
    const now = Date.now();
    
    // Process timers
    const expiredTimers: string[] = [];
    this.expirationTimers.forEach((timerId, key) => {
      clearTimeout(timerId);
      expiredTimers.push(key);
    });
    
    expiredTimers.forEach(key => {
      this.expirationTimers.delete(key);
      onExpire(key);
    });
    
    // Process queue
    const expiredFromQueue: ExpirationItem[] = [];
    while (!this.expirationQueue.isEmpty()) {
      const item = this.expirationQueue.dequeue()!;
      if (item.expirationTime <= now) {
        expiredFromQueue.push(item);
      }
    }
    
    expiredFromQueue.forEach(item => {
      onExpire(item.key);
    });
  }

  /**
   * Cleanup stale TTL timers (for maintenance)
   */
  cleanupStaleRequests(maxAge: number = 5 * 60 * 1000): number {
    const now = Date.now();
    
    // Clean up expired items from queue
    const expiredItems: ExpirationItem[] = [];
    while (!this.expirationQueue.isEmpty()) {
      const item = this.expirationQueue.peek();
      if (!item || item.expirationTime > now) {
        break;
      }
      expiredItems.push(this.expirationQueue.dequeue()!);
    }
    
    return expiredItems.length;
  }
}