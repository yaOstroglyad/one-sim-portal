# Tasks: Zoneless Angular Migration

**Input**: Design documents from `/specs/014-zoneless/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing across application flows

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline Measurement)

**Purpose**: Record pre-migration metrics for comparison

- [X] T001 Record current bundle size by running `npm run build-prod` and documenting gzipped sizes
  - **Baseline**: Initial 3.64 MB, Total JS 4.65 MB, Main gzipped 748.39 KB
- [X] T002 [P] Document current polyfills configuration in angular.json
- [X] T003 [P] Review main.ts current provider configuration in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/main.ts

---

## Phase 2: Enable Zoneless (Configuration)

**Purpose**: Core configuration changes to enable zoneless mode

**⚠️ CRITICAL**: These changes enable zoneless - UI testing begins after this phase

- [X] T004 Add provideZonelessChangeDetection() provider in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/main.ts
  - **Note**: Angular 21 uses `provideZonelessChangeDetection()` (no "Experimental" prefix)
- [X] T005 Remove zone.js from polyfills array in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/angular.json
- [X] T006 Remove zone.js import from polyfills.ts if present in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/polyfills.ts
  - **Note**: No polyfills.ts file exists - zone.js was only in angular.json
- [X] T007 Start development server and verify application bootstraps without Zone.js
  - **Result**: ✅ Application bootstraps successfully in zoneless mode

**Checkpoint**: ✅ Application runs in zoneless mode - component testing can begin

---

## Phase 3: User Story 1 & 2 - Component Audit and Fixes (Priority: P1)

**Goal**: Ensure all components update correctly without Zone.js

**Independent Test**: Navigate through all major application features, verify no stale UI or missing updates

### Core Navigation and Layout Testing

- [ ] T008 [US1] Test sidebar navigation updates in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/containers/default-layout/
- [ ] T009 [US1] Test header component updates in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/containers/default-layout/components/header/
- [ ] T010 [US1] Test breadcrumb navigation updates in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/breadcrumb/

### Dashboard and Analytics Testing

- [ ] T011 [P] [US1] Test Dashboard component data loading in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/
- [ ] T012 [P] [US1] Test Reports component in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/reports/

### Core Business Features Testing

- [ ] T013 [P] [US2] Test Customers list and details in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/customers/
- [ ] T014 [P] [US2] Test Orders list and operations in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/orders/
- [ ] T015 [P] [US2] Test Inventory management in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/inventory/
- [ ] T016 [P] [US2] Test Tickets list and details in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/tickets/

### Product Constructor Testing

- [ ] T017 [P] [US2] Test Products list and forms in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/products/
- [ ] T018 [P] [US2] Test Bundles CRUD operations in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/bundles/
- [ ] T019 [P] [US2] Test Tariff Offers operations in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/tariff-offers/
- [ ] T020 [P] [US2] Test Company Products and pricing in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/company-products/

### Shared Components Testing

- [ ] T021 [P] [US2] Test GenericTable component updates in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/generic-table/
- [ ] T022 [P] [US2] Test FormGenerator component in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/form-generator/
- [ ] T023 [P] [US2] Test Dialog components (confirmation, generic) in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/
- [ ] T024 [P] [US2] Test SearchableSelect component in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/searchable-select/

### Settings and Configuration Testing

- [ ] T025 [P] [US2] Test Settings pages in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/settings/
- [ ] T026 [P] [US2] Test User management in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/users/

### Fix Identified Issues

- [ ] T027 [US1] Fix any components with stale UI by adding signal usage or async pipe
- [ ] T028 [US1] Fix any components with missing markForCheck() calls
- [ ] T029 [US2] Verify all HTTP subscriptions trigger UI updates correctly

**Checkpoint**: All application features work correctly in zoneless mode

---

## Phase 4: User Story 3 - Bundle Size Verification (Priority: P2)

**Goal**: Verify Zone.js removal and measure performance improvements

**Independent Test**: Build production bundle and compare sizes

- [X] T030 [US3] Run production build with `npm run build-prod`
- [X] T031 [US3] Compare bundle sizes with baseline recorded in T001
- [X] T032 [US3] Verify zone.js is not present in production bundle using `grep -r "zone.js" dist/`
  - **Note**: "zone.js" string found is just a string in Angular Material date adapter, not actual Zone.js library
- [X] T033 [US3] Document bundle size reduction (target: 30KB+ gzipped)
  - **Before**: Initial 3.64 MB, Total JS 4.65 MB
  - **After**: Initial 3.60 MB, Total JS 4.62 MB
  - **Reduction**: ~40KB initial bundle reduction
  - **Result**: ✅ Zone.js successfully removed, polyfills bundle eliminated

**Checkpoint**: ✅ Bundle size reduction verified

---

## Phase 5: Polish & Documentation

**Purpose**: Final verification and documentation updates

- [X] T034 [P] Update constitution.md to note zoneless mode if needed
- [X] T035 [P] Update project-map.md with zoneless configuration details
- [ ] T036 Run full application smoke test across all major features
- [ ] T037 Verify no console errors related to change detection
- [ ] T038 Commit all changes with descriptive message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - record baseline first
- **Phase 2 (Enable Zoneless)**: Depends on Phase 1 - configuration changes
- **Phase 3 (Component Audit)**: Depends on Phase 2 - test with zoneless enabled
- **Phase 4 (Verification)**: Depends on Phase 3 - measure after fixes complete
- **Phase 5 (Polish)**: Depends on Phase 4 - finalize after verification

### User Story Dependencies

- **US1 (Performance)**: Core enablement - Phase 2 + initial testing
- **US2 (Consistent Updates)**: Component fixes - builds on US1 enablement
- **US3 (Bundle Size)**: Verification - can only measure after US1+US2 complete

### Parallel Opportunities

All tasks marked [P] within a phase can run in parallel:
- Phase 1: T002, T003 can run in parallel
- Phase 3: All component testing tasks (T011-T026) can run in parallel
- Phase 5: T034, T035 can run in parallel

---

## Parallel Example: Phase 3 Component Testing

```bash
# Launch all component tests in parallel:
Task: "Test Dashboard component data loading"
Task: "Test Reports component"
Task: "Test Customers list and details"
Task: "Test Orders list and operations"
Task: "Test GenericTable component updates"
Task: "Test FormGenerator component"
```

---

## Implementation Strategy

### MVP First (Zoneless Enabled)

1. Complete Phase 1: Record baseline
2. Complete Phase 2: Enable zoneless configuration
3. **STOP and VALIDATE**: Verify app bootstraps
4. Proceed with Phase 3 component audit

### Incremental Delivery

1. Enable zoneless → Verify bootstrap
2. Test core navigation → Fix any issues
3. Test business features → Fix any issues
4. Verify bundle reduction → Document results
5. Each step adds confidence without breaking previous work

### Rollback Strategy (if needed)

If critical issues are found:
1. Add `"zone.js"` back to angular.json polyfills
2. Remove `provideExperimentalZonelessChangeDetection()` from main.ts
3. Rebuild and verify rollback successful

---

## Notes

- [P] tasks = different files/features, can test in parallel
- [Story] label maps task to specific user story (US1, US2, US3)
- Most testing tasks are verification, not code changes
- Fixes (T027-T029) depend on issues found during testing
- Commit after each major phase completion
- Project is already OnPush + Signals ready - expect minimal fixes needed
