# Tasks: Public API Documentation

**Input**: Design documents from `/specs/023-public-api-docs/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not requested - no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, all source paths are under `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, routing, models, base styles

- [x] T001 Install npm dependencies: `npm install marked highlight.js && npm install -D @types/marked`
- [x] T002 [P] Create docs models in `src/app/views/docs/models/docs.model.ts` with all interfaces from data-model.md
- [x] T003 [P] Create barrel export in `src/app/views/docs/models/index.ts`
- [x] T004 [P] Create docs theme variables in `src/scss/_docs-theme.scss`
- [x] T005 Import docs theme in `src/scss/styles.scss`
- [x] T006 Add public `/docs` route in `src/main.ts` without AuthGuardService

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and layout that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create mock documentation data in `src/app/views/docs/services/mock-docs.data.ts`
- [x] T008 Create DocsDataService in `src/app/views/docs/services/docs-data.service.ts`
- [x] T009 Create DocsLayoutComponent shell in `src/app/views/docs/docs-layout/docs-layout.component.ts`
- [x] T010 [P] Create DocsLayoutComponent template in `src/app/views/docs/docs-layout/docs-layout.component.html`
- [x] T011 [P] Create DocsLayoutComponent styles in `src/app/views/docs/docs-layout/docs-layout.component.scss`
- [x] T012 Create docs routes in `src/app/views/docs/docs.routes.ts`

**Checkpoint**: Foundation ready - user stories can now begin

---

## Phase 3: User Story 1 - View API Documentation (Priority: P1) MVP

**Goal**: Developer can navigate to `/docs` and see formatted documentation with syntax-highlighted code blocks

**Independent Test**: Navigate to `/docs`, verify Markdown renders correctly with headings, lists, code blocks, tables

### Implementation for User Story 1

- [x] T013 [US1] Create Markdown rendering utility in `src/app/views/docs/utils/markdown.util.ts` (configure marked + highlight.js)
- [x] T014 [P] [US1] Create DocsContentComponent in `src/app/views/docs/components/docs-content/docs-content.component.ts`
- [x] T015 [P] [US1] Create DocsContentComponent template in `src/app/views/docs/components/docs-content/docs-content.component.html`
- [x] T016 [P] [US1] Create DocsContentComponent styles in `src/app/views/docs/components/docs-content/docs-content.component.scss`
- [x] T017 [US1] Create loading skeleton component in `src/app/views/docs/components/docs-loading/docs-loading.component.ts`
- [x] T018 [US1] Create error state component in `src/app/views/docs/components/docs-error/docs-error.component.ts`
- [x] T019 [US1] Integrate DocsContentComponent into DocsLayoutComponent template
- [x] T020 [US1] Add loading and error states to DocsLayoutComponent

**Checkpoint**: User Story 1 complete - documentation renders with formatting and syntax highlighting

---

## Phase 4: User Story 2 - Search Documentation (Priority: P2)

**Goal**: Developer can press Cmd+K to search documentation and navigate to results

**Independent Test**: Press Cmd+K, type "balance", click result, verify navigation to section

### Implementation for User Story 2

- [x] T021 [US2] Create DocsSearchProvider in `src/app/views/docs/services/docs-search.provider.ts` implementing SearchProvider interface
- [x] T022 [US2] Implement search index building from documentation sections in DocsSearchProvider
- [x] T023 [US2] Implement fuzzy search over documentation content in DocsSearchProvider
- [x] T024 [P] [US2] Create DocsHeaderComponent in `src/app/views/docs/components/docs-header/docs-header.component.ts`
- [x] T025 [P] [US2] Create DocsHeaderComponent template in `src/app/views/docs/components/docs-header/docs-header.component.html`
- [x] T026 [P] [US2] Create DocsHeaderComponent styles in `src/app/views/docs/components/docs-header/docs-header.component.scss`
- [x] T027 [US2] Configure component-level providers in DocsLayoutComponent for DocsSearchProvider
- [x] T028 [US2] Add CommandPaletteComponent to DocsLayoutComponent imports
- [x] T029 [US2] Wire up keyboard shortcut (Cmd+K) to open search in docs context

**Checkpoint**: User Story 2 complete - search finds documentation sections and navigates correctly

---

## Phase 5: User Story 3 - Navigate via Table of Contents (Priority: P3)

**Goal**: Developer can browse documentation structure via sidebar and TOC, with active section highlighting

**Independent Test**: Click sidebar items, verify scroll to section; scroll page, verify TOC highlights active section

### Implementation for User Story 3

- [x] T030 [US3] Create TOC extraction utility in `src/app/views/docs/utils/toc.util.ts` (parse headings from Markdown)
- [x] T031 [P] [US3] Create DocsSidebarComponent in `src/app/views/docs/components/docs-sidebar/docs-sidebar.component.ts`
- [x] T032 [P] [US3] Create DocsSidebarComponent template in `src/app/views/docs/components/docs-sidebar/docs-sidebar.component.html`
- [x] T033 [P] [US3] Create DocsSidebarComponent styles in `src/app/views/docs/components/docs-sidebar/docs-sidebar.component.scss`
- [x] T034 [P] [US3] Create DocsTocComponent in `src/app/views/docs/components/docs-toc/docs-toc.component.ts`
- [x] T035 [P] [US3] Create DocsTocComponent template in `src/app/views/docs/components/docs-toc/docs-toc.component.html`
- [x] T036 [P] [US3] Create DocsTocComponent styles in `src/app/views/docs/components/docs-toc/docs-toc.component.scss`
- [x] T037 [US3] Implement IntersectionObserver for active section tracking in DocsTocComponent
- [x] T038 [US3] Add smooth scroll behavior for TOC link clicks
- [x] T039 [US3] Integrate DocsSidebarComponent and DocsTocComponent into DocsLayoutComponent

