# Architecture Map

> **Context Tags:** `@learn-project`
> **Read when:** Understanding project architecture and structure
> **Last Updated:** 2025-11-15

## 🎯 Project Overview

**One Sim Portal** - Angular 19 eSIM management platform

**Type:** White-label B2B SaaS application

**Tech Stack:**
- Angular 19 (standalone components)
- CoreUI + Angular Material
- Chart.js for analytics
- RxJS for reactive programming
- JWT authentication
- @ngx-translate for i18n

---

## 📁 Directory Structure

```
/src/app/
├── shared/                    # Shared resources (used everywhere)
│   ├── components/            # Reusable UI components
│   ├── services/              # Shared services (data/, ui/, core/)
│   ├── models/                # TypeScript interfaces/types
│   ├── utils/                 # Utility functions
│   ├── auth/                  # Authentication logic
│   └── index.ts               # Barrel exports
│
├── views/                     # Feature modules (lazy-loaded)
│   ├── customers/             # Customer management
│   ├── orders/                # Order processing
│   ├── inventory/             # eSIM inventory
│   ├── analytics/             # Dashboard & reports
│   │   └── dashboard/         # Main dashboard with tabs
│   ├── pages/                 # Static pages (login, 404, etc.)
│   └── ...                    # Other features
│
├── layout/                    # App layout components
│   └── default-layout/        # Main layout with sidebar/header
│
├── app.component.ts           # Root component
├── app.routes.ts              # Route configuration
└── app.config.ts              # App-level providers

/src/assets/
├── i18n/                      # Translation files (en, he, ru, uk)
├── icons/                     # Custom SVG icons
└── ...

/src/scss/
├── _variables.scss            # Global variables, color system
├── _mixins.scss               # Reusable SCSS mixins
├── _utilities.scss            # Utility classes
└── styles.scss                # Global styles
```

---

## 🏗️ Architecture Patterns

### 1. Lazy-Loaded Feature Modules

**Pattern:** Standalone components with route-based lazy loading

```typescript
// app.routes.ts
{
  path: 'customers',
  loadComponent: () => import('./views/customers/customers.component')
    .then(m => m.CustomersComponent)
}
```

**Benefits:**
- Smaller initial bundle
- Faster app startup
- On-demand feature loading

---

### 2. Shared Resources Organization

**Pattern:** Domain-based organization in `/shared/`

```
/shared/
├── services/
│   ├── data/          # API/CRUD services
│   ├── ui/            # UI state services
│   └── core/          # Base classes, utilities
├── models/
│   ├── auth/          # Auth models
│   ├── business/      # Business entities
│   ├── ui/            # UI configs
│   └── ...            # 9 categories total
└── utils/
    ├── http/          # HTTP utilities
    ├── data/          # Data manipulation
    └── ...
```

---

### 3. Component Architecture

**Standard:** Standalone + OnPush + inject()

```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [/* explicit imports */]
})
export class MyComponent {
  private readonly service = inject(MyService);
  private readonly cdr = inject(ChangeDetectorRef);
}
```

---

### 4. State Management

**No NgRx/Akita** - Uses:
- Services with BehaviorSubject for shared state
- Component local state
- NgxWebstorage for persistence

---

### 5. Data Flow

```
Component
    ↓ (inject)
Data Service
    ↓ (HTTP)
API via Proxy (/api/v1/*)
    ↓
Backend (https://esim-server.dev.global-sim.app)
```

**Caching Layer:**
```
Component → Data Service → CacheHubService → HTTP (if cache miss)
```

---

## 🔐 Authentication Flow

```
1. User submits credentials
2. LoginService → OAuth2 endpoint (/oauth/token)
3. Receive JWT token
4. Store in LocalStorage/SessionStorage
5. HTTP Interceptor adds Bearer token to all requests
6. AuthGuard protects routes
7. Automatic token refresh on expiry
```

**Key Files:**
- `AuthService` - Token management, permissions
- `httpInspector.service.ts` - HTTP interceptor
- `login.service.ts` - OAuth flow

---

## 🌐 API Structure

**Base URL (dev):** `https://esim-server.dev.global-sim.app`

**Endpoint Pattern:** `/api/v1/{resource}/{command|query}/{action}`

**Examples:**
- `GET /api/v1/customers/query/all` - List customers
- `POST /api/v1/customers/command/create` - Create customer
- `GET /api/v1/customers/query/{id}/details` - Customer details

**Proxy:** All `/api/*` requests proxied in development (proxy.conf.js)

---

## 👥 User Roles & Permissions

**Roles:**
- Admin - Full access
- Customer - Self-service portal
- Support - Customer support operations
- Special - Custom permissions

**Implementation:** Hardcoded in AuthService (not backend-driven)

**UI Rendering:** Conditional based on permissions

```typescript
if (this.authService.hasPermission('MANAGE_CUSTOMERS')) {
  // Show admin features
}
```

---

## 🎨 Design System

**Approach:** Tailwind-inspired utility-first

**Color System:**
- 26 predefined colors
- CSS variables for theming
- Semantic aliases
- Dark mode support

**Components:**
- Badge - 26 color variants
- Card - 6 style variants
- All use global color system

**SCSS Architecture:**
- `@use` instead of `@import`
- Namespaced mixins
- Utility classes
- Component-specific styles scoped

---

## 📦 Key Modules

### Customers Module
- CRUD operations
- Private & corporate customers
- Complex filtering
- Generic table integration

### Orders Module
- Order management
- eSIM allocation
- Inventory integration

### Inventory Module
- eSIM tracking
- Bulk operations
- Status management

### Analytics/Dashboard Module
- **4 tabs:** Overview, Subscribers, Traffic, Finance
- Chart.js integration
- Period filtering (day/week/month)
- Real-time data with forkJoin

---

## 🌍 Internationalization

**Supported Languages:** en, he, ru, uk

**Library:** @ngx-translate/core

**Files:** `/src/assets/i18n/{lang}.json`

**Rule:** Translation keys MUST be lowercase

---

## 🔧 Development Workflow

**Commands:**
- `npm start` - Dev server with proxy (port 4200)
- `npm run build-prod` - Production build
- `npm test` - Unit tests (Karma/Jasmine)

**Build Output:** `dist/one-sim-portal`

**Deployment:** Docker multi-stage build (Node 16 + Nginx)

**Routing:** Hash-based (`#`) for URL compatibility

---

## 📚 Related Documentation

- **Component Rules:** [.claude/rules/01-CRITICAL.md](../rules/01-CRITICAL.md)
- **Reusable Components:** [./reusable-components.md](./reusable-components.md)
- **Common Patterns:** [./common-patterns.md](./common-patterns.md)
- **Similar Features:** [./similar-features.md](./similar-features.md)

---

**Last Updated:** 2025-11-15
