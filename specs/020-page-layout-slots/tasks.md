# Page Layout Slots - Tasks

> **Feature ID:** 020-page-layout-slots
> **Created:** 2026-01-06
> **Updated:** 2026-01-06
> **Spec:** [spec.md](./spec.md)
> **Plan:** [plan.md](./plan.md)

---

## Task Legend

- `[ ]` — Pending
- `[X]` — Completed
- `[P]` — Can be parallelized with other [P] tasks in same phase

---

## Phase 1: Core Infrastructure

### T001: Create page-layout models
- [X] Create `src/app/shared/models/ui/page-layout.model.ts`
- [X] Define `SlotComponent<T>` interface
- [X] Define `SlotZones` interface
- [X] Define `PAGE_SLOTS` const
- [X] Export from `src/app/shared/models/ui/index.ts`
- [X] Export from `src/app/shared/models/index.ts`

### T002: Create PageLayoutService
- [X] Create `src/app/shared/services/ui/page-layout.service.ts`
- [X] Implement `header` signal with `SlotZones` type
- [X] Implement `subheader` signal with `SlotZones` type
- [X] Implement `hasHeader` computed signal
- [X] Implement `hasSubheader` computed signal
- [X] Implement auto-cleanup on NavigationStart
- [X] Implement `clearAll()` method
- [X] Implement mobile filter drawer state (`isFilterDrawerOpen`, `activeFilterCount`)
- [X] Implement event streams:
  - [X] `filterApply$` Subject/Observable
  - [X] `filterClear$` Subject/Observable
  - [X] `emitFilterApply()` method
  - [X] `emitFilterClear()` method
- [X] Export from `src/app/shared/services/ui/index.ts`

---

## Phase 2: Slot Components

### T003: Create os-page-header component [P]
- [X] Create `src/app/shared/components/page-header/` folder
- [X] Create `page-header.component.ts` with:
  - [X] `zones` input (SlotZones)
  - [X] Three zone divs: start, center, end
  - [X] `ngComponentOutlet` for dynamic rendering
- [X] Create `page-header.component.scss`:
  - [X] Sticky positioning
  - [X] Flexbox layout with zones
  - [X] Use design system variables
  - [X] Mobile styles (<768px):
    - [X] Reduced padding
    - [X] Min-height 48px
    - [X] Icon-only buttons (hide labels via CSS class)
    - [X] Min touch target 44px
- [X] Create `index.ts` barrel export
- [X] Export from `src/app/shared/index.ts`

### T004: Create os-page-sub-header component [P]
- [X] Create `src/app/shared/components/page-sub-header/` folder
- [X] Create `page-sub-header.component.ts`:
  - [X] `zones` input (SlotZones)
  - [X] `ngComponentOutlet` for dynamic rendering
- [X] Create `page-sub-header.component.scss`:
  - [X] Sticky positioning with lower z-index
  - [X] Appropriate spacing
  - [X] Desktop: show filter controls
  - [X] Mobile (<768px):
    - [X] Hide full subheader
    - [X] Show mobile-filter-button instead (via CSS media query)
- [X] Create `index.ts` barrel export
- [X] Export from `src/app/shared/index.ts`

### T005: Create os-page-title component [P]
- [X] Create `src/app/shared/components/page-title/` folder
- [X] Create `page-title.component.ts`:
  - [X] `title` input (required)
  - [X] Simple h1 template with styling
  - [X] Mobile: show only current page title (no full breadcrumb)
- [X] Create `index.ts` barrel export
- [X] Export from `src/app/shared/index.ts`

---

## Phase 3: Mobile Components

### T006: Create os-filter-drawer component
- [X] Create `src/app/shared/components/filter-drawer/` folder
- [X] Create `filter-drawer.component.ts`:
  - [X] Inject `PageLayoutService`
  - [X] `isOpen` computed from `layoutService.isFilterDrawerOpen()`
  - [X] `filterComponents` computed from `layoutService.subheader().start`
  - [X] Render filter components via `ngComponentOutlet`
  - [X] Close button calls `layoutService.closeFilterDrawer()`
  - [X] Apply button calls `layoutService.emitFilterApply()`
  - [X] Clear All button calls `layoutService.emitFilterClear()`
- [X] Create `filter-drawer.component.scss`:
  - [X] Slide-in animation from right
  - [X] Backdrop with opacity
  - [X] Header with title and close button
  - [X] Scrollable content area
  - [X] Footer with action buttons
- [X] Create `index.ts` barrel export
- [X] Export from `src/app/shared/index.ts`

### T007: Create os-mobile-filter-button component
- [X] Create `src/app/shared/components/mobile-filter-button/` folder
- [X] Create `mobile-filter-button.component.ts`:
  - [X] Inject PageLayoutService
  - [X] Display active filter count badge from `layoutService.activeFilterCount()`
  - [X] Open filter drawer on click via `layoutService.openFilterDrawer()`
- [X] Create `mobile-filter-button.component.scss`:
  - [X] Button styling with icon
  - [X] Badge for active filter count
  - [X] Touch-friendly size (min 44x44px)
