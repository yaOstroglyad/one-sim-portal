import { Injectable, inject } from '@angular/core';
import { CacheEntry, MemoryStats, DataType, CacheHubConfig } from './types';
import { CacheUtils } from './utils';
import { CACHE_HUB_CONFIG } from './config';

/**
 * Manages memory usage and implements LRU eviction
 */
@Injectable({
  providedIn: 'root'
})
export class MemoryManager {
  private readonly config = inject(CACHE_HUB_CONFIG);
  private readonly maxCacheSize: number;
  private readonly maxSizeBytes: number;
  private currentSizeBytes = 0;
  private memoryPressure: 'low' | 'medium' | 'high' = 'low';

  constructor() {
    this.maxCacheSize = this.config.maxCacheSize;
    this.maxSizeBytes = this.config.maxSizeBytes;
  }

  /**
   * Check if adding new value would exceed memory limits
   */
  shouldEvict(newValue: any, currentSize: number): boolean {
    const estimatedSize = CacheUtils.calculateSize(newValue);
    const wouldExceedSize = this.currentSizeBytes + estimatedSize > this.maxSizeBytes;
    const wouldExceedCount = currentSize >= this.maxCacheSize;

    return wouldExceedSize || wouldExceedCount;
  }

  /**
   * Select entries for eviction using LRU + priority algorithm
   */
  selectEntriesForEviction(
    allEntries: Array<[string, CacheEntry<any>]>
  ): string[] {
    const scoredEntries = allEntries.map(([fullKey, entry]) => ({
      fullKey,
      score: this.calculateEvictionScore(entry)
    })).sort((a, b) => b.score - a.score); // Higher score = more likely to evict

    // Evict enough entries to get below 80% capacity
    const targetSize = this.maxSizeBytes * 0.8;
    const targetCount = this.maxCacheSize * 0.8;
    
    const toEvict: string[] = [];
    let freedSize = 0;
    let freedCount = 0;

    for (const { fullKey, score } of scoredEntries) {
      const entry = allEntries.find(([key]) => key === fullKey)?.[1];
      if (!entry) continue;

      if (freedSize >= (this.currentSizeBytes - targetSize) && 
          freedCount >= (allEntries.length - targetCount)) {
        break;
      }
      
      toEvict.push(fullKey);
      freedSize += entry.size;
      freedCount++;
    }

    return toEvict;
  }

  /**
   * Calculate eviction score for an entry
   * Higher score = more likely to be evicted
   */
  private calculateEvictionScore(entry: CacheEntry<any>): number {
    const now = Date.now();
    const age = now - entry.lastAccessed;
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
    
    // Access frequency (lower hit count = higher eviction score)
    const accessWeight = Math.max(1, 100 / (entry.hits + 1));
    
    // Higher score = more likely to be evicted
    return (sizeWeight * 0.2) + (ageWeight * 0.3) + (typeWeight * 0.3) + (accessWeight * 0.2);
  }

  /**
   * Update memory usage tracking
   */
  updateSize(delta: number): void {
    this.currentSizeBytes += delta;
    this.updateMemoryPressure();
  }

  /**
   * Check and update current memory pressure
   */
  checkMemoryPressure(currentEntryCount: number): void {
    this.updateMemoryPressure(currentEntryCount);
    
    if (this.memoryPressure === 'high') {
      console.warn('🔥 High memory pressure detected in CacheHub');
    }
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(currentEntryCount: number): MemoryStats {
    return {
      currentSizeBytes: this.currentSizeBytes,
      maxSizeBytes: this.maxSizeBytes,
      usagePercentage: (this.currentSizeBytes / this.maxSizeBytes) * 100,
      pressure: this.memoryPressure,
      entryCount: currentEntryCount,
      maxEntryCount: this.maxCacheSize
    };
  }

  /**
   * Reset memory tracking (for testing or manual cleanup)
   */
  reset(): void {
    this.currentSizeBytes = 0;
    this.memoryPressure = 'low';
  }

  /**
   * Estimate memory needed for a value
   */
  estimateSize(value: any): number {
    return CacheUtils.calculateSize(value);
  }

  /**
   * Update memory pressure based on current usage
   */
  private updateMemoryPressure(currentEntryCount?: number): void {
    const usagePercentage = (this.currentSizeBytes / this.maxSizeBytes) * 100;
    let countPercentage = 0;
    
    if (currentEntryCount !== undefined) {
      countPercentage = (currentEntryCount / this.maxCacheSize) * 100;
    }
    
    const maxPercentage = Math.max(usagePercentage, countPercentage);
    
    if (maxPercentage > 90) {
      this.memoryPressure = 'high';
    } else if (maxPercentage > 70) {
      this.memoryPressure = 'medium';
    } else {
      this.memoryPressure = 'low';
    }
  }

  /**
   * Check if aggressive cleanup is needed
   */
  needsAggressiveCleanup(): boolean {
    return this.memoryPressure === 'high';
  }

  /**
   * Get cleanup recommendations
   */
  getCleanupRecommendations(): {
    action: 'evict' | 'clear_transient' | 'clear_volatile' | 'compress';
    reason: string;
  }[] {
    const recommendations = [];
    
    if (this.memoryPressure === 'high') {
      recommendations.push({
        action: 'clear_transient' as const,
        reason: 'High memory pressure - clear transient data'
      });
      
      recommendations.push({
        action: 'evict' as const,
        reason: 'Evict LRU entries to free memory'
      });
    }
    
    if (this.memoryPressure === 'medium') {
      recommendations.push({
        action: 'clear_transient' as const,
        reason: 'Medium memory pressure - clear temporary data'
      });
    }
    
    return recommendations;
  }
}