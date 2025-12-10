# Tasks: Waterfall Chart Component

**Input**: Design documents from `/specs/012-waterfall-chart/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No tests requested - manual testing via dev server
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/app/shared/` for shared components, `src/app/views/` for feature views
- All paths are relative to `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and folder structure

- [x] T001 Create waterfall chart component folder structure at /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and utilities that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create WaterfallDataPoint interface in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/waterfall-chart.types.ts
- [x] T003 [P] Create WaterfallColors interface in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/waterfall-chart.types.ts
- [x] T004 [P] Create WaterfallChartOptions interface in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/waterfall-chart.types.ts
- [x] T005 Create transformToWaterfallData utility function in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/waterfall-chart.utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Reusable Waterfall Chart Component (Priority: P1) 🎯 MVP

**Goal**: Create a standalone, reusable waterfall chart component in the shared components library

**Independent Test**: Render the component with sample data points showing positive, negative, and total values. Verify floating bars render correctly with proper colors.

### Implementation for User Story 1

- [x] T006 [US1] Create os-waterfall-chart.component.ts with OnPush, standalone, inject() pattern following os-bar-chart in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/os-waterfall-chart.component.ts
- [x] T007 [US1] Create os-waterfall-chart.component.html template with canvas element in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/os-waterfall-chart.component.html
- [x] T008 [US1] Create os-waterfall-chart.component.scss with @use syntax and CSS variables in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/waterfall-chart/os-waterfall-chart.component.scss
- [x] T009 [US1] Implement Chart.js floating bar initialization in component using [start, end] data format
- [x] T010 [US1] Implement automatic color assignment (green for positive, red for negative, blue for total)
- [x] T011 [US1] Implement tooltip configuration showing label and value on hover
- [x] T012 [US1] Add input() properties: data, options, colors, height, responsive
- [x] T013 [US1] Implement ngOnChanges to update chart when data changes
- [x] T014 [US1] Export OsWaterfallChartComponent from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/index.ts barrel

**Checkpoint**: Waterfall chart component is complete and can be used in any view

---

## Phase 4: User Story 2 - Bundle Statuses Lifecycle Ordering (Priority: P2)

**Goal**: Sort bundle statuses in the Subscribers tab chart by lifecycle order

**Independent Test**: View the Bundle Statuses chart and verify legend shows statuses in order: PAID, FAILED_ACTIVATE, REFUNDED, ACTIVE, SPENT, EXPIRED

### Implementation for User Story 2

- [x] T015 [US2] Create BUNDLE_STATUS_LIFECYCLE_ORDER constant in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/bundle-status.utils.ts
- [x] T016 [US2] Create sortByLifecycleOrder utility function in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/bundle-status.utils.ts
- [x] T017 [US2] Update buildBundleStatusChartConfig() in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts to use lifecycle ordering
- [x] T018 [US2] Export bundle-status.utils from /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/utils/index.ts

**Checkpoint**: Bundle statuses now appear in correct lifecycle order

---

## Phase 5: User Story 3 - Subscribers Tab Translation Fix (Priority: P2)

**Goal**: Ensure "Bundle Statuses" chart title is translated in all 4 supported languages

**Independent Test**: Switch language to RU, UA, HE and verify chart title displays correctly translated text

### Implementation for User Story 3

- [x] T019 [P] [US3] Verify/add translation for dashboard.subscribers.bundleStatuses in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/assets/i18n/en.json
- [x] T020 [P] [US3] Verify/add translation for dashboard.subscribers.bundleStatuses in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/assets/i18n/ru.json
- [x] T021 [P] [US3] Verify/add translation for dashboard.subscribers.bundleStatuses in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/assets/i18n/ua.json
- [x] T022 [P] [US3] Verify/add translation for dashboard.subscribers.bundleStatuses in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/assets/i18n/he.json

**Checkpoint**: All translations verified and working

---

## Phase 6: User Story 4 - Replace Bundle Statuses with Waterfall Chart (Priority: P3)

**Goal**: Replace the stacked bar chart with waterfall chart in Subscribers tab Bundle Statuses section

**Independent Test**: View Bundle Statuses section and verify it displays a waterfall chart with floating bars

**Depends on**: User Story 1 (waterfall component), User Story 2 (lifecycle ordering)

### Implementation for User Story 4

- [x] T023 [US4] Import OsWaterfallChartComponent in /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.ts
- [x] T024 [US4] Create buildBundleStatusWaterfallData() method to transform API data to WaterfallDataPoint[] in subscribers-tab.component.ts
- [x] T025 [US4] Add bundleStatusWaterfallData signal to store waterfall data in subscribers-tab.component.ts
- [x] T026 [US4] Update subscribers-tab.component.html to use os-waterfall-chart instead of os-bar-chart for Bundle Statuses
- [x] T027 [US4] Remove unused bundleStatusChartData signal and buildBundleStatusChartConfig method

**Checkpoint**: Subscribers tab now shows waterfall chart for bundle statuses

---

## Phase 7: User Story 5 - Waterfall Chart Documentation (Priority: P3)

**Goal**: Create developer documentation for the waterfall chart component

**Independent Test**: New developer can read docs and successfully use the component without additional guidance

### Implementation for User Story 5

- [x] T028 [US5] Create /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/docs/components/waterfall-chart.md with component overview
- [x] T029 [US5] Add API reference section documenting all inputs (data, options, colors, height, responsive)
- [x] T030 [US5] Add usage examples section with at least 2 code snippets
- [x] T031 [US5] Add color customization guide explaining how to override default colors

**Checkpoint**: Documentation complete and comprehensive

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T032 Run quickstart.md validation - verify all examples work
- [x] T033 Code cleanup - remove any unused imports or dead code
- [x] T034 Verify component renders within 500ms performance target

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP component
- **User Story 2 (Phase 4)**: Depends on Foundational - can run parallel to US1
- **User Story 3 (Phase 5)**: Depends on Foundational - can run parallel to US1/US2
- **User Story 4 (Phase 6)**: Depends on US1 (waterfall component) and US2 (lifecycle ordering)
- **User Story 5 (Phase 7)**: Depends on US1 (component must exist first)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
US1 (Waterfall Component) ─────┬──> US4 (Integration)
                               │
US2 (Lifecycle Ordering) ──────┘

US3 (Translations) ────────────> Independent

US5 (Documentation) ───────────> Depends on US1
```

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different interfaces in same file)
- T019, T020, T021, T022 can run in parallel (different language files)
- US1, US2, US3 can start in parallel after Foundational phase
- US4 can only start after US1 and US2 complete
- US5 can start after US1 completes

---

## Parallel Example: Foundational Phase

```bash
# Launch all interface definitions together:
Task: "Create WaterfallDataPoint interface in waterfall-chart.types.ts"
Task: "Create WaterfallColors interface in waterfall-chart.types.ts"
Task: "Create WaterfallChartOptions interface in waterfall-chart.types.ts"
```

## Parallel Example: User Story 3 (Translations)

```bash
# Launch all translation tasks together:
Task: "Verify/add translation in en.json"
Task: "Verify/add translation in ru.json"
Task: "Verify/add translation in ua.json"
Task: "Verify/add translation in he.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types and utils)
3. Complete Phase 3: User Story 1 (waterfall component)
4. **STOP and VALIDATE**: Test component with sample data
5. Component is now usable across the application

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test → MVP ready!
3. User Stories 2 + 3 (parallel) → Existing chart improved
4. User Story 4 → Integration complete
5. User Story 5 → Documentation complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Follow os-bar-chart patterns for consistency
- Use CSS variables for all colors (theme support)
- Commit after each task or logical group
