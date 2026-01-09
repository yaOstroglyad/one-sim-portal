# Tasks: Global Account Context

**Input**: Design documents from `/specs/021-global-account-context/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested - manual testing per quickstart.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All paths are absolute from repository root

## Path Conventions

- **Root**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`
- **Shared Services**: `src/app/shared/services/`
- **Shared Components**: `src/app/shared/components/`
- **Shared Models**: `src/app/shared/models/`
- **Views**: `src/app/views/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and directory structure for AccountContext feature

- [ ] T001 [P] Create model interface `AccountContextOptions` in `src/app/shared/models/ui/account-context.model.ts`
- [ ] T002 [P] Create directory structure `src/app/shared/services/account-context/`
- [ ] T003 [P] Create directory structure `src/app/shared/components/account-selector-chip/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service and UI component that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement `AccountContextService` with signal-based state in `src/app/shared/services/account-context/account-context.service.ts`
  - Signals: `accounts`, `selectedAccount`, `isLoading`, `isVisible`, `isRequired`, `selectFirstByDefault`
  - Computed: `selectedAccountId`, `needsAttention`, `hasSelection`, `isEmpty`
  - Methods: `configure()`, `reset()`, `selectAccount()`, `clearSelection()`
  - Admin-only initialization check using `AuthService.hasPermission(ADMIN_PERMISSION)`
  - Load accounts via `AccountsDataService.ownerAccounts()`

- [ ] T005 Create barrel export in `src/app/shared/services/account-context/index.ts`

- [ ] T006 Export `AccountContextService` from `src/app/shared/index.ts` barrel

- [ ] T007 [P] Create `AccountSelectorChipComponent` scaffold in `src/app/shared/components/account-selector-chip/account-selector-chip.component.ts`
  - Standalone component with OnPush
  - Inject `AccountContextService`
  - Use MatSelect for dropdown

- [ ] T008 [P] Create template in `src/app/shared/components/account-selector-chip/account-selector-chip.component.html`
  - Compact chip design with account name
  - Dropdown with account list
  - Loading and empty states

- [ ] T009 [P] Create styles in `src/app/shared/components/account-selector-chip/account-selector-chip.component.scss`
  - Compact chip styling
  - Use CSS variables for colors
  - Include attention indicator animation (pulse effect)

- [ ] T010 Export `AccountSelectorChipComponent` from `src/app/shared/index.ts` barrel

**Checkpoint**: Foundation ready - AccountContextService and AccountSelectorChipComponent exist

---

## Phase 3: User Story 1 - Select Account from Header (Priority: P1) 🎯 MVP

**Goal**: Admin user can select an account from the global header, and the selection is shared across pages

**Independent Test**: Navigate to Reports page, click account selector in header, select an account, verify data loads

### Implementation for User Story 1

- [ ] T011 [US1] Integrate `AccountSelectorChipComponent` into header - modify `src/app/containers/default-layout/components/header/header.component.ts`
  - Import `AccountSelectorChipComponent`
  - Inject `AccountContextService`
  - Add admin check for conditional rendering

- [ ] T012 [US1] Add chip to header template - modify `src/app/containers/default-layout/components/header/header.component.html`
  - Place chip between search bar and theme toggle (in `header__right` zone)
  - Use `@if (accountContext.isVisible())` for conditional rendering

- [ ] T013 [US1] Add header styles for chip positioning in `src/app/containers/default-layout/components/header/header.component.scss`
  - Ensure proper spacing and alignment

**Checkpoint**: Account selector visible in header for admin users on pages that configure it

---

## Phase 4: User Story 5 - Module Migration (Priority: P1)

**Goal**: All 8 existing pages migrated to use global account context

**Independent Test**: Navigate to each page and verify account selection works through header

**Note**: This is P1 because core functionality requires at least one page to use the new system

### Migration Tasks (can be parallelized across different files)

- [ ] T014 [P] [US5] Migrate Reports component - modify `src/app/views/analytics/reports/reports.component.ts`
  - Remove `AccountSelectorComponent` import
  - Inject `AccountContextService`
  - Add `configure({ visible: true, required: true })` in `ngOnInit()`
  - Add `reset()` in `ngOnDestroy()`
  - Use `effect()` to react to account changes
  - Remove local `selectedAccountId` and `onAccountSelected()`

- [ ] T015 [P] [US5] Update Reports template - modify `src/app/views/analytics/reports/reports.component.html`
  - Remove `<app-account-selector>` element

