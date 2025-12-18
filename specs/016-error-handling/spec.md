# Feature Specification: Error Handling Architecture Refactoring

**Feature Branch**: `016-error-handling`
**Created**: 2025-01-XX
**Status**: Draft
**Type**: Full Refactoring
**Architecture Reference**: [docs/architecture/error-handling.md](../../docs/architecture/error-handling.md)

---

## Clarifications

### Session 2025-12-18

- Q: What notification durations and dismiss behavior should be used? → A: Success: 3s, Error: 5s, Warning: 4s, Info: 3s — all manually dismissible
- Q: Should non-GET requests (POST/PUT/DELETE) be retried on 503/504? → A: No, retry only GET requests; non-GET fail immediately
- Q: How should return URL be handled after 401 redirect? → A: Store in query param `/login?returnUrl=...`
- Q: How to prevent infinite 401 redirect loop? → A: Track consecutive 401s for same returnUrl; on 2nd occurrence redirect to `/login` without returnUrl + show info "Page temporarily unavailable", user lands on home after login
- Q: Is this a full refactoring or partial? → A: FULL refactoring — all legacy error handling must be removed and replaced with new 4-layer architecture

---

## Current State Analysis

### Existing Components

| File | Purpose | Problems |
|------|---------|----------|
| `shared/utils/http/http-error.utils.ts` | Error handlers & transformation | Swallows errors silently, no UI notification |
| `shared/auth/httpInspector.service.ts` | HTTP Interceptor | Only handles 401, basic implementation |
| `shared/auth/error-handler.service.ts` | Global ErrorHandler | Never receives swallowed errors |
| `shared/services/ui/snackbar.service.ts` | Notification wrapper | Barely used, components use MatSnackBar directly |

### Current Error Flow (Broken)

```
HTTP Error → Interceptor → Service.pipe(handleArrayError()) → Component gets []
                                    ↓
                              console.error only
                              User sees NOTHING!
```

### Identified Issues

1. **Errors are swallowed**: `handleArrayError`/`handleObjectError` return fallback values and only log to console
2. **SnackbarService not used**: 30+ components inject MatSnackBar directly, duplicating code
3. **Inconsistent messages**: Some Russian, some English, some hardcoded, some i18n
4. **No standard notification types**: Different panelClass usage across codebase
5. **Unused code**: `ApiResponse`, `wrapResponse`, `createErrorResponse` in utils
6. **No retry logic**: Network errors fail immediately without retry
7. **Missing error boundaries**: 403, 404, 500 not handled consistently

---

## User Scenarios & Testing

### User Story 1 - Error Visibility (Priority: P1)

As a user, I want to see meaningful error messages when something goes wrong, so I understand what happened and what to do next.

**Why this priority**: Currently users see no feedback when errors occur due to silent error swallowing. This is the core problem to solve.

**Independent Test**: Can be tested by triggering any API error and verifying notification appears with appropriate message.

**Acceptance Scenarios**:

1. **Given** user is on any page, **When** an API request fails with 400/404/409/422/500 error, **Then** user sees a notification with a meaningful message in their language
2. **Given** user is on any page, **When** network connection is lost, **Then** user sees "No connection" notification
3. **Given** user submits a form, **When** validation fails on server, **Then** user sees specific field errors highlighted

---

### User Story 2 - Automatic Session Handling (Priority: P1)

As a user, I want the system to automatically handle session expiration and permission issues, so I don't encounter confusing errors.

**Why this priority**: Authentication errors should be handled transparently without user confusion.

**Independent Test**: Can be tested by simulating 401/403 responses and verifying automatic redirects.

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** session expires (401 response), **Then** user is automatically redirected to login page without error notification
2. **Given** user tries to access restricted resource, **When** server returns 403, **Then** user is redirected to "No Permissions" page
3. **Given** user was redirected to login, **When** user logs back in, **Then** user returns to the page they were trying to access
4. **Given** user just logged in and 401 occurs again for same page, **When** this is 2nd consecutive 401, **Then** user is redirected to `/login` without returnUrl, sees "Page temporarily unavailable" info, and lands on home after login

---

### User Story 3 - Automatic Retry for Transient Errors (Priority: P2)

As a user, I want the system to automatically retry failed requests due to temporary issues, so I don't need to manually refresh.

**Why this priority**: Improves user experience for transient network issues without user intervention.

**Independent Test**: Can be tested by simulating 503/504/network errors and verifying automatic retry with eventual success or failure notification.

**Acceptance Scenarios**:

1. **Given** user makes a request, **When** server returns 503/504, **Then** system retries 2-3 times before showing error
2. **Given** user has unstable connection, **When** request fails due to network, **Then** system retries with exponential backoff
3. **Given** retries are exhausted, **When** all retries fail, **Then** user sees error notification with option to retry manually

