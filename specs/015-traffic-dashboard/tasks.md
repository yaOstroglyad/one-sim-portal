# Tasks: Traffic Dashboard Tab

**Input**: Design documents from `/specs/015-traffic-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing only

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Cleanup (Prerequisites)

**Purpose**: Remove legacy Traffic tab implementation before creating new version

**⚠️ CRITICAL**: Must complete cleanup before any new implementation

- [x] T001 Delete legacy traffic tab directory at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/traffic/
- [x] T002 [P] Delete legacy traffic-data.service.ts at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/services/traffic-data.service.ts
- [x] T003 [P] Delete legacy traffic.types.ts at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/models/traffic.types.ts
- [x] T004 Remove TrafficTabComponent import from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/dashboard.component.ts
- [x] T005 Remove traffic tab pane section from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/dashboard.component.html
- [x] T006 Remove getTrafficData method from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/services/mock-data.service.ts
- [x] T007 Remove traffic configuration from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/config.utils.ts
- [x] T008 Verify build succeeds after cleanup with `npm run build`

**Checkpoint**: Legacy code removed, clean slate for new implementation

---

## Phase 2: Foundational (Models, Services, Utilities)

**Purpose**: Create shared infrastructure needed by all user stories

**⚠️ CRITICAL**: All user stories depend on these foundational components

### Types & Models

- [x] T009 Create traffic.types.ts with API response interfaces at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/models/traffic.types.ts
- [x] T010 Export traffic types from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/models/index.ts

### Service Layer

- [x] T011 Create TrafficDataService with getTrafficData method at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/services/traffic-data.service.ts
- [x] T012 Add traffic endpoint to DASHBOARD_API_CONFIG in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/config.utils.ts
- [x] T013 Add getTrafficData facade method to /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/services/dashboard-data.service.ts

### Utility Functions

- [x] T014 Create traffic.utils.ts with formatTrafficValue function at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/traffic.utils.ts
- [x] T015 Add calculateKpiValues function to traffic.utils.ts
- [x] T016 Add buildTrafficByCountryChartConfig function to traffic.utils.ts
- [x] T017 Add buildSubscribersByCountryChartConfig function to traffic.utils.ts
- [x] T018 Add buildAverageTrafficChartConfig function to traffic.utils.ts
- [x] T019 Export traffic utilities from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/index.ts

**Checkpoint**: Foundation ready - component implementation can begin

---

## Phase 3: User Story 1 - View Traffic Overview (Priority: P1) 🎯 MVP

**Goal**: Display 4 KPI cards with traffic metrics summary

**Independent Test**: Open Traffic tab and verify 4 KPI cards display correct values

### Component Structure

- [x] T020 [US1] Create traffic-tab.component.ts with signals for loading, error, data at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/traffic/traffic-tab.component.ts
- [x] T021 [US1] Implement loadData method with API call and effect() for period/account changes
- [x] T022 [US1] Add KPI cards signals (kpiValues) using calculateKpiValues utility

### Template (KPI Cards Section)

- [x] T023 [US1] Create traffic-tab.component.html with KPI cards row at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/traffic/traffic-tab.component.html
- [x] T024 [US1] Add Total Traffic KPI card displaying formatted traffic value
- [x] T025 [US1] Add Active Countries KPI card displaying country count
- [x] T026 [US1] Add Top Country KPI card displaying country with highest traffic
- [x] T027 [US1] Add Avg Traffic/Subscriber KPI card displaying formatted average

### Styles (KPI Cards)

- [x] T028 [US1] Create traffic-tab.component.scss with KPI cards grid layout at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/traffic/traffic-tab.component.scss
- [x] T029 [US1] Add responsive breakpoints for KPI cards (4-col desktop, 2-col tablet, 1-col mobile)

### Barrel Export

- [x] T030 [US1] Create index.ts barrel export at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/traffic/index.ts

**Checkpoint**: KPI cards display correctly - User Story 1 complete

---

## Phase 4: User Story 2 - Traffic by Country Chart (Priority: P1)

**Goal**: Display stacked bar chart showing traffic distribution by country over time

**Independent Test**: View stacked bar chart with top 15 countries, periods on X-axis

### Implementation

- [x] T031 [US2] Add trafficChartConfig signal to traffic-tab.component.ts
- [x] T032 [US2] Call buildTrafficByCountryChartConfig in loadData method
- [x] T033 [US2] Add Traffic by Country chart section to traffic-tab.component.html using OsBarChartComponent
- [x] T034 [US2] Add custom legend below chart displaying country colors and totals
- [x] T035 [US2] Add chart container styles to traffic-tab.component.scss

**Checkpoint**: Traffic by Country chart renders with custom legend

---

## Phase 5: User Story 3 - Subscribers by Country Chart (Priority: P2)

**Goal**: Display stacked bar chart showing subscriber distribution by country over time

**Independent Test**: View subscribers chart with consistent colors matching traffic chart

### Implementation

- [x] T036 [US3] Add subscribersChartConfig signal to traffic-tab.component.ts
- [x] T037 [US3] Call buildSubscribersByCountryChartConfig in loadData method
- [x] T038 [US3] Add Subscribers by Country chart section to traffic-tab.component.html
- [x] T039 [US3] Add custom legend for subscribers chart
- [x] T040 [US3] Add 2-column layout styles for side-by-side charts

**Checkpoint**: Both charts display side-by-side with matching country colors

---

## Phase 6: User Story 4 - Average Traffic Trend Chart (Priority: P2)

**Goal**: Display line chart showing average traffic per subscriber trend

**Independent Test**: View line chart with connected data points and area fill

### Implementation

- [x] T041 [US4] Add avgTrafficChartConfig signal to traffic-tab.component.ts
- [x] T042 [US4] Call buildAverageTrafficChartConfig in loadData method
- [x] T043 [US4] Add Average Traffic line chart section to traffic-tab.component.html using OsLineChartComponent
- [x] T044 [US4] Add full-width layout for line chart below bar charts

**Checkpoint**: All 3 charts render correctly

---

## Phase 7: User Story 5 - Integration & States (Priority: P1)

**Goal**: Enable Traffic tab and handle loading/error/empty states

**Independent Test**: Change account/period and verify all visualizations refresh

### Dashboard Integration

- [x] T045 [US5] Import TrafficTabComponent in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/dashboard.component.ts
- [x] T046 [US5] Change traffic tab disabled flag to false in tabs signal
- [x] T047 [US5] Add traffic tab pane with @if conditional rendering to dashboard.component.html

### Loading State

- [x] T048 [US5] Add loading skeleton for KPI cards in traffic-tab.component.html
- [x] T049 [US5] Add loading skeleton for chart areas

### Error State

- [x] T050 [US5] Add error display with retry button using ErrorDisplayComponent
- [x] T051 [US5] Implement onRetry method in traffic-tab.component.ts

### Empty State

- [x] T052 [US5] Add empty state message "No traffic data for selected period"

**Checkpoint**: Traffic tab fully integrated with dashboard

---

## Phase 8: Polish & Verification

**Purpose**: Final verification and cleanup

- [x] T053 Verify Traffic tab is enabled in dashboard navigation
- [x] T054 Verify API returns data for selected account/period
- [x] T055 Verify all 4 KPI cards display correct values
- [x] T056 Verify Traffic by Country chart renders with top 15 countries
- [x] T057 Verify Subscribers by Country chart renders with consistent colors
- [x] T058 Verify Average Traffic line chart renders with trend
- [x] T059 Verify loading state displays during API call
- [x] T060 Verify error state displays on API failure with retry button
- [x] T061 Verify empty state displays when no data available
- [x] T062 Verify responsive layout on tablet and mobile viewports
- [x] T063 Run production build and verify no errors: `npm run build-prod`
- [ ] T064 Commit all changes with descriptive message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Cleanup (Phase 1)**: No dependencies - must complete first
- **Foundational (Phase 2)**: Depends on Cleanup - BLOCKS all user stories
- **US1 KPI Cards (Phase 3)**: Depends on Foundational
- **US2 Traffic Chart (Phase 4)**: Depends on Phase 3 component structure
- **US3 Subscribers Chart (Phase 5)**: Can start after Phase 3, parallel with Phase 4
- **US4 Line Chart (Phase 6)**: Can start after Phase 3, parallel with Phases 4-5
- **US5 Integration (Phase 7)**: Depends on Phases 3-6
- **Polish (Phase 8)**: Depends on all phases

### User Story Dependencies

```
Phase 1 (Cleanup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: KPI Cards) ─────────────────┐
    ↓                                     │
