import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, throwError } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { CacheEntry } from './types';

/**
 * Observable request tracking
 */
interface ActiveRequest<T> {
  observable: Observable<T>;
  subscribers: number;
  startTime: number;
}

/**
 * Manages Observable lifecycle and prevents duplicate API calls
 */
@Injectable({
  providedIn: 'root'
})
export class ObservableManager implements OnDestroy {
  private activeRequests = new Map<string, ActiveRequest<any>>();
  private subscriptions = new Map<string, Subscription>();

  /**
   * Get or create observable for a cache operation
   * Prevents duplicate API calls for the same key
   */
  getOrCreateObservable<T>(
    key: string,
    factory: () => Observable<T>,
    onSuccess: (data: T) => void,
    onError: (error: any) => void
  ): Observable<T> {
    // Check if request is already in progress
    const activeRequest = this.activeRequests.get(key);
    if (activeRequest) {
      activeRequest.subscribers++;
      return activeRequest.observable;
    }

    // Create new observable
    const observable = factory().pipe(
      tap(data => {
        onSuccess(data);
        this.cleanupRequest(key);
      }),
      catchError(error => {
        onError(error);
        this.cleanupRequest(key);
        return throwError(error);
      }),
      finalize(() => {
        this.cleanupRequest(key);
      })
    );

    // Track the request
    this.activeRequests.set(key, {
      observable,
      subscribers: 1,
      startTime: Date.now()
    });

    return observable;
  }

  /**
   * Subscribe to cache entry changes
   */
  subscribeToEntry<T>(
    entry: CacheEntry<T>,
    callback: (value: T) => void
  ): Subscription {
    const subscription = entry.subject.subscribe(callback);
    const subKey = `${entry.namespace}:${entry.key}:${Date.now()}`;
    
    this.subscriptions.set(subKey, subscription);
    
    // Return a subscription that also cleans up our tracking
    return new Subscription(() => {
      subscription.unsubscribe();
      this.subscriptions.delete(subKey);
    });
  }

  /**
   * Update cache entry value and notify subscribers
   */
  updateEntry<T>(entry: CacheEntry<T>, newValue: T): void {
    entry.value = newValue;
    entry.lastAccessed = Date.now();
    entry.hits++;
    
    // Notify all subscribers
    entry.subject.next(newValue);
  }

  /**
   * Check if there's an active request for a key
   */
  hasActiveRequest(key: string): boolean {
    return this.activeRequests.has(key);
  }

  /**
   * Get active request statistics
   */
  getActiveRequestStats(): {
    total: number;
    longestRunning: number;
    averageDuration: number;
  } {
    const now = Date.now();
    const requests = Array.from(this.activeRequests.values());
    
    if (requests.length === 0) {
      return {
        total: 0,
        longestRunning: 0,
        averageDuration: 0
      };
    }

    const durations = requests.map(req => now - req.startTime);
    const longestRunning = Math.max(...durations);
    const averageDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

    return {
      total: requests.length,
      longestRunning,
      averageDuration
    };
  }

  /**
   * Cancel all active requests (for cleanup)
   */
  cancelAllRequests(): void {
    this.activeRequests.clear();
    
    // Unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }

  /**
   * Cancel specific request
   */
  cancelRequest(key: string): void {
    this.cleanupRequest(key);
  }

  /**
   * Get requests that have been running for too long
   */
  getStaleRequests(maxDuration: number = 60000): string[] {
    const now = Date.now();
    const staleKeys: string[] = [];

    this.activeRequests.forEach((request, key) => {
      if (now - request.startTime > maxDuration) {
        staleKeys.push(key);
      }
    });

    return staleKeys;
  }

  /**
   * Cleanup stale requests
   */
  cleanupStaleRequests(maxDuration: number = 60000): number {
    const staleKeys = this.getStaleRequests(maxDuration);
    
    staleKeys.forEach(key => {
      console.warn(`Cleaning up stale request: ${key}`);
      this.cleanupRequest(key);
    });

    return staleKeys.length;
  }

  /**
   * Create a BehaviorSubject for a cache entry
   */
  createSubject<T>(initialValue: T): BehaviorSubject<T> {
    return new BehaviorSubject<T>(initialValue);
  }

  /**
   * Safely complete and cleanup a subject
   */
  completeSubject<T>(subject: BehaviorSubject<T>): void {
    try {
      if (!subject.closed) {
        subject.complete();
      }
    } catch (error) {
      console.warn('Error completing subject:', error);
    }
  }

  /**
   * Clone observable to prevent external modifications
   */
  cloneObservable<T>(observable: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      const subscription = observable.subscribe(subscriber);
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get memory usage statistics for observables
   */
  getMemoryStats(): {
    activeRequests: number;
    totalSubscriptions: number;
    estimatedMemoryUsage: number;
  } {
    // Rough estimation of memory usage
    const requestMemory = this.activeRequests.size * 1024; // ~1KB per request
    const subscriptionMemory = this.subscriptions.size * 512; // ~512B per subscription
    
    return {
      activeRequests: this.activeRequests.size,
      totalSubscriptions: this.subscriptions.size,
      estimatedMemoryUsage: requestMemory + subscriptionMemory
    };
  }

  ngOnDestroy(): void {
    this.cancelAllRequests();
  }

  /**
   * Clean up a specific request
   */
  private cleanupRequest(key: string): void {
    const request = this.activeRequests.get(key);
    if (request) {
      request.subscribers--;
      
      // Remove if no more subscribers
      if (request.subscribers <= 0) {
        this.activeRequests.delete(key);
      }
    }
  }

  /**
   * Periodic cleanup of resources
   */
  performMaintenanceCleanup(): void {
    // Cleanup stale requests (older than 5 minutes)
    this.cleanupStaleRequests(5 * 60 * 1000);
    
    // Log statistics if there are performance issues
    const stats = this.getActiveRequestStats();
    if (stats.total > 50) {
      console.warn('High number of active requests detected:', stats);
    }
    
    if (stats.longestRunning > 2 * 60 * 1000) {
      console.warn('Long-running request detected:', stats.longestRunning + 'ms');
    }
  }
}