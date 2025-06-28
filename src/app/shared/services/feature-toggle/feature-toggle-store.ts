import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Global static store for feature toggles
 * This allows access without dependency injection
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureToggleStore {
  private static instance: FeatureToggleStore;
  private static togglesSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  private static toggles$ = FeatureToggleStore.togglesSubject.asObservable();

  constructor() {
    FeatureToggleStore.instance = this;
  }

  /**
   * Update toggles in the static store
   */
  updateToggles(toggles: Map<string, boolean>): void {
    FeatureToggleStore.togglesSubject.next(toggles);
  }

  /**
   * Static method to check if a toggle is active
   */
  static isActive(key: string): boolean {
    const currentToggles = FeatureToggleStore.togglesSubject.getValue();
    return currentToggles.get(key) || false;
  }

  /**
   * Static method to observe toggle state
   */
  static isActive$(key: string): Observable<boolean> {
    return FeatureToggleStore.toggles$.pipe(
      map(toggles => toggles.get(key) || false)
    );
  }

  /**
   * Get all toggle keys
   */
  static getToggleKeys(): string[] {
    return Array.from(FeatureToggleStore.togglesSubject.getValue().keys());
  }
}

/**
 * Global helper functions that can be used anywhere without injection
 */
export function isToggleActive(key: string): boolean {
  return FeatureToggleStore.isActive(key);
}

export function isToggleActive$(key: string): Observable<boolean> {
  return FeatureToggleStore.isActive$(key);
}

export function getFeatureToggleKeys(): string[] {
  return FeatureToggleStore.getToggleKeys();
}
