import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  InjectionToken,
  inject,
  DestroyRef,
  provideAppInitializer
} from '@angular/core';
import { FeatureEntry, FabButtonConfig } from '../models';
import { FeatureRegistryService } from '../services/feature-registry.service';
import { FabConfigService } from '../services/fab-config.service';
import { AuthService } from '../../../auth';

/**
 * Custom initialization token for FAB feature registration
 * Replaces deprecated ENVIRONMENT_INITIALIZER
 */
const FAB_FEATURE_INITIALIZER = new InjectionToken<(() => void | Promise<void>)[]>('FAB_FEATURE_INITIALIZER', {
  providedIn: 'root',
  factory: () => []
});

/**
 * Custom initialization token for FAB button registration
 * Replaces deprecated ENVIRONMENT_INITIALIZER
 */
const FAB_BUTTON_INITIALIZER = new InjectionToken<(() => void | Promise<void>)[]>('FAB_BUTTON_INITIALIZER', {
  providedIn: 'root',
  factory: () => []
});

/**
 * Injection token for FAB button configurations
 * Use multi: true to allow multiple providers at different levels (global, route, etc.)
 */
export const FAB_ACTIONS = new InjectionToken<FabButtonConfig[]>('FAB_ACTIONS', {
  providedIn: 'root',
  factory: () => []
});

/**
 * Injection token for FAB features (lazy-loaded components)
 * Use multi: true to allow multiple providers at different levels
 */
export const FAB_FEATURES = new InjectionToken<FeatureEntry[]>('FAB_FEATURES', {
  providedIn: 'root',
  factory: () => []
});

/**
 * Provides FAB layout system
 * Use this ONCE in your main.ts
 *
 * @example
 * // In main.ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideFabLayout(),
 *     // ... other providers
 *   ]
 * });
 */
export function provideFabLayout(): EnvironmentProviders {
  return makeEnvironmentProviders([
    FeatureRegistryService,
    FabConfigService
  ]);
}

/**
 * Provides a feature (lazy-loaded component) for the FAB layout via DI token
 * Can be used globally (main.ts) or per-route (route config)
 *
 * Thanks to Angular's DI hierarchy and modern initialization pattern:
 * - Features are provided via FAB_FEATURES injection token
 * - Custom initializer registers features with permission check
 * - Route providers automatically cleaned up when route is destroyed
 *
 * @param entry - Feature entry with metadata and lazy loader
 *
 * @example
 * // Global feature (main.ts)
 * provideFeature({
 *   meta: { key: 'support-chat', title: 'Support', icon: 'chat' },
 *   load: () => import('./features/support-chat/...')
 * })
 *
 * // Route-specific feature (route config)
 * {
 *   path: 'customers',
 *   loadComponent: () => import('./customers.component'),
 *   providers: [
 *     provideFeature({
 *       meta: { key: 'customer-actions', title: 'Actions', icon: 'plus' },
 *       load: () => import('./features/customer-actions/...')
 *     })
 *   ]
 * }
 */
export function provideFeature(entry: FeatureEntry): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Step 1: Provide feature via injection token
    {
      provide: FAB_FEATURES,
      multi: true,
      useValue: entry
    },
    // Step 2: Register feature with permission check using modern pattern
    {
      provide: FAB_FEATURE_INITIALIZER,
      multi: true,
      useFactory: () => {
        const registry = inject(FeatureRegistryService);
        const authService = inject(AuthService);
        const destroyRef = inject(DestroyRef, { optional: true });

        return () => {
          // Check permission based on user roles (synchronous)
          const requiredRoles = entry.meta.roles;
          const allowed = !requiredRoles || requiredRoles.length === 0
            || requiredRoles.some(role => authService.hasPermission(role));

          if (!allowed) {
            console.warn(`[FAB Provider] Permission DENIED for feature: ${entry.meta.key}`, {
              requiredRoles,
              injectorLevel: destroyRef ? 'route' : 'global'
            });
            return;
          }

          // Permission granted - register feature
          registry.register(entry);

          // Auto-cleanup for route-scoped features
          if (destroyRef) {
            destroyRef.onDestroy(() => {
              registry.unregister(entry.meta.key);
            });
          }
        };
      }
    },
    // Step 3: Execute initializer at app/route startup
    provideAppInitializer(() => {
      const initializers = inject(FAB_FEATURE_INITIALIZER);
      initializers.forEach(init => init());
    })
  ]);
}

/**
 * Provides FAB button configuration via DI token
 * Can be used globally (main.ts) or per-route (route config)
 *
 * Thanks to Angular's DI hierarchy and modern initialization pattern:
 * - Buttons are provided via FAB_ACTIONS injection token
 * - Custom initializer registers buttons with permission check
 * - Route providers automatically cleaned up when route is destroyed
 *
 * @param button - Button configuration
 *
 * @example
 * // Global button (main.ts)
 * provideFabButton({
 *   id: 'support-chat',
 *   label: 'Chat',
 *   icon: 'chat',
 *   action: 'component',
 *   target: 'support-chat',
 *   order: 10
 * })
 *
 * // Route-specific button (customers.routes.ts)
 * {
 *   path: '',
 *   component: CustomersComponent,
 *   providers: [
 *     provideFabButton({
 *       id: 'create-customer',
 *       label: 'Create',
 *       icon: 'plus',
 *       action: 'route',
 *       target: '/customers/create',
 *       order: 20
 *     })
 *   ]
 * }
 */
export function provideFabButton(button: FabButtonConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Step 1: Provide button via injection token
    {
      provide: FAB_ACTIONS,
      multi: true,
      useValue: button
    },
    // Step 2: Register button with permission check using modern pattern
    {
      provide: FAB_BUTTON_INITIALIZER,
      multi: true,
      useFactory: () => {
        const fabConfig = inject(FabConfigService);
        const authService = inject(AuthService);
        const destroyRef = inject(DestroyRef, { optional: true });

        return () => {
          // Check permission based on user roles (synchronous)
          const requiredRoles = button.roles;
          const allowed = !requiredRoles || requiredRoles.length === 0
            || requiredRoles.some(role => authService.hasPermission(role));

          if (!allowed) {
            console.warn(`[FAB Provider] Permission DENIED for button: ${button.id}`, {
              requiredRoles,
              injectorLevel: destroyRef ? 'route' : 'global'
            });
            return;
          }

          // Permission granted - register button
          fabConfig.addButtons([button]);

          // Auto-cleanup for route-scoped buttons
          if (destroyRef) {
            destroyRef.onDestroy(() => {
              fabConfig.removeButtons([button.id]);
            });
          }
        };
      }
    },
    // Step 3: Execute initializer at app/route startup
    provideAppInitializer(() => {
      const initializers = inject(FAB_BUTTON_INITIALIZER);
      initializers.forEach(init => init());
    })
  ]);
}
