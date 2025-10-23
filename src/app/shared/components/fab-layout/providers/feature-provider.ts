import { Provider, InjectionToken, inject, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FeatureEntry } from '../models';
import { FeatureRegistryService } from '../services/feature-registry.service';

export const FEATURE_REGISTRY_MULTI = new InjectionToken<FeatureEntry[]>('FEATURE_REGISTRY_MULTI');

/**
 * Token for FAB layout initialization
 */
export const FAB_LAYOUT_INITIALIZER = new InjectionToken<() => void>('FAB_LAYOUT_INITIALIZER');

/**
 * Provides a feature entry for registration
 */
export function provideFeature(entry: FeatureEntry): Provider {
  return {
    provide: FEATURE_REGISTRY_MULTI,
    multi: true,
    useValue: entry,
  };
}

/**
 * Factory function for FAB layout initialization
 */
export function createFabLayoutInitializer(): () => void {
  return () => {
    const entries = inject(FEATURE_REGISTRY_MULTI, { optional: true }) || [];
    const registry = inject(FeatureRegistryService);
    
    // Register all provided features
    entries.forEach(entry => {
      registry.register(entry);
    });
  };
}

/**
 * Provides FAB layout system with feature registration
 * Use this in your application providers or route providers
 * 
 * @example
 * // In main.ts or app.config.ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideFabLayout(),
 *     // other providers
 *   ]
 * });
 * 
 * // Or in a route configuration
 * {
 *   path: 'feature',
 *   loadComponent: () => import('./feature.component'),
 *   providers: [
 *     provideFabLayout(),
 *     provideFeature({ ... })
 *   ]
 * }
 */
export function provideFabLayout(): EnvironmentProviders {
  return makeEnvironmentProviders([
    FeatureRegistryService,
    {
      provide: FAB_LAYOUT_INITIALIZER,
      useFactory: createFabLayoutInitializer
    }
  ]);
}