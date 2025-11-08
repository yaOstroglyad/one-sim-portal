# Service Organization Rules

> **Created:** 2025-11-01 | **Last Updated:** 2025-11-15
> **Context Tags:** `@creating-new` `@service` `@extending`
> **Read when:** Creating or organizing services

## Service Organization Rules
> **Created:** 2025-11-01 | **Last Updated:** 2025-11-01

### 🎯 Critical: Check Before Creating New Services

**ALWAYS follow this workflow when creating services:**

```
1. Need a new service?
   ↓
2. 🔍 SEARCH in /shared/services first!
   ↓
3. Does it exist?
   ├─ YES → ✅ Reuse existing service
   └─ NO  → Continue to step 4
   ↓
4. Is it reusable across domains?
   ├─ YES → Create in /shared/services (shared service)
   └─ NO  → Create in domain-specific folder
```

### 📂 Shared Services Structure

All shared services MUST be organized in domain-based folders:

```
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/
├── data/           # API/data interaction services (CRUD operations)
├── ui/             # UI/UX services (theme, language, visual, notifications)
├── core/           # Core/foundational services (base classes, utilities)
├── cache-hub/      # Caching system (CacheHubService)
└── feature-toggle/ # Feature flag service
```

### 🚨 Critical Rules

**❌ NEVER:**
- Create service without checking if it already exists in `/shared/services`
- Create duplicate services in different locations
- Put services directly in `/shared/services` root (must use folders)
- Create domain-specific service in `/shared/services`
- Create generic service in domain folder

**✅ ALWAYS:**
- Search existing services before creating new ones
- Use domain-based organization (data/, ui/, core/, etc.)
- Create barrel exports (`index.ts`) for each folder
- Add JSDoc comments to all service classes
- Include usage examples in JSDoc
- Use dependency injection with `inject()` function

### 📋 Decision Tree: Where to Create Service?

#### Step 1: Check Existing Services

```bash
# Search in shared services
grep -r "ServiceName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/

# Search across entire codebase
grep -r "ServiceName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/
```

#### Step 2: Determine Location

**Use this decision tree:**

```
Is service reusable across multiple domains/features?
├─ YES → Create in /shared/services
│   └─ Which category?
│       ├─ API/data operations? → /shared/services/data/
│       ├─ UI/UX functionality? → /shared/services/ui/
│       ├─ Core/base classes? → /shared/services/core/
│       ├─ Caching? → /shared/services/cache-hub/
│       ├─ Feature flags? → /shared/services/feature-toggle/
│       └─ New category? → Create new folder in /shared/services/
│
└─ NO → Domain-specific
    └─ Create in domain services folder
        Example: /views/dashboard/services/
```

### 📝 Service Category Definitions

#### 1. Data Services (`/shared/services/data/`)

**Purpose:** API interactions and CRUD operations for backend resources

**Naming Convention:** `{resource}-data.service.ts`

**Characteristics:**
- Extends `DataService<T>` base class (optional)
- Uses HttpClient for API calls
- Implements error handling with `handleArrayError`, `handleObjectError`, etc.
- May use CacheHubService for intelligent caching

**Examples:**
- `accounts-data.service.ts` - Account CRUD operations
- `customers-data.service.ts` - Customer management
- `orders-data.service.ts` - Order operations
- `products-data.service.ts` - Product catalog
- `tariff-offer.service.ts` - Tariff offer management

**Template:**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResourceType } from '../../model';
import { handleArrayError, handleObjectError } from '../../utils';
import { CacheHubService, DataType } from '../cache-hub';

