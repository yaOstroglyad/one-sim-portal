# Tasks: SCSS Responsive Architecture Refactoring

**Input**: Design documents from `/specs/024-scss-responsive-refactoring/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: No automated tests requested. Validation through manual device testing and visual regression checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **SCSS globals**: `src/scss/`
- **Layout components**: `src/app/containers/default-layout/`
- **Component SCSS**: `src/app/**/*.component.scss`

---

## Phase 1: Setup (Foundation Variables & Mixins)

**Purpose**: Add centralized breakpoint variables and layout mixins that all subsequent work depends on

- [x] T001 Add responsive breakpoint variables ($breakpoint-sm/md/lg/xl/xxl, $layout-breakpoint) to `src/scss/_variables.scss`
- [x] T002 Add content breakpoint mixins (breakpoint-down, breakpoint-up) to `src/scss/_mixins.scss`
- [x] T003 Add layout breakpoint mixins (layout-mobile, layout-desktop) to `src/scss/_mixins.scss`
- [x] T004 Add layout component mixins (layout-base, layout-main-base, layout-main-rtl, layout-mobile-overlay, layout-content-base, layout-container-base) to `src/scss/_mixins.scss`
- [x] T005 Update existing mobile/tablet/desktop mixins to use centralized variables in `src/scss/_mixins.scss`
- [x] T006 Delete deprecated empty file `src/scss/_custom.scss`
- [x] T007 Remove `@use "./custom"` import from `src/scss/styles.scss` (if exists)

**Checkpoint**: Foundation ready - all breakpoint variables and mixins are available for use

---

## Phase 2: User Story 1 - Mobile User Accesses Application (Priority: P1) 🎯 MVP

**Goal**: Mobile users (viewport ≤ 900px) see hamburger menu, can tap to reveal sidebar as overlay, close by tapping outside

**Independent Test**: Open application on iPhone 14 Pro Max in landscape mode (932px width) - hamburger menu should appear and function correctly

### Implementation for User Story 1

- [x] T008 [US1] Refactor `.layout` base styles to use `@include mixins.layout-base` in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T009 [US1] Refactor `.layout__main` styles to use `@include mixins.layout-main-base` in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T010 [US1] Refactor `.layout--rtl .layout__main` styles to use `@include mixins.layout-main-rtl` in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T011 [US1] Refactor `.layout__mobile-overlay` styles to use `@include mixins.layout-mobile-overlay` in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T012 [US1] Replace hardcoded 768px media queries with `@include mixins.layout-mobile` in `src/app/containers/default-layout/components/header/header.component.scss`
- [x] T013 [US1] Replace hardcoded 768px media queries with `@include mixins.layout-mobile` in `src/app/containers/default-layout/components/sidebar/sidebar.component.scss`
- [x] T014 [US1] Test hamburger menu visibility at 900px breakpoint across header, sidebar, default-layout

**Checkpoint**: Mobile layout works correctly with hamburger menu appearing at 900px

---

## Phase 3: User Story 2 - Tablet User Switches Orientation (Priority: P1)

**Goal**: Layout smoothly adapts when tablet rotates between portrait (sidebar hidden) and landscape (sidebar visible)

**Independent Test**: On iPad Mini, rotate between portrait (768px) and landscape (1024px) - layout adapts correctly without page reload

### Implementation for User Story 2

- [x] T015 [US2] Add `@media (prefers-reduced-motion: reduce)` to all layout transitions in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T016 [US2] Add `@media (prefers-reduced-motion: reduce)` to sidebar transitions in `src/app/containers/default-layout/components/sidebar/sidebar.component.scss`
- [x] T017 [US2] Verify smooth margin-left transition on `.layout__main` when crossing 900px breakpoint
- [x] T018 [US2] Test orientation change on iPad Mini - verify no flicker or jarring transitions

**Checkpoint**: Tablet orientation changes work smoothly with proper transitions

---

## Phase 4: User Story 3 - Desktop User Has Persistent Sidebar (Priority: P2)

**Goal**: Desktop users (viewport > 900px) always see sidebar, can collapse to icon-only view

**Independent Test**: On desktop browser, resize window above 900px - sidebar remains visible and can be collapsed

### Implementation for User Story 3

- [x] T019 [US3] Ensure sidebar collapse/expand behavior preserved in `src/app/containers/default-layout/components/sidebar/sidebar.component.scss`
- [x] T020 [US3] Verify `.layout__main` margin adjusts for collapsed sidebar width (56px) in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T021 [US3] Test sidebar collapse/expand on desktop viewport

**Checkpoint**: Desktop sidebar behavior works correctly with collapse/expand

---

## Phase 5: User Story 4 - Developer Modifies Breakpoint Value (Priority: P2)

**Goal**: Changing `$layout-breakpoint` variable applies to all layout components automatically

**Independent Test**: Change `$layout-breakpoint` to 850px, recompile - all responsive behaviors should shift to 850px

### Implementation for User Story 4

- [x] T022 [US4] Eliminate all duplicated layout styles from `src/app/views/docs/docs-layout/docs-layout.component.scss` by using layout mixins
- [x] T023 [US4] Refactor `.layout__content` styles to use `@include mixins.layout-content-base` in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T024 [US4] Refactor `.layout__container` styles to use `@include mixins.layout-container-base` in `src/app/containers/default-layout/default-layout.component.scss`
- [x] T025 [US4] Fix 767px hardcoded breakpoint to use `@include mixins.breakpoint-down('md')` in `src/scss/_vendor-overrides.scss`
- [x] T026 [US4] Replace hardcoded breakpoints with mixins in `src/scss/_dashboard-layout.scss`
- [x] T027 [US4] Replace hardcoded breakpoints with mixins in `src/scss/_detail-section.scss`
- [x] T028 [US4] Replace hardcoded breakpoints with mixins in `src/scss/_fab-layout.scss`
- [x] T029 [US4] Replace hardcoded breakpoints with mixins in `src/scss/_searchable-select-overlay.scss`
- [x] T030 [US4] Verify changing `$layout-breakpoint` value affects all layout components

**Checkpoint**: Single variable change propagates to all layout behaviors

---

## Phase 6: User Story 5 - Developer Creates New Layout Component (Priority: P3)

**Goal**: Developers can use shared layout mixins to create new layouts with < 20 lines of layout-specific SCSS

**Independent Test**: Create a test layout component using only mixins - should behave identically to default-layout

### Implementation for User Story 5

- [x] T031 [P] [US5] Replace hardcoded 768px with `@include mixins.breakpoint-down('md')` in component files (batch 1: components A-D)
- [x] T032 [P] [US5] Replace hardcoded 768px with `@include mixins.breakpoint-down('md')` in component files (batch 2: components E-L)
- [x] T033 [P] [US5] Replace hardcoded 768px with `@include mixins.breakpoint-down('md')` in component files (batch 3: components M-R)
- [x] T034 [P] [US5] Replace hardcoded 768px with `@include mixins.breakpoint-down('md')` in component files (batch 4: components S-Z)
- [x] T035 [US5] Replace hardcoded 480px with `@include mixins.breakpoint-down('sm')` in all component files
- [x] T036 [US5] Replace hardcoded 1024px with `@include mixins.breakpoint-down('lg')` in all component files
- [x] T037 [US5] Replace hardcoded 1200px/1280px with `@include mixins.breakpoint-down('xl')` in all component files
- [x] T038 [US5] Verify mixin documentation in mixins file allows new component creation

**Checkpoint**: All hardcoded breakpoints replaced with mixins, developers can use layout mixins easily

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and cleanup

- [x] T039 Run grep verification: confirm 0 hardcoded breakpoints in component SCSS files (3 intentional exceptions: docs-layout TOC 992px, overview tablet range query)
- [x] T040 Verify docs-layout has no duplicated layout styles (target: ~111 lines eliminated)
- [ ] T041 Test full device matrix: iPhone SE, iPhone 14 Pro Max (landscape), iPad Mini (both orientations), Desktop
- [ ] T042 Test RTL mode: verify sidebar slides from right, margins correct
- [ ] T043 Test reduced motion preference: verify transitions are instant when enabled
- [x] T044 [P] Update `constitution.md` Section VII with breakpoint documentation
- [x] T045 [P] Update `project-map.md` with new breakpoint system reference
- [x] T046 Final code review: verify all SCSS follows constitution patterns

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - must complete first, BLOCKS all user stories
- **User Story 1 (Phase 2)**: Depends on Setup - core mobile functionality
- **User Story 2 (Phase 3)**: Depends on US1 completion - orientation changes
- **User Story 3 (Phase 4)**: Depends on Setup - can run parallel with US1/US2
- **User Story 4 (Phase 5)**: Depends on US1 completion - requires layout mixins in use
- **User Story 5 (Phase 6)**: Depends on US4 completion - mass migration of component files
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies after Setup - MUST complete first (MVP)
- **User Story 2 (P1)**: Builds on US1 - adds transition polish
- **User Story 3 (P2)**: Can proceed after Setup - desktop behavior
- **User Story 4 (P2)**: Requires US1 mixins in place - extends coverage
- **User Story 5 (P3)**: Requires US4 complete - bulk migration

### Within Each User Story

- Refactor default-layout before docs-layout
- Layout components (header, sidebar) depend on layout-base mixins
- Test after each major refactor

### Parallel Opportunities

- T031, T032, T033, T034 can run in parallel (different component batches)
- T044, T045 can run in parallel (different documentation files)
- US3 can run in parallel with US1/US2 after Setup

---

## Parallel Example: Component Migration (Phase 6)

```bash
# Launch all component batches together:
Task: "Replace hardcoded 768px in component files (batch 1: A-D)"
Task: "Replace hardcoded 768px in component files (batch 2: E-L)"
Task: "Replace hardcoded 768px in component files (batch 3: M-R)"
Task: "Replace hardcoded 768px in component files (batch 4: S-Z)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: User Story 1 (T008-T014)
3. **STOP and VALIDATE**: Test on iPhone 14 Pro Max landscape
4. Deploy/demo if ready - mobile users can now access navigation

