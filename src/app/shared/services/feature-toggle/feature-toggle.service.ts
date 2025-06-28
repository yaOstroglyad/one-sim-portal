import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { FeatureToggle, FeatureToggleResponse } from '../../model/feature-toggle.interface';
import { FeatureToggleStore } from './feature-toggle-store';
import { getDefaultTogglesMap, FEATURE_TOGGLES_API_URL } from './feature-toggle.config';

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleService {
  private togglesSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  private toggles$ = this.togglesSubject.asObservable();
  private _featureToggles = new Set<string>();
  private isInitialized = false;
  private useMockData = true; // TODO: Set to false when API is ready

  constructor(
    private http: HttpClient,
    private featureToggleStore: FeatureToggleStore
  ) {
    const defaultToggles = getDefaultTogglesMap();
    this.togglesSubject.next(defaultToggles);
    this.featureToggleStore.updateToggles(defaultToggles);

    this.loadFeatureToggles();

    timer(300000, 300000).pipe(
      switchMap(() => this.fetchFeatureToggles())
    ).subscribe();
  }

  private loadFeatureToggles(): void {
    this.fetchFeatureToggles().subscribe();
  }

  private fetchFeatureToggles(): Observable<FeatureToggleResponse> {
    if (this.useMockData) {
      return this.fetchMockToggles();
    }

    return this.http.get<FeatureToggleResponse>(FEATURE_TOGGLES_API_URL).pipe(
      tap(response => {
        const toggleMap = new Map<string, boolean>();
        this._featureToggles.clear();

        response.toggles.forEach(toggle => {
          toggleMap.set(toggle.key, toggle.enabled);
          this._featureToggles.add(toggle.key);
        });

        this.togglesSubject.next(toggleMap);
        this.featureToggleStore.updateToggles(toggleMap);
        this.isInitialized = true;
      }),
      catchError(error => {
        console.error('Failed to fetch feature toggles:', error);
        this.isInitialized = true;
        return of({ toggles: [], timestamp: new Date() });
      })
    );
  }

  private fetchMockToggles(): Observable<FeatureToggleResponse> {
    const mockToggles: FeatureToggle[] = Array.from(getDefaultTogglesMap().entries()).map(([key, enabled]) => ({
      key,
      enabled
    }));

    return of({ toggles: mockToggles, timestamp: new Date() }).pipe(
      tap(response => {
        const toggleMap = new Map<string, boolean>();
        this._featureToggles.clear();

        response.toggles.forEach(toggle => {
          toggleMap.set(toggle.key, toggle.enabled);
          this._featureToggles.add(toggle.key);
        });

        this.togglesSubject.next(toggleMap);
        this.featureToggleStore.updateToggles(toggleMap);
        this.isInitialized = true;
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
   * Check if the service has been initialized with data from server
   */
  get initialized(): boolean {
    return this.isInitialized;
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
    if (!this.useMockData) {
      console.warn('setToggle is only available in mock mode');
      return;
    }

    const currentToggles = new Map(this.togglesSubject.getValue());
    currentToggles.set(key, enabled);
    this._featureToggles.add(key);
    this.togglesSubject.next(currentToggles);
    this.featureToggleStore.updateToggles(currentToggles);
  }
}