/**
 * Data service for {Resource} management
 *
 * Provides CRUD operations and caching for {Resource} entities
 *
 * @example
 * ```typescript
 * const service = inject(ResourceDataService);
 * service.list().subscribe(items => console.log(items));
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceDataService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);
  private readonly baseUrl = '/api/v1/resources';

  list(): Observable<ResourceType[]> {
    return this.cacheHub.get(
      'resources:list',
      () => this.http.get<ResourceType[]>(this.baseUrl),
      { dataType: DataType.BUSINESS }
    ).pipe(
      catchError(handleArrayError<ResourceType>('fetching resources'))
    );
  }

  getById(id: string): Observable<ResourceType | null> {
    return this.cacheHub.get(
      `resources:detail-${id}`,
      () => this.http.get<ResourceType>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    ).pipe(
      catchError(handleObjectError<ResourceType>('fetching resource by id'))
    );
  }

  create(resource: ResourceType): Observable<ResourceType | null> {
    return this.http.post<ResourceType>(this.baseUrl, resource).pipe(
      tap(() => this.cacheHub.invalidatePattern('resources:')),
      catchError(handleObjectError<ResourceType>('creating resource'))
    );
  }
}
```

#### 2. UI Services (`/shared/services/ui/`)

**Purpose:** User interface and UX functionality

**Naming Convention:** `{feature}.service.ts`

**Characteristics:**
- No HTTP calls (or minimal)
- Manages UI state, preferences, visual behavior
- Often uses LocalStorage or SessionStorage
- Provides reactive streams (BehaviorSubject/Observable)

**Examples:**
- `language.service.ts` - Internationalization
- `theme.service.ts` - Theme switching (light/dark)
- `visual.service.ts` - Visual customization
- `snackbar.service.ts` - Toast notifications

**Template:**
```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * UI service for {Feature}
 *
 * Manages {feature description} state and preferences
 *
 * @example
 * ```typescript
 * const service = inject(FeatureService);
 * service.currentState$.subscribe(state => console.log(state));
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private readonly stateSubject = new BehaviorSubject<StateType>(initialState);

  readonly currentState$ = this.stateSubject.asObservable();

  setState(newState: StateType): void {
    this.stateSubject.next(newState);
    localStorage.setItem('feature-state', JSON.stringify(newState));
  }

  getState(): StateType {
    return this.stateSubject.value;
  }
}
```

#### 3. Core Services (`/shared/services/core/`)

**Purpose:** Foundational services, base classes, core utilities

**Naming Convention:** `{feature}.service.ts` or `{base-class}.service.ts`

**Characteristics:**
- Abstract base classes for inheritance
- Core business logic utilities
- Framework-level services
- Minimal dependencies

**Examples:**
- `data.service.ts` - Generic CRUD base class
- `country.service.ts` - Country/locale utilities
- `user-role.service.ts` - Role/permission utilities

**Template:**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Generic data service base class
 *
 * Provides common CRUD operations for entities
 * Extend this class for specific entity services
 *
 * @example
 * ```typescript
 * export class MyEntityService extends DataService<MyEntity> {
 *   constructor(http: HttpClient) {
 *     super(http, '/api/v1/my-entities');
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class DataService<T> {
  protected readonly http = inject(HttpClient);

  constructor(protected baseUrl: string) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl);
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  // ... other CRUD methods
}
```

### 📦 Barrel Exports

**Each service category MUST have an `index.ts` barrel export:**

```typescript
// /shared/services/data/index.ts
/**
 * Data Services barrel export
 *
 * Provides API interaction services for:
 * - Accounts, Companies, Customers
 * - Orders, Products, Providers
 * - Transactions, Subscriptions
 */

export * from './accounts-data.service';
export * from './companies-data.service';
export * from './customers-data.service';
// ... more exports
```

**Main barrel export (`/shared/services/index.ts`):**

**❌ WRONG - Individual service exports:**
```typescript
export * from './accounts-data.service';
export * from './customers-data.service';
export * from './language.service';
// ... 20+ individual exports
```

**✅ CORRECT - Category exports:**
```typescript
// Services - organized by category
export * from './data';        // Data/API services
export * from './ui';          // UI/UX services
export * from './core';        // Core/foundational services
export * from './cache-hub';   // Cache service
export * from './feature-toggle';  // Feature toggle service
```

### 🔍 Import Patterns

**Prefer category imports for tree-shaking:**

```typescript
// ✅ BEST - Import from main shared barrel
import { CustomersDataService, LanguageService } from '@shared';

