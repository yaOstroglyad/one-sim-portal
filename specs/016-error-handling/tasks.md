# Tasks: Error Handling Architecture Refactoring

**Input**: Design documents from `/specs/016-error-handling/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No tests explicitly requested. Unit tests may be added in Polish phase if needed.

**Organization**: Tasks are grouped by implementation phase aligned with user stories to enable incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## User Story Mapping

| Story | Priority | Description | Phase |
|-------|----------|-------------|-------|
| US1 | P1 | Error Visibility - users see meaningful error messages | Phase 3-5 |
| US2 | P1 | Automatic Session Handling - 401/403 redirects | Phase 3 |
| US3 | P2 | Automatic Retry - 503/504/network retry | Phase 3 |
| US4 | P2 | Consistent Error Messages - i18n, styling | Phase 2-4 |
| US5 | P3 | Developer Experience - standardized patterns | Phase 6 |

---

## Phase 1: Setup (Foundation Infrastructure)

**Purpose**: Create new error handling infrastructure without breaking existing code

- [x] T001 [P] Create error model interfaces (ApiError, NotificationType, RetryConfig) in `src/app/shared/models/core/error.model.ts`
- [x] T002 [P] Create notification SCSS styles in `src/scss/_notifications.scss`
- [x] T003 [P] Add error i18n keys to `src/assets/i18n/en.json` under `errors.*`
- [x] T004 [P] Add error i18n keys to `src/assets/i18n/ru.json` under `errors.*`
- [x] T005 [P] Add error i18n keys to `src/assets/i18n/he.json` under `errors.*`
- [x] T006 [P] Add error i18n keys to `src/assets/i18n/ua.json` under `errors.*`
- [x] T007 Create NotificationService with success/error/warning/info methods in `src/app/shared/services/ui/notification.service.ts`
- [x] T008 Export NotificationService from `src/app/shared/services/ui/index.ts`
- [x] T009 Export error models from `src/app/shared/models/core/index.ts`
- [x] T010 Import notification styles in main SCSS entry point

**Checkpoint**: NotificationService is ready for use. No breaking changes to existing code.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create new HTTP interceptor that runs alongside old one

**⚠️ CRITICAL**: This phase enables all user story implementations

- [x] T011 Create interceptors directory `src/app/shared/interceptors/`
- [x] T012 [US2] [US3] Create HttpErrorInterceptor skeleton in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T013 [US2] Implement 401 handling with returnUrl in query param in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T014 [US2] Implement consecutive 401 tracking and graceful degradation in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T015 [US2] Implement 403 redirect to `/403` page in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T016 [US3] Implement retry logic for GET requests on 503/504 with exponential backoff in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T017 [US1] Implement network error detection (status 0) with notification in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T018 [US1] Implement error transformation to ApiError format for pass-through errors in `src/app/shared/interceptors/http-error.interceptor.ts`
- [x] T019 Export HttpErrorInterceptor from `src/app/shared/interceptors/index.ts`
- [x] T020 Register HttpErrorInterceptor in `src/main.ts` (after existing CustomHttpInterceptor)

**Checkpoint**: New interceptor runs in parallel with old one. Both handle 401, new one handles more cases.

---

## Phase 3: GlobalErrorHandler Upgrade

**Purpose**: Update GlobalErrorHandler to use NotificationService

**Goal**: [US1] [US4] Unhandled errors show proper notifications with i18n

**Independent Test**: Throw unhandled error, verify notification appears with translated message

- [x] T021 [US1] [US4] Update GlobalErrorHandlerService to inject NotificationService in `src/app/shared/auth/error-handler.service.ts`
- [x] T022 [US1] Add chunk loading error detection with "Please refresh" message in `src/app/shared/auth/error-handler.service.ts`
- [x] T023 [US4] Replace hardcoded messages with i18n keys in `src/app/shared/auth/error-handler.service.ts`
- [x] T024 Improve error logging with structured context in `src/app/shared/auth/error-handler.service.ts`

**Checkpoint**: GlobalErrorHandler uses NotificationService with i18n. Old error handling still works.

---

## Phase 4: Service Layer Cleanup

**Purpose**: Remove error swallowing from services, let errors propagate to components

**Goal**: [US1] [US5] Services don't swallow errors silently

**Independent Test**: Simulate API error, verify error propagates to component (not swallowed)

### Data Services (shared/services/data/)

- [ ] T025 [P] [US1] Remove handleArrayError from customers-data.service.ts, let errors propagate - `src/app/shared/services/data/customers-data.service.ts`
- [ ] T026 [P] [US1] Remove handleArrayError from companies-data.service.ts, let errors propagate - `src/app/shared/services/data/companies-data.service.ts`
- [ ] T027 [P] [US1] Remove handleArrayError from products-data.service.ts, let errors propagate - `src/app/shared/services/data/products-data.service.ts`
- [ ] T028 [P] [US1] Remove handleArrayError from orders-data.service.ts, let errors propagate - `src/app/shared/services/data/orders-data.service.ts`
- [ ] T029 [P] [US1] Remove handleArrayError from subscriber-data.service.ts, let errors propagate - `src/app/shared/services/data/subscriber-data.service.ts`
- [ ] T030 [P] [US1] Remove handleArrayError from accounts-data.service.ts, let errors propagate - `src/app/shared/services/data/accounts-data.service.ts`
- [ ] T031 [P] [US1] Remove handleArrayError from domains-data.service.ts, let errors propagate - `src/app/shared/services/data/domains-data.service.ts`
- [ ] T032 [P] [US1] Remove handleArrayError from transaction-data.service.ts, let errors propagate - `src/app/shared/services/data/transaction-data.service.ts`
- [ ] T033 [P] [US1] Remove handleArrayError from white-label-data.service.ts, let errors propagate - `src/app/shared/services/data/white-label-data.service.ts`
- [ ] T034 [P] [US1] Remove handleArrayError from providers-data.service.ts, let errors propagate - `src/app/shared/services/data/providers-data.service.ts`
- [ ] T035 [P] [US1] Remove handleArrayError from purchased-products-data.service.ts, let errors propagate - `src/app/shared/services/data/purchased-products-data.service.ts`

### View-Specific Services

- [ ] T036 [P] [US1] Remove handleArrayError from traffic-data.service.ts - `src/app/views/analytics/dashboard/services/traffic-data.service.ts`
- [ ] T037 [P] [US1] Remove handleArrayError from bundle-leftovers-data.service.ts - `src/app/views/analytics/reports/services/bundle-leftovers-data.service.ts`
- [ ] T038 [P] [US1] Remove handleArrayError from bundle-purchases-data.service.ts - `src/app/views/analytics/reports/services/bundle-purchases-data.service.ts`
- [ ] T039 [P] [US1] Remove handleArrayError from company-product-price.service.ts - `src/app/views/product-constructor/services/company-product-price.service.ts`
- [ ] T040 [P] [US1] Remove handleArrayError from inventory-data.service.ts - `src/app/views/inventory/inventory-data.service.ts`
- [ ] T041 [P] [US1] Remove handleArrayError from invoices.service.ts - `src/app/views/settings/invoicing-gateway/invoices.service.ts`
- [ ] T042 [P] [US1] Remove handleArrayError from payment-gateway.service.ts - `src/app/views/settings/payment-gateway-table/payment-gateway.service.ts`
- [ ] T043 [P] [US1] Remove handleArrayError from send-registration-email.service.ts - `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.service.ts`
- [ ] T044 [P] [US1] Remove handleArrayError from refund-product.service.ts - `src/app/shared/components/refund-product/refund-product.service.ts`

**Checkpoint**: All services propagate errors to components. Components must handle errors.

---

## Phase 5: Component Layer Migration

**Purpose**: Replace MatSnackBar with NotificationService, add error handlers

**Goal**: [US1] [US4] All notifications use NotificationService with i18n keys

**Independent Test**: Trigger any notification in any component, verify it uses consistent styling and i18n

### Customer Module Components

- [ ] T045 [US1] [US4] Migrate customers.component.ts - replace MatSnackBar with NotificationService, add error handlers - `src/app/views/customers/customers.component.ts`
- [ ] T046 [US1] [US4] Migrate subscriber-details.component.ts - replace MatSnackBar with NotificationService, add error handlers - `src/app/views/customers/private-customer-details/subscriber-details/subscriber-details.component.ts`
- [ ] T047 [US1] [US4] Migrate add-subscriber.component.ts - replace MatSnackBar with NotificationService, add error handlers - `src/app/views/customers/private-customer-details/add-subscriber/add-subscriber.component.ts`
- [ ] T048 [US1] [US4] Migrate add-subscriber-product.component.ts - replace MatSnackBar with NotificationService, add error handlers - `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.ts`
- [ ] T049 [US1] [US4] Migrate send-registration-email.component.ts - replace MatSnackBar with NotificationService, add error handlers - `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.component.ts`
- [ ] T050 [P] [US4] Update customers.utils.ts - replace MatSnackBar references - `src/app/views/customers/customers.utils.ts`

### Settings Module Components

- [ ] T051 [P] [US1] [US4] Migrate general-settings.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/general/general-settings.component.ts`
- [ ] T052 [P] [US1] [US4] Migrate retail.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/view-configuration/retail/retail.component.ts`
- [ ] T053 [P] [US1] [US4] Migrate portal.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/view-configuration/portal/portal.component.ts`
- [ ] T054 [P] [US1] [US4] Migrate edit-payment-gateway.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/payment-gateway-table/edit-payment-gateway/edit-payment-gateway.component.ts`
- [ ] T055 [P] [US1] [US4] Migrate template-type-grid.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/email-configurations/template-type-grid/template-type-grid.component.ts`
- [ ] T056 [P] [US1] [US4] Migrate email-configurations.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/email-configurations/email-configurations.component.ts`
- [ ] T057 [P] [US1] [US4] Migrate domains.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/domains/domains.component.ts`
- [ ] T058 [P] [US1] [US4] Migrate edit-invoices.component.ts - replace MatSnackBar with NotificationService - `src/app/views/settings/invoicing-gateway/edit-invoices/edit-invoices.component.ts`

