# Tasks: Subscribers Tab API Integration

**Input**: Design documents from `/specs/010-subscribers-api/`
**Prerequisites**: plan.md (complete), spec.md (complete)

**Tests**: Not requested - no test tasks generated.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All paths are absolute from repository root

## Path Conventions

**Base path**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

```text
src/app/views/analytics/dashboard/
├── dashboard.component.ts
├── services/dashboard-data.service.ts
├── utils/config.utils.ts
├── models/subscribers.types.ts
└── tabs/subscribers/
    ├── subscribers-tab.component.ts
    ├── subscribers-tab.component.html
    └── subscribers-tab.component.scss
```

---

## Phase 1: Setup

**Purpose**: Enable tab and configure API infrastructure

- [X] T001 Enable Subscribers tab by removing `disabled: true` in `src/app/views/analytics/dashboard/dashboard.component.ts`
- [X] T002 [P] Add 4 subscriber endpoint URLs to `DASHBOARD_API_CONFIG.endpoints.subscribers` in `src/app/views/analytics/dashboard/utils/config.utils.ts`
- [X] T003 [P] Set `subscribers: false` in `DEFAULT_MOCK_CONFIG` in `src/app/views/analytics/dashboard/utils/config.utils.ts`

**Checkpoint**: Tab is visible and clickable, API config ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types and service methods that ALL user stories depend on

**⚠️ CRITICAL**: User story implementation cannot begin until this phase is complete

- [X] T004 Add `SubscriberSummaryResponse` interface in `src/app/views/analytics/dashboard/models/subscribers.types.ts`
- [X] T005 [P] Add `PeriodStatusesResponse`, `PeriodStatus`, `StatusCount` interfaces in `src/app/views/analytics/dashboard/models/subscribers.types.ts`
- [X] T006 [P] Add `BundleSubscribersResponse`, `BundleGroup` interfaces in `src/app/views/analytics/dashboard/models/subscribers.types.ts`
- [X] T007 Add `getSubscriberSummary()` API method in `src/app/views/analytics/dashboard/services/dashboard-data.service.ts`
- [X] T008 [P] Add `getNetworkStatuses()` API method in `src/app/views/analytics/dashboard/services/dashboard-data.service.ts`
- [X] T009 [P] Add `getBundleSubscribers()` API method in `src/app/views/analytics/dashboard/services/dashboard-data.service.ts`
- [X] T010 [P] Add `getBundleStatuses()` API method in `src/app/views/analytics/dashboard/services/dashboard-data.service.ts`
- [X] T011 Update `getSubscriberAnalytics()` to use forkJoin with all 4 new methods in `src/app/views/analytics/dashboard/services/dashboard-data.service.ts`

**Checkpoint**: All API methods ready, types defined - component work can begin ✅

---

## Phase 3: User Story 1 - View Subscriber Summary Report (Priority: P1) 🎯 MVP

**Goal**: Display 5 KPI metric cards from subscriber-summary API

**Independent Test**: Navigate to Subscribers tab, verify 5 KPI cards show real data (newSubscribers, downloadedSims, activeSubscribers, spentBundles, avrBundleSize)

### Implementation for User Story 1

- [X] T012 [US1] Add `summaryData` signal property in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T013 [US1] Update `loadData()` to call `getSubscriberSummary()` and store result in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T014 [US1] Create KPI cards row section in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.html` using `@for` and `app-metric-card`
- [X] T015 [US1] Add KPI row styles (`.kpi-row`, 5-column grid) in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.scss`

**Checkpoint**: User Story 1 complete - KPI cards display real data from API ✅

---

## Phase 4: User Story 2 - View Network Status Distribution (Priority: P1)

**Goal**: Display network status chart from network-statuses API

**Independent Test**: View Subscribers tab, verify network status chart shows status distribution by period

### Implementation for User Story 2

- [X] T016 [US2] Add `networkStatusData` signal property in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T017 [US2] Update `loadData()` to call `getNetworkStatuses()` and store result in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T018 [US2] Add `buildNetworkStatusChartConfig()` method to transform API data to chart format in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T019 [US2] Create network status chart section in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.html` using `os-card` and `os-bar-chart`
- [X] T020 [US2] Add network status section styles in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.scss`

**Checkpoint**: User Story 2 complete - Network status chart displays real data ✅

---

## Phase 5: User Story 3 - View Bundle Subscribers Report (Priority: P2)

**Goal**: Display bundle subscribers charts (by bundle and by country) from bundle-subscribers API

**Independent Test**: View Subscribers tab, verify two charts show subscribers grouped by bundle name and by country