- [X] Create `index.ts` barrel export
- [X] Export from `src/app/shared/index.ts`

---

## Phase 4: Layout Integration

### T008: Update DefaultLayoutComponent template
- [X] Import `PageHeaderComponent`, `PageSubHeaderComponent`
- [X] Import `FilterDrawerComponent`, `MobileFilterButtonComponent`
- [X] Add conditional `os-page-header`:
  - [X] Show when `layoutService.hasHeader()` is true
  - [X] Bind `zones` to `layoutService.header()`
- [X] Add conditional breadcrumb fallback:
  - [X] Show existing breadcrumb when no header set
- [X] Add conditional `os-page-sub-header`:
  - [X] Show when `layoutService.hasSubheader()` is true
  - [X] Component handles desktop/mobile visibility internally
- [X] Add `os-filter-drawer` (always present, visibility controlled internally)

### T009: Update DefaultLayoutComponent class
- [X] Inject `PageLayoutService` as `layoutService`
- [X] Make `layoutService` accessible in template (protected)

### T010: Update DefaultLayoutComponent styles
- [X] Ensure `.layout__content` properly contains sticky elements
- [X] Verify z-index hierarchy doesn't conflict with modals/dropdowns
- [X] Add mobile-specific layout adjustments

---

## Phase 5: Generic Table Updates

### T011: Update generic-table structure
- [X] Wrap table in scroll container div
- [X] Move pagination outside scroll container

### T012: Update generic-table styles
- [X] Add `.generic-table` wrapper with max-height
- [X] Add `.generic-table__scroll-container` with overflow-y: auto
- [X] Add `thead` sticky positioning:
  - [X] `position: sticky; top: 0; z-index: 5`
  - [X] Background color to prevent see-through
- [X] Add `.generic-table__pagination` sticky bottom:
  - [X] `position: sticky; bottom: 0`
  - [X] Border-top separator
  - [X] Background color

### T013: Add CSS variables for table offset
- [X] Add `--table-offset` variable to `:root`
- [X] Use in max-height calculation
- [X] Document how to override per-page if needed

---

## Phase 6: Demo & Verification

### T014: Test with existing pages (no migration)
- [X] Verify Customers page still works (app-header intact)
- [X] Verify Dashboard still works
- [X] Verify detail pages still work
- [X] Verify breadcrumb shows by default

### T015: Create demo using new slot system
- [X] Test header slot renders correctly
- [X] Test subheader slot renders correctly
- [X] Test scroll behavior with table
- [X] Test sticky thead works
- [X] Test sticky pagination works

### T016: Test mobile responsiveness
- [X] Test page-header on 375px viewport
- [X] Test filter button visibility on mobile
- [X] Test filter drawer opens/closes
- [X] Test filter drawer renders components from `subheader.start`
- [X] Test Apply/Clear events reach page component
- [X] Test touch targets are ≥44px

---

## Phase 7: Documentation & Translations

### T017: Add translations
- [X] Add `common.filters` translation key
- [X] Add `common.clearAll` translation key
- [X] Add `common.apply` translation key
- [X] Add to all 4 languages (en, ru, he, ua)

### T018: Update project documentation
- [X] Add usage examples to docs or constitution
- [X] Update project-map.md with new components/service
- [X] Document CSS variables
- [X] Document mobile behavior
- [X] Document event subscription pattern for filter Apply/Clear

---

## Dependencies Graph

```
T001 ──► T002 ──┬──► T008 ──► T014
                │
T003 ───────────┼──► T008
T004 ───────────┤
T005 ───────────┘

T006 ──► T008
T007 ──► T008

T011 ──► T012 ──► T013 ──► T015

T014 ──► T015 ──► T016 ──► T018
T017 ──► T016
```

---

## Parallel Execution

**Can run in parallel:**
- T003, T004, T005 (slot components)
- T006, T007 (mobile components) with T003-T005
- T011, T012 (table updates) with above

**Must be sequential:**
- T001 → T002 (service depends on models)
- T008, T009, T010 → after T002-T007
- T014 → after T008-T010
- T015 → after T011-T013, T014
- T016 → after T015, T017

---

## Estimates Summary

| Phase | Description | Complexity |
|-------|-------------|------------|
| Phase 1 | Models + Service | Low |
| Phase 2 | Slot Components | Medium |
| Phase 3 | Mobile Components | Medium |
| Phase 4 | Layout Integration | Medium |
| Phase 5 | Table Updates | Medium |
| Phase 6 | Testing | Low |
| Phase 7 | Documentation | Low |

**Total tasks:** 18

---

## Notes

- Existing `app-header` component stays untouched
- Full page migration is separate future task
- Backwards compatible: pages opt-in to new system
- Default behavior: breadcrumb shows if no header set
- Mobile: subheader collapses to filter button with drawer
- Filter drawer reads components from `layoutService.subheader().start`
- Pages subscribe to `layoutService.filterApply$` / `filterClear$` for events
