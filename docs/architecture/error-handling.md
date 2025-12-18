# Error Handling Architecture

> **Version:** 1.0
> **Last Updated:** 2025-01-XX
> **Status:** Reference Architecture

---

## Overview

This document defines the standard error handling architecture for Angular applications. All new features MUST follow these patterns. Existing code should be refactored to comply.

---

## Error Handling Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: HTTP Interceptor                    │
│         Global handling of all HTTP requests                    │
│    401, 403, 500, timeout, network errors, token refresh        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 2: Service Layer                       │
│         Business logic, data transformation                     │
│    Domain-specific errors, retry logic, fallbacks               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 3: Component Layer                     │
│         UI-specific handling                                    │
│    User notifications, UX decisions, context-aware messages     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 4: Global ErrorHandler                 │
│         Last line of defense (fallback)                         │
│    Unhandled errors, logging, crash reporting                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: HTTP Interceptor

### Responsibilities

The HTTP Interceptor handles **infrastructure-level** errors that require **automatic system response** without user/component involvement.

### Automatic Actions (User Does NOT See)

| HTTP Status | Action | Show Notification? |
|-------------|--------|-------------------|
| **401 Unauthorized** | Clear token, redirect → `/login` | No |
| **403 Forbidden** | Redirect → `/403` or `/no-permissions` | No |
| **503 Service Unavailable** | Retry 2-3 times with exponential delay | No (if retry succeeds) |
| **0 (Network Error)** | Show "No connection" | Yes |
| **408/504 Timeout** | Retry 1-2 times | No (if retry succeeds) |

### Pass Through (Component Handles)

| HTTP Status | Reason |
|-------------|--------|
| **400 Bad Request** | Business error, component knows context |
| **404 Not Found** | Depends on context (resource vs page) |
| **409 Conflict** | Business logic (e.g., duplicate entry) |
| **422 Validation Error** | Form should display field-level errors |
| **500 Internal Error** | Pass through, component may show generic message |

### Implementation Pattern

```typescript
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      // Retry for network errors and 5xx
      retry({
        count: 2,
        delay: (error, retryCount) => {
          if (this.shouldRetry(error)) {
            return timer(1000 * retryCount);
          }
          return throwError(() => error);
        }
      }),

      catchError((error: HttpErrorResponse) => {
        // 401: Session expired → Login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return EMPTY;
        }

        // 403: No permissions
        if (error.status === 403) {
          this.router.navigate(['/403']);
          return EMPTY;
        }

        // Network error: show notification
        if (error.status === 0) {
          this.notification.error('errors.networkError');
          return EMPTY;
        }

        // Everything else: pass to service/component layer
        return throwError(() => this.transformError(error));
      })
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    return error.status === 0 ||
           error.status === 503 ||
           error.status === 504;
  }

  private transformError(error: HttpErrorResponse): ApiError {
    return {
      code: String(error.status),
      message: error.error?.message || this.getDefaultMessage(error.status),
      details: error.error,
      timestamp: new Date()
    };
  }
}
```

---

## Layer 2: Service Layer

### Responsibilities

Services handle **business logic** and **data transformation**. They should NOT display notifications.

### Rules

1. **DO NOT** show UI notifications in services
2. **DO NOT** swallow errors silently (unless explicitly intended)
3. **DO** transform errors to domain-specific types
4. **DO** implement retry logic for critical operations
5. **DO** use silent fallbacks only for non-critical data

### Implementation Patterns

```typescript
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  // ✅ CORRECT: Pass error to component
  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`/api/customers/${id}`).pipe(
      map(response => this.transformCustomer(response))
      // NO catchError — error goes to component
    );
  }

  // ✅ CORRECT: Silent fallback for non-critical data
  getCustomerStats(id: string): Observable<Stats | null> {
    return this.http.get<Stats>(`/api/customers/${id}/stats`).pipe(
      catchError(() => of(null)) // Stats are not critical
    );
  }

  // ✅ CORRECT: Retry for important operations
  saveCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>('/api/customers', customer).pipe(
      retry({ count: 1, delay: 1000 })
      // Error after retry goes to component
    );
  }

  // ❌ WRONG: Service shows notification
  getCustomerBad(id: string): Observable<Customer | null> {
    return this.http.get<Customer>(`/api/customers/${id}`).pipe(
      catchError(err => {
        this.notification.error('Error!'); // NO! Component's responsibility
        return of(null);
      })
    );
  }
}
```

---

## Layer 3: Component Layer

### Responsibilities

Components make **UI decisions** about how to present errors to users.

### Rules

1. **DO** handle errors in `subscribe({ error: ... })`
2. **DO** show context-aware messages
3. **DO** decide on recovery actions (retry, redirect, etc.)
4. **DO** use `NotificationService` for user notifications
5. **DO** use i18n keys for all messages

### Implementation Pattern