### User & Role Components

- [ ] T059 [P] [US1] [US4] Migrate user-list.component.ts - replace MatSnackBar with NotificationService - `src/app/views/users/components/user-list/user-list.component.ts`
- [ ] T060 [P] [US4] Update user-list.utils.ts - replace MatSnackBar references - `src/app/views/users/components/user-list/user-list.utils.ts`
- [ ] T061 [P] [US1] [US4] Migrate role-list.component.ts - replace MatSnackBar with NotificationService - `src/app/views/roles/components/role-list/role-list.component.ts`

### Other Components

- [ ] T062 [P] [US1] [US4] Migrate companies.component.ts - replace MatSnackBar with NotificationService - `src/app/views/companies/companies.component.ts`
- [ ] T063 [P] [US1] [US4] Migrate refund-product.component.ts - replace MatSnackBar with NotificationService - `src/app/shared/components/refund-product/refund-product.component.ts`
- [ ] T064 [P] [US4] Migrate copy-to-clipboard.directive.ts - replace MatSnackBar with NotificationService - `src/app/shared/directives/attribute/copy-to-clipboard/copy-to-clipboard.directive.ts`
- [ ] T065 [US1] [US4] Migrate login.service.ts - replace MatSnackBar with NotificationService, add error handlers - `src/app/views/pages/login/login.service.ts`

