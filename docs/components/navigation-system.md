# Navigation System

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/containers/default-layout/`

## Overview

Multi-level navigation with role-based access, built on Angular Router and CoreUI components.

## File Structure

```
src/app/
├── app-routing.module.ts                    # Main app routing
└── containers/default-layout/
    ├── default-layout.component.ts          # Main layout container
    ├── default-layout-routing.module.ts     # Internal routing
    ├── _nav.ts                              # Menu configuration
    ├── default-header/                      # Header with language/logout
    ├── default-footer/                      # Footer component
    └── sidebar-skeleton/                    # Loading state
```

## Menu Configuration (`_nav.ts`)

```typescript
export const navItems: any[] = [
  {
    name: 'nav.companies',              // Translation key
    url: 'companies',                   // Route URL
    iconComponent: { name: 'cil-industry' },  // CoreUI icon
    permissions: [ADMIN_PERMISSION]     // Required permissions
  },
  {
    name: 'nav.customers',
    url: 'customers',
    iconComponent: { name: 'cil-group' },
    permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION]
  },
  {
    name: 'nav.settings',
    url: '/home/settings',
    iconComponent: { name: 'cil-settings' },
    children: [                         // Submenu
      { name: 'nav.general', url: '/home/settings/general' }
    ]
  }
];
```

## Permission Types

| Permission | Description |
|------------|-------------|
| `ADMIN_PERMISSION` | Full access to all sections |
| `CUSTOMER_PERMISSION` | Customer-level access |
| `SUPPORT_PERMISSION` | Support team access |

## Adding New Menu Item

1. **Add to `_nav.ts`:**
```typescript
{
  name: 'nav.newFeature',
  url: 'new-feature',
  iconComponent: { name: 'cil-star' },
  permissions: [ADMIN_PERMISSION]
}
```

2. **Add route to `default-layout-routing.module.ts`:**
```typescript
{
  path: 'new-feature',
  loadComponent: () => import('../../views/new-feature/new-feature.component')
    .then(m => m.NewFeatureComponent)
}
```

3. **Add translation to i18n files:**
```json
"nav.newFeature": "New Feature"
```

## Key Components

### DefaultLayoutComponent

Main container managing sidebar, branding, and navigation filtering.

```typescript
export class DefaultLayoutComponent {
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  activeThemeService = inject(ActiveThemeService);

  // Filters menu by user permissions and translates labels
  filterAndTranslateNavItems(): void { ... }
}
```

### AuthGuardService

Protects routes from unauthorized access:

```typescript
export class AuthGuardService implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.auth.checkAndRefreshToken().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['login']);
          return false;
        }
        return true;
      })
    );
  }
}
```

### SidebarSkeletonComponent

Loading state while branding loads:

```typescript
@Input() itemsCount: number = 8;
```

## Route Protection

All routes under `/home` are protected by `AuthGuardService`:

```typescript
{
  path: 'home',
  loadChildren: () => import('./containers/default-layout/default-layout.module'),
  canActivate: mapToCanActivate([AuthGuardService])
}
```

## Initialization Flow

1. App Routing checks route
2. AuthGuard validates JWT token
3. DefaultLayout loads (lazy)
4. Services init (Auth, Visual, Translate)
5. Menu filtered by permissions
6. Labels translated
7. Branding loaded
8. UI rendered

## Features

- **Lazy Loading** - All modules load on demand
- **Role-based Access** - Menu items filtered by permissions
- **i18n Support** - All labels translatable
- **Dynamic Branding** - Logo loaded via ActiveThemeService
- **Skeleton Loading** - UX during brand load
- **OnPush Detection** - Performance optimized