- [ ] T016 [P] [US5] Migrate Dashboard component - modify `src/app/views/analytics/dashboard/dashboard.component.ts`
  - Same pattern as Reports

- [ ] T017 [P] [US5] Update Dashboard template - modify `src/app/views/analytics/dashboard/dashboard.component.html`
  - Remove `<app-account-selector>` element

- [ ] T018 [P] [US5] Migrate Email Logs component - modify `src/app/views/email-logs/email-logs.component.ts`
  - Same pattern as Reports

- [ ] T019 [P] [US5] Update Email Logs template - modify `src/app/views/email-logs/email-logs.component.html`
  - Remove `<app-account-selector>` element

- [ ] T020 [P] [US5] Migrate Ticket List component - modify `src/app/views/tickets/components/tickets/ticket-list/ticket-list.component.ts`
  - Same pattern as Reports

- [ ] T021 [P] [US5] Update Ticket List template - modify `src/app/views/tickets/components/tickets/ticket-list/ticket-list.component.html`
  - Remove `<app-account-selector>` element

- [ ] T022 [P] [US5] Migrate Company Product List component - modify `src/app/views/product-constructor/components/company-products/company-product-list/company-product-list.component.ts`
  - Same pattern as Reports

- [ ] T023 [P] [US5] Update Company Product List template - modify `src/app/views/product-constructor/components/company-products/company-product-list/company-product-list.component.html`
  - Remove `<app-account-selector>` element

- [ ] T024 [P] [US5] Migrate Email Configurations component - modify `src/app/views/settings/email-configurations/email-configurations.component.ts`
  - Same pattern as Reports

- [ ] T025 [P] [US5] Update Email Configurations template - modify `src/app/views/settings/email-configurations/email-configurations.component.html`
  - Remove `<app-account-selector>` element

- [ ] T026 [P] [US5] Migrate Payment Gateway Table component - modify `src/app/views/settings/payment-gateway-table/payment-gateway-table.component.ts`
  - Same pattern as Reports

- [ ] T027 [P] [US5] Update Payment Gateway Table template - modify `src/app/views/settings/payment-gateway-table/payment-gateway-table.component.html`
  - Remove `<app-account-selector>` element

- [ ] T028 [P] [US5] Migrate Invoicing Gateway component - modify `src/app/views/settings/invoicing-gateway/invoicing-gateway.component.ts`
  - Same pattern as Reports

- [ ] T029 [P] [US5] Update Invoicing Gateway template - modify `src/app/views/settings/invoicing-gateway/invoicing-gateway.component.html`
  - Remove `<app-account-selector>` element

**Checkpoint**: All 8 pages use global account context, no duplicate selectors

---

## Phase 5: User Story 2 - Visual Attention Indicator (Priority: P2)

**Goal**: Account selector shows visual attention indicator when selection is required but missing

**Independent Test**: Navigate to Reports without account selected, verify primary border and pulse animation

### Implementation for User Story 2

- [ ] T030 [US2] Add `needsAttention` computed signal logic to `AccountContextService` in `src/app/shared/services/account-context/account-context.service.ts`
  - `needsAttention = computed(() => this.isVisible() && this.isRequired() && !this.selectedAccount())`

- [ ] T031 [US2] Add attention indicator styles to chip component in `src/app/shared/components/account-selector-chip/account-selector-chip.component.scss`
  - `.os-account-chip--attention` class with primary color border
  - `@keyframes attention-pulse` animation
  - Use `var(--os-color-primary)` for border color

- [ ] T032 [US2] Bind attention class in chip template in `src/app/shared/components/account-selector-chip/account-selector-chip.component.html`
  - `[class.os-account-chip--attention]="accountContext.needsAttention()"`

**Checkpoint**: Attention indicator visible when required but no selection

---

## Phase 6: User Story 3 - Persist Account Selection (Priority: P2)

**Goal**: Selected account is persisted to localStorage and restored on page load

**Independent Test**: Select account, refresh page, verify same account is selected

### Implementation for User Story 3

- [ ] T033 [US3] Add localStorage persistence to `AccountContextService` in `src/app/shared/services/account-context/account-context.service.ts`
  - Add `STORAGE_KEY = 'os_account_context_selected_id'`
  - Add `saveToStorage()` method - called on `selectAccount()`
  - Add `restoreFromStorage()` method - called on init after accounts load
  - Add `clearStorage()` method - called on logout