Phase 4 (US2: Traffic Chart)  ←──┐       │
                                  │       │
Phase 5 (US3: Subscribers Chart) ←┤       ├─→ Phase 7 (US5: Integration)
                                  │       │            ↓
Phase 6 (US4: Line Chart) ←───────┘       │      Phase 8 (Polish)
                                          │
All charts can be implemented in parallel ─┘
after US1 component structure is ready
```

### Parallel Opportunities

**Phase 1 (Cleanup)**:
- T002, T003 can run in parallel (different files)

**Phase 2 (Foundational)**:
- T009, T010 (types)
- T011, T012, T013 (services) - sequential within service layer
- T014-T019 (utilities) - can run in parallel after types

**Phases 4, 5, 6 (Charts)**:
- Can be implemented in parallel by different developers
- All depend on Phase 3 component structure being ready

---

## Parallel Example: Chart Implementation

```bash
# After Phase 3 (US1) is complete, launch chart tasks in parallel:
Task: "[US2] Add trafficChartConfig signal to traffic-tab.component.ts"
Task: "[US3] Add subscribersChartConfig signal to traffic-tab.component.ts"
Task: "[US4] Add avgTrafficChartConfig signal to traffic-tab.component.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Cleanup legacy code
2. Complete Phase 2: Foundational (types, services, utilities)
3. Complete Phase 3: US1 (KPI Cards)
4. **STOP and VALIDATE**: Verify KPI cards work
5. Complete Phase 4: US2 (Traffic Chart)
6. **STOP and VALIDATE**: Verify main chart works
7. Continue with remaining stories

### Incremental Delivery

1. Cleanup → Foundation → KPI Cards (MVP visible)
2. Add Traffic Chart → Two visualizations working
3. Add Subscribers Chart → Three visualizations
4. Add Line Chart → Full feature complete
5. Integration & Polish → Production ready

### File Creation Order

```
1. traffic.types.ts (models)
2. traffic-data.service.ts (service)
3. traffic.utils.ts (utilities)
4. traffic-tab.component.ts (component)
5. traffic-tab.component.html (template)
6. traffic-tab.component.scss (styles)
7. index.ts (barrel export)
8. Update dashboard.component.ts (integration)
9. Update dashboard.component.html (integration)
```

---

## Notes

- [P] tasks = different files, can run in parallel
- [Story] label maps task to specific user story
- No automated tests - manual verification only
- Reuse existing OsBarChartComponent and OsLineChartComponent
- Follow existing Finance/Subscribers tab patterns
- Use absolute paths per constitution
