import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, delay, catchError, retry, shareReplay, switchMap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { 
  DashboardResponse, 
  DashboardError, 
  DashboardPeriod,
  ExecutiveTabData,
  SubscribersTabData,
  SubscriberAnalytics
} from '../models/dashboard.types';
import { TrafficAnalytics } from '../models/traffic.types';
import { FinanceAnalytics } from '../models/finance.types';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly API_BASE_URL = '/api/v1/dashboard';
  private readonly USE_MOCK_DATA = true; // Toggle for mock/real data
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Period management
  private selectedPeriod$ = new BehaviorSubject<DashboardPeriod>(this.getDefaultPeriod());
  public period$ = this.selectedPeriod$.asObservable();

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  /**
   * Get Executive tab data
   */
  getExecutiveData(): Observable<DashboardResponse<ExecutiveTabData>> {
    const cacheKey = `executive_${this.selectedPeriod$.value.preset}`;
    
    if (this.USE_MOCK_DATA) {
      return this.mockDataService.getExecutiveData(this.selectedPeriod$.value)
        .pipe(
          delay(1000), // Simulate network delay
          map(data => this.wrapResponse(data)),
          catchError(error => this.handleError(error))
        );
    }

    return this.getCachedOrFetch(
      cacheKey,
      `${this.API_BASE_URL}/executive`,
      this.selectedPeriod$.value
    );
  }

  /**
   * Get Subscribers tab data
   */
  getSubscribersData(): Observable<DashboardResponse<SubscribersTabData>> {
    const cacheKey = `subscribers_${this.selectedPeriod$.value.preset}`;
    
    if (this.USE_MOCK_DATA) {
      return this.mockDataService.getSubscribersData(this.selectedPeriod$.value)
        .pipe(
          delay(800),
          map(data => this.wrapResponse(data)),
          catchError(error => this.handleError(error))
        );
    }

    return this.getCachedOrFetch(
      cacheKey,
      `${this.API_BASE_URL}/subscribers`,
      this.selectedPeriod$.value
    );
  }

  /**
   * Get Traffic tab data
   */
  getTrafficData(): Observable<DashboardResponse<TrafficAnalytics>> {
    const cacheKey = `traffic_${this.selectedPeriod$.value.preset}`;
    
    if (this.USE_MOCK_DATA) {
      console.log('DashboardDataService: Using mock data for traffic');
      return this.mockDataService.getTrafficData(this.selectedPeriod$.value)
        .pipe(
          delay(900),
          map(data => {
            console.log('DashboardDataService: Traffic mock data received:', data);
            return this.wrapResponse(data);
          }),
          catchError(error => this.handleError(error))
        );
    }

    return this.getCachedOrFetch(
      cacheKey,
      `${this.API_BASE_URL}/traffic`,
      this.selectedPeriod$.value
    );
  }

  /**
   * Get Finance tab data
   */
  getFinanceData(): Observable<DashboardResponse<FinanceAnalytics>> {
    const cacheKey = `finance_${this.selectedPeriod$.value.preset}`;
    
    if (this.USE_MOCK_DATA) {
      console.log('DashboardDataService: Using mock data for finance');
      return this.mockDataService.getFinanceData(this.selectedPeriod$.value)
        .pipe(
          delay(1100),
          map(data => {
            console.log('DashboardDataService: Finance mock data received:', data);
            return this.wrapResponse(data);
          }),
          catchError(error => this.handleError(error))
        );
    }

    return this.getCachedOrFetch(
      cacheKey,
      `${this.API_BASE_URL}/finance`,
      this.selectedPeriod$.value
    );
  }

  /**
   * Get Subscriber Analytics data
   */
  getSubscriberAnalytics(): Observable<DashboardResponse<SubscriberAnalytics>> {
    const cacheKey = `subscriber_analytics_${this.selectedPeriod$.value.preset}`;
    
    if (this.USE_MOCK_DATA) {
      return this.mockDataService.getSubscriberAnalytics(this.selectedPeriod$.value)
        .pipe(
          delay(1000), // Simulate network delay
          map(data => this.wrapResponse(data)),
          catchError(error => this.handleError(error))
        );
    }

    return this.getCachedOrFetch(
      cacheKey,
      `${this.API_BASE_URL}/subscriber-analytics`,
      this.selectedPeriod$.value
    );
  }

  /**
   * Update selected period
   */
  setPeriod(period: DashboardPeriod): void {
    this.selectedPeriod$.next(period);
    // Clear cache when period changes
    this.clearCache();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get default period (last 30 days)
   */
  private getDefaultPeriod(): DashboardPeriod {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate,
      endDate,
      label: 'Last 30 Days',
      preset: 'last30days'
    };
  }

  /**
   * Get cached data or fetch from API
   */
  private getCachedOrFetch<T>(
    cacheKey: string, 
    url: string, 
    period: DashboardPeriod
  ): Observable<DashboardResponse<T>> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(this.wrapResponse(cached.data));
    }

    // Fetch from API
    return this.http.post<T>(url, {
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString()
    }).pipe(
      retry(2),
      map(data => {
        // Cache the result
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return this.wrapResponse(data);
      }),
      catchError(error => this.handleError(error)),
      shareReplay(1)
    );
  }

  /**
   * Wrap data in standard response format
   */
  private wrapResponse<T>(data: T): DashboardResponse<T> {
    return {
      data,
      status: 'success',
      timestamp: new Date()
    };
  }

  /**
   * Handle errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let dashboardError: DashboardError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      dashboardError = {
        code: 'CLIENT_ERROR',
        message: 'An error occurred. Please try again.',
        details: error.error.message
      };
    } else {
      // Server-side error
      dashboardError = {
        code: error.status.toString(),
        message: this.getErrorMessage(error.status),
        details: error.error
      };
    }

    return throwError(() => ({
      data: null,
      status: 'error' as const,
      message: dashboardError.message,
      timestamp: new Date()
    }));
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return 'You are not authorized to view this data.';
      case 403:
        return 'You do not have permission to access this data.';
      case 404:
        return 'The requested data was not found.';
      case 500:
        return 'Unexpected error occurred. Please try again later.';
      case 503:
        return 'Waiting on ClickHouse Connect...';
      default:
        return 'Unexpected error occurred.';
    }
  }
}