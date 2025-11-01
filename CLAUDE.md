# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Rules Version History & Navigation
> **Document Created:** 2025-10-16 | **Last Major Update:** 2025-11-01

| Priority | Rule Section | Created | Status | Location |
|----------|--------------|---------|--------|----------|
| 🔴 Critical | [Rule Addition Protocol](#rule-addition-protocol) | 2025-10-16 | ✅ Active | Line 26 |
| 🔴 Critical | [File Path Rules](#critical-file-path-rules) | 2025-10-16 | ✅ Active | Line 75 |
| 🟡 High | [Documentation Language](#documentation-and-comments-language-rule) | 2025-10-16 | ✅ Active | Line 92 |
| 🔵 Low | [Mock Server Rules](#mock-server-rules) | 2025-10-16 | ✅ Active | Line 100 |
| 🟡 High | [Component Architecture](#component-architecture-rules) | 2025-10-16 | ✅ Active | Line 183 |
| 🔴 Critical | [HTTP Error Handling](#http-error-handling-rules) | 2025-11-01 | ✅ Active | Line 293 |
| 🔴 Critical | [Utility Functions](#utility-functions-organization-rules) | 2025-11-01 | ✅ Active | Line 715 |
| 🔵 Low | [Cache Service Rules](#cachehubservice-usage) | 2025-10-16 | ✅ Active | Line 291 |
| 🟢 Medium | [SCSS Architecture](#scss-architecture-rules) | 2025-10-16 | ✅ Active | Line 363 |
| 🔴 Critical | [SVG & Icon Usage](#icon-strategy-prefer-custom-icons) | 2025-10-16 | ✅ Active | Line 470 |
| 🟡 High | [TypeScript Interfaces](#typescript-interface-model-organization-rules) | 2025-10-16 | ✅ Active | Line 614 |

> **Maintenance Note:** Review rules quarterly for Angular version updates and best practices evolution.
> **Priority Guide:** 🔴 Critical = Project-breaking | 🟡 High = Code quality | 🟢 Medium = Best practices | 🔵 Low = Specific cases

> 🚨 **REMINDER**: Always use ABSOLUTE paths: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/...`
> Never use relative paths like `../../../../` - they will fail!

## 🚫 RULE ADDITION PROTOCOL
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16 (Added update tracking requirement)

### CRITICAL: Prevent Rule Duplication

**Before adding ANY new rule to CLAUDE.md:**

1. **🔍 Search for existing rules** using keywords related to your topic:
   ```bash
   # Search examples:
   - SCSS/CSS rules: search "scss", "style", "mixin", "@use", "@import"
   - Component rules: search "component", "standalone", "architecture"
   - Path rules: search "path", "absolute", "relative", "file"
   - Icon rules: search "icon", "svg", "coreui"
   ```

2. **📋 Check the navigation table above** - scan rule sections for related topics

3. **⚠️ If similar rule exists:**
   - **Option A:** Update existing rule instead of creating new one
   - **Option B:** Merge content into existing section
   - **Option C:** Add cross-reference to existing rule
   - **❌ Never:** Create duplicate rule in different section

4. **✅ If adding new rule:**
   - Add to navigation table with priority and date
   - Use proper heading hierarchy
   - Include creation date: `> **Created:** YYYY-MM-DD`
   - Follow existing formatting patterns

5. **📝 If updating existing rule:**
   - Update the "Last Updated" date: `> **Created:** YYYY-MM-DD | **Last Updated:** YYYY-MM-DD`
   - Document what changed (add comment if major modification)
   - Update navigation table "Last Updated" date if significant change

6. **🔄 After adding/updating rule:**
   - Update "Last Major Update" date in navigation table
   - Verify no conflicts with existing rules
   - Test that navigation links work

**Examples:**

**❌ What NOT to do:**
```markdown
❌ Adding SCSS @use rule in "Component Architecture"
   when "SCSS Architecture" section already exists
❌ Adding icon usage in multiple sections
❌ Repeating file path rules in different places
❌ Updating rule without changing date
```

**✅ What TO do:**
```markdown
✅ Update existing SCSS section instead of creating new one
✅ Add cross-reference: "See SCSS Architecture section"
✅ Update date when modifying rule:
   > **Created:** 2025-10-16 | **Last Updated:** 2025-10-16 (Added @use requirement)
```

**This protocol prevents:**
- 🚫 Rule duplication
- 🚫 Conflicting guidelines
- 🚫 Scattered information
- 🚫 Maintenance overhead

## ⚠️ CRITICAL FILE PATH RULES ⚠️
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

### 🚨 ABSOLUTE PATHS ONLY 🚨

**❌ NEVER USE RELATIVE PATHS**: `../../../../andreyostroglyad/IdeaProjects/...`
**✅ ALWAYS USE ABSOLUTE PATHS**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/...`

### Examples:
```
❌ WRONG: ../../../../andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/...
✅ CORRECT: /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/...

❌ WRONG: ../../../scss/styles.scss
✅ CORRECT: /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/scss/styles.scss
```

### Root Directory: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

**IF YOU USE RELATIVE PATHS, THE OPERATION WILL FAIL WITH "File does not exist" ERROR!**

## Documentation and Comments Language Rule
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**ALL documentation, README files, code comments, and commit messages MUST be written in English.**
- This includes inline comments, JSDoc/TSDoc comments, README files, and any other documentation
- Variable names, function names, and code identifiers should also use English
- Exception: User-facing text and translations remain in their respective languages

## Mock Server Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**Mock server has its own architecture rules** - see `/mock-server/CLAUDE-MOCK.md` for detailed guidelines when working with mock server code.

## Project Overview

This is an Angular 16 eSIM portal management application that provides a white-label solution for managing eSIM products, customers, orders, and inventory. The application uses CoreUI and Angular Material for UI components and implements JWT-based authentication with role-based access control.

## Development Commands

### Essential Commands
- `npm start` - Start development server with proxy configuration (runs on http://localhost:4200)
- `npm run build-prod` - Build for production
- `npm test` - Run unit tests with Karma/Jasmine
- `ng serve --proxy-config proxy.conf.json` - Manual dev server start with API proxy

### Testing
- Test files follow Angular convention: `*.spec.ts`
- Run specific test file: `ng test --include='**/path-to-file.spec.ts'`
- Tests use Karma with Chrome browser

### Build & Deployment
- Production build outputs to `dist/one-sim-portal`
- Docker multi-stage build with Node 16 Alpine and Nginx
- Uses hash-based routing (#) for URLs

## Architecture & Code Structure

### Core Architecture
The application follows Angular's modular architecture with lazy-loaded feature modules:

1. **Authentication Flow**:
   - JWT tokens stored in LocalStorage/SessionStorage
   - HTTP interceptor (`src/app/shared/auth/httpInspector.service.ts`) adds Bearer token to all requests
   - AuthGuard protects routes requiring authentication
   - Automatic token refresh mechanism implemented

2. **API Communication**:
   - All API calls proxy to `https://esim-server.dev.global-sim.app` in development
   - API endpoints follow pattern: `/api/v1/{resource}`
   - No centralized API configuration - endpoints hardcoded in services

3. **User Roles & Permissions**:
   - Four main roles: Admin, Customer, Support, Special
   - Permissions are currently hardcoded in `AuthService`
   - UI elements conditionally rendered based on permissions

### Key Modules & Their Services

1. **Customers Module** (`src/app/views/customers/`):
   - `CustomersDataService` - Handles customer CRUD operations
   - Supports both private and corporate customers
   - Complex filtering and search capabilities

2. **Orders Module** (`src/app/views/orders/`):
   - `OrdersDataService` - Order management and processing
   - Integrates with inventory for eSIM allocation

3. **Inventory Module** (`src/app/views/inventory/`):
   - `InventoryDataService` - eSIM inventory tracking
   - Bulk operations support

4. **Generic Components** (`src/app/shared/components/`):
   - `GenericTableComponent` - Reusable data table with sorting, pagination, filtering
   - `FormGeneratorComponent` - Dynamic form generation from JSON schema
     - **Documentation**: See `src/app/shared/components/form-generator/README.md`
     - **HTTP Dependencies**: Supports dynamic field dependencies with API calls
     - **FormArray Support**: Nested form arrays with field dependencies
   - `GenericDialogComponent` - Reusable dialog wrapper

### State Management
- Uses `NgxWebstorage` for local/session storage
- No centralized state management (no NgRx/Akita)
- Services maintain component state

### Internationalization
- Supported languages: English (en), Hebrew (he), Russian (ru), Ukrainian (uk)
- Translation files in `src/assets/i18n/`
- Uses `@ngx-translate/core` for translations
- **Translation Keys Rule**: All translation keys MUST be lowercase (e.g., `nav.productconstructor` not `nav.productConstructor`)

## Important Technical Details

### Component Architecture Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

1. **Standalone Components ONLY**: All new components MUST be standalone (Angular 14+ pattern)
   - Use `standalone: true` in component decorator
   - Import dependencies explicitly in `imports` array
   - NO module-based components
   - NO NgModules for new features - use standalone components with lazy loading directly
   - **NO HttpClientModule**: Never import HttpClientModule in standalone components - HttpClient is provided globally via provideHttpClient() in app configuration
   - **NO Deprecated APIs**: Never use deprecated Angular APIs:
     - ❌ `APP_INITIALIZER` - use `provideAppInitializer(() => inject(Service).init())`
     - ❌ `ENVIRONMENT_INITIALIZER` - use `makeEnvironmentProviders` with custom tokens
     - ❌ `HttpClientModule` - use `provideHttpClient()`
     - Always check Angular documentation for current best practices
   - **Modern App Initialization**: Use `provideAppInitializer` for app startup logic:
     - ✅ `provideAppInitializer(() => inject(AuthService).loadPermissions())`
     - ✅ Runs in injection context, supports async operations
     - ✅ Blocks app bootstrap until completion
   - **Provider Functions**: Correct usage of provider functions:
     - ✅ `provideFabLayout()` - use directly in providers array (returns EnvironmentProviders)
     - ❌ `...provideFabLayout()` - do NOT spread EnvironmentProviders
     - ✅ `...providerArray` - only spread actual arrays of providers

2. **OnPush Change Detection MANDATORY**: All new components MUST use OnPush strategy
   - Use `changeDetection: ChangeDetectionStrategy.OnPush` in component decorator
   - Inject `ChangeDetectorRef` and use `markForCheck()` when updating component state
   - Use `markForCheck()` instead of `detectChanges()` for better performance
   - NEVER mutate objects/arrays directly - use immutable patterns

3. **Dependency Injection with inject() MANDATORY**: All new components and services MUST use the `inject()` function
   - Use `inject()` function instead of constructor injection
   - Declare injected dependencies as `private readonly` fields
   - Example:
   ```typescript
   @Component({
     standalone: true,
     changeDetection: ChangeDetectionStrategy.OnPush,
     // ...
   })
   export class MyComponent {
     private readonly cdr = inject(ChangeDetectorRef);
     private readonly authService = inject(AuthService);

     updateData(newData: any): void {
       this.data = { ...this.data, ...newData }; // Immutable update
       this.cdr.markForCheck(); // Trigger change detection
     }
   }
   ```

4. **Template Separation**: If HTML template contains more than one logical block, MUST extract to separate `.html` file
   - Simple components with single logical block can use inline templates
   - Complex components with multiple sections MUST use `templateUrl`
   - Example: Dashboard tabs, forms with multiple sections, lists with headers/footers

   > **Note:** For SCSS styling rules, see [SCSS Architecture section](#scss-architecture-rules)

### TypeScript Configuration
- Target: ES2022
- Strict null checks are DISABLED (`strictNullChecks: false`)
- Be cautious with null/undefined handling

### Global Design System (Tailwind-inspired)
The project uses a Tailwind-inspired design system with reusable utilities:

1. **Color System** (`src/scss/_variables.scss`):
   - Global `$os-colors` map with 26 colors (semantic + Tailwind colors)
   - Each color includes: bg, text, subtle-bg, and rgb values
   - Universal mixins: `generate-os-colors()` for component variants

2. **Utilities** (`src/scss/_utilities.scss`):
   - Border radius scale: none, small, medium, large, xl, 2xl, 3xl, full
   - Shadow utilities: sm, default, md, lg, xl, 2xl, inner
   - Spacing scale: 0 to 24 (Tailwind-inspired)
   - Typography scale: xs to 5xl
   - Mixins: glassmorphism, elevation, interactive-states, disabled-state, loading-state, truncate

3. **Color Mixins** (`src/scss/_color-mixins.scss`):
   - `generate-border-colors()` - Creates border color classes
   - `generate-shadow-colors()` - Creates colored shadow classes

4. **Component Architecture**:
   - Badge component: Supports all 26 colors with smart text contrast
   - Card component: 6 variants (default, elevated, outlined, ghost, gradient, glassmorphism)
   - Both use the global color system and utilities

> **SCSS Usage:** For import patterns and styling guidelines, see [SCSS Architecture section](#scss-architecture-rules)

## HTTP Error Handling Rules
> **Created:** 2025-11-01 | **Last Updated:** 2025-11-01 (Added forkJoin pattern)

### 🎯 Overview
All HTTP error handling MUST use the unified utilities from `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/http/http-error.utils.ts`. This file consolidates all error handling, response wrapping, and configuration in a single location.

### 🚨 Critical Rules

**❌ NEVER:**
- Create inline `catchError(() => of([]))` handlers
- Use custom error parsing logic in services/components
- Import from deleted files (`error-handler.utils.ts`, `response.utils.ts`, etc.)
- Omit type parameters from error handlers
- Return wrong type from error handlers (e.g., `handleObjectError` for arrays)
- Add `catchError` to individual observables inside `forkJoin` (see forkJoin pattern below)

**✅ ALWAYS:**
- Import from barrel export: `import { ... } from '../utils'` or `'../../../shared/utils'`
- Provide error context description for logging
- Use appropriate type parameters for type safety
- Choose correct handler for expected return type
- Add `catchError(createErrorResponse)` ONLY after `forkJoin`, never inside it

### 📦 Available Utilities

#### 1. Standard Error Handlers

**`handleArrayError<T>(errorContext: string): Observable<T[]>`**
- **Use for:** API endpoints that return arrays
- **Returns:** Empty array `[]` on error
- **Type parameter:** Entity type in the array

```typescript
// ✅ Correct usage
getPurchasedProducts(params: { subscriberId: string }): Observable<ProductPurchase[]> {
  return this.http.get<ProductPurchase[]>(`/api/v1/product-purchases/query/all`, { params }).pipe(
    catchError(handleArrayError<ProductPurchase>('fetching purchased products'))
  );
}

// ❌ Wrong - missing type parameter
catchError(handleArrayError('fetching products'))  // Returns Observable<unknown[]>

// ❌ Wrong - using handleObjectError for array endpoint
catchError(handleObjectError<ProductPurchase>('fetching products'))  // Returns Observable<ProductPurchase | null>
```

**`handleObjectError<T>(errorContext: string): Observable<T | null>`**
- **Use for:** API endpoints that return single objects
- **Returns:** `null` on error
- **Type parameter:** Expected object type
- **Important:** Return type must include `| null`

```typescript
// ✅ Correct usage
getCustomerDetails(id: string): Observable<DataObject | null> {
  return this.http.get<DataObject>(`/api/v1/customers/query/${id}/details`).pipe(
    catchError(handleObjectError<DataObject>('fetching customer details'))
  );
}

// ❌ Wrong - return type doesn't include null
getCustomerDetails(id: string): Observable<DataObject> {  // TypeScript error!
  return this.http.get<DataObject>(`/api/v1/customers/query/${id}/details`).pipe(
    catchError(handleObjectError<DataObject>('fetching customer details'))
  );
}
```

**`handleWithDefault<T>(errorContext: string, defaultValue: T): Observable<T>`**
- **Use for:** Custom fallback values (e.g., paginated responses, complex objects)
- **Returns:** Provided default value on error
- **Type parameter:** Type of default value

```typescript
// ✅ Correct usage - pagination with default
paginatedCustomers(params: any, page: number = 0, size: number = 15): Observable<Pagination<Customer>> {
  return this.http.get<Pagination<Customer>>('/api/v1/customers/query/all/page', { params }).pipe(
    catchError(handleWithDefault('fetching paginated customers', {
      totalElements: 0,
      totalPages: 0,
      content: []
    }))
  );
}

// ✅ Correct usage - object with default structure
getConfig(): Observable<AppConfig> {
  return this.http.get<AppConfig>('/api/v1/config').pipe(
    catchError(handleWithDefault('fetching app config', { theme: 'light', locale: 'en' }))
  );
}
```

**`handleEmptyObjectError(errorContext: string): Observable<{}>`**
- **Use for:** Endpoints where you need an empty object fallback
- **Returns:** Empty object `{}` on error
- **Rare use case:** Prefer `handleWithDefault` for most scenarios

```typescript
// ✅ Correct usage
getOptionalMetadata(): Observable<{}> {
  return this.http.get('/api/v1/metadata').pipe(
    catchError(handleEmptyObjectError('fetching metadata'))
  );
}
```

#### 2. Error Transformation

**`transformHttpError(error: HttpErrorResponse): ApiError`**
- **Use for:** Generic HTTP errors in data services
- **Returns:** Standardized ApiError object
- **Handles:** Network errors, server errors, client errors

```typescript
// ✅ Standard data service error
this.http.post('/api/v1/customers', data).pipe(
  catchError(err => {
    const apiError = transformHttpError(err);
    console.error('Error creating customer:', apiError.message);
    return throwError(() => apiError);
  })
);
```

**`transformAuthError(error: HttpErrorResponse): ApiError`**
- **Use for:** OAuth/authentication errors ONLY
- **Returns:** ApiError with parsed OAuth error_description
- **Special handling:** Parses JSON error responses with `error_description` field

```typescript
// ✅ OAuth/Login error handling
login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.authService.authorize(credentials).pipe(
    catchError(err => {
      let message = 'Authorization error';
      if (err instanceof HttpErrorResponse) {
        const authError = transformAuthError(err);  // Parses OAuth JSON
        message = authError.message;
      }
      console.error('Login error:', err);
      this.notify(message);
      return EMPTY;
    })
  );
}

// ❌ Wrong - using transformAuthError for non-auth endpoints
this.http.get('/api/v1/customers').pipe(
  catchError(err => {
    const error = transformAuthError(err);  // Don't use for regular APIs!
    return of([]);
  })
);
```

#### 3. Response Wrapping (Advanced)

**`wrapResponse<T>(observable: Observable<T>): Observable<ApiResponse<T>>`**
- **Use for:** Components that need loading/error states
- **Returns:** Observable of ApiResponse with status tracking
- **States:** 'loading' → 'success' | 'error'

```typescript
// ✅ Component with loading state
export class CustomerListComponent {
  customers$: Observable<ApiResponse<Customer[]>>;

  ngOnInit() {
    this.customers$ = wrapResponse(
      this.customerService.list()
    );
  }
}

// Template usage
<div *ngIf="customers$ | async as response">
  <spinner *ngIf="response.status === 'loading'"></spinner>
  <error-message *ngIf="response.status === 'error'" [error]="response.error"></error-message>
  <customer-list *ngIf="response.status === 'success'" [customers]="response.data"></customer-list>
</div>
```

**`createErrorResponse(error: any): ApiResponse<null>`**
- **Use for:** Manual error response creation
- **Returns:** ApiResponse with 'error' status

### 📋 Decision Tree: Which Handler to Use?

```
Does endpoint return an array?
├─ YES → Use handleArrayError<T>('context')
└─ NO → Does it return a single object?
    ├─ YES → Use handleObjectError<T>('context')
    │        Remember: return type must be Observable<T | null>
    └─ NO → Need custom fallback?
        ├─ YES → Use handleWithDefault<T>('context', defaultValue)
        └─ NO → Use handleEmptyObjectError('context')

Is this an OAuth/login error?
├─ YES → Use transformAuthError(error)
└─ NO → Use transformHttpError(error)

Need loading/error states in component?
├─ YES → Use wrapResponse(observable)
└─ NO → Use standard handlers
```

### 🎓 Complete Examples

#### Data Service (Most Common Pattern)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Customer, Pagination } from '../model';
import { handleArrayError, handleObjectError, handleWithDefault } from '../utils';

@Injectable({ providedIn: 'root' })
export class CustomersDataService {
  constructor(private http: HttpClient) {}

  // Array endpoint
  list(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/v1/customers/query/all').pipe(
      catchError(handleArrayError<Customer>('fetching customers list'))
    );
  }

  // Single object endpoint
  getById(id: string): Observable<Customer | null> {
    return this.http.get<Customer>(`/api/v1/customers/query/${id}`).pipe(
      catchError(handleObjectError<Customer>('fetching customer by id'))
    );
  }

  // Paginated endpoint with custom default
  paginated(page: number = 0, size: number = 15): Observable<Pagination<Customer>> {
    return this.http.get<Pagination<Customer>>('/api/v1/customers/query/all/page', {
      params: { page, size }
    }).pipe(
      catchError(handleWithDefault('fetching paginated customers', {
        totalElements: 0,
        totalPages: 0,
        content: []
      }))
    );
  }

  // POST/PUT/DELETE with custom error handling
  create(customer: Customer): Observable<Customer | null> {
    return this.http.post<Customer>('/api/v1/customers/command/create', customer).pipe(
      catchError(handleObjectError<Customer>('creating customer'))
    );
  }
}
```

#### Component with Subscription

```typescript
import { Component, OnInit } from '@angular/core';
import { CustomersDataService } from '../services/customers-data.service';
import { Customer } from '../model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;

  constructor(private customerService: CustomersDataService) {}

  ngOnInit() {
    this.loading = true;
    this.customerService.list().subscribe({
      next: (data) => {
        this.customers = data;  // handleArrayError ensures this is never null
        this.loading = false;
      },
      error: (err) => {
        // This won't be called if using handleArrayError
        // Error is already logged, empty array returned
        this.loading = false;
      }
    });
  }
}
```

#### Login/Auth Service (OAuth Errors)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transformAuthError } from '../utils';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(credentials: { username: string; password: string }) {
    return this.http.post('/oauth/token', credentials).pipe(
      catchError(err => {
        let message = 'Authorization error';
        if (err instanceof HttpErrorResponse) {
          const authError = transformAuthError(err);  // Parses OAuth JSON
          message = authError.message;
        } else if (err?.message) {
          message = err.message;
        }
        console.error('Login error:', err);
        this.snackBar.open(message, '', { panelClass: 'app-notification-error', duration: 2000 });
        return EMPTY;
      })
    ).subscribe({
      next: (token) => {
        localStorage.setItem('token', token);
        this.router.navigate(['/home']);
      }
    });
  }
}
```

#### HTTP Interceptor (Advanced)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { transformHttpError } from '../utils';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(error => {
      const apiError = transformHttpError(error);

      // Handle unauthorized
      if (error.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }

      // Log all errors
      console.error('HTTP Error:', apiError);

      return throwError(() => apiError);
    })
  );
};
```

### 🔍 Import Patterns

**✅ Correct imports:**
```typescript
// From data service (2 levels deep: services/foo.service.ts → utils/)
import { handleArrayError, handleObjectError, transformHttpError } from '../utils';

// From component (4 levels deep: views/customers/list/list.component.ts → shared/utils/)
import { handleArrayError, wrapResponse } from '../../../shared/utils';

// Never import individual files
import { handleArrayError } from '../../../shared/utils/http/http-error.utils';  // ❌ Wrong
```

### 📝 Error Context Best Practices

**Context descriptions should:**
- Use present participle (-ing form): "fetching", "creating", "updating", "deleting"
- Be specific about the resource: "fetching customer details", not "getting data"
- Be lowercase (logs will capitalize)

**Examples:**
```typescript
✅ handleArrayError<Product>('fetching products list')
✅ handleObjectError<Order>('creating new order')
✅ handleWithDefault('loading user preferences', defaultPrefs)
✅ handleArrayError<Invoice>('searching invoices by date range')

❌ handleArrayError('get data')  // Too vague
❌ handleObjectError('Fetching Customer')  // Don't capitalize
❌ handleArrayError('fetch')  // Not specific enough
```

### 🔄 forkJoin Pattern (CRITICAL)

**When combining multiple HTTP requests with `forkJoin`, follow this pattern:**

#### ✅ CORRECT Pattern:

```typescript
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { wrapResponse, createErrorResponse } from '../utils';

getExecutiveData(): Observable<DashboardResponse<ExecutiveTabData>> {
  // Real API: Combine both endpoints with forkJoin
  return forkJoin({
    bundleRevenue: this.getBundleRevenueFromApi(period),    // ✅ Clean observable
    inventoryStatus: this.getInventoryStatusFromApi()       // ✅ Clean observable
  }).pipe(
    map(({ bundleRevenue, inventoryStatus }) =>
      this.mapApiDataToExecutiveData(bundleRevenue, inventoryStatus)
    ),
    map(data => wrapResponse(data)),
    catchError(error => createErrorResponse(error))  // ✅ ONLY catchError here
  );
}

// Helper methods return clean observables WITHOUT catchError
private getBundleRevenueFromApi(period: DashboardPeriod): Observable<BundleRevenueApiResponse> {
  return this.http.get<BundleRevenueApiResponse>('/api/endpoint', { params }).pipe(
    retry(2),
    shareReplay(1)
    // ✅ NO catchError here!
  );
}

private getInventoryStatusFromApi(): Observable<InventoryStatusApiResponse> {
  return this.http.get<InventoryStatusApiResponse>('/api/endpoint').pipe(
    retry(2),
    shareReplay(1)
    // ✅ NO catchError here!
  );
}
```

#### ❌ WRONG Pattern:

```typescript
// ❌ DO NOT DO THIS
getExecutiveData(): Observable<DashboardResponse<ExecutiveTabData>> {
  return forkJoin({
    bundleRevenue: this.getBundleRevenueFromApi(period),
    inventoryStatus: this.getInventoryStatusFromApi()
  }).pipe(
    map(data => wrapResponse(data)),
    catchError(error => createErrorResponse(error))
  );
}

// ❌ PROBLEM: catchError inside individual observables
private getBundleRevenueFromApi(period: DashboardPeriod): Observable<BundleRevenueApiResponse> {
  return this.http.get<BundleRevenueApiResponse>('/api/endpoint', { params }).pipe(
    retry(2),
    catchError(err => {  // ❌ This transforms the error!
      console.error('Bundle Revenue Error:', err);
      throw err;  // Now this is no longer HttpErrorResponse
    }),
    shareReplay(1)
  );
}
```

**Why this matters:**

1. `createErrorResponse()` needs the original `HttpErrorResponse` to parse backend error format (`{code: 400, message: "..."}`)
2. When you add `catchError` inside forkJoin observables and re-throw, the error becomes a transformed object
3. When `forkJoin` fails and calls the outer `catchError(createErrorResponse)`, it receives the already-transformed error
4. `transformHttpError()` cannot parse the transformed error → returns `UNKNOWN_ERROR` instead of actual backend message

**Result:**
- ❌ Without pattern: Shows "Unexpected error occurred" with code "UNKNOWN_ERROR"
- ✅ With pattern: Shows "Account ID must be provided by admin users" with code "400"

### 🎯 Migration Checklist

When updating old services to use unified error handling:

- [ ] Remove inline `catchError(() => of([]))` or `catchError(() => of(null))`
- [ ] Add import: `import { handleArrayError, handleObjectError, ... } from '../utils'`
- [ ] Replace with appropriate handler (check decision tree above)
- [ ] Add type parameter: `handleArrayError<EntityType>(...)`
- [ ] Provide descriptive error context
- [ ] For object endpoints, ensure return type includes `| null`
- [ ] For OAuth/login, use `transformAuthError` instead of `transformHttpError`
- [ ] Remove any custom error parsing logic (e.g., `parseErrorMessage()`)
- [ ] **For forkJoin: Remove all `catchError` from individual observables inside forkJoin**
- [ ] Test that errors are logged correctly with context

### 📚 Related Files

- **Utilities:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/http/http-error.utils.ts`
- **Barrel Export:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/index.ts`
- **Example Services:** See any file in `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/`
- **Auth Service:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/pages/login/login.service.ts`

## Utility Functions Organization Rules
> **Created:** 2025-11-01 | **Last Updated:** 2025-11-01

### 🎯 Critical: Check Before Creating New Utilities

**ALWAYS follow this workflow when creating utility functions:**

```
1. Need a utility function?
   ↓
2. 🔍 SEARCH in /shared/utils first!
   ↓
3. Does it exist?
   ├─ YES → ✅ Reuse existing utility
   └─ NO  → Continue to step 4
   ↓
4. Is it reusable across domains?
   ├─ YES → Create in /shared/utils (shared utility)
   └─ NO  → Create in domain-specific utils
```

### 📂 Shared Utils Structure

All shared utilities MUST be organized in domain-based folders:

```
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/
├── color/          # Color manipulation (hex, rgb, shading, constants)
├── data/           # Data manipulation (search, format, transform)
├── currency/       # Currency conversion, price calculations
├── http/           # HTTP error handling, requests, responses
└── testing/        # Mock utilities, test helpers
```

### 🚨 Critical Rules

**❌ NEVER:**
- Create utility without checking if it already exists in `/shared/utils`
- Create duplicate utilities in different locations
- Put utilities directly in `/shared/utils` root (must use folders)
- Create domain-specific utility in `/shared/utils`
- Create generic utility in domain folder

**✅ ALWAYS:**
- Search existing utilities before creating new ones
- Use domain-based organization (color/, data/, http/, etc.)
- Create barrel exports (`index.ts`) for each folder
- Add JSDoc comments to all utility functions
- Include usage examples in JSDoc

### 📋 Decision Tree: Where to Create Utility?

#### Step 1: Check Existing Utilities

```bash
# Search in shared utils
grep -r "functionName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/

# Search across entire codebase
grep -r "functionName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/
```

#### Step 2: Determine Location

**Use this decision tree:**

```
Is utility reusable across multiple domains/features?
├─ YES → Create in /shared/utils
│   └─ Which category?
│       ├─ Color manipulation? → /shared/utils/color/
│       ├─ Data formatting/search? → /shared/utils/data/
│       ├─ Currency/pricing? → /shared/utils/currency/
│       ├─ HTTP operations? → /shared/utils/http/
│       ├─ Testing/mocking? → /shared/utils/testing/
│       └─ New category? → Create new folder in /shared/utils/
│
└─ NO → Domain-specific
    └─ Create in domain utils folder
        Example: /views/dashboard/utils/
```

### 📝 Examples

#### ✅ Correct: Reusable Utility in Shared

**Scenario:** Need to format currency values

```typescript
// ❌ WRONG - Creating in domain folder
// /views/orders/utils/currency-formatter.ts

// ✅ CORRECT - Search first, found in shared utils
import { formatCurrency } from '../../shared/utils/data';

// Usage
const formatted = formatCurrency(1234.56, 'USD'); // "$1,234.56"
```

#### ✅ Correct: Domain-Specific Utility

**Scenario:** Calculate dashboard-specific metrics

```typescript
// ✅ CORRECT - Domain-specific, stays in domain
// /views/dashboard/utils/metric-calculator.ts

/**
 * Calculate dashboard-specific KPIs
 * This logic is only used in dashboard and not reusable
 */
export function calculateDashboardKPIs(data: DashboardData): DashboardMetrics {
  // Dashboard-specific calculation logic
}
```

#### ❌ Wrong: Creating Duplicate Utility

**Scenario:** Need to search nested objects

```typescript
// ❌ WRONG - Not checking existing utilities
// /views/customers/utils/object-search.ts
export function searchInObject(obj: any, term: string): boolean {
  // Duplicate implementation
}

// ✅ CORRECT - Reuse existing utility
import { deepSearch } from '../../shared/utils/data';

const found = deepSearch(customerData, 'search term');
```

### 🔨 Creating New Shared Utility

When creating a new utility in `/shared/utils`:

1. **Choose correct folder** based on domain
2. **Create `.utils.ts` file** with descriptive name
3. **Add JSDoc comments** with examples
4. **Export from `index.ts`** in that folder
5. **Update main barrel export** if needed

**Example: Adding new data utility**

```typescript
// /shared/utils/data/validation.utils.ts

/**
 * Validate email format
 *
 * @param email - Email string to validate
 * @returns true if valid email format
 *
 * @example
 * ```typescript
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid-email');    // false
 * ```
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Update barrel export:**

```typescript
// /shared/utils/data/index.ts
export * from './search.utils';
export * from './format.utils';
export * from './validation.utils';  // Add new export
```

### 📦 Import Patterns

**Prefer specific imports for tree-shaking:**

```typescript
// ✅ BEST - Import from specific category
import { CHART_COLORS, shadeColor } from '@shared/utils/color';
import { deepSearch } from '@shared/utils/data';

// ✅ GOOD - Import from main barrel (convenience)
import { CHART_COLORS, deepSearch } from '@shared/utils';

// ❌ AVOID - Direct file import (bypasses barrel exports)
import { CHART_COLORS } from '@shared/utils/color/color.constants';
```

### 🔍 Search Checklist Before Creating

Before creating ANY utility, search these locations:

- [ ] `/shared/utils/color/` - Color manipulation
- [ ] `/shared/utils/data/` - Data formatting, searching, transformation
- [ ] `/shared/utils/currency/` - Currency conversion, price calculations
- [ ] `/shared/utils/http/` - HTTP error handling, transformations
- [ ] `/shared/utils/testing/` - Mock utilities, test helpers
- [ ] Domain-specific utils (e.g., `/views/dashboard/utils/`)

**Search commands:**

```bash
# Search by function name
grep -r "functionName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/

# Search by keyword (e.g., "currency", "format", "search")
grep -r "currency" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/

# List all utility files
find /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/ -name "*.ts"
```

### 🏗️ Creating New Category

If your utility doesn't fit existing categories:

1. **Verify it's truly a new category** (not a variant of existing)
2. **Create new folder** in `/shared/utils/` with descriptive name
3. **Create barrel export** (`index.ts`)
4. **Add JSDoc** at folder level explaining category
5. **Update main barrel export** `/shared/utils/index.ts`
6. **Document in CLAUDE.md** (this file)

**Example: New "validation" category**

```typescript
// /shared/utils/validation/index.ts
/**
 * Validation utilities barrel export
 *
 * Provides validation functions for:
 * - Email validation
 * - Phone number validation
 * - Form field validation
 */

export * from './email.utils';
export * from './phone.utils';
export * from './form.utils';
```

### 📚 Related Files

- **Main barrel:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/index.ts`
- **Color utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/color/`
- **Data utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/data/`
- **HTTP utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/http/`
- **Currency utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/currency/`
- **Testing utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/testing/`

### Routing
- Uses `HashLocationStrategy` - all routes have `#` prefix
- Main layout loaded at `/home` route
- Feature modules lazy-loaded for performance

### HTTP Interceptor
The HTTP interceptor automatically:
- Adds authentication token to requests
- Redirects to login on 401 errors
- Located at `src/app/shared/auth/httpInspector.service.ts`

### CacheHubService Usage
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**CRITICAL: Cache Invalidation Pattern Rules**

When using CacheHubService, cache keys include namespace prefixes. Always match invalidation patterns with full keys:

#### ❌ WRONG - Missing namespace:
```typescript
// Cache key: "default:users:page-0-15-active"
this.cacheHub.invalidatePattern('users:page-*'); // WON'T WORK!
```

#### ✅ CORRECT - Include namespace:
```typescript
// Cache key: "default:users:page-0-15-active"
this.cacheHub.invalidatePattern('default:users:page-*'); // WORKS!
```

#### Best Practices:
1. **Always log cache keys during development** to see the actual format
2. **Include namespace in invalidation patterns**: `default:resource:*` not `resource:*`
3. **Use consistent naming**: `resource:page-{page}-{size}-{filters}`
4. **Test cache invalidation** after CRUD operations to ensure data refresh

#### Example Service Pattern:
```typescript
createUser(user: CreateUserRequest): Observable<User> {
  return this.http.post<User>('/api/users', user).pipe(
    tap(() => {
      // Include namespace in pattern!
      this.cacheHub.invalidatePattern('default:users:page-*');
    })
  );
}
```

### Generic Table Usage
Most list views use `GenericTableComponent`:
- Configured via `tableConfig` object
- Supports server-side pagination and filtering
- Column definitions include type, sorting, filtering options

## Common Development Patterns

### Adding a New Feature Module
1. Create module in `src/app/views/{feature-name}/`
2. Add routing configuration with lazy loading
3. Create corresponding data service in module
4. Use generic components where applicable

### Working with Forms
- Use `FormGeneratorComponent` for dynamic forms
- Form schemas defined as JSON objects
- Validation rules included in schema
- **HTTP Dependencies**: Fields can depend on API responses (see README.md for examples)
- **FormArray Support**: Dynamic form arrays with nested field dependencies

### API Service Pattern
Services typically follow this pattern:
```typescript
getItems(params?: any): Observable<any> {
  return this.http.get('/api/v1/resource', { params });
}
```

### Permission Checks
Use `AuthService` for permission checks:
```typescript
if (this.authService.hasPermission('PERMISSION_NAME')) {
  // Show/enable feature
}
```

## SCSS Architecture Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

### CRITICAL: Never Duplicate SCSS Styles
**ALWAYS reuse existing mixins and utilities instead of duplicating code.**
**See complete architecture rules in `.context/SCSS_ARCHITECTURE.md`**

#### Quick Reference - Dashboard Components
Use mixins from `src/scss/_mixins.scss`:
- `@include dashboard-card-header()` - Consistent card headers (1.25rem title, proper spacing)
- `@include dashboard-chart-container($height)` - Chart containers with proper sizing
- `@include dashboard-kpi-grid($columns)` - Responsive KPI card grids
- `@include dashboard-chart-legend()` - Chart legends with colored dots
- `@include dashboard-demographics-row()` - Two-column responsive layout
- `@include dashboard-metric-summary()` - Metric displays (retention, churn rates)
- `@include dashboard-reason-bars()` - Horizontal bar charts for analysis
- `@include dashboard-dark-theme()` - Consistent dark theme support

#### Chart Components
- `@include chart-complete($component-name, $icon)` - Full chart styling
- Never duplicate canvas overflow fixes - use existing mixins

#### SCSS Import Rules
**CRITICAL: Always use @use instead of @import**

```scss
// ✅ CORRECT - Modern @use syntax
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;
@use "../../../../scss/utilities" as utils;

// Usage with namespace
.my-component {
  @include mixins.interactive-states();
  color: var(--os-color-primary);
}
```

```scss
// ❌ WRONG - Legacy @import syntax (deprecated)
@import "../../../../scss/variables";
@import "../../../../scss/mixins";
@import "../../../../scss/utilities";
```

#### Import Order in Components
```scss
@use "../../../../scss/variables" as vars;  // Always first
@use "../../../../scss/mixins" as mixins;   // Always second
@use "../../../../scss/utilities" as utils; // Only if using utility maps
```

#### SCSS Color System (`$os-colors`)
A centralized color system is available in `src/scss/_variables.scss` for consistent theming across all components:

```scss
// Usage in any component:
@use "../../../../scss/variables" as vars;

:host {
  // Generate all color variants automatically
  @include vars.generate-os-colors('my-component');

  // This creates:
  // .my-component--primary, .my-component--blue, etc. (solid)
  // .my-component--outline.my-component--primary (outline)
  // .my-component--subtle.my-component--primary (subtle)
}
```

**Available for**: badges, buttons, alerts, notifications, cards, and any component that needs color variants.

**Benefits**:
- Single source of truth for colors
- Automatic generation of solid, outline, and subtle variants
- Full CSS variable support for theming
- Easy to add new colors globally

#### Component Styling Best Practices
- **Reusability First**: Always check for existing mixins and utilities before creating new classes
- **Namespace Usage**: Use `vars.`, `mixins.`, `utils.` prefixes with @use imports
- **No Duplication**: Reference existing dashboard and component mixins

**Before writing new styles, check if existing mixins can be used or extended.**

## CoreUI Icons Integration

### 🎨 ICON STRATEGY: Prefer Custom Icons
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-24 (Added CRITICAL inline SVG rule)

**ALWAYS prefer custom SVG icons over CoreUI icons when possible:**

1. **Custom Icons First** - Create or use existing icons from `src/assets/icons/`
2. **Gradual Migration** - When adding new icons, use custom SVGs instead of CoreUI
3. **Benefits**: Better performance, consistent design, no external dependency

#### Custom Icon Usage:
```typescript
// FAB Configuration with custom icon
{
  id: 'home',
  label: 'Главная',
  icon: '/assets/icons/home.svg',  // ✅ Custom SVG
  action: 'route',
  target: '/home'
}

// Icon Service with custom URL
iconService.getIcon('/assets/icons/home.svg')
```

#### ⚠️ CRITICAL: NEVER Use Inline SVG in HTML

**ALWAYS use the `app-icon` component instead of inline SVG elements!**

**❌ WRONG - Inline SVG:**
```html
<svg viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="80"/>
  <!-- ... more SVG code -->
</svg>
```

**✅ CORRECT - app-icon component:**
```html
<!-- 1. Create SVG file in /src/assets/icons/my-icon.svg -->
<!-- 2. Use app-icon component -->
<div class="icon-container">
  <app-icon [icon]="'my-icon'"></app-icon>
</div>
```

**Process for adding new SVG icons:**
1. Check if similar icon already exists in `/src/assets/icons/`
2. If not, create new `.svg` file with descriptive name
3. Use `app-icon` component with the filename (without extension)
4. NEVER paste SVG code directly in HTML templates

**Why?**
- ✅ Icon reusability across the app
- ✅ Centralized icon management
- ✅ Built-in caching via IconService
- ✅ Consistent sizing and styling
- ✅ Smaller bundle size

#### Available Custom Icons:
- `home.svg` - Home/dashboard navigation
- `chat.svg` - Chat/messaging features
- `chat-search.svg` - Chat search state illustration
- `chat-empty.svg` - Chat empty state illustration
- `chat-placeholder.svg` - Chat thread selection placeholder
- `plus.svg` - Add/create actions
- `settings.svg` - Configuration/settings
- `history.svg` - Historical data/logs
- `default.svg` - Fallback icon

**Create new custom icons**: Add SVG files to `src/assets/icons/` with descriptive names.

### CRITICAL: How to Properly Use CoreUI Icons (Legacy)

**NEVER use CSS classes like `<i class="icon cil-name">` - this will NOT work!**

#### Correct Icon Implementation:

1. **Use SVG with CoreUI directive**:
   ```html
   <svg cIcon [name]="iconName" width="24" height="24"></svg>
   ```

2. **Required imports in component**:
   ```typescript
   import { IconDirective, IconModule } from '@coreui/icons-angular';

   @Component({
     imports: [IconDirective, IconModule, ...]
   })
   ```

3. **CSS styling for SVG icons**:
   ```scss
   svg {
     width: 1.5rem;
     height: 1.5rem;
     fill: white; // Use 'fill' not 'color' for SVG
   }
   ```

4. **Icon availability**:
   - All icons must be added to `src/app/icons/icon-subset.ts`
   - Import icon from `@coreui/icons`
   - Add to both import list and iconSubset object
   - Icons are loaded globally via IconSetService in app.component.ts

#### Available Icons Pattern:
- Use `cil-` prefix: `cil-location-pin`, `cil-data-transfer-down`
- Check `icon-subset.ts` for available icons before using
- Add new icons to subset if needed

#### Example Usage:
```html
<!-- Correct -->
<svg cIcon name="cil-location-pin" width="20" height="20"></svg>

<!-- Incorrect - will not display -->
<i class="icon cil-location-pin"></i>
```

## Known Issues & Limitations

1. No environment configuration files - API URLs hardcoded
2. Permissions hardcoded in AuthService instead of backend-driven
3. No linting configuration - relies on Angular CLI defaults
4. Limited test coverage - most spec files only check component creation
5. No centralized error handling beyond HTTP interceptor

## Docker & Deployment

The application includes a multi-stage Dockerfile:
- Build stage: Node 16 Alpine with Angular CLI
- Runtime stage: Nginx Alpine
- Nginx configuration in `default.conf`

Production build command: `npm run build-prod`

## UI/UX Design Guidelines

### Visual Design Approach
When creating new UI components, follow **Tailwind CSS design principles**:

1. **Typography & Sizing**:
   - Use Tailwind's font sizes: `text-xs` (0.75rem), `text-sm` (0.875rem), `text-base` (1rem)
   - Consistent spacing with padding: `2px 8px`, `4px 12px`, `6px 16px`
   - Heights: 20px, 24px, 32px for small, medium, large variants

2. **Colors**:
   - **Always use project CSS variables**: `var(--os-color-primary)`, `var(--os-color-success)`, etc.
   - Follow Tailwind color palette principles but use existing project variables

   **Semantic colors:**
   - Primary: `var(--os-color-primary)` (matches project branding)
   - Secondary: `var(--os-color-secondary)` (blue accent)
   - Success: `var(--os-color-success)`
   - Danger: `var(--os-color-danger)`
   - Warning: `var(--os-color-warning)`
   - Info: `var(--os-color-info)` (cyan-500: #06b6d4)
   - Medium: `var(--os-color-medium)` (gray tones)
   - Light: `var(--os-color-light)` with `var(--os-color-dark)` text
   - Dark: `var(--os-color-dark)`

   **Tailwind context colors** (available for badges and other components):
   - Each color includes: base (`--os-color-{name}`), shade (`--os-color-{name}-shade`), and RGB (`--os-color-{name}-rgb`)
   - `var(--os-color-red)` (#ef4444), `var(--os-color-orange)` (#f97316), `var(--os-color-amber)` (#f59e0b)
   - `var(--os-color-yellow)` (#eab308), `var(--os-color-lime)` (#84cc16), `var(--os-color-green)` (#22c55e)
   - `var(--os-color-emerald)` (#10b981), `var(--os-color-teal)` (#14b8a6), `var(--os-color-cyan)` (#06b6d4)
   - `var(--os-color-sky)` (#0ea5e9), `var(--os-color-blue)` (#3b82f6), `var(--os-color-indigo)` (#6366f1)
   - `var(--os-color-violet)` (#8b5cf6), `var(--os-color-purple)` (#a855f7), `var(--os-color-fuchsia)` (#d946ef)
   - `var(--os-color-pink)` (#ec4899), `var(--os-color-rose)` (#f43f5e), `var(--os-color-zinc)` (#71717a)
   - **No hardcoded colors**: All values use CSS variables for consistency and theming support

3. **Border Radius**:
   - Small: `2px` (rounded-sm)
   - Medium: `6px` (rounded-md)
   - Full: `9999px` (rounded-full)

4. **Text Contrast & Accessibility**:
   - **Smart text color selection**: Automatically chooses light or dark text based on background brightness
   - Light backgrounds (yellow, amber, lime, light) use dark text with color-specific optimizations
   - Dark/saturated backgrounds use white text with subtle shadows for readability
   - Text shadows: `0 1px 2px rgba(0,0,0,0.1)` for light text, `0 1px 2px rgba(255,255,255,0.1)` for dark text

5. **Animations**:
   - Quick transitions: `0.15s ease-in-out`
   - Subtle hover effects: opacity changes, minimal transforms
   - Focus states with subtle shadows: `0 0 0 3px rgba(59, 130, 246, 0.1)`

6. **Variant Options**:
   - **Default**: Solid background with smart text contrast
   - **Outline**: Transparent background with colored border and text
   - **Subtle**: Tailwind-style with 10% opacity background and darker color text (e.g., `bg-blue-500/10 text-blue-600`)

7. **Component Structure**:
   - Clean, minimal design without unnecessary borders
   - Consistent spacing and typography
   - Proper focus and accessibility states
   - Responsive design considerations

**Important**: All new components should follow this Tailwind-inspired design system for visual consistency across the application.

## Global Color System

> **SCSS Color Implementation:** See [SCSS Architecture section](#scss-architecture-rules) for complete color system usage and patterns.

## TypeScript Interface & Model Organization Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

### MANDATORY: Interface Location Rules
**ALL TypeScript interfaces and types MUST be defined in dedicated model files, NEVER in components.**

#### Component Interface Rules
1. **NEVER create interfaces inside component files** (`.component.ts`)
2. **ALWAYS create interfaces in corresponding model files** in `models/` directory
3. **Component-specific interfaces** → Create `{component-name}.model.ts`
4. **Shared interfaces** → Place in existing model files or `common.model.ts`

#### Model File Structure
```typescript
// Example: src/app/views/feature/models/overview.model.ts
export interface OverviewStats {
  // interface definition
}

export interface QuickAction {
  // interface definition
}
```

#### Import Pattern
```typescript
// Component file - CORRECT
import { OverviewStats, QuickAction } from '../../models';

// Component file - WRONG (interfaces defined here)
interface OverviewStats { ... } // ❌ NEVER DO THIS
```

#### Benefits of This Pattern
- **Reusability**: Models can be imported by multiple components/services
- **Type Safety**: Centralized type definitions prevent inconsistencies
- **Maintainability**: Single source of truth for data structures
- **Testing**: Models can be tested independently
- **API Contracts**: Clear separation between data models and view logic

#### Model Export Pattern
Always export new models through `models/index.ts`:
```typescript
export * from './overview.model';
```

**This rule applies to ALL components across the entire application.**

---

## 🚨 FINAL REMINDER: ABSOLUTE PATHS ONLY! 🚨

**Refer to the File Path Rules section above for complete guidelines.**

**ROOT**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`