// ✅ GOOD - Import from category barrel
import { CustomersDataService } from '@shared/services/data';
import { LanguageService } from '@shared/services/ui';

// ✅ ACCEPTABLE - Import from main services barrel
import { CustomersDataService, LanguageService } from '@shared/services';

// ❌ AVOID - Direct file import (bypasses barrel exports)
import { CustomersDataService } from '@shared/services/data/customers-data.service';
```

### 🏗️ Creating New Service Category

If your service doesn't fit existing categories:

1. **Verify it's truly a new category** (not a variant of existing)
2. **Create new folder** in `/shared/services/` with descriptive name
3. **Create barrel export** (`index.ts`)
4. **Add JSDoc** at folder level explaining category
5. **Update main barrel export** `/shared/services/index.ts`
6. **Update navigation table** in CLAUDE.md

**Example: New "analytics" category**

```typescript
// /shared/services/analytics/index.ts
/**
 * Analytics Services barrel export
 *
 * Provides analytics and tracking services for:
 * - User behavior tracking
 * - Performance monitoring
 * - Event logging
 */

export * from './tracking.service';
export * from './performance.service';
export * from './events.service';
```

**Update main barrel:**
```typescript
// /shared/services/index.ts
export * from './data';
export * from './ui';
export * from './core';
export * from './analytics';  // Add new category
```

### 🔄 Domain-Specific Services

**When to create domain-specific services:**
- Service is only used in one feature/domain
- Logic is tightly coupled to specific component tree
- Not reusable across application

**Location:** Create `services/` folder within domain

```
/views/dashboard/
├── components/
├── services/           # Domain-specific services
│   ├── dashboard-metrics.service.ts
│   └── index.ts       # Barrel export
└── dashboard.component.ts
```

**Example:**
```typescript
// /views/dashboard/services/dashboard-metrics.service.ts
/**
 * Dashboard-specific metrics calculation service
 * Only used within dashboard feature
 */
@Injectable()
export class DashboardMetricsService {
  calculateKPIs(data: DashboardData): DashboardKPIs {
    // Dashboard-specific logic
  }
}
```

### 🔍 Search Checklist Before Creating

Before creating ANY service, search these locations:

- [ ] `/shared/services/data/` - API/data services
- [ ] `/shared/services/ui/` - UI/UX services
- [ ] `/shared/services/core/` - Core/base services
- [ ] `/shared/services/cache-hub/` - Caching
- [ ] `/shared/services/feature-toggle/` - Feature flags
- [ ] Domain-specific services (e.g., `/views/dashboard/services/`)

**Search commands:**

```bash
# Search by service name
grep -r "ServiceName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/

# Search by functionality (e.g., "customer", "order", "theme")
grep -r "customer" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/

# List all service files
find /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/ -name "*.service.ts"
```

### 📚 Related Files

- **Main barrel:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/index.ts`
- **Data services:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/data/`
- **UI services:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/ui/`
- **Core services:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/core/`
- **Cache service:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/cache-hub/`

### ⚠️ Common Mistakes to Avoid

**1. Creating duplicate data services:**
```typescript
// ❌ WRONG - Duplicate service
// /views/customers/services/customer-api.service.ts
// Already exists: /shared/services/data/customers-data.service.ts
```

**2. Putting UI logic in data services:**
```typescript
// ❌ WRONG - UI logic in data service
@Injectable()
export class CustomersDataService {
  showNotification(message: string) { }  // Should be in UI service
}
```

**3. Not using barrel exports:**
```typescript
// ❌ WRONG - No barrel export, hard to import
import { CustomersDataService } from '@shared/services/data/customers-data.service';

// ✅ CORRECT - Use barrel export
import { CustomersDataService } from '@shared/services/data';
```

**4. Creating services in wrong category:**
```typescript
// ❌ WRONG - Notification service in data/ folder
// /shared/services/data/notification.service.ts

// ✅ CORRECT - Notification service in ui/ folder
// /shared/services/ui/snackbar.service.ts
```