### Incremental Delivery

1. Setup → Foundation ready
2. User Story 1 → Mobile layout fixed (MVP!)
3. User Story 2 → Smooth transitions added
4. User Story 3 → Desktop polish
5. User Story 4 → Maintainability improvements
6. User Story 5 → Full codebase migration
7. Each story adds value without breaking previous stories

### Recommended Execution

For single developer:
1. T001-T007 (Setup) - ~30 min
2. T008-T014 (US1) - ~45 min
3. T015-T018 (US2) - ~20 min
4. T019-T021 (US3) - ~15 min
5. T022-T030 (US4) - ~1 hr
6. T031-T038 (US5) - ~2 hrs (bulk changes)
7. T039-T046 (Polish) - ~30 min

---

## Success Metrics Verification

| Task | Metric | Verification Command |
|------|--------|---------------------|
| T039 | 0 hardcoded breakpoints | `grep -r "max-width: [0-9]*px" src/app --include="*.scss" \| wc -l` |
| T040 | 0 duplicated layout lines | Compare docs-layout.component.scss before/after |
| T041 | All devices work | Manual testing on device matrix |
| T042 | RTL works | Manual testing with `dir="rtl"` |
| T043 | Reduced motion works | System preference + visual check |

---

## Notes

- All tasks modify SCSS files only - no TypeScript or HTML changes
- Each checkpoint allows validation before proceeding
- Commit after each user story completion
- Visual regression possible - test thoroughly after each phase
- RTL testing critical - sidebar direction depends on it