- [ ] T034 [US3] Add validation for persisted account ID in `src/app/shared/services/account-context/account-context.service.ts`
  - In `restoreFromStorage()`, verify persisted ID exists in current accounts list
  - If not found, clear storage and show attention indicator (if required)

- [ ] T035 [US3] Add logout cleanup - ensure storage is cleared when user logs out
  - Subscribe to AuthService logout event or hook into `clearAndLogout()`
  - Clear selection and storage on logout

**Checkpoint**: Selection persists across page refresh and browser sessions

---

## Phase 7: User Story 4 - Auto-Select First Account (Priority: P3)

**Goal**: Modules can optionally auto-select the first account if no prior selection exists

**Independent Test**: Configure a module with `selectFirstByDefault: true`, navigate with no prior selection, verify first account selected

### Implementation for User Story 4

- [ ] T036 [US4] Add auto-select logic to `configure()` method in `src/app/shared/services/account-context/account-context.service.ts`
  - If `selectFirstByDefault` is true AND no persisted selection AND accounts available
  - Automatically select first account in list
  - Persisted selection always takes priority

- [ ] T037 [US4] Update one page to test auto-select (optional) - can modify any of the 8 migrated pages
  - Example: `{ visible: true, required: false, selectFirstByDefault: true }`

**Checkpoint**: Auto-select works when configured, persisted selection has priority

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, edge cases, documentation

- [ ] T038 [P] Handle edge case: no accounts available - show disabled state in chip
- [ ] T039 [P] Handle edge case: accounts loading - show loading indicator in chip
- [ ] T040 [P] Handle edge case: non-admin user - ensure selector never renders
- [ ] T041 Update translations for account selector labels in `src/assets/i18n/en.json`, `he.json`, `ru.json`, `ua.json`
- [ ] T042 Manual testing per quickstart.md validation scenarios
- [ ] T043 Code review and cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US5 Migration)**: Depends on Phase 2, can run parallel with Phase 3
- **Phase 5 (US2)**: Depends on Phase 2, can run after Phase 3
- **Phase 6 (US3)**: Depends on Phase 2, can run parallel with Phase 5
- **Phase 7 (US4)**: Depends on Phase 6 (needs persistence)
- **Phase 8 (Polish)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Header Integration) | Phase 2 | - |
| US5 (Migration) | Phase 2 | US1 |
| US2 (Attention) | Phase 2 | US5 |
| US3 (Persistence) | Phase 2 | US2 |
| US4 (Auto-select) | US3 | - |

### Parallel Opportunities

**Phase 1** (all parallel):
- T001, T002, T003

**Phase 2** (models and UI parallel):
- T007, T008, T009

**Phase 4 - Migration** (all 8 pages parallel):
- T014-T029 can ALL run in parallel (different files)

**Phase 5-7** (independent stories):
- US2, US3 can run in parallel after Phase 2

---

## Parallel Example: Module Migration (Phase 4)

```bash
# All 8 page migrations can run simultaneously:
Task: "Migrate Reports" (T014, T015)
Task: "Migrate Dashboard" (T016, T017)
Task: "Migrate Email Logs" (T018, T019)
Task: "Migrate Ticket List" (T020, T021)
Task: "Migrate Company Product List" (T022, T023)
Task: "Migrate Email Configurations" (T024, T025)
Task: "Migrate Payment Gateway Table" (T026, T027)
Task: "Migrate Invoicing Gateway" (T028, T029)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 1 Migration)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010)
3. Complete Phase 3: US1 Header Integration (T011-T013)
4. Migrate ONE page (e.g., Reports T014-T015)
5. **STOP and VALIDATE**: Test account selection in header on Reports page
6. Demo/deploy MVP

### Incremental Delivery

1. MVP: Setup + Foundation + US1 + 1 migration → Test
2. Add remaining 7 migrations → Test all 8 pages
3. Add US2 (Attention) → Test visual indicator
4. Add US3 (Persistence) → Test refresh behavior
5. Add US4 (Auto-select) → Test auto-select
6. Polish phase → Final validation

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundation together
2. Once Foundation is done:
   - Dev A: US1 (Header) + 4 migrations
   - Dev B: 4 migrations + US2 (Attention)
   - Dev C: US3 (Persistence) + US4 (Auto-select)
3. Merge and integrate

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- All 8 migration tasks are independent and parallelizable
- Constitution compliance: standalone, OnPush, inject(), signals, CSS variables
- No tests requested - manual validation per quickstart.md