---

### User Story 4 - Consistent Error Messages (Priority: P2)

As a user, I want error messages in my preferred language with consistent styling, so I have a cohesive experience.

**Why this priority**: Improves professionalism and user trust in the application.

**Independent Test**: Can be tested by switching languages and triggering errors, verifying all messages are translated.

**Acceptance Scenarios**:

1. **Given** user's language is set to Russian, **When** any error occurs, **Then** error message is displayed in Russian
2. **Given** user sees success notification, **When** notification appears, **Then** it has green styling
3. **Given** user sees error notification, **When** notification appears, **Then** it has red styling

---

### User Story 5 - Developer Experience (Priority: P3)

As a developer, I want a standardized error handling pattern, so I can implement consistent error handling across all features.

**Why this priority**: Ensures long-term maintainability and prevents regression to old patterns.

**Independent Test**: Can be tested by creating new component and verifying error handling follows documented pattern.

**Acceptance Scenarios**:

1. **Given** developer creates new component, **When** implementing error handling, **Then** they use NotificationService with i18n keys
2. **Given** developer creates new service, **When** implementing API calls, **Then** errors propagate to component layer (not swallowed)
3. **Given** error occurs anywhere in app, **When** GlobalErrorHandler catches it, **Then** error is logged with context for debugging

---

### Edge Cases

