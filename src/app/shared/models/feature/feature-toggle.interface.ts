import { Observable } from 'rxjs';

/**
 * Feature Toggle Entity
 *
 * Represents a single feature toggle configuration
 */
export interface FeatureToggle {
  key: string;
  enabled: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Feature Toggle API Response
 *
 * Response format from feature toggles endpoint
 */
export interface FeatureToggleResponse {
  toggles: FeatureToggle[];
  timestamp: Date;
}

/**
 * Feature Toggle Service Contract
 *
 * Defines the required interface that any feature toggle service must implement.
 * This contract ensures consistent API across different implementations.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class FeatureToggleService implements FeatureToggleContract {
 *   isToggleActive(key: string): boolean {
 *     return this.checkToggle(key);
 *   }
 *
 *   isToggleActive$(key: string): Observable<boolean> {
 *     return this.observeToggle(key);
 *   }
 *
 *   get featureToggles(): Set<string> {
 *     return this.getAllToggles();
 *   }
 * }
 * ```
 */
export interface FeatureToggleContract {
  /**
   * Check if a feature toggle is active (synchronous)
   * @param key The feature toggle key
   * @returns true if the toggle is active, false otherwise
   */
  isToggleActive(key: string): boolean;

  /**
   * Check if a feature toggle is active (asynchronous)
   * @param key The feature toggle key
   * @returns Observable that emits true if the toggle is active, false otherwise
   */
  isToggleActive$(key: string): Observable<boolean>;

  /**
   * Get all registered feature toggle keys
   */
  readonly featureToggles: Set<string>;
}