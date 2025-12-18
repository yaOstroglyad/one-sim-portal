# Implementation Plan: Error Handling Architecture Refactoring

**Feature Branch**: `016-error-handling`
**Spec Reference**: [spec.md](./spec.md)
**Architecture Reference**: [docs/architecture/error-handling.md](../../docs/architecture/error-handling.md)
**Created**: 2025-12-18
**Status**: Ready for Implementation

---

## Technical Context

### Current Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CURRENT STATE (BROKEN)                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  HTTP Error → CustomHttpInterceptor → Service.pipe(handleArrayError())   │
│                      ↓                              ↓                    │
│              401 → login redirect            Returns [] or null          │
│              (no other handling)              (USER SEES NOTHING!)       │
│                                                      ↓                   │
│                                              console.error only          │
│                                                                          │
│  Direct MatSnackBar usage: 21+ components (inconsistent)                 │
│  SnackbarService: exists but barely used                                 │
│  GlobalErrorHandler: works but rarely receives errors                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Target Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       TARGET STATE (4-LAYER)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LAYER 1: HttpErrorInterceptor (NEW)                                     │
│  ├── 401 → /login?returnUrl=... (track consecutive, graceful degrade)    │
│  ├── 403 → /403 page                                                     │
│  ├── 503/504 → retry 2-3x (GET only)                                     │
│  ├── 0 (network) → notification + retry                                  │
│  └── 400/404/409/422/500 → pass through as ApiError                      │
│                              ↓                                           │
│  LAYER 2: Service Layer                                                  │
│  ├── NO notifications (component responsibility)                         │
│  ├── NO silent swallowing (except non-critical data)                     │
│  └── Errors propagate to component                                       │
│                              ↓                                           │
│  LAYER 3: Component Layer                                                │
│  ├── Handle errors in subscribe({ error: ... })                          │
│  ├── Use NotificationService with i18n keys                              │
│  └── Context-aware messages                                              │
│                              ↓                                           │
│  LAYER 4: GlobalErrorHandler (ENHANCED)                                  │
│  ├── Catch unhandled exceptions                                          │
│  ├── Log with full context                                               │
│  └── Show generic notification via NotificationService                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@angular/core` | 21.0.5 | ErrorHandler, HttpInterceptor |
| `@angular/common/http` | 21.0.5 | HttpClient, HttpErrorResponse |
| `@angular/material/snack-bar` | existing | MatSnackBar (used by NotificationService) |
| `@ngx-translate/core` | existing | TranslateService for i18n |
| `rxjs` | existing | retry, catchError, timer |

### Existing Files Analysis

| File | Lines | Current State | Action |
|------|-------|---------------|--------|
| `shared/auth/httpInspector.service.ts` | 45 | Basic 401 handling only | DELETE (replace with new interceptor) |
| `shared/services/ui/snackbar.service.ts` | 15 | Wrapper barely used | DELETE (replace with NotificationService) |
| `shared/utils/http/http-error.utils.ts` | 348 | Contains swallowing handlers | REWRITE (keep transformHttpError, ApiError) |
| `shared/auth/error-handler.service.ts` | 39 | Uses MatSnackBar directly | REWRITE (use NotificationService) |

### Migration Scope

| Category | Count | Files |
|----------|-------|-------|
| Direct MatSnackBar usage | 21 | Components in views/*, shared/* |
| handleArrayError/handleObjectError usage | 20 | Services in shared/services/data/*, views/*/services/* |
| SnackbarService imports | ~5 | Various components |
| httpInspector imports | 1 | main.ts |

---

## Constitution Compliance Check

| Rule | Status | Notes |
|------|--------|-------|
| Absolute paths only | ✅ | All paths in this document are relative to project root |
| Standalone components | ✅ | No new components created |
| OnPush change detection | ✅ | N/A for services |
| inject() for DI | ✅ | All new services use inject() |
| Signal APIs | ✅ | N/A for this feature |
| @if/@for control flow | ✅ | N/A for this feature |
| os- selector prefix | ✅ | N/A for services |
| Error handling 4-layer | ✅ | This IS the implementation of 4-layer |
| NotificationService mandatory | ✅ | This creates NotificationService |
| i18n keys for messages | ✅ | All messages use translation keys |
| SCSS @use syntax | ✅ | Notification styles use @use |
| CSS variables for colors | ✅ | Notification classes use CSS vars |
| English documentation | ✅ | All documentation in English |
| Search before creating | ✅ | Verified no existing NotificationService |

---

## File Structure

### New Files

```
src/app/
├── shared/
│   ├── interceptors/
│   │   └── http-error.interceptor.ts      # Layer 1: New HTTP interceptor
│   ├── services/
│   │   └── ui/
│   │       └── notification.service.ts    # Centralized notifications with i18n
│   └── models/
│       └── core/
│           └── error.model.ts             # ApiError, NotificationType, RetryConfig
│
├── scss/
│   └── components/
│       └── _notifications.scss            # Notification panel styles
│
└── assets/
    └── i18n/
        ├── en.json  → + errors.* keys
        ├── ru.json  → + errors.* keys
        ├── he.json  → + errors.* keys
        └── uk.json  → + errors.* keys
