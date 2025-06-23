import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { FeatureToggle, FeatureToggleResponse } from '../model/feature-toggle.interface';

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleService {
  private togglesSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  private toggles$ = this.togglesSubject.asObservable();
  private _featureToggles = new Set<string>();
  
  // Mock data for development
  private mockToggles: FeatureToggle[] = [
    { key: 'new-ui', enabled: true, description: 'New UI design' },
    { key: 'advanced-search', enabled: false, description: 'Advanced search functionality' },
    { key: 'bulk-operations', enabled: true, description: 'Bulk operations support' },
    { key: 'email-notifications', enabled: true, description: 'Email notification system' },
    { key: 'test', enabled: true, description: 'Test feature toggle' }
  ];

  constructor(private http: HttpClient) {
    this.loadFeatureToggles();
    // Refresh toggles every 5 minutes
    timer(0, 300000).pipe(
      switchMap(() => this.fetchFeatureToggles())
    ).subscribe();
  }

  private loadFeatureToggles(): void {
    this.fetchFeatureToggles().subscribe();
  }

  private fetchFeatureToggles(): Observable<FeatureToggleResponse> {
    // TODO: Replace with actual API endpoint when backend is ready
    // return this.http.get<FeatureToggleResponse>('/api/v1/feature-toggles');
    
    // Mock implementation
    return of({ 
      toggles: this.mockToggles, 
      timestamp: new Date() 
    }).pipe(
      tap(response => {
        const toggleMap = new Map<string, boolean>();
        this._featureToggles.clear();
        
        response.toggles.forEach(toggle => {
          toggleMap.set(toggle.key, toggle.enabled);
          this._featureToggles.add(toggle.key);
        });
        
        this.togglesSubject.next(toggleMap);
      }),
      catchError(error => {
        console.error('Failed to fetch feature toggles:', error);
        // Return empty response on error
        return of({ toggles: [], timestamp: new Date() });
      })
    );
  }

  /**
   * Check if a feature toggle is active (synchronous)
   * @param key The feature toggle key
   * @returns true if the toggle is active, false otherwise
   */
  isToggleActive(key: string): boolean {
    const currentToggles = this.togglesSubject.getValue();
    return currentToggles.get(key) || false;
  }

  /**
   * Check if a feature toggle is active (asynchronous)
   * @param key The feature toggle key
   * @returns Observable that emits true if the toggle is active, false otherwise
   */
  isToggleActive$(key: string): Observable<boolean> {
    return this.toggles$.pipe(
      map(toggles => toggles.get(key) || false)
    );
  }

  /**
   * Get all registered feature toggle keys
   */
  get featureToggles(): Set<string> {
    return new Set(this._featureToggles);
  }

  /**
   * Force refresh of feature toggles from the server
   */
  refresh(): Observable<void> {
    return this.fetchFeatureToggles().pipe(
      map(() => void 0)
    );
  }

  /**
   * Update a feature toggle (for testing/development only)
   * @param key The feature toggle key
   * @param enabled The new state
   */
  setToggle(key: string, enabled: boolean): void {
    const currentToggles = new Map(this.togglesSubject.getValue());
    currentToggles.set(key, enabled);
    this._featureToggles.add(key);
    this.togglesSubject.next(currentToggles);
    
    // Update mock data
    const existingToggle = this.mockToggles.find(t => t.key === key);
    if (existingToggle) {
      existingToggle.enabled = enabled;
    } else {
      this.mockToggles.push({ key, enabled });
    }
  }
}