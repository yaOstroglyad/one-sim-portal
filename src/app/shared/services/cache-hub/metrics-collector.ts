import { Injectable } from '@angular/core';
import { CacheMetrics, CacheStats, DataType } from './types';

/**
 * Detailed operation metrics
 */
interface OperationMetrics {
  count: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  errors: number;
}

/**
 * Performance metrics by data type
 */
interface DataTypeMetrics {
  [DataType.STATIC]: OperationMetrics;
  [DataType.REFERENCE]: OperationMetrics;
  [DataType.BUSINESS]: OperationMetrics;
  [DataType.VOLATILE]: OperationMetrics;
  [DataType.USER]: OperationMetrics;
  [DataType.TRANSIENT]: OperationMetrics;
}

/**
 * Collects and analyzes cache performance metrics
 */
@Injectable({
  providedIn: 'root'
})
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

  private operationTimes: number[] = [];
  private maxOperationHistory = 1000;

  private dataTypeMetrics: Partial<DataTypeMetrics> = {};
  private namespaceMetrics = new Map<string, Partial<CacheMetrics>>();
  private hourlyStats: Array<{ hour: number; metrics: CacheMetrics }> = [];

  /**
   * Record a cache hit
   */
  recordHit(dataType?: DataType, responseTime?: number): void {
    this.metrics.hits++;
    this.updateHitRate();
    
    if (responseTime !== undefined) {
      this.recordOperationTime(responseTime);
    }
    
    if (dataType) {
      this.updateDataTypeMetrics(dataType, 'hit', responseTime);
    }
  }

  /**
   * Record a cache miss
   */
  recordMiss(dataType?: DataType, responseTime?: number): void {
    this.metrics.misses++;
    this.updateHitRate();
    
    if (responseTime !== undefined) {
      this.recordOperationTime(responseTime);
    }
    
    if (dataType) {
      this.updateDataTypeMetrics(dataType, 'miss', responseTime);
    }
  }

  /**
   * Record a cache set operation
   */
  recordSet(bytes: number, dataType?: DataType, responseTime?: number): void {
    this.metrics.sets++;
    this.metrics.totalBytesStored += bytes;
    
    if (responseTime !== undefined) {
      this.recordOperationTime(responseTime);
    }
    
    if (dataType) {
      this.updateDataTypeMetrics(dataType, 'set', responseTime);
    }
  }

  /**
   * Record a cache update operation
   */
  recordUpdate(oldBytes: number, newBytes: number, dataType?: DataType, responseTime?: number): void {
    this.metrics.updates++;
    this.metrics.totalBytesStored = this.metrics.totalBytesStored - oldBytes + newBytes;
    
    if (responseTime !== undefined) {
      this.recordOperationTime(responseTime);
    }
    
    if (dataType) {
      this.updateDataTypeMetrics(dataType, 'update', responseTime);
    }
  }

  /**
   * Record a cache invalidation
   */
  recordInvalidation(bytes: number, dataType?: DataType): void {
    this.metrics.invalidations++;
    this.metrics.totalBytesStored -= bytes;
    
    if (dataType) {
      this.updateDataTypeMetrics(dataType, 'invalidation');
    }
  }

  /**
   * Record a cache eviction
   */
  recordEviction(bytes: number, dataType?: DataType): void {
    this.metrics.evictions++;
    this.metrics.totalBytesStored -= bytes;
    
    if (dataType) {
      this.updateDataTypeMetrics(dataType, 'eviction');
    }
  }

  /**
   * Record metrics for a specific namespace
   */
  recordNamespaceOperation(
    namespace: string,
    operation: 'hit' | 'miss' | 'set' | 'update' | 'invalidation' | 'eviction',
    bytes?: number
  ): void {
    if (!this.namespaceMetrics.has(namespace)) {
      this.namespaceMetrics.set(namespace, {
        hits: 0,
        misses: 0,
        sets: 0,
        updates: 0,
        invalidations: 0,
        evictions: 0,
        totalBytesStored: 0,
        averageResponseTime: 0,
        hitRate: 0
      });
    }

    const nsMetrics = this.namespaceMetrics.get(namespace)!;
    
    switch (operation) {
      case 'hit':
        nsMetrics.hits!++;
        break;
      case 'miss':
        nsMetrics.misses!++;
        break;
      case 'set':
        nsMetrics.sets!++;
        if (bytes) nsMetrics.totalBytesStored! += bytes;
        break;
      case 'update':
        nsMetrics.updates!++;
        break;
      case 'invalidation':
        nsMetrics.invalidations!++;
        if (bytes) nsMetrics.totalBytesStored! -= bytes;
        break;
      case 'eviction':
        nsMetrics.evictions!++;
        if (bytes) nsMetrics.totalBytesStored! -= bytes;
        break;
    }

    // Update namespace hit rate
    const total = nsMetrics.hits! + nsMetrics.misses!;
    nsMetrics.hitRate = total > 0 ? (nsMetrics.hits! / total) * 100 : 0;
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics for a specific data type
   */
  getDataTypeMetrics(dataType: DataType): OperationMetrics | undefined {
    return this.dataTypeMetrics[dataType];
  }

  /**
   * Get metrics for a specific namespace
   */
  getNamespaceMetrics(namespace: string): Partial<CacheMetrics> | undefined {
    return this.namespaceMetrics.get(namespace);
  }

  /**
   * Get all namespace metrics
   */
  getAllNamespaceMetrics(): Map<string, Partial<CacheMetrics>> {
    return new Map(this.namespaceMetrics);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    hitRate: number;
    averageResponseTime: number;
    totalOperations: number;
    cacheEfficiency: 'excellent' | 'good' | 'fair' | 'poor';
    bytesStored: string;
  } {
    const totalOps = this.metrics.hits + this.metrics.misses + this.metrics.sets;
    const efficiency = this.getCacheEfficiencyRating(this.metrics.hitRate);
    
    return {
      hitRate: this.metrics.hitRate,
      averageResponseTime: this.metrics.averageResponseTime,
      totalOperations: totalOps,
      cacheEfficiency: efficiency,
      bytesStored: this.formatBytes(this.metrics.totalBytesStored)
    };
  }

  /**
   * Get hourly statistics for trend analysis
   */
  getHourlyStats(): Array<{ hour: number; metrics: CacheMetrics }> {
    return [...this.hourlyStats];
  }

  /**
   * Generate cache statistics report
   */
  generateReport(): CacheStats {
    const now = new Date();
    const oldestEntry = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    
    return {
      size: this.metrics.sets - this.metrics.evictions - this.metrics.invalidations,
      sizeBytes: this.metrics.totalBytesStored,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: this.metrics.hitRate,
      oldestEntry,
      memoryPressure: this.calculateMemoryPressure()
    };
  }

  /**
   * Reset all metrics (for testing or fresh start)
   */
  resetMetrics(): void {
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
    
    this.operationTimes = [];
    this.dataTypeMetrics = {};
    this.namespaceMetrics.clear();
    this.hourlyStats = [];
  }

  /**
   * Export metrics to JSON format
   */
  exportMetrics(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      globalMetrics: this.metrics,
      dataTypeMetrics: this.dataTypeMetrics,
      namespaceMetrics: Object.fromEntries(this.namespaceMetrics),
      hourlyStats: this.hourlyStats,
      performanceSummary: this.getPerformanceSummary()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Start collecting hourly statistics
   */
  startHourlyCollection(): void {
    setInterval(() => {
      this.collectHourlyStats();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Record operation time for average calculation
   */
  recordOperationTime(time: number): void {
    this.operationTimes.push(time);
    
    // Keep only recent operations
    if (this.operationTimes.length > this.maxOperationHistory) {
      this.operationTimes = this.operationTimes.slice(-this.maxOperationHistory);
    }
    
    // Update average
    this.metrics.averageResponseTime = 
      this.operationTimes.reduce((sum, t) => sum + t, 0) / this.operationTimes.length;
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  /**
   * Update metrics for specific data type
   */
  private updateDataTypeMetrics(
    dataType: DataType,
    operation: string,
    responseTime?: number
  ): void {
    if (!this.dataTypeMetrics[dataType]) {
      this.dataTypeMetrics[dataType] = {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0
      };
    }

    const metrics = this.dataTypeMetrics[dataType]!;
    metrics.count++;

    if (responseTime !== undefined) {
      metrics.totalTime += responseTime;
      metrics.averageTime = metrics.totalTime / metrics.count;
      metrics.minTime = Math.min(metrics.minTime, responseTime);
      metrics.maxTime = Math.max(metrics.maxTime, responseTime);
    }
  }

  /**
   * Calculate memory pressure based on current metrics
   */
  private calculateMemoryPressure(): 'low' | 'medium' | 'high' {
    // Simple heuristic based on eviction rate
    const total = this.metrics.sets + this.metrics.updates;
    if (total === 0) return 'low';
    
    const evictionRate = this.metrics.evictions / total;
    
    if (evictionRate > 0.2) return 'high';
    if (evictionRate > 0.1) return 'medium';
    return 'low';
  }

  /**
   * Get cache efficiency rating
   */
  private getCacheEfficiencyRating(hitRate: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (hitRate >= 90) return 'excellent';
    if (hitRate >= 75) return 'good';
    if (hitRate >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Format bytes for human reading
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Collect hourly statistics snapshot
   */
  private collectHourlyStats(): void {
    const hour = new Date().getHours();
    const snapshot = { ...this.metrics };
    
    this.hourlyStats.push({ hour, metrics: snapshot });
    
    // Keep only last 24 hours
    if (this.hourlyStats.length > 24) {
      this.hourlyStats = this.hourlyStats.slice(-24);
    }
  }
}