- What happens when multiple errors occur simultaneously? (Show most recent, queue others)
- How does system handle errors during app initialization? (Show on login page or dedicated error page)
- What happens when translation key is missing? (Fallback to English)
- How does system handle errors in dialogs/modals? (Show notification, don't close dialog automatically)
- What happens when user is offline and tries to submit form? (Show offline indicator, queue for retry)
- What happens if 401 occurs immediately after login? (Track consecutive 401s for same URL, after 2nd redirect to login without returnUrl + info notification, user lands on home — graceful degradation)

---

## Requirements

### Functional Requirements

#### Layer 1: HTTP Interceptor

- **FR-001**: Interceptor MUST redirect to `/login?returnUrl={currentUrl}` on 401 response and clear authentication state
- **FR-001a**: Login component MUST read `returnUrl` query param and redirect there after successful authentication
- **FR-001b**: Interceptor MUST track consecutive 401s for same returnUrl; on 2nd occurrence, redirect to `/login` WITHOUT returnUrl and show info notification "Page temporarily unavailable"
- **FR-001c**: 401 tracking MUST reset on successful authenticated request or navigation to different page
- **FR-002**: Interceptor MUST redirect to `/403` page on 403 response
- **FR-003**: Interceptor MUST show network error notification on status 0 (no connection)
- **FR-004**: Interceptor MUST retry GET requests only 2-3 times for 503/504 responses with exponential backoff; POST/PUT/DELETE requests MUST NOT be retried
- **FR-005**: Interceptor MUST transform all HTTP errors to standardized `ApiError` format
- **FR-006**: Interceptor MUST pass through 400/404/409/422/500 errors to service/component layer

#### Layer 2: Service Layer

- **FR-007**: Services MUST NOT display notifications (UI is component responsibility)
- **FR-008**: Services MUST NOT swallow errors silently (except for explicitly non-critical data)
- **FR-009**: Services MAY implement retry logic for critical operations
- **FR-010**: Services MAY provide silent fallbacks only for non-critical, supplementary data

#### Layer 3: Component Layer

- **FR-011**: Components MUST handle errors in subscribe error callbacks
- **FR-012**: Components MUST use NotificationService for all user notifications
- **FR-013**: Components MUST use i18n keys for all notification messages
- **FR-014**: Components MUST provide context-aware error messages (not generic)

#### Layer 4: Global Error Handler

- **FR-015**: GlobalErrorHandler MUST catch all unhandled exceptions
- **FR-016**: GlobalErrorHandler MUST log errors with full context for debugging
- **FR-017**: GlobalErrorHandler MUST show generic notification for uncaught errors
- **FR-018**: GlobalErrorHandler MUST handle chunk loading errors with "Please refresh" message

#### NotificationService

- **FR-019**: NotificationService MUST provide methods: success(), error(), warning(), info()
- **FR-020**: NotificationService MUST integrate with TranslateService for i18n
- **FR-021**: NotificationService MUST apply consistent styling (panelClass) for each type
- **FR-022**: NotificationService MUST be the ONLY way to show snackbar notifications
- **FR-027**: NotificationService MUST use durations: success=3s, error=5s, warning=4s, info=3s
- **FR-028**: All notifications MUST be manually dismissible by user

#### Migration Requirements

- **FR-023**: All existing MatSnackBar direct usage MUST be replaced with NotificationService
- **FR-024**: All hardcoded error messages MUST be replaced with i18n keys
- **FR-025**: All `handleArrayError`/`handleObjectError` usage MUST be reviewed and updated
- **FR-026**: Unused code in http-error.utils.ts MUST be removed

### Key Entities

- **ApiError**: Standardized error object with code, message, details, timestamp
- **NotificationType**: Enum of success, error, warning, info
- **RetryConfig**: Configuration for retry behavior (count, delay, conditions)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of API errors result in visible user feedback (notification or redirect)
- **SC-002**: 0 instances of direct MatSnackBar usage in components (all via NotificationService)
- **SC-003**: 100% of notification messages use i18n keys (no hardcoded strings)
- **SC-004**: All 4 supported languages (en, ru, he, uk) have complete error message translations
- **SC-005**: 401/403 responses result in automatic redirect within 100ms (no error notification shown)
- **SC-006**: Network errors trigger automatic retry (2-3 attempts) before showing error
- **SC-007**: All error handlers follow documented 4-layer architecture pattern
- **SC-008**: Zero silent error swallowing (except documented non-critical fallbacks)

### Quality Metrics

- **SC-009**: No Russian/hardcoded strings in codebase (all i18n)
- **SC-010**: Error handling code follows single responsibility principle (each layer has clear role)
- **SC-011**: New features can implement error handling using documented pattern in < 5 minutes

### Migration Completion Metrics

- **SC-012**: 0 imports of `httpInspector.service.ts` in codebase (file deleted)
- **SC-013**: 0 imports of `snackbar.service.ts` in codebase (file deleted)
- **SC-014**: 0 usages of `handleArrayError`/`handleObjectError` functions
- **SC-015**: 0 direct `MatSnackBar` injections in components (only in NotificationService)
- **SC-016**: All legacy error handling files removed or rewritten

---

## Assumptions

1. Existing i18n infrastructure supports adding new translation keys
2. All error messages can be user-friendly (no technical jargon needed)
3. MatSnackBar is the preferred notification mechanism (no need for custom toast component)
4. Current authentication flow (token-based) remains unchanged
5. No external error logging service (Sentry/LogRocket) required in initial implementation

---

## Refactoring Scope (FULL REPLACEMENT)

> **This is a COMPLETE refactoring** — all existing error handling code must be replaced with the new architecture. No legacy patterns should remain.

### Files to DELETE (replace with new implementation)

| File | Reason |
|------|--------|
| `shared/auth/httpInspector.service.ts` | Replaced by new `HttpErrorInterceptor` |
| `shared/services/ui/snackbar.service.ts` | Replaced by `NotificationService` |

### Files to COMPLETELY REWRITE

| File | Changes |
|------|---------|
| `shared/utils/http/http-error.utils.ts` | Remove `handleArrayError`, `handleObjectError`, unused code; keep only `transformHttpError`, `ApiError` |
| `shared/auth/error-handler.service.ts` | Rewrite to use `NotificationService` |

### Code to MIGRATE (30+ files)

All components currently using:
- `MatSnackBar` directly → Replace with `NotificationService`
- `handleArrayError()`/`handleObjectError()` → Remove, let errors propagate to component
- Hardcoded error messages → Replace with i18n keys

### Migration Verification Checklist

- [ ] `grep -r "MatSnackBar" src/app` returns 0 results (except NotificationService)
- [ ] `grep -r "handleArrayError" src/app` returns 0 results
- [ ] `grep -r "handleObjectError" src/app` returns 0 results
- [ ] `grep -r "httpInspector" src/app` returns 0 results
- [ ] `grep -r "snackbar.service" src/app` returns 0 results
- [ ] All error messages in `assets/i18n/*.json` under `errors.*` keys

---

## Out of Scope

- Offline mode with request queuing
- Error analytics dashboard
- Integration with external logging services (Sentry, LogRocket)
- Custom notification components (using MatSnackBar)
- Error recovery UI (retry buttons in components) - can be added later

---

## Dependencies

- TranslateService (@ngx-translate) - existing
- MatSnackBar (@angular/material) - existing
- Router (@angular/router) - existing
- HttpClient (@angular/common/http) - existing

---

## New Files to Create

| File | Purpose |
|------|---------|
| `shared/services/notification.service.ts` | Centralized notification service with i18n |
| `shared/interceptors/http-error.interceptor.ts` | New 4-layer compliant interceptor |
| `shared/models/error.model.ts` | `ApiError`, `NotificationType` interfaces |
| `assets/i18n/en.json` → `errors.*` | English error messages |
| `assets/i18n/ru.json` → `errors.*` | Russian error messages |
| `assets/i18n/he.json` → `errors.*` | Hebrew error messages |
| `assets/i18n/uk.json` → `errors.*` | Ukrainian error messages |

> **Note:** For files to DELETE, REWRITE, and MIGRATE see [Refactoring Scope](#refactoring-scope-full-replacement) section above.
