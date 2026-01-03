# Tasks: SCSS Architecture Refactor

**Input**: Design documents from `/specs/018-scss-refactor/`
**Prerequisites**: plan.md (required), spec.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Level 1 Abstract Bases (Foundational)

**Purpose**: Create the foundation mixins that all Level 2 mixins will inherit from

**⚠️ CRITICAL**: No Level 2 refactoring can begin until this phase is complete

- [ ] T001 [US1] Create `os-surface-base($bg, $border, $radius)` mixin in `src/scss/_mixins.scss`
- [ ] T002 [US1] Create `os-interactive-base($transition)` mixin in `src/scss/_mixins.scss`
- [ ] T003 [US1] Create `os-feedback-base($color-var)` mixin in `src/scss/_mixins.scss`
- [ ] T004 [US2] Add JSDoc documentation for all Level 1 mixins

**Checkpoint**: Level 1 bases ready for Level 2 inheritance

---

## Phase 2: Level 2 Specialized Mixins (Priority: P1)

**Purpose**: Refactor existing mixins to use Level 1 bases + add missing mixins

### Batch 2.1: Surface-based Mixins

- [ ] T005 [US1] Refactor `os-input-base` to use `os-surface-base` in `src/scss/_mixins.scss`
- [ ] T006 [US1] Refactor `os-dropdown-base` to use `os-surface-base` in `src/scss/_mixins.scss`
- [ ] T007 [US1] Refactor `os-card-base` to use `os-surface-base` in `src/scss/_mixins.scss`
- [ ] T008 [US1] Create `os-panel-base` using `os-surface-base` in `src/scss/_mixins.scss`
- [ ] T009 [US1] Create `os-overlay-base` using `os-surface-base` in `src/scss/_mixins.scss`
- [ ] T010 [US1] Create `os-table-base` using `os-surface-base` in `src/scss/_mixins.scss`

### Batch 2.2: Interactive-based Mixins

- [ ] T011 [US1] Create `os-button-base` using `os-surface-base` + `os-interactive-base`
- [ ] T012 [US1] Refactor `os-option-item` → rename to `os-list-item-base`, use `os-interactive-base`
- [ ] T013 [US1] Refactor `os-nav-button` → rename to `os-icon-button-base`, use `os-interactive-base`
- [ ] T014 [US1] Create `os-table-sortable-base` using `os-interactive-base`

### Batch 2.3: Table Sub-component Mixins (Level 3)

- [ ] T015 [US1] Create `os-table-header-base` inheriting from `os-table-base`
- [ ] T016 [US1] Create `os-table-row-base` inheriting from `os-table-base`
- [ ] T017 [US1] Create `os-table-cell-base` inheriting from `os-table-base`
- [ ] T018 [US1] Create `os-table-actions-base` inheriting from `os-table-base`

### Batch 2.4: Feedback-based Mixins

- [ ] T019 [US1] Create `os-spinner-base` using `os-feedback-base` in `src/scss/_mixins.scss`
- [ ] T020 [US1] Create `os-alert-base` using `os-feedback-base` in `src/scss/_mixins.scss`
- [ ] T021 [US1] Create `os-badge-base` using `os-feedback-base` in `src/scss/_mixins.scss`

### Batch 2.5: Consolidation & Cleanup

- [ ] T022 [US2] Consolidate `os-btn-outline-primary`, `os-btn-outline-secondary` → use `os-button-base`
- [ ] T023 [US2] Review `dashboard-*` mixins - consolidate or keep as-is
- [ ] T024 [US2] Remove deprecated/unused mixins
- [ ] T025 [US2] Add JSDoc documentation for all Level 2 & Level 3 mixins

**Checkpoint**: All mixins follow hierarchy, no duplicates

---

## Phase 3: US1 - Shared Components Migration

**Goal**: Update shared components to use new mixin hierarchy

**Independent Test**: Each component renders identically in light/dark themes

### Batch 3.1: Input Components