### Login Component Update (US2)

- [ ] T066 [US2] Update LoginComponent to read returnUrl query param and redirect after successful login - `src/app/views/pages/login/login.component.ts`

**Checkpoint**: All components use NotificationService. All notifications use i18n keys.

---

## Phase 6: Cleanup & Verification

**Purpose**: Remove old code, verify migration complete

**Goal**: [US5] Clean codebase with no legacy error handling

- [ ] T067 Remove old CustomHttpInterceptor registration from `src/main.ts`
- [ ] T068 Delete `src/app/shared/auth/httpInspector.service.ts`
- [ ] T069 Delete `src/app/shared/services/ui/snackbar.service.ts`
- [ ] T070 Remove handleArrayError, handleObjectError, handleEmptyObjectError, handleWithDefault from `src/app/shared/utils/http/http-error.utils.ts`
- [ ] T071 Update exports in `src/app/shared/utils/http/index.ts` (remove deleted functions)
- [ ] T072 Update exports in `src/app/shared/auth/index.ts` (remove httpInspector)
- [ ] T073 Update exports in `src/app/shared/services/ui/index.ts` (remove snackbar, ensure notification exported)
- [ ] T074 [P] Run verification: `grep -r "MatSnackBar" src/app --include="*.ts" | grep -v notification.service`
- [ ] T075 [P] Run verification: `grep -r "handleArrayError" src/app --include="*.ts"`
- [ ] T076 [P] Run verification: `grep -r "handleObjectError" src/app --include="*.ts"`
- [ ] T077 [P] Run verification: `grep -r "httpInspector" src/app --include="*.ts"`
- [ ] T078 [P] Run verification: `grep -r "snackbar.service" src/app --include="*.ts"`
- [ ] T079 Run `ng build` to verify no TypeScript errors
- [ ] T080 Manual testing: verify 401 redirects to login with returnUrl
- [ ] T081 Manual testing: verify 403 redirects to /403 page
- [ ] T082 Manual testing: verify network error shows notification
- [ ] T083 Manual testing: verify form error shows context-aware message

