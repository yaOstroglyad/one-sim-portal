# Feature Specification: Global Account Context

**Feature Branch**: `021-global-account-context`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Move account selector to global header with signal-based state management, module-level configuration, and visual attention indicator"

## Clarifications

### Session 2026-01-08

- Q: Should account selector be active for all users or only admins? → A: Admin-only. The entire account context system (service, UI component, persistence) is only initialized and active when an admin user is logged in. Non-admin users never see the selector and the context service remains dormant.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Account from Header (Priority: P1)

An admin user navigates to a module that requires account selection (e.g., Reports, Dashboard). They see a compact account selector in the global header. They click on it, see a dropdown with available accounts, select one, and the module immediately loads data for that account.

**Why this priority**: This is the core functionality - without it, the feature has no value. Every other story depends on this working.

**Independent Test**: Can be fully tested by navigating to Reports page, clicking account selector in header, selecting an account, and verifying the report data loads for that account.

**Acceptance Scenarios**:

1. **Given** admin user is on Reports page and no account is selected, **When** user clicks account selector in header and selects "Quantum Soft", **Then** the selector shows "Quantum Soft" and Reports loads data for that account
2. **Given** admin user has selected "Quantum Soft" account, **When** user navigates to Dashboard, **Then** the same account remains selected and Dashboard uses it
3. **Given** admin user is on a page that doesn't require account selection (e.g., Settings), **When** user views the header, **Then** the account selector is not visible
4. **Given** non-admin user logs in, **When** user navigates to any page, **Then** the account selector is never shown and account context is not initialized

---

### User Story 2 - Visual Attention for Required Selection (Priority: P2)

When a user navigates to a module that requires account selection but no account is currently selected, the account selector in the header displays a visual indicator (primary color border with subtle animation) to draw attention and guide the user to select an account before working with the module.

**Why this priority**: Improves user experience by clearly indicating when action is needed, reducing confusion about why data isn't loading.

**Independent Test**: Navigate to Reports page without any account selected and verify the account selector has a highlighted border effect that draws attention.

**Acceptance Scenarios**:

1. **Given** no account is selected, **When** user navigates to Reports page, **Then** the account selector displays with primary color border and subtle pulse effect
2. **Given** account selector is showing attention indicator, **When** user selects an account, **Then** the attention indicator disappears and selector shows normal state
3. **Given** user has already selected an account, **When** user navigates to a page requiring account selection, **Then** no attention indicator is shown (account already selected)

---

### User Story 3 - Persist Account Selection (Priority: P2)

When a user selects an account, that selection is remembered across page refreshes and browser sessions. When the user returns to the application, their previously selected account is automatically restored.

**Why this priority**: Improves workflow efficiency by not requiring repeated account selection, especially for users who typically work with a single account.

**Independent Test**: Select an account, close browser, reopen application, and verify the same account is pre-selected.

**Acceptance Scenarios**:

1. **Given** user selects "Quantum Soft" account, **When** user refreshes the page, **Then** "Quantum Soft" remains selected
2. **Given** user selects "Quantum Soft" account and closes browser, **When** user opens application in new session, **Then** "Quantum Soft" is automatically selected
3. **Given** user clears selection (if applicable), **When** user refreshes page, **Then** no account is pre-selected

---

### User Story 4 - Auto-Select First Account (Priority: P3)

For certain modules where it makes sense, the system can be configured to automatically select the first available account if no account was previously selected. This reduces friction for users who only have access to one account or where a default makes sense.

**Why this priority**: Nice-to-have optimization that reduces clicks for specific use cases, but core functionality works without it.

**Independent Test**: Configure a module to auto-select first account, navigate to it with no prior selection, and verify first account is automatically selected.

**Acceptance Scenarios**:

1. **Given** no account is previously selected and module is configured with auto-select, **When** user navigates to that module, **Then** the first account in the list is automatically selected
2. **Given** user previously selected "Account B" and module is configured with auto-select, **When** user navigates to that module, **Then** "Account B" remains selected (persisted selection takes priority)
3. **Given** module is NOT configured with auto-select, **When** user navigates with no prior selection, **Then** no account is selected and attention indicator is shown