```

### Files to Delete

```
src/app/shared/auth/httpInspector.service.ts  # Replaced by http-error.interceptor.ts
src/app/shared/services/ui/snackbar.service.ts  # Replaced by notification.service.ts
```

### Files to Modify

```
src/main.ts                                    # Register new interceptor, remove old
src/app/shared/auth/error-handler.service.ts   # Use NotificationService
src/app/shared/utils/http/http-error.utils.ts  # Remove handleArrayError/handleObjectError
src/app/shared/utils/http/index.ts             # Update exports
src/app/shared/auth/index.ts                   # Remove httpInspector export
src/app/shared/services/ui/index.ts            # Remove snackbar export, add notification

# Components (21 files) - Replace MatSnackBar with NotificationService
# Services (20 files) - Remove handleArrayError/handleObjectError, let errors propagate
```

---

## Implementation Phases

### Phase 0: Foundation (No Breaking Changes)

Create new infrastructure without modifying existing code.

| Task | Files | Dependencies |
|------|-------|--------------|
| Create error.model.ts | shared/models/core/error.model.ts | None |
| Create NotificationService | shared/services/ui/notification.service.ts | error.model.ts |
| Create notification styles | scss/components/_notifications.scss | None |
| Add i18n error keys | assets/i18n/*.json | None |

**Deliverables:**
- `error.model.ts` with ApiError, NotificationType interfaces
- `NotificationService` with success(), error(), warning(), info() methods
- Notification SCSS styles
- Error translation keys in all 4 languages

### Phase 1: New Interceptor (Parallel Operation)

Create new interceptor that runs alongside old one.

| Task | Files | Dependencies |
|------|-------|--------------|
| Create HttpErrorInterceptor | shared/interceptors/http-error.interceptor.ts | Phase 0 |
| Implement 401 with returnUrl tracking | http-error.interceptor.ts | AuthService |
| Implement 403 redirect | http-error.interceptor.ts | Router |
| Implement retry logic (GET only) | http-error.interceptor.ts | RxJS retry |
| Implement network error handling | http-error.interceptor.ts | NotificationService |
| Register in main.ts (after old) | main.ts | http-error.interceptor.ts |

**Deliverables:**
- `HttpErrorInterceptor` with full 4-layer compliance
- Both interceptors running (new one handles more cases)
- Tests for interceptor logic

### Phase 2: GlobalErrorHandler Upgrade

Update GlobalErrorHandler to use NotificationService.

| Task | Files | Dependencies |
|------|-------|--------------|
| Update GlobalErrorHandler | shared/auth/error-handler.service.ts | NotificationService |
| Add chunk load error handling | error-handler.service.ts | None |
| Add error logging | error-handler.service.ts | Console (Sentry later) |

**Deliverables:**
- `GlobalErrorHandlerService` using NotificationService
- Chunk loading error detection
- Improved error logging

### Phase 3: Service Layer Cleanup

Remove error swallowing from services, let errors propagate.

| Task | Files | Dependencies |
|------|-------|--------------|
| Update customers-data.service | shared/services/data/customers-data.service.ts | Phase 1 |
| Update companies-data.service | shared/services/data/companies-data.service.ts | Phase 1 |
| Update products-data.service | shared/services/data/products-data.service.ts | Phase 1 |
| Update orders-data.service | shared/services/data/orders-data.service.ts | Phase 1 |
| Update subscriber-data.service | shared/services/data/subscriber-data.service.ts | Phase 1 |
| Update remaining data services | shared/services/data/*.ts | Phase 1 |
| Update view-specific services | views/*/services/*.ts | Phase 1 |

**Strategy:**
- Remove `handleArrayError`/`handleObjectError` calls
- Keep only silent fallbacks for documented non-critical data
- Services should NOT import NotificationService

**Deliverables:**
- All data services propagate errors to components
- No silent error swallowing (except documented exceptions)

### Phase 4: Component Layer Migration

Replace MatSnackBar with NotificationService in all components.

| Task | Files | Dependencies |
|------|-------|--------------|
| Migrate customers.component | views/customers/customers.component.ts | Phase 3 |
| Migrate companies.component | views/companies/companies.component.ts | Phase 3 |
| Migrate subscriber-details | views/customers/private-customer-details/subscriber-details/subscriber-details.component.ts | Phase 3 |
| Migrate add-subscriber | views/customers/private-customer-details/add-subscriber/add-subscriber.component.ts | Phase 3 |
| Migrate add-subscriber-product | views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.ts | Phase 3 |
| Migrate send-registration-email | views/customers/private-customer-details/send-registration-email/send-registration-email.component.ts | Phase 3 |
| Migrate refund-product | shared/components/refund-product/refund-product.component.ts | Phase 3 |
| Migrate settings components | views/settings/**/*.component.ts | Phase 3 |
| Migrate user-list | views/users/components/user-list/user-list.component.ts | Phase 3 |
| Migrate role-list | views/roles/components/role-list/role-list.component.ts | Phase 3 |
| Migrate login.service | views/pages/login/login.service.ts | Phase 3 |
| Migrate copy-to-clipboard | shared/directives/attribute/copy-to-clipboard/copy-to-clipboard.directive.ts | Phase 3 |
| Migrate remaining components | remaining files with MatSnackBar | Phase 3 |

**Strategy:**
- Replace `inject(MatSnackBar)` with `inject(NotificationService)`
- Replace hardcoded messages with i18n keys
- Add error handling in subscribe({ error: ... })

**Deliverables:**
- All components use NotificationService
- All messages use i18n keys
- Context-aware error handling in components

### Phase 5: Cleanup & Verification

Remove old code and verify migration.

| Task | Files | Dependencies |
|------|-------|--------------|
| Remove old interceptor | main.ts, shared/auth/httpInspector.service.ts | Phase 4 |
| Remove snackbar.service | shared/services/ui/snackbar.service.ts | Phase 4 |
| Remove handleArrayError/handleObjectError | shared/utils/http/http-error.utils.ts | Phase 4 |
| Update barrel exports | shared/*/index.ts | Phase 4 |
| Run verification checks | CLI commands | All phases |

**Verification Commands:**
```bash
# Must return 0 results (except NotificationService)
grep -r "MatSnackBar" src/app --include="*.ts" | grep -v notification.service