- [ ] T026 [P] [US1] Migrate `src/app/shared/components/searchable-select/searchable-select.component.scss`
- [ ] T027 [P] [US1] Migrate `src/app/shared/components/datepicker/datepicker.component.scss`
- [ ] T028 [P] [US1] Migrate `src/app/shared/components/form-inputs/file-upload/file-upload.component.scss`
- [ ] T029 [P] [US1] Migrate `src/app/shared/components/form-inputs/multiselect-grid/multiselect-grid.component.scss`
- [ ] T030 [P] [US1] Migrate `src/app/shared/components/form-inputs/rich-text-input/rich-text-input.component.scss`

### Batch 3.2: Card & Panel Components

- [ ] T031 [P] [US1] Migrate `src/app/shared/components/card/card.component.scss`
- [ ] T032 [P] [US1] Migrate `src/app/shared/components/card/metric-card.component.scss`
- [ ] T033 [P] [US1] Migrate `src/app/shared/components/detail-row/detail-row.component.scss`
- [ ] T034 [P] [US1] Migrate `src/app/shared/components/generic-right-panel/generic-right-panel.component.scss`

### Batch 3.3: Dropdown & Menu Components

- [ ] T035 [P] [US1] Migrate `src/app/shared/components/ui/os-dropdown/os-dropdown.component.scss`
- [ ] T036 [P] [US1] Migrate `src/app/shared/components/ui/os-menu/os-menu.component.scss`
- [ ] T037 [P] [US1] Migrate `src/app/shared/components/account-selector/account-selector.component.scss`
- [ ] T038 [P] [US1] Migrate `src/app/shared/components/column-control/column-control.component.scss`

### Batch 3.4: Table & List Components

- [ ] T039 [P] [US1] Migrate `src/app/shared/components/generic-table/generic-table.component.scss` (use table mixins)
- [ ] T040 [P] [US1] Migrate `src/app/shared/components/pagination/pagination.component.scss`
- [ ] T041 [P] [US1] Migrate `src/app/shared/components/timeline/timeline.component.scss`

### Batch 3.5: Dialog & Overlay Components

- [ ] T042 [P] [US1] Migrate `src/app/shared/components/generic-dialog/generic-dialog.component.scss`
- [ ] T043 [P] [US1] Migrate `src/app/shared/components/html-dialog/html-dialog.component.scss`
- [ ] T044 [P] [US1] Migrate `src/app/shared/components/empty-state/empty-state.component.scss`

### Batch 3.6: Other Shared Components

- [ ] T045 [P] [US1] Migrate `src/app/shared/components/breadcrumb/breadcrumb.component.scss`
- [ ] T046 [P] [US1] Migrate `src/app/shared/components/smart-filter-header/smart-filter-header.component.scss`
- [ ] T047 [P] [US1] Migrate `src/app/shared/components/period-selector/period-selector.component.scss`
- [ ] T048 [P] [US1] Migrate `src/app/shared/components/attachments/attachments.component.scss`
- [ ] T049 [P] [US1] Migrate `src/app/shared/components/comments/comments.component.scss`
- [ ] T050 [P] [US1] Migrate `src/app/shared/components/chart-legend/chart-legend.component.scss`
- [ ] T051 [P] [US1] Migrate `src/app/shared/components/refund-product/refund-product.component.scss`

**Checkpoint**: All shared components use mixin hierarchy

---

## Phase 4: US1 - View Components Migration

**Goal**: Update view-specific SCSS files

### Batch 4.1: Settings Views

- [ ] T052 [P] [US1] Migrate `src/app/views/settings/settings.component.scss`
- [ ] T053 [P] [US1] Migrate `src/app/views/settings/email-configurations/email-configurations.component.scss`
- [ ] T054 [P] [US1] Migrate `src/app/views/settings/email-configurations/components/create-domain/create-domain.component.scss`
- [ ] T055 [P] [US1] Migrate `src/app/views/settings/invoicing-gateway/invoicing-gateway.component.scss`
- [ ] T056 [P] [US1] Migrate `src/app/views/settings/payment-gateway/payment-gateway-table.component.scss` (use table mixins)

### Batch 4.2: Analytics Views

- [ ] T057 [P] [US1] Migrate `src/app/views/analytics/dashboard/dashboard.component.scss`
- [ ] T058 [P] [US1] Migrate `src/app/views/analytics/dashboard/tabs/executive/executive-tab.component.scss`
- [ ] T059 [P] [US1] Migrate `src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.scss`
- [ ] T060 [P] [US1] Migrate `src/app/views/analytics/reports/reports.component.scss`

