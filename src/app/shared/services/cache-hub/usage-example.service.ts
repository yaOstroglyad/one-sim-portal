import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CacheHubService, DataType } from './index';
import { CacheNamespace, CacheMethod } from './namespace.decorator';

/**
 * Example service showing how to use CacheHub with inject() pattern
 */
@CacheNamespace('example')
@Injectable({
  providedIn: 'root'
})
export class ExampleUsageService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);

  /**
   * Example: Cache users data with reference data type (1 hour TTL)
   */
  @CacheMethod('users-list')
  getUsers(): Observable<any[]> {
    return this.cacheHub.get('users', 
      () => this.http.get<any[]>('/api/v1/users'), 
      {
        dataType: DataType.REFERENCE,
        ttl: 60 * 60 * 1000 // 1 hour
      }
    );
  }

  /**
   * Example: Cache products with business data type (5 minutes TTL)
   */
  getProducts(categoryId?: number): Observable<any[]> {
    const key = categoryId ? `products-${categoryId}` : 'products';
    
    return this.cacheHub.get(key,
      () => this.http.get<any[]>('/api/v1/products', { 
        params: categoryId ? { categoryId: categoryId.toString() } : {} 
      }),
      {
        dataType: DataType.BUSINESS
      }
    );
  }

  /**
   * Example: Cache paginated data
   */
  getPaginatedOrders(page: number, size: number, filters?: any): Observable<any> {
    return this.cacheHub.getPaginated(
      'orders',
      page,
      size,
      () => this.http.get<any>('/api/v1/orders', {
        params: {
          page: page.toString(),
          size: size.toString(),
          ...filters
        }
      }),
      filters,
      {
        dataType: DataType.BUSINESS,
        ttl: 2 * 60 * 1000 // 2 minutes for orders
      }
    );
  }

  /**
   * Example: Cache select options for dropdowns
   */
  getCountries(): Observable<any[]> {
    return this.cacheHub.getSelectOptions(
      'countries',
      () => this.http.get<any[]>('/api/v1/countries'),
      {
        dataType: DataType.STATIC,
        ttl: 24 * 60 * 60 * 1000 // 24 hours for static data
      }
    );
  }

  /**
   * Example: Cache user profile (user-specific data)
   */
  getUserProfile(userId: string): Observable<any> {
    return this.cacheHub.get(`user-profile-${userId}`,
      () => this.http.get<any>(`/api/v1/users/${userId}/profile`),
      {
        dataType: DataType.USER,
        ttl: 30 * 60 * 1000 // 30 minutes for user data
      }
    );
  }

  /**
   * Example: Cache volatile data (frequently changing)
   */
  getDashboardMetrics(): Observable<any> {
    return this.cacheHub.get('dashboard-metrics',
      () => this.http.get<any>('/api/v1/dashboard/metrics'),
      {
        dataType: DataType.VOLATILE,
        ttl: 1 * 60 * 1000 // 1 minute for metrics
      }
    );
  }

  /**
   * Example: Preload critical data
   */
  preloadCriticalData(): void {
    // Preload users and countries in background
    this.cacheHub.preload('users', 
      () => this.http.get<any[]>('/api/v1/users'),
      { dataType: DataType.REFERENCE }
    );

    this.cacheHub.preload('countries',
      () => this.http.get<any[]>('/api/v1/countries'),
      { dataType: DataType.STATIC }
    );
  }

  /**
   * Example: Warm up multiple endpoints
   */
  warmUpDashboard(): Observable<any[]> {
    return this.cacheHub.warmUp([
      {
        key: 'dashboard-metrics',
        factory: () => this.http.get('/api/v1/dashboard/metrics'),
        options: { dataType: DataType.VOLATILE }
      },
      {
        key: 'recent-orders',
        factory: () => this.http.get('/api/v1/orders/recent'),
        options: { dataType: DataType.BUSINESS }
      },
      {
        key: 'user-notifications',
        factory: () => this.http.get('/api/v1/notifications'),
        options: { dataType: DataType.USER }
      }
    ]);
  }

  /**
   * Example: Update cached data
   */
  updateUserProfile(userId: string, profileData: any): Observable<any> {
    return this.http.put<any>(`/api/v1/users/${userId}/profile`, profileData)
      .pipe(
        tap(updatedProfile => {
          // Update cache with new data
          this.cacheHub.update(`user-profile-${userId}`, updatedProfile);
        })
      );
  }

  /**
   * Example: Invalidate specific cache entries
   */
  invalidateUserData(userId: string): void {
    this.cacheHub.invalidate(`user-profile-${userId}`);
    this.cacheHub.invalidate('users'); // Refresh users list
  }

  /**
   * Example: Clear all example namespace cache
   */
  clearExampleCache(): number {
    return this.cacheHub.invalidateNamespace('example');
  }

  /**
   * Example: Subscribe to cache changes
   */
  subscribeToUsers(callback: (users: any[]) => void): () => void {
    return this.cacheHub.subscribe('users', callback);
  }

  /**
   * Example: Get cache statistics
   */
  getCacheStats() {
    return {
      globalStats: this.cacheHub.getStats(),
      memoryStats: this.cacheHub.getMemoryStats(),
      config: this.cacheHub.exportConfig()
    };
  }
}

/**
 * Example usage in component with inject() pattern
 */
/*
@Component({
  selector: 'app-example',
  template: `
    <div>
      <h2>Cache Hub Example</h2>
      <button (click)="loadUsers()">Load Users</button>
      <button (click)="loadProducts()">Load Products</button>
      <button (click)="preloadData()">Preload Data</button>
      <button (click)="showStats()">Show Stats</button>
    </div>
  `,
  standalone: true
})
export class ExampleComponent {
  private readonly exampleService = inject(ExampleUsageService);

  loadUsers() {
    this.exampleService.getUsers().subscribe(users => {
      console.log('Users loaded from cache:', users);
    });
  }

  loadProducts() {
    this.exampleService.getProducts().subscribe(products => {
      console.log('Products loaded from cache:', products);
    });
  }

  preloadData() {
    this.exampleService.preloadCriticalData();
    console.log('Critical data preloading started');
  }

  showStats() {
    const stats = this.exampleService.getCacheStats();
    console.log('Cache Statistics:', stats);
  }
}
*/