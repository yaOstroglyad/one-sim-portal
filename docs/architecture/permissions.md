# Permissions System

## Overview

The OneSim Portal uses a role-based access control (RBAC) system with permissions defined as string constants. Permissions are loaded from the API and stored in `AuthService`.

## Available Permissions

| Permission | Constant | Description |
|------------|----------|-------------|
| **ADMIN** | `ADMIN_PERMISSION` | Full system access, all features available |
| **CUSTOMER** | `CUSTOMER_PERMISSION` | Company customer access, limited to company-specific data |
| **SUPPORT** | `SUPPORT_PERMISSION` | Support team access, customer management and tickets |
| **ANALYTICS** | `ANALYTICS_PERMISSION` | Analytics-only access, dashboards and reports |

## Permission Constants

Defined in `src/app/shared/auth/auth.service.ts`:

```typescript
export const ADMIN_PERMISSION = 'ADMIN';
export const CUSTOMER_PERMISSION = 'CUSTOMER';
export const SUPPORT_PERMISSION = 'SUPPORT';
export const ANALYTICS_PERMISSION = 'ANALYTICS';
```

## Access Matrix by Section

| Section                   | ADMIN | CUSTOMER | SUPPORT | ANALYTICS |
|---------------------------|-------|----------|---------|-----------|
| Analytics (Dashboard)     | Yes   | Yes      | -       | Yes       |
| Analytics (Reports)       | Yes   | Yes      | -       | Yes       |
| Analytics (Admin Overview)| Yes   | -        | -       | -         |
| Companies                 | Yes   | -        | -       | -         |
| Customers                 | Yes   | Yes      | Yes     | -         |
| Providers                 | Yes   | -        | -       | -         |
| Orders                    | Yes   | Yes      | -       | -         |
| Email Logs                | Yes   | Yes      | -       | -         |
| Inventory                 | Yes   | Yes      | -       | -         |
| Products (Company)        | -     | Yes      | -       | -         |
| Tickets                   | Yes   | Yes      | Yes     | -         |
| Product Constructor       | Yes   | -        | -       | -         |
| Settings                  | Yes   | -        | -       | -         |
| Settings (Email Config)   | Yes   | Yes      | -       | -         |

## Usage

### Check permission in component

```typescript
import { AuthService, ADMIN_PERMISSION } from '@shared';

export class MyComponent {
  private authService = inject(AuthService);

  isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
}
```

### Check permission in template

```html
<button *ngIf="isAdmin">Admin Action</button>
```

### Using HasPermission directive

```html
<div *appHasPermission="[ADMIN_PERMISSION]">
  Admin only content
</div>
```

### Route guard

```typescript
{
  path: 'admin',
  component: AdminComponent,
  data: {
    permissions: [ADMIN_PERMISSION]
  },
  canActivate: [permissionGuard]
}
```

## UserRoleService

For convenience, `UserRoleService` provides helper methods:

```typescript
import { UserRoleService } from '@shared';

export class MyComponent {
  private userRoleService = inject(UserRoleService);

  ngOnInit() {
    if (this.userRoleService.isAdmin()) {
      // Admin logic
    }

    if (this.userRoleService.isCustomer()) {
      // Customer logic
    }

    if (this.userRoleService.isSupport()) {
      // Support logic
    }

    if (this.userRoleService.isAnalytics()) {
      // Analytics logic
    }
  }
}
```

## Navigation Configuration

Permissions are configured in `src/app/containers/default-layout/_nav.ts`:

```typescript
{
  name: 'nav.analytics',
  url: '/home/analytics',
  permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, ANALYTICS_PERMISSION],
  // ...
}
```

## Role Hierarchy

The system checks permissions in order of precedence (in `UserRoleService.getCurrentUserRole()`):

1. ADMIN (highest)
2. SUPPORT
3. ANALYTICS
4. CUSTOMER (default)

A user with multiple permissions will be assigned the highest role.

## Default Route by Role

After login, users are redirected to their default route based on role (handled by `roleRedirectGuard`):

| Role | Default Route | Reason |
|------|---------------|--------|
| ADMIN | `/home/customers` | Full access, customers is primary view |
| CUSTOMER | `/home/customers` | Primary business view |
| SUPPORT | `/home/customers` | Support works with customers and tickets |
| ANALYTICS | `/home/analytics` | Only has access to analytics section |

Implementation: `src/app/shared/auth/role-redirect.guard.ts`