```typescript
@Component({...})
export class CustomerDetailsComponent {
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);

  readonly loading = signal(false);
  readonly customer = signal<Customer | null>(null);

  loadCustomer(id: string): void {
    this.loading.set(true);

    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.loading.set(false);

        // 404: Resource not found — redirect with message
        if (error.code === '404') {
          this.notification.error('customer.notFound');
          this.router.navigate(['/customers']);
          return;
        }

        // 422: Validation error — show details
        if (error.code === '422') {
          this.handleValidationErrors(error.details);
          return;
        }

        // Everything else: generic message
        this.notification.error('customer.loadError');
      }
    });
  }

  saveCustomer(): void {
    this.loading.set(true);

    this.customerService.saveCustomer(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('customer.saved');
        this.router.navigate(['/customers']);
      },
      error: (error: ApiError) => {
        this.loading.set(false);

        // 409: Conflict — specific message
        if (error.code === '409') {
          this.notification.error('customer.alreadyExists');
          return;
        }

        this.notification.error('customer.saveError');
      }
    });
  }
}
```

---

## Layer 4: Global ErrorHandler

### Responsibilities

The Global ErrorHandler is the **last line of defense** for unhandled errors.

### Handles

- Unhandled JavaScript exceptions (bugs)
- Chunk loading errors (lazy modules)
- Promise rejections without catch
- Any error that escaped previous layers

### Implementation Pattern

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notification = inject(NotificationService);
  private readonly loggingService = inject(ErrorLoggingService);
  private readonly zone = inject(NgZone);

  handleError(error: any): void {
    // Log ALL errors
    console.error('Unhandled error:', error);
    this.loggingService.logError(error);

    // Show generic notification
    const message = this.extractMessage(error);

    this.zone.run(() => {
      this.notification.error(message);
    });
  }

  private extractMessage(error: any): string {
    // Chunk loading error (lazy modules)
    if (error.message?.includes('Loading chunk')) {
      return 'errors.appUpdateRequired';
    }

    // HTTP error (unhandled)
    if (error instanceof HttpErrorResponse) {
      return 'errors.unexpectedError';
    }

    // Generic
    return 'errors.somethingWentWrong';
  }
}
```

---

## NotificationService

### Purpose

Centralized service for displaying user notifications with i18n support.

### Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  success(messageKey: string, params?: Record<string, any>): void {
    const message = this.translate.instant(messageKey, params);
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-success',
      duration: 3000
    });
  }

  error(messageKey: string, params?: Record<string, any>): void {
    const message = this.translate.instant(messageKey, params);
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-error',
      duration: 5000
    });
  }

  warning(messageKey: string, params?: Record<string, any>): void {
    const message = this.translate.instant(messageKey, params);
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-warning',
      duration: 4000
    });
  }

  info(messageKey: string, params?: Record<string, any>): void {
    const message = this.translate.instant(messageKey, params);
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-info',
      duration: 3000
    });
  }
}
```

---

## Decision Matrix

| Error Type | Handler Layer | Show to User? | Action |
|------------|---------------|---------------|--------|
| **401 Unauthorized** | Interceptor | No | Redirect → Login |
| **403 Forbidden** | Interceptor | No | Redirect → 403 page |
| **404 Page** | Router Guard | No | Redirect → 404 page |
| **404 Resource** | Component | Yes | Context message + redirect |
| **400 Validation** | Component | Yes | Show field errors |
| **409 Conflict** | Component | Yes | Context message |
| **500 Server Error** | Interceptor + Component | Yes | "Try again later" |
| **Network Error** | Interceptor | Yes | "No connection" |
| **JS Runtime Error** | GlobalErrorHandler | Yes (generic) | Log + "Something went wrong" |
| **Chunk Load Error** | GlobalErrorHandler | Yes | "Please refresh" |

---

## Anti-Patterns (DO NOT)

```typescript
// ❌ Swallow errors without notification
catchError(() => of([]))

// ❌ Show notification in service
this.snackBar.open('Error') // in service layer

// ❌ Handle 401 in every component
if (error.status === 401) this.router.navigate(['/login'])

// ❌ Hardcode messages
this.snackBar.open('Ошибка загрузки данных')

// ❌ Ignore form submission errors
this.form.submit().subscribe({ next: ... }) // no error handler

// ❌ Show technical details to user
this.snackBar.open(error.stack)

// ❌ Use different notification services
this.matSnackBar.open() // use NotificationService instead
```

---

## File Structure

```
shared/
├── interceptors/
│   └── http-error.interceptor.ts    # Layer 1
├── services/
│   ├── notification.service.ts      # Centralized notifications
│   └── error-logging.service.ts     # Sentry/LogRocket
├── handlers/
│   └── global-error.handler.ts      # Layer 4
├── models/
│   └── error.model.ts               # ApiError interface
└── utils/
    └── error.utils.ts               # Transformation helpers
```

---

## See Also

- [Constitution](/.specify/memory/constitution.md) — Project rules including error handling
- [Error Handling Refactoring Spec](../specs/016-error-handling/spec.md) — Migration plan
