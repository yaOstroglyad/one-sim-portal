# Data Model: Global Account Context

**Feature**: 021-global-account-context
**Date**: 2026-01-08

## Entities

### 1. Account (existing)

**Location**: `/src/app/shared/models/business/account.model.ts`

```typescript
export interface Account {
  id: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
}
```

**Notes**: No changes required. Existing model is sufficient.

---

### 2. AccountContextOptions (new)

**Location**: `/src/app/shared/models/ui/account-context.model.ts`

```typescript
/**
 * Configuration options for account context per module/page.
 * Passed to AccountContextService.configure() when a page initializes.
 */
export interface AccountContextOptions {
  /**
   * Whether to show the account selector in the header.
   * If false, selector is hidden regardless of other settings.
   */
  visible: boolean;

  /**
   * Whether account selection is required for this module.
   * If true and no account selected, shows attention indicator.
   * @default false
   */
  required?: boolean;

  /**
   * Whether to auto-select the first account if none is persisted.
   * Only applies when visible=true.
   * @default false
   */
  selectFirstByDefault?: boolean;
}
```

---

### 3. AccountContextState (internal to service)

**Location**: Internal to `AccountContextService` (not exported)

```typescript
/**
 * Internal state managed by AccountContextService.
 * All properties are signals.
 */
interface AccountContextState {
  // === Data ===
  accounts: Signal<Account[]>;
  selectedAccount: Signal<Account | null>;
  isLoading: Signal<boolean>;

  // === Module Configuration ===
  isVisible: Signal<boolean>;
  isRequired: Signal<boolean>;
  selectFirstByDefault: Signal<boolean>;

  // === Computed ===
  selectedAccountId: Signal<string | null>;  // computed from selectedAccount
  needsAttention: Signal<boolean>;           // computed: visible && required && !selected
  hasSelection: Signal<boolean>;             // computed: selectedAccount !== null
  isEmpty: Signal<boolean>;                  // computed: accounts.length === 0
}
```

---

## State Transitions

### Account Selection State Machine

```
                    ┌──────────────────┐
                    │   UNINITIALIZED  │ (non-admin or first load)
                    └────────┬─────────┘
                             │ admin logs in + configure() called
                             ▼
                    ┌──────────────────┐
        ┌───────────│     LOADING      │
        │           └────────┬─────────┘
        │                    │ accounts loaded
        │                    ▼
        │           ┌──────────────────┐
        │      ┌────│   NO_SELECTION   │◄────────┐
        │      │    └────────┬─────────┘         │
        │      │             │ user selects      │ clearSelection()
        │      │             │ or auto-select    │
        │      │             ▼                   │
        │      │    ┌──────────────────┐         │
        │      │    │    SELECTED      │─────────┘
        │      │    └──────────────────┘
        │      │
        │      │ logout event
        │      ▼
        └──────►┌──────────────────┐
                │   UNINITIALIZED  │
                └──────────────────┘
```

### Configuration State per Navigation

```
Page Enter (ngOnInit)                    Page Exit (ngOnDestroy)
        │                                        │
        ▼                                        ▼
┌───────────────────┐                   ┌───────────────────┐
│ configure({       │                   │ reset()           │
│   visible: true,  │                   │ - isVisible=false │
│   required: true  │                   │ - isRequired=false│
│ })                │                   │                   │
└───────────────────┘                   └───────────────────┘
```

---

## Validation Rules

| Rule | Location | Description |
|------|----------|-------------|
| Admin-only | `configure()` | Check `AuthService.hasPermission(ADMIN_PERMISSION)` before initialization |
| Valid persisted ID | `restoreFromStorage()` | Persisted account ID must exist in current accounts list |
| Non-empty selection | `needsAttention` computed | If `required=true` and no selection, show attention indicator |

---

## Persistence

### localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `os_account_context_selected_id` | `string` | ID of selected account |

### Lifecycle

1. **Save**: On `selectAccount(account)` → `localStorage.setItem(KEY, account.id)`
2. **Load**: On `configure()` first call → `localStorage.getItem(KEY)` → validate → set if valid
3. **Clear**: On `logout` event or `clearSelection()` → `localStorage.removeItem(KEY)`

---

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    AccountContextService                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ accounts[]  │  │ selected    │  │ configuration           │  │
│  │   Account   │──│   Account   │  │ visible,required,auto   │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │ localStorage    │       │ Header UI       │
    │ (persistence)   │       │ (chip display)  │
    └─────────────────┘       └─────────────────┘
                                      │
                              subscribes to
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │ ReportsPage     │     │ DashboardPage   │     │ TicketsPage     │
    │ effect(() =>    │     │ effect(() =>    │     │ effect(() =>    │
    │   loadData())   │     │   loadData())   │     │   loadData())   │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## API Dependencies

| Service | Method | Used For |
|---------|--------|----------|
| `AccountsDataService` | `ownerAccounts()` | Load available accounts |
| `AuthService` | `hasPermission(ADMIN_PERMISSION)` | Check admin role |
| `AuthService` | `logoutEvent$` (or hook into `clearAndLogout()`) | Clear on logout |