**Checkpoint**: User Story 3 complete - sidebar navigation and TOC work with active highlighting

---

## Phase 6: User Story 4 - Copy Code Examples (Priority: P4)

**Goal**: Developer can copy code snippets with a single click

**Independent Test**: Hover code block, click Copy button, verify clipboard contains code

### Implementation for User Story 4

- [x] T040 [P] [US4] Create CodeBlockComponent in `src/app/views/docs/components/code-block/code-block.component.ts`
- [x] T041 [P] [US4] Create CodeBlockComponent template in `src/app/views/docs/components/code-block/code-block.component.html`
- [x] T042 [P] [US4] Create CodeBlockComponent styles in `src/app/views/docs/components/code-block/code-block.component.scss`
- [x] T043 [US4] Implement clipboard copy with Clipboard API + fallback in CodeBlockComponent
- [x] T044 [US4] Add copy success/error feedback via NotificationService
- [x] T045 [US4] Update Markdown renderer to use CodeBlockComponent for code blocks

**Checkpoint**: User Story 4 complete - code blocks have copy button with visual feedback

---

## Phase 7: User Story 5 - Switch Theme (Priority: P5)

**Goal**: Developer can toggle between light and dark themes

**Independent Test**: Click theme toggle, verify all elements update (background, text, code highlighting)

### Implementation for User Story 5

- [x] T046 [US5] Create DocsThemeService in `src/app/views/docs/services/docs-theme.service.ts`
- [x] T047 [US5] Implement theme persistence to localStorage in DocsThemeService
- [x] T048 [US5] Add theme toggle button to DocsHeaderComponent
- [x] T049 [US5] Add dark theme CSS variables to `src/scss/_docs-theme.scss`
- [x] T050 [US5] Import highlight.js dark theme CSS conditionally
- [x] T051 [US5] Apply theme class to docs layout container

**Checkpoint**: User Story 5 complete - theme toggle works with instant switching

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, mobile responsiveness, deep linking

- [x] T052 [P] Implement deep linking via URL fragments in DocsContentComponent
- [x] T053 [P] Add mobile responsive styles to DocsLayoutComponent (hide TOC on mobile)
- [x] T054 [P] Handle invalid section links (show "section not found" message)
- [x] T055 [P] Add translations for docs UI strings in `src/assets/i18n/en.json`
- [x] T056 Update barrel exports in `src/app/views/docs/` for all components and services
- [ ] T057 Manual testing: verify all acceptance scenarios from spec.md

**Note**: Build fix applied - updated `tsconfig.app.json` to include `src/**/*.ts` with exclude pattern for test files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (View Docs) | Foundational | None (start first) |
| US2 (Search) | US1 (needs content to search) | US3, US4, US5 |
| US3 (Navigation) | US1 (needs sections) | US2, US4, US5 |
| US4 (Copy Code) | US1 (needs code blocks) | US2, US3, US5 |
| US5 (Theme) | Foundational | US2, US3, US4 |

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002 [P] + T003 [P] + T004 [P] can run together (different files)
```

**Phase 2 (Foundational)**:
```
T010 [P] + T011 [P] can run together (template + styles)
```

**Phase 3 (US1)**:
```
T014 [P] + T015 [P] + T016 [P] can run together (component files)
```

**Phase 5 (US3)**:
```
T031-T036 [P] can run together (sidebar + TOC components)
```

**Phase 6 (US4)**:
```
T040 [P] + T041 [P] + T042 [P] can run together (code-block component files)
```

**Phase 8 (Polish)**:
```
T052 [P] + T053 [P] + T054 [P] + T055 [P] can run together (independent concerns)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012)
3. Complete Phase 3: User Story 1 (T013-T020)
4. **STOP and VALIDATE**: Navigate to `/docs`, verify documentation renders
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Documentation viewable (MVP!)
3. Add User Story 2 → Search working
4. Add User Story 3 → Navigation complete
5. Add User Story 4 → Copy functionality
6. Add User Story 5 → Theme support
7. Polish → Production ready

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 57 |
| **Phase 1 (Setup)** | 6 tasks |
| **Phase 2 (Foundational)** | 6 tasks |
| **US1 (View Docs)** | 8 tasks |
| **US2 (Search)** | 9 tasks |
| **US3 (Navigation)** | 10 tasks |
| **US4 (Copy Code)** | 6 tasks |
| **US5 (Theme)** | 6 tasks |
| **Phase 8 (Polish)** | 6 tasks |
| **Parallel Opportunities** | 22 tasks marked [P] |
| **MVP Scope** | T001-T020 (20 tasks) |

---

## Notes

- All components use `standalone: true`, OnPush, `inject()` per constitution
- All selectors use `os-docs-*` prefix
- CSS uses existing `--layout-*` and `--os-color-*` variables
- DocsSearchProvider implements existing SearchProvider interface
- Mock data used initially; API integration is a future task
