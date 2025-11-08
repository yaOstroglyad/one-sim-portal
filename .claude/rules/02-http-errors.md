# HTTP Error Handling Rules

> **Created:** 2025-11-01 | **Last Updated:** 2025-11-15
> **Context Tags:** `@http` `@extending` `@fixing-bug` `@creating-new`
> **Read when:** Working with HTTP calls, fixing HTTP errors, or adding API endpoints

## 🎯 Overview

All HTTP error handling MUST use the unified utilities from `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/http/http-error.utils.ts`.

This file consolidates all error handling, response wrapping, and configuration in a single location.

---

## 🚨 Critical Rules

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

---

## 📦 Available Utilities

### 1. Standard Error Handlers

#### `handleArrayError<T>(errorContext: string): Observable<T[]>`

**Use for:** API endpoints that return arrays

**Returns:** Empty array `[]` on error

**Type parameter:** Entity type in the array

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

---

#### `handleObjectError<T>(errorContext: string): Observable<T | null>`

**Use for:** API endpoints that return single objects

**Returns:** `null` on error

**Type parameter:** Expected object type

**Important:** Return type must include `| null`

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

---

#### `handleWithDefault<T>(errorContext: string, defaultValue: T): Observable<T>`

**Use for:** Custom fallback values (e.g., paginated responses, complex objects)

**Returns:** Provided default value on error

**Type parameter:** Type of default value

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

---

#### `handleEmptyObjectError(errorContext: string): Observable<{}>`

**Use for:** Endpoints where you need an empty object fallback

**Returns:** Empty object `{}` on error

**Rare use case:** Prefer `handleWithDefault` for most scenarios

```typescript
// ✅ Correct usage
getOptionalMetadata(): Observable<{}> {
  return this.http.get('/api/v1/metadata').pipe(
    catchError(handleEmptyObjectError('fetching metadata'))
  );
}
```

---

### 2. Error Transformation

#### `transformHttpError(error: HttpErrorResponse): ApiError`

**Use for:** Generic HTTP errors in data services

**Returns:** Standardized ApiError object

**Handles:** Network errors, server errors, client errors

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

---

#### `transformAuthError(error: HttpErrorResponse): ApiError`

**Use for:** OAuth/authentication errors ONLY

**Returns:** ApiError with parsed OAuth error_description

**Special handling:** Parses JSON error responses with `error_description` field

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

---

### 3. Response Wrapping (Advanced)

#### `wrapResponse<T>(observable: Observable<T>): Observable<ApiResponse<T>>`

**Use for:** Components that need loading/error states

**Returns:** Observable of ApiResponse with status tracking

**States:** 'loading' → 'success' | 'error'

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

---

#### `createErrorResponse(error: any): ApiResponse<null>`

**Use for:** Manual error response creation

**Returns:** ApiResponse with 'error' status

---

## 📋 Decision Tree: Which Handler to Use?

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

---

## 🎓 Complete Examples

### Data Service (Most Common Pattern)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Customer, Pagination } from '../model';
import { handleArrayError, handleObjectError, handleWithDefault } from '../utils';

@Injectable({ providedIn: 'root' })
export class CustomersDataService {
  private readonly http = inject(HttpClient);

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

### Component with Subscription

```typescript
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CustomersDataService } from '../services/customers-data.service';
import { Customer } from '../model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomersDataService);

  customers: Customer[] = [];
  loading = false;

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

### Login/Auth Service (OAuth Errors)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transformAuthError } from '../utils';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

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

### HTTP Interceptor (Advanced)

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

---

## 🔍 Import Patterns

**✅ Correct imports:**

```typescript
// From data service (2 levels deep: services/foo.service.ts → utils/)
import { handleArrayError, handleObjectError, transformHttpError } from '../utils';

// From component (4 levels deep: views/customers/list/list.component.ts → shared/utils/)
import { handleArrayError, wrapResponse } from '../../../shared/utils';

// Never import individual files
import { handleArrayError } from '../../../shared/utils/http/http-error.utils';  // ❌ Wrong
```

---

## 📝 Error Context Best Practices

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

---

## 🔄 forkJoin Pattern (CRITICAL)

**When combining multiple HTTP requests with `forkJoin`, follow this pattern:**

### ✅ CORRECT Pattern:

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

### ❌ WRONG Pattern:

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

### Why this matters:

1. `createErrorResponse()` needs the original `HttpErrorResponse` to parse backend error format (`{code: 400, message: "..."}`)
2. When you add `catchError` inside forkJoin observables and re-throw, the error becomes a transformed object
3. When `forkJoin` fails and calls the outer `catchError(createErrorResponse)`, it receives the already-transformed error
4. `transformHttpError()` cannot parse the transformed error → returns `UNKNOWN_ERROR` instead of actual backend message

**Result:**
- ❌ Without pattern: Shows "Unexpected error occurred" with code "UNKNOWN_ERROR"
- ✅ With pattern: Shows "Account ID must be provided by admin users" with code "400"

---

## 🎯 Migration Checklist

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

---

## 📚 Related Files

- **Utilities:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/http/http-error.utils.ts`
- **Barrel Export:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/index.ts`
- **Example Services:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/`
- **Auth Service:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/pages/login/login.service.ts`
- **Similar Features:** [.claude/context/similar-features.md](../context/similar-features.md#data-services) (when created)

---

**Last Updated:** 2025-11-15
**Priority:** 🔴 Critical - HTTP operations fail without proper error handling