### Batch 4.3: Product Constructor Views

- [ ] T061 [P] [US1] Migrate `src/app/views/product-constructor/components/bundles/bundle-details/bundle-details.component.scss`
- [ ] T062 [P] [US1] Migrate `src/app/views/product-constructor/components/bundles/bundle-list/bundle-list.component.scss` (use table mixins)
- [ ] T063 [P] [US1] Migrate `src/app/views/product-constructor/components/overview/overview.component.scss`
- [ ] T064 [P] [US1] Migrate `src/app/views/product-constructor/components/regions/region-list/region-list.component.scss` (use table mixins)
- [ ] T065 [P] [US1] Migrate `src/app/views/product-constructor/create-product/create-product.component.scss`

### Batch 4.4: Customer & Company Views

- [ ] T066 [P] [US1] Migrate `src/app/views/companies/edit-company/edit-company.component.scss`
- [ ] T067 [P] [US1] Migrate `src/app/views/customers/edit-customer/edit-customer.component.scss`
- [ ] T068 [P] [US1] Migrate `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.scss`

### Batch 4.5: Feature Components

- [ ] T069 [P] [US1] Migrate `src/app/features/support-chat/support-chat.shell.component.scss`
- [ ] T070 [P] [US1] Migrate `src/app/shared/components/fab-layout/components/flyout-layout/flyout-layout.component.scss`
- [ ] T071 [P] [US1] Migrate `src/app/shared/components/fab-layout/components/global-fab/global-fab.component.scss`

**Checkpoint**: All view components use mixin hierarchy

---

## Phase 5: US3 - Update Constitution

**Goal**: Document SCSS rules for future development

- [ ] T072 [US3] Add SCSS section to `.specify/memory/constitution.md`
- [ ] T073 [US3] Document mixin hierarchy (Level 1 → Level 2 → Level 3)
- [ ] T074 [US3] Document CSS variable usage (`--layout-*` vs `--os-color-*`)
- [ ] T075 [US3] Document clean code rules (nesting, tokens, no @extend)
- [ ] T076 [US3] Add examples of correct mixin usage (including tables)

**Checkpoint**: constitution.md has complete SCSS guidelines

---

## Phase 6: US4 - Clean Code Verification

**Goal**: Ensure all code follows clean code principles

- [ ] T077 [US4] Verify max nesting ≤ 4 levels in all SCSS files
- [ ] T078 [US4] Verify no hardcoded colors remain
- [ ] T079 [US4] Verify design tokens used for spacing/sizing
- [ ] T080 [US4] Verify no `@extend` usage (only `@include`)

**Checkpoint**: All SCSS follows clean code principles

---

## Phase 7: Final Verification

**Purpose**: Comprehensive testing and cleanup

- [ ] T081 Verify all components in light theme
- [ ] T082 Verify all components in dark theme
- [ ] T083 Run `ng build` and verify CSS bundle size
- [ ] T084 Clean up any unused mixins or variables
- [ ] T085 Update `docs/dark-theme-fixes-2026-01-03.md` with refactor summary

---

## Dependencies & Execution Order

```
Phase 1 (Level 1 Bases)
    ↓
Phase 2 (Level 2 Mixins) ──────────────────────┐
    ↓                                           │
Phase 3 (Shared Components) ←──────────────────┤
    ↓                                           │
Phase 4 (View Components) ←────────────────────┘
    ↓
Phase 5 (Constitution) ← can start after Phase 2
    ↓
Phase 6 (Clean Code Verification)
    ↓
Phase 7 (Final Verification)
```

### Parallel Opportunities

- Phase 3 and Phase 4 can run in parallel after Phase 2
- All tasks marked [P] within a batch can run in parallel
- Phase 5 can start as soon as Phase 2 is complete

---

## Notes

- Always test component in both themes after migration
- Commit after each batch for easy rollback
- Keep visual appearance identical - this is a refactor, not redesign
- If a component has unique styling, document why mixin wasn't used
- Prefer Level 2 mixins over Level 1 for standard patterns
