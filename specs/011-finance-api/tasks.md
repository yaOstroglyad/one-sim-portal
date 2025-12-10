# Tasks: Finance Dashboard API Integration

**Input**: Design documents from `/specs/011-finance-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not requested in specification. Manual testing via dev server.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Base

All paths relative to: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

---

## Phase 1: Setup (Configuration)

**Purpose**: Update configuration and API types

- [X] T001 [P] Add API response interfaces (PeriodRevenueSummaryResponse, PeriodRevenueData, RevenueGroup) to `src/app/views/analytics/dashboard/models/finance.types.ts`
- [X] T002 [P] Update DASHBOARD_API_CONFIG.endpoints.finance to `/api/v1/reports/dashboards/finance/period-revenue-summary` in `src/app/views/analytics/dashboard/utils/config.utils.ts`
- [X] T003 Set `finance: false` in DEFAULT_MOCK_CONFIG in `src/app/views/analytics/dashboard/utils/config.utils.ts`

---

## Phase 2: User Story 1+2 - View Real Revenue Data + Period Filtering (Priority: P1) 🎯 MVP

**Goal**: Display live finance data from API with period-based filtering

**Independent Test**: Navigate to Dashboard > Finance tab, select an account, verify charts display real data. Change period filter, verify data refreshes.

### Implementation

- [X] T004 [US1] Add `buildFinanceReportParams()` method to build query params (accountId, period, dateFrom, dateTo) in `src/app/views/analytics/dashboard/services/finance-data.service.ts`
- [X] T005 [US1] Add `getPeriodRevenueSummary()` method to call real API endpoint with GET request in `src/app/views/analytics/dashboard/services/finance-data.service.ts`
- [X] T006 [US1] Add transformation methods to convert API response to FinanceAnalytics:
  - `transformRevenueByBundle()` - aggregate bundle revenue for bar chart
  - `transformRevenueByCountry()` - aggregate country revenue for bar chart
  - `transformMarginByCountry()` - transform margin data for line chart
  in `src/app/views/analytics/dashboard/services/finance-data.service.ts`
- [X] T007 [US1] Update `getFinanceData()` to use real API when `mockConfig.finance === false` in `src/app/views/analytics/dashboard/services/finance-data.service.ts`
- [X] T008 [US2] Verify period change triggers re-fetch via existing effect in finance-tab.component.ts (existing behavior, manual verification only)

**Checkpoint**: Finance tab displays real API data for all three charts, period changes trigger refresh

---

## Phase 3: User Story 3 - Handle API Errors (Priority: P2)

**Goal**: Display meaningful error messages with retry option when API fails

**Independent Test**: Disconnect network or use invalid accountId, verify error message appears with retry button. Click retry, verify API is called again.

### Implementation

- [X] T009 [US3] Ensure error handling uses `catchError(createErrorResponse(error))` pattern in `getPeriodRevenueSummary()` in `src/app/views/analytics/dashboard/services/finance-data.service.ts`
- [X] T010 [US3] Verify ErrorDisplayComponent receives and displays error with retry button (existing component, manual verification)

**Checkpoint**: API errors display user-friendly message with functional retry

---

## Phase 4: User Story 4 - Loading State (Priority: P2)

**Goal**: Show loading indicator while data is being fetched

**Independent Test**: Observe Finance tab during initial load and period changes, verify loading indicator appears and disappears appropriately.

### Implementation

- [X] T011 [US4] Verify loading state is set before API call and cleared after response/error in finance-tab.component.ts (existing behavior, manual verification)
- [X] T012 [US4] Verify LoadingIndicatorComponent displays during loading state (existing component, manual verification)

**Checkpoint**: Loading indicator appears during data fetch and disappears after

---

## Phase 5: Polish & Validation

**Purpose**: Final verification and edge case handling

- [X] T013 Verify empty data arrays display appropriate empty state message
- [X] T014 Verify missing currency falls back to EUR default
- [X] T015 Run full manual test: Dashboard > Finance tab with real data for all charts
- [X] T016 Verify no mock data references remain in Finance tab flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (US1+2)**: Depends on Phase 1 (T001, T002, T003)
- **Phase 3 (US3)**: Depends on Phase 2 (error handling needs API call working)
- **Phase 4 (US4)**: Depends on Phase 2 (loading state needs API call working)
- **Phase 5 (Polish)**: Depends on Phases 2-4

### Task Dependencies within Phase 2

```
T001, T002, T003 (parallel) → T004 → T005 → T006 → T007 → T008
```

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different locations in different files)

---

## Parallel Example: Phase 1

```bash
# Launch all setup tasks together:
Task: "T001 - Add API response interfaces to finance.types.ts"
Task: "T002 - Update endpoint in config.utils.ts"
Task: "T003 - Disable mock in config.utils.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1+2)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: US1+2 Core Implementation (T004-T008)
3. **STOP and VALIDATE**: Test Finance tab with real data
4. Proceed to US3, US4 if MVP works

### Total Tasks: 16

| Phase | Story | Task Count |
|-------|-------|------------|
| Phase 1 | Setup | 3 |
| Phase 2 | US1+US2 | 5 |
| Phase 3 | US3 | 2 |
| Phase 4 | US4 | 2 |
| Phase 5 | Polish | 4 |

---

## Notes

- US1 and US2 are combined because period filtering is inherent to the API call (same implementation)
- US3 and US4 are verification tasks - existing UI components handle error/loading display
- Most work is in finance-data.service.ts (transformation logic)
- No new components needed - only service layer changes
- Tests not included as specification indicates manual testing via dev server
