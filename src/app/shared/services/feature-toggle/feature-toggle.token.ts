import { InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FeatureToggleContract } from '@shared/models/feature';

/**
 * Injection token for Feature Toggle Service
 *
 * Use this token to inject the feature toggle service implementation.
 * The service must implement the FeatureToggleContract interface.
 *
 * @example
 * ```typescript
 * // In providers
 * providers: [
 *   {
 *     provide: FEATURE_TOGGLES_SERVICE,
 *     useExisting: FeatureToggleService
 *   }
 * ]
 *
 * // In component
 * private featureService = inject(FEATURE_TOGGLES_SERVICE);
 * ```
 */
export const FEATURE_TOGGLES_SERVICE = new InjectionToken<FeatureToggleContract>(
  'FeatureTogglesService',
  {
    providedIn: 'root',
    factory: () => {
      // Lazy import to avoid circular dependencies
      return inject(FeatureToggleService);
    }
  }
);

// Forward declaration to avoid circular dependency
import { FeatureToggleService } from './feature-toggle.service';

/**
 * Helper function to check if a feature toggle is active
 * Can be used directly in components without dependency injection
 * @param key The feature toggle key
 * @returns true if the toggle is active, false otherwise
 *
 * @example
 * import { isToggleActive } from '@shared/services/feature-toggle.token';
 *
 * if (isToggleActive('new-ui')) {
 *   // Show new UI
 * }
 */
export function isToggleActive(key: string): boolean {
  const service = inject(FEATURE_TOGGLES_SERVICE);
  return service.isToggleActive(key);
}

/**
 * Helper function to observe a feature toggle state
 * @param key The feature toggle key
 * @returns Observable that emits the toggle state
 *
 * @example
 * import { isToggleActive$ } from '@shared/services/feature-toggle.token';
 *
 * isToggleActive$('new-ui').subscribe(enabled => {
 *   this.showNewUI = enabled;
 * });
 */
export function isToggleActive$(key: string): Observable<boolean> {
  const service = inject(FEATURE_TOGGLES_SERVICE);
  return service.isToggleActive$(key);
}

/**
 * Helper function to get all available feature toggles
 * @returns Set of all feature toggle keys
 */
export function getFeatureToggles(): Set<string> {
  const service = inject(FEATURE_TOGGLES_SERVICE);
  return service.featureToggles;
}