# Must return 0 results
grep -r "handleArrayError" src/app --include="*.ts"
grep -r "handleObjectError" src/app --include="*.ts"
grep -r "httpInspector" src/app --include="*.ts"
grep -r "snackbar.service" src/app --include="*.ts"
```

**Deliverables:**
- Old files deleted
- All verification commands pass
- Build succeeds
- No TypeScript errors

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Run both interceptors in parallel during migration |
| Missing error handlers in components | Medium | TypeScript will error if subscribe has no error handler |
| Missing translations | Low | Fallback to English key |
| Performance impact from retries | Low | Only retry GET, max 2-3 times |
| 401 loop on broken auth | High | Track consecutive 401s, graceful degradation |

---

## Testing Strategy

### Unit Tests
- NotificationService: verify i18n integration, styling
- HttpErrorInterceptor: verify status code handling, retry logic
- GlobalErrorHandler: verify error extraction, notification

### Integration Tests
- Simulate 401/403 responses, verify redirects
- Simulate network errors, verify retry and notification
- Simulate 500 errors, verify component handles

### E2E Tests
- Login flow with session expiration
- Form submission with validation errors
- Network offline/online toggle

---

## Rollback Plan

If issues arise:

1. **Phase 0-2 issues**: New code is additive, simply revert commits
2. **Phase 3-4 issues**: Old interceptor still works, errors are logged
3. **Phase 5 issues**: Restore deleted files from git history

Emergency rollback command:
```bash
git revert --no-commit HEAD~N..HEAD  # N = number of commits
# OR
git checkout release -- src/app/shared/auth/httpInspector.service.ts
git checkout release -- src/app/shared/services/ui/snackbar.service.ts
```

---

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| MatSnackBar direct usage | 0 (except NotificationService) | grep command |
| handleArrayError usage | 0 | grep command |
| handleObjectError usage | 0 | grep command |
| i18n coverage | 100% | No hardcoded strings in notifications |
| Build status | Success | ng build |
| TypeScript errors | 0 | ng build --aot |

---

## Appendix: i18n Keys Structure

```json
{
  "errors": {
    "network": "No internet connection. Please check your network.",
    "networkRetry": "Connection restored. Retrying...",
    "unauthorized": "Session expired. Please log in again.",
    "forbidden": "You don't have permission to access this resource.",
    "notFound": "The requested resource was not found.",
    "conflict": "This operation conflicts with existing data.",
    "validation": "Please check the form for errors.",
    "serverError": "Server error. Please try again later.",
    "unexpectedError": "An unexpected error occurred.",
    "appUpdateRequired": "Application updated. Please refresh the page.",
    "somethingWentWrong": "Something went wrong. Please try again.",
    "pageTemporarilyUnavailable": "Page temporarily unavailable. Please try again later."
  }
}
```

---

## Next Steps

1. Run `/speckit.tasks` to generate detailed task list
2. Create feature branch `016-error-handling`
3. Begin Phase 0 implementation