---

### User Story 5 - Module Migration (Priority: P1)

All existing pages that currently use the local AccountSelectorComponent are migrated to use the global account context. The local selector is removed from page templates, and pages react to account changes from the global context.

**Why this priority**: Without migration, the feature isn't complete - we'd have duplicate selectors or broken pages.

**Independent Test**: Navigate to each migrated page (Reports, Dashboard, Tickets, etc.) and verify account selection works through the global header selector.

**Acceptance Scenarios**:

1. **Given** user is on Reports page, **When** user changes account in header, **Then** Reports reloads data for new account
2. **Given** user is on Dashboard page, **When** user changes account in header, **Then** Dashboard reloads data for new account
3. **Given** user navigates between migrated pages, **When** account is selected, **Then** all pages use the same selected account from global context

---

### Edge Cases

- What happens when a non-admin user logs in?
  - Account context system is not initialized at all; selector is never rendered; no API calls for accounts are made
- What happens when the persisted account ID no longer exists (account was deleted)?
  - System clears the invalid selection and shows attention indicator if on a page requiring selection
- What happens when user has no accounts available?
  - Account selector shows "No accounts available" state, is disabled
- What happens when accounts list is loading?
  - Account selector shows loading indicator
- What happens when user logs out and logs back in as different user?
  - Persisted selection is cleared on logout to prevent cross-user data leakage
- What happens on pages that don't require account selection?
  - Account selector is completely hidden from header

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize account context (service, UI, persistence) ONLY when an admin user is logged in; for non-admin users, the system remains completely dormant
- **FR-002**: System MUST display a compact account selector component in the global header (admin only)
- **FR-003**: System MUST show the account selector only on pages that are configured to require it
- **FR-004**: System MUST allow pages to configure whether account selection is required (shows attention indicator) or optional
- **FR-005**: System MUST display a visual attention indicator (primary color border) when account selection is required but no account is selected
- **FR-006**: System MUST persist the selected account ID to local storage
- **FR-007**: System MUST restore the persisted account selection when the application loads
- **FR-008**: System MUST validate that persisted account ID still exists in the accounts list before restoring
- **FR-009**: System MUST allow pages to configure auto-selection of the first account when no prior selection exists
- **FR-010**: System MUST emit account selection changes to all subscribed components reactively
- **FR-011**: System MUST clear persisted account selection when user logs out
- **FR-012**: System MUST migrate all 8 existing pages using AccountSelectorComponent to use global context:
  - Reports, Dashboard, Email Logs, Ticket List, Company Product List, Email Configurations, Payment Gateway Table, Invoicing Gateway

### Key Entities

- **Account**: Represents an owner account with id, name, and email. Used for filtering data across modules.
- **AccountContextConfiguration**: Per-module configuration specifying visibility, required flag, and auto-select behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select an account from the header and see data update in under 2 seconds on any module page
- **SC-002**: Account selection persists across 100% of page refreshes and browser sessions
- **SC-003**: Users notice the attention indicator within 3 seconds when account selection is required (visual prominence)
- **SC-004**: All 8 existing pages work correctly with the global account selector (zero regressions)
- **SC-005**: Zero duplicate account selectors visible - local selectors completely removed from migrated pages
- **SC-006**: Account selector is hidden on pages that don't require it (clean header on non-account pages)

## Assumptions

- The existing `AccountsDataService.ownerAccounts()` API will continue to be used for loading accounts
- The header component has space for the account selector (between search and theme toggle)
- All 8 pages currently using AccountSelectorComponent have similar behavior (required selection, no auto-select by default)
- Local storage is available and not blocked by browser settings (graceful degradation if unavailable)
- The attention indicator animation should be subtle (not distracting) but noticeable

## Out of Scope

- URL-based account selection (deep linking with account ID in URL)
- Multiple account selection
- Account switching confirmation dialogs
- Account-specific theming or branding
- Keyboard shortcuts for account selection
