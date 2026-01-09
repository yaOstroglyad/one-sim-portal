# Research: Global Account Context

**Feature**: 021-global-account-context
**Date**: 2026-01-08

## Research Summary

No NEEDS CLARIFICATION items in Technical Context. This document captures best practices research for implementation decisions.

---

## 1. Signal-Based Global State Pattern

### Decision
Use Angular signals with a providedIn: 'root' service for global account state.

### Rationale
- Constitution mandates signals for state management (Section II)
- Angular 21 zoneless mode works optimally with signals
- Signals provide fine-grained reactivity without zone.js overhead
- `computed()` for derived state, `effect()` for side-effects

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| BehaviorSubject | Constitution forbids for local state; signals preferred |
| NgRx Store | Overkill for single entity; adds complexity |
| Context API pattern | Not native to Angular; signals are idiomatic |

### Implementation Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class AccountContextService {
  readonly accounts = signal<Account[]>([]);
  readonly selectedAccount = signal<Account | null>(null);
  readonly selectedAccountId = computed(() => this.selectedAccount()?.id ?? null);
}
```

---

## 2. Admin-Only Initialization Pattern

### Decision
Check admin permission before initializing accounts loading. Use lazy initialization triggered by first configure() call.

### Rationale
- FR-001 requires admin-only initialization
- Prevents unnecessary API calls for non-admin users
- AuthService.hasPermission(ADMIN_PERMISSION) already exists

### Implementation Pattern
```typescript
private initialized = false;

configure(options: AccountContextOptions): void {
  if (!this.authService.hasPermission(ADMIN_PERMISSION)) {
    return; // Non-admin: remain dormant
  }

  if (!this.initialized) {
    this.loadAccounts();
    this.restoreFromStorage();
    this.initialized = true;
  }

  // Apply module configuration...
}
```

---

## 3. localStorage Persistence Pattern

### Decision
Store only account ID (not full object) with user-specific key.

### Rationale
- Account data may change; ID is stable reference
- Validate against current accounts list on restore
- Clear on logout for security (FR-011)
- User-specific key prevents cross-user leakage

### Key Format
```typescript
const STORAGE_KEY = 'os_account_context_selected_id';
```

### Validation on Restore
```typescript
private restoreFromStorage(): void {
  const savedId = localStorage.getItem(STORAGE_KEY);
  if (savedId) {
    const account = this.accounts().find(a => a.id === savedId);
    if (account) {
      this.selectedAccount.set(account);
    } else {
      localStorage.removeItem(STORAGE_KEY); // Invalid ID
    }
  }
}
```

---

## 4. Module Configuration Pattern

### Decision
Modules call `configure()` in ngOnInit and `reset()` in ngOnDestroy.

### Rationale
- Clean lifecycle management
- Allows different pages to have different requirements
- Configuration is declarative, not imperative

### Interface
```typescript
interface AccountContextOptions {
  visible: boolean;           // Show selector in header
  required?: boolean;         // Show attention indicator if no selection
  selectFirstByDefault?: boolean;  // Auto-select first account
}
```

### Usage in Components
```typescript
ngOnInit(): void {
  this.accountContext.configure({
    visible: true,
    required: true,
    selectFirstByDefault: false
  });
}

ngOnDestroy(): void {
  this.accountContext.reset();
}
```

---

## 5. Visual Attention Indicator

### Decision
Use CSS animation with primary color border, triggered by computed signal.

### Rationale
- Non-intrusive but noticeable (SC-003: noticed within 3 seconds)
- Leverages existing CSS variables (`--os-color-primary`)
- Computed signal `needsAttention()` drives the state

### Implementation
```typescript
readonly needsAttention = computed(() =>
  this.isVisible() && this.isRequired() && !this.selectedAccount()
);
```

```scss
.os-account-chip--attention {
  border-color: var(--os-color-primary);
  animation: attention-pulse 2s ease-in-out infinite;
}

@keyframes attention-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--os-color-primary-rgb), 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(var(--os-color-primary-rgb), 0.1); }
}
```

---

## 6. Header Integration Pattern

### Decision
Add chip between search bar and theme toggle, conditionally rendered based on visibility signal.

### Rationale
- Header already has left/center/right zones
- Chip fits naturally in right zone before action buttons
- Conditional rendering via `@if (accountContext.isVisible())`

### Header Layout After Change
```
┌─────────────────────────────────────────────────────────────────┐
│  ☰   │        🔍 Search...        │ [Account ▼] │ 🌙 │ 👤       │
│ left │         center             │    right zone              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Migration Strategy

### Decision
Migrate pages one-by-one, removing local AccountSelectorComponent usage.

### Migration Checklist (per page)
1. Add `AccountContextService` injection
2. Add `configure()` call in `ngOnInit()`
3. Add `reset()` call in `ngOnDestroy()`
4. Replace local `selectedAccountId` signal/variable with `accountContext.selectedAccountId()`
5. Use `effect()` to react to account changes and reload data
6. Remove `<app-account-selector>` from template
7. Remove `AccountSelectorComponent` from imports
8. Remove local `onAccountSelected()` handler

### Example Migration
```typescript
// BEFORE
@Component({
  imports: [AccountSelectorComponent, ...]
})
export class ReportsComponent {
  selectedAccountId = signal<string | null>(null);

  onAccountSelected(account: Account): void {
    this.selectedAccountId.set(account.id);
    this.loadReport();
  }
}

// AFTER
@Component({
  imports: [...] // No AccountSelectorComponent
})
export class ReportsComponent {
  private readonly accountContext = inject(AccountContextService);

  constructor() {
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account) this.loadReport();
    });
  }

  ngOnInit(): void {
    this.accountContext.configure({ visible: true, required: true });
  }

  ngOnDestroy(): void {
    this.accountContext.reset();
  }
}
```

---

## 8. Logout Cleanup

### Decision
Subscribe to AuthService logout event and clear persisted selection.

### Rationale
- FR-011: Clear on logout for security
- Prevents cross-user data leakage

### Implementation
```typescript
constructor() {
  // Listen for logout
  this.authService.logoutEvent$.pipe(
    takeUntilDestroyed()
  ).subscribe(() => {
    this.clearSelection();
    localStorage.removeItem(STORAGE_KEY);
    this.initialized = false;
  });
}
```

---

## Conclusions

All research items resolved. No blocking questions remain. Ready to proceed with Phase 1 artifacts.
