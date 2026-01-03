# Tasks: Gmail-Style Layout Redesign

**Input**: Design documents from `/specs/017-gmail-layout/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), quickstart.md (complete)

**Tests**: Manual testing only (no unit tests for layout changes per plan.md)

**Organization**: Tasks grouped by user story priority (P1 → P2 → P3)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- All paths are absolute from repository root

## Path Conventions

```text
src/app/containers/default-layout/
├── default-layout.component.ts
├── default-layout.component.html
├── default-layout.component.scss
├── components/
│   ├── header/
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.scss
│   └── sidebar/
│       ├── sidebar.component.ts
│       ├── sidebar.component.html
│       └── sidebar.component.scss
```

---

## Phase 1: Setup (SCSS Variables)

**Purpose**: Add layout constants for consistent values across components

- [ ] T001 Add layout variables ($layout-header-height, $layout-sidebar-width, $layout-content-radius) in src/scss/_variables.scss

---

## Phase 2: Foundational (Core Layout Restructure)

**Purpose**: Restructure the layout hierarchy from sidebar-first to header-first

**⚠️ CRITICAL**: All user stories depend on this phase being complete

- [ ] T002 Update header.component.scss: change positioning to full-width (left: 0, right: 0, z-index: 1001) in src/app/containers/default-layout/components/header/header.component.scss
- [ ] T003 Update sidebar.component.scss: change top to 64px, height to calc(100vh - 64px) in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T004 Update default-layout.component.scss: add wrapper background with sidebar color, content container with border-radius in src/app/containers/default-layout/default-layout.component.scss
- [ ] T005 Update default-layout.component.html: restructure layout wrapper and content container in src/app/containers/default-layout/default-layout.component.html

**Checkpoint**: Header is full-width, sidebar starts below header, content has visual frame. Basic structure complete.

---

## Phase 3: User Story 1+2 - Desktop Navigation & Header (Priority: P1) 🎯 MVP

**Goal**: Header provides global actions (search, dropdown, user menu) while sidebar handles navigation with clean visual separation

**Independent Test**: Load any page on desktop (>768px). Header spans full width, contains (left to right): disabled dropdown button, search bar, user menu. Sidebar visible with navigation.

### Implementation for User Stories 1+2

- [ ] T006 [US1] Remove breadcrumb component from header.component.html in src/app/containers/default-layout/components/header/header.component.html
- [ ] T007 [P] [US2] Add disabled dropdown menu button to header left side in src/app/containers/default-layout/components/header/header.component.html
- [ ] T008 [P] [US2] Add search input field to header center area in src/app/containers/default-layout/components/header/header.component.html
- [ ] T009 [US2] Style dropdown button as disabled (reduced opacity) in src/app/containers/default-layout/components/header/header.component.scss
- [ ] T010 [US2] Style search bar with placeholder and focus states in src/app/containers/default-layout/components/header/header.component.scss
- [ ] T011 [US1] Verify sidebar toggle button works with new positioning in src/app/containers/default-layout/components/sidebar/sidebar.component.ts
- [ ] T012 [US1] Ensure content area adjusts width when sidebar collapses/expands in src/app/containers/default-layout/default-layout.component.scss

**Checkpoint**: Desktop layout complete. Header full-width with dropdown, search, user menu. Sidebar collapses/expands correctly. MVP deliverable.

---

## Phase 4: User Story 3 - Sidebar Logo Behavior (Priority: P2)

**Goal**: Logo in sidebar switches between full and narrow variants based on sidebar state

**Independent Test**: Toggle sidebar collapse/expand. Full logo shows when expanded (256px), narrow logo shows when collapsed (56px). Hover-expand shows full logo.

### Implementation for User Story 3

- [ ] T013 [US3] Verify logo switching logic works with new sidebar positioning in src/app/containers/default-layout/components/sidebar/sidebar.component.ts
- [ ] T014 [US3] Adjust logo container styles for new sidebar height in src/app/containers/default-layout/components/sidebar/sidebar.component.scss

**Checkpoint**: Logo behavior unchanged from current implementation, just verified with new layout.

---

## Phase 5: User Story 4 - Breadcrumbs in Content Area (Priority: P2)

**Goal**: Breadcrumbs displayed at top of content area (not in header)

**Independent Test**: Navigate to nested page (e.g., Analytics > Dashboard). Breadcrumbs appear inside content area with rounded corners, showing full path.

### Implementation for User Story 4

- [ ] T015 [US4] Move breadcrumb component to content area in default-layout.component.html in src/app/containers/default-layout/default-layout.component.html
- [ ] T016 [US4] Style breadcrumb container with proper spacing inside rounded content area in src/app/containers/default-layout/default-layout.component.scss
- [ ] T017 [US4] Ensure breadcrumb background matches content background in src/app/containers/default-layout/default-layout.component.scss

**Checkpoint**: Breadcrumbs visible inside content area on all pages.

---

## Phase 6: User Story 5 - Mobile Navigation Experience (Priority: P2)

**Goal**: Mobile users can toggle sidebar with enlarged button, sidebar slides in/out smoothly

**Independent Test**: Resize to mobile (<768px). Sidebar hidden. Tap toggle button at bottom-left, sidebar slides in. Tap overlay or menu item, sidebar closes.

### Implementation for User Story 5

- [ ] T018 [US5] Update mobile breakpoint styles for sidebar off-screen positioning in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T019 [US5] Enlarge toggle button on mobile (more prominent styling) in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T020 [US5] Update mobile overlay positioning for new layout structure in src/app/containers/default-layout/default-layout.component.scss
- [ ] T021 [US5] Ensure sidebar slide-in animation works with new top offset in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T022 [US5] Verify menu item tap closes sidebar in src/app/containers/default-layout/components/sidebar/sidebar.component.ts

**Checkpoint**: Mobile navigation fully functional with enlarged toggle button.

---

## Phase 7: User Story 6 - Collapsed Sidebar Interaction (Priority: P3)

**Goal**: Desktop users can hover over collapsed sidebar to temporarily expand it

**Independent Test**: Collapse sidebar on desktop. Hover over sidebar, it expands showing full menu items. Move mouse away, it collapses back.

### Implementation for User Story 6

- [ ] T023 [US6] Verify hover-expand behavior works with new positioning in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T024 [US6] Ensure hover-expanded sidebar overlays content (not pushing) in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T025 [US6] Test toggle button click still permanently expands/collapses in src/app/containers/default-layout/components/sidebar/sidebar.component.ts

**Checkpoint**: Collapsed sidebar hover interaction complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: RTL support, final testing, edge cases

- [ ] T026 [P] Add RTL mirroring styles for sidebar (right side) in src/app/containers/default-layout/components/sidebar/sidebar.component.scss
- [ ] T027 [P] Add RTL mirroring styles for header elements in src/app/containers/default-layout/components/header/header.component.scss
- [ ] T028 [P] Add RTL mirroring styles for content area in src/app/containers/default-layout/default-layout.component.scss
- [ ] T029 Test layout with Hebrew language locale
- [ ] T030 Test responsive breakpoint transitions (desktop → tablet → mobile)
- [ ] T031 Verify all animations complete within 300ms
- [ ] T032 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ────────────────────────┐
                                        ▼
Phase 2 (Foundational) ─────────────────┤ BLOCKS ALL USER STORIES
                                        ▼
┌───────────────────────────────────────┴───────────────────────────────────┐
│                                                                           │
│  Phase 3 (US1+US2) ──► Phase 4 (US3) ──► Phase 5 (US4)                   │
│       P1                   P2               P2                            │
│                                                                           │
│                       Phase 6 (US5) ──► Phase 7 (US6)                    │
│                            P2               P3                            │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                                        ▼
                              Phase 8 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1+US2 (P1) | Foundational | Phase 2 complete |
| US3 (P2) | US1+US2 | Phase 3 complete |
| US4 (P2) | US1+US2 | Phase 3 complete |
| US5 (P2) | US1+US2 | Phase 3 complete |
| US6 (P3) | US5 | Phase 6 complete |

### Parallel Opportunities

**Within Phase 2 (Foundational):**
- T002 (header.scss) and T003 (sidebar.scss) can run in parallel [P]

**Within Phase 3 (US1+US2):**
- T007 (dropdown HTML) and T008 (search HTML) can run in parallel [P]

**Within Phase 8 (Polish):**
- T026, T027, T028 (RTL styles) can all run in parallel [P]

---

## Parallel Example: Phase 3 (Header Elements)

```bash
# Launch header element tasks in parallel:
Task: "T007 [P] [US2] Add disabled dropdown menu button to header left side"
Task: "T008 [P] [US2] Add search input field to header center area"
```

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T005)
3. Complete Phase 3: US1+US2 (T006-T012)
4. **STOP and VALIDATE**: Test desktop layout independently
5. Deploy/demo if ready - this is the MVP!

### Incremental Delivery

1. Setup + Foundational → Core layout restructured
2. Add US1+US2 (P1) → Desktop navigation complete → **MVP Ready**
3. Add US3 (P2) → Logo behavior verified
4. Add US4 (P2) → Breadcrumbs relocated
5. Add US5 (P2) → Mobile experience complete
6. Add US6 (P3) → Power user features
7. Add Polish → RTL and edge cases

### Single Developer Strategy

Execute phases sequentially in order (1 → 2 → 3 → 4 → 5 → 6 → 7 → 8).
Use [P] markers within each phase to batch similar file edits.

---

## Task Summary

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|----------|
| 1 - Setup | - | 1 | 0 |
| 2 - Foundational | - | 4 | 0 |
| 3 - US1+US2 | P1 | 7 | 2 |
| 4 - US3 | P2 | 2 | 0 |
| 5 - US4 | P2 | 3 | 0 |
| 6 - US5 | P2 | 5 | 0 |
| 7 - US6 | P3 | 3 | 0 |
| 8 - Polish | - | 7 | 3 |
| **Total** | | **32** | **5** |

---

## Notes

- No unit tests (manual testing per plan.md)
- All CSS changes use @use syntax and CSS variables per constitution
- RTL support is mandatory - test with Hebrew locale
- Animation duration must be ≤300ms
- Commit after each phase or logical task group