### Implementation for User Story 3

- [X] T021 [US3] Add `bundleSubscribersData` signal property in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T022 [US3] Update `loadData()` to call `getBundleSubscribers()` and store result in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T023 [US3] Add `buildBundleChartConfig()` method to transform subscribersByBundle to chart format in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T024 [US3] Add `buildCountryChartConfig()` method to transform subscribersByCountry to chart format in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T025 [US3] Create bundle subscribers section with 2 side-by-side charts in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.html`
- [X] T026 [US3] Add bundle subscribers section styles (2-column grid) in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.scss`

**Checkpoint**: User Story 3 complete - Bundle distribution charts display real data ✅

---

## Phase 6: User Story 4 - View Bundle Status Distribution (Priority: P2)

**Goal**: Display bundle status chart from bundle-statuses API

**Independent Test**: View Subscribers tab, verify bundle status chart shows status distribution by period

### Implementation for User Story 4

- [X] T027 [US4] Add `bundleStatusData` signal property in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T028 [US4] Update `loadData()` to call `getBundleStatuses()` and store result in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T029 [US4] Add `buildBundleStatusChartConfig()` method to transform API data to chart format in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [X] T030 [US4] Create bundle statuses chart section in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.html`
- [X] T031 [US4] Add bundle statuses section styles in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.scss`

**Checkpoint**: User Story 4 complete - Bundle status chart displays real data ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and final integration

- [X] T032 Remove old mock-based template sections (retention, churnAnalysis, growth, demographics, lifecycle) from `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.html`
- [ ] T033 [P] Remove unused type definitions (SubscriberAnalytics, RetentionAnalysis, ChurnAnalysis, etc.) from `src/app/views/analytics/dashboard/models/subscribers.types.ts`
- [X] T034 [P] Add empty state handling for each chart section in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.html`
- [X] T035 Verify all loading and error states work correctly in `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts`
- [ ] T036 Manual testing: Navigate to Subscribers tab, verify all 4 sections display data

**Checkpoint**: Feature complete - all user stories functional with real API data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-6 (User Stories)**: All depend on Phase 2 completion
- **Phase 7 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **US3 (P2)**: Can start after Phase 2 - No dependencies on other stories
- **US4 (P2)**: Can start after Phase 2 - No dependencies on other stories

**Note**: All user stories modify the same files, so parallel execution requires careful coordination. Recommended: sequential implementation in priority order.

### Within Each User Story

1. Add signal property for data storage
2. Update loadData() to call API
3. Add chart config builder method (for chart stories)
4. Create HTML template section
5. Add SCSS styles

### Parallel Opportunities

**Phase 1:**
- T002 and T003 can run in parallel (different sections of same file)

**Phase 2:**
- T005 and T006 can run in parallel (different interfaces)
- T008, T009, T010 can run in parallel (different methods)

**Phase 7:**
- T033 and T034 can run in parallel (different files/concerns)

---

## Parallel Example: Phase 2 Foundational

```bash
# Types can be added in parallel:
Task: "Add PeriodStatusesResponse, PeriodStatus, StatusCount interfaces"
Task: "Add BundleSubscribersResponse, BundleGroup interfaces"

# API methods can be added in parallel:
Task: "Add getNetworkStatuses() API method"
Task: "Add getBundleSubscribers() API method"
Task: "Add getBundleStatuses() API method"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011)
3. Complete Phase 3: User Story 1 (T012-T015)
4. **STOP and VALIDATE**: Test KPI cards display real data
5. Demo/deploy MVP

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 (KPI cards) → Test → Deploy (MVP!)
3. Add US2 (Network status) → Test → Deploy
4. Add US3 (Bundle subscribers) → Test → Deploy
5. Add US4 (Bundle statuses) → Test → Deploy
6. Polish phase → Final cleanup

### Recommended Execution Order

Since all user stories modify the same component files, sequential execution is recommended:

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011
    → T012 → T013 → T014 → T015 (US1 complete)
    → T016 → T017 → T018 → T019 → T020 (US2 complete)
    → T021 → T022 → T023 → T024 → T025 → T026 (US3 complete)
    → T027 → T028 → T029 → T030 → T031 (US4 complete)
    → T032 → T033 → T034 → T035 → T036 (Polish complete)
```

---

## Notes

- All user stories share the same component files - coordinate edits carefully
- Use `@if` for conditional rendering, `@for` for iterations (Angular 19 syntax)
- Use `inject()` for dependency injection
- Use signals for reactive state management
- Add `catchError(handleObjectError())` for HTTP error handling
- Commit after each task or logical group of tasks