**Checkpoint**: Migration complete. All verification checks pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS component migration
- **Phase 3 (GlobalErrorHandler)**: Depends on Phase 1 completion
- **Phase 4 (Service Layer)**: Depends on Phase 2 completion
- **Phase 5 (Component Layer)**: Depends on Phase 1, 2, 4 completion
- **Phase 6 (Cleanup)**: Depends on ALL previous phases

### User Story Dependencies

| Story | Can Start After | Dependencies |
|-------|-----------------|--------------|
| US1 (Error Visibility) | Phase 1 | NotificationService ready |
| US2 (Session Handling) | Phase 1 | NotificationService for info messages |
| US3 (Retry Logic) | Phase 1 | Part of interceptor |
| US4 (Consistent Messages) | Phase 1 | i18n keys ready |
| US5 (Developer Experience) | Phase 6 | Clean codebase ready |

### Parallel Opportunities

**Phase 1** (all [P] tasks can run in parallel):
- T001-T006 can all run simultaneously (different files)
- T003-T006 (i18n files) can run in parallel

**Phase 4** (service cleanup - all [P]):
- T025-T044 can all run in parallel (different service files)

**Phase 5** (component migration - marked [P] tasks):
- T050-T064 can run in parallel (different component files)
- T045-T049 should run sequentially (same module, may share utils)

**Phase 6** (verification - all [P]):
- T074-T078 can all run in parallel (grep commands)

---

## Parallel Example: Phase 4 Service Cleanup

```bash
# Launch all service cleanup tasks in parallel:
Task: T025 - customers-data.service.ts
Task: T026 - companies-data.service.ts
Task: T027 - products-data.service.ts
Task: T028 - orders-data.service.ts
...
Task: T044 - refund-product.service.ts
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T020)
3. Complete Phase 3: GlobalErrorHandler (T021-T024)
4. **STOP and VALIDATE**: Test interceptor and GlobalErrorHandler
5. Users now see error notifications and proper 401/403 handling

### Incremental Delivery

1. **Phase 1-2** → Foundation ready, both interceptors running
2. **Phase 3** → GlobalErrorHandler upgraded → Test unhandled errors
3. **Phase 4** → Services cleaned up → Test error propagation
4. **Phase 5** → Components migrated → Test all notifications
5. **Phase 6** → Old code removed → Final verification

### Risk Mitigation

- Old interceptor runs alongside new one until Phase 6
- Services can be cleaned up one at a time
- Components can be migrated incrementally
- Rollback: restore deleted files from git

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each phase should be a complete, independently testable increment
- Commit after each task or logical group
- Stop at any checkpoint to validate progress
- All hardcoded messages must be replaced with i18n keys from `errors.*`
- Keep only `transformHttpError` and `ApiError` in http-error.utils.ts

---

## Summary

| Phase | Task Count | Parallel Tasks | Key Deliverable |
|-------|------------|----------------|-----------------|
| Phase 1 | 10 | 7 | NotificationService + i18n keys |
| Phase 2 | 10 | 0 | HttpErrorInterceptor |
| Phase 3 | 4 | 0 | GlobalErrorHandler upgrade |
| Phase 4 | 20 | 20 | Service layer cleanup |
| Phase 5 | 22 | 16 | Component migration |
| Phase 6 | 17 | 5 | Cleanup + verification |
| **Total** | **83** | **48** | **Full refactoring complete** |
