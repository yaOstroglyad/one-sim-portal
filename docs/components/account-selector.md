# Global Account Context

> **Status:** Active
> **Last Updated:** 2026-01-08
> **Location:** `src/app/shared/services/account-context/` and `src/app/shared/components/account-selector-chip/`

## Overview

Global account context system for admin users. Provides centralized account selection in the header that persists across page navigation. Only visible to admin users on pages that opt-in.

## Architecture

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **AccountContextService** | `/shared/services/account-context/` | Global state management (signals) |
| **AccountSelectorChipComponent** | `/shared/components/account-selector-chip/` | Compact dropdown in header |

### Key Features

- **Admin-only**: Only initializes for users with `ADMIN_PERMISSION`
- **Page opt-in**: Pages must call `configure()` to show the selector
- **Persistent selection**: Saved to localStorage, restored on page load
- **Reactive**: Uses Angular signals for state management
- **Auto-select**: Optional first account auto-selection per module

## API

### AccountContextService

#### Signals (read-only)

| Signal | Type | Description |
|--------|------|-------------|
| `accounts` | `Signal<Account[]>` | List of available accounts |
| `selectedAccount` | `Signal<Account \| null>` | Currently selected account |
| `selectedAccountId` | `Signal<string \| null>` | ID of selected account |
| `isLoading` | `Signal<boolean>` | Loading state |
| `isVisible` | `Signal<boolean>` | Whether selector is visible |
| `isRequired` | `Signal<boolean>` | Whether selection is required |
| `needsAttention` | `Signal<boolean>` | True if required but no selection |
| `hasSelection` | `Signal<boolean>` | True if account is selected |
| `isEmpty` | `Signal<boolean>` | True if no accounts available |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `configure(options)` | `AccountContextOptions` | Enable selector for current page |
| `reset()` | - | Hide selector (call in ngOnDestroy) |
| `selectAccount(account)` | `Account` | Programmatically select account |
| `clearSelection()` | - | Clear current selection |

#### AccountContextOptions

```typescript
interface AccountContextOptions {
  visible: boolean;           // Show selector in header
  required?: boolean;         // Show attention indicator if no selection
  selectFirstByDefault?: boolean;  // Auto-select first account
}
```

## Usage

### Basic Page Integration

```typescript
import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { AccountContextService } from '@shared';

@Component({...})
export class MyPageComponent implements OnInit, OnDestroy {
  private readonly accountContext = inject(AccountContextService);

  constructor() {
    // React to account changes
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account) {
        this.loadData(account.id);
      }
    });
  }

  ngOnInit(): void {
    // Enable account selector for this page
    this.accountContext.configure({
      visible: true,
      required: true
    });
  }

  ngOnDestroy(): void {
    // Hide selector when leaving page
    this.accountContext.reset();
  }

  private loadData(accountId: string): void {
    // Load data filtered by account
  }
}
```

### With Auto-Select First Account

```typescript
ngOnInit(): void {
  this.accountContext.configure({
    visible: true,
    required: true,
    selectFirstByDefault: true  // Auto-select first account
  });
}
```

### Reading Selection in Template

```html
@if (accountContext.selectedAccount(); as account) {
  <p>Selected: {{ account.name }}</p>
}

@if (accountContext.needsAttention()) {
  <p class="warning">Please select an account</p>
}
```

### Programmatic Selection

```typescript
// Select specific account
const account = this.accountContext.accounts().find(a => a.name === 'MyCompany');
if (account) {
  this.accountContext.selectAccount(account);
}

// Clear selection
this.accountContext.clearSelection();
```

## Behavior

### Initialization Flow

1. Page calls `configure({ visible: true })`
2. Service checks if user has `ADMIN_PERMISSION`
3. If admin and first init: loads accounts from API
4. Restores previous selection from localStorage
5. Applies auto-select if configured and no selection

### Logout Handling

When user logs out:
1. `AuthService.clearAuth()` clears permissions signal
2. Effect in `AccountContextService` detects permission change
3. `clearOnLogout()` resets all state and localStorage

### Persistence

- Selection saved to `localStorage` with key `os_account_context_selected_id`
- Restored on next page visit (if account still exists)
- Cleared on logout

## Migrated Pages

These pages use the global account context:

- Dashboard (`/home/analytics/dashboard`)
- Reports (`/home/analytics/reports`)
- Email Logs (`/home/email-logs`)
- Tickets (`/home/tickets/list`)
- Company Products (`/home/product-constructor/company-products`)
- Email Configurations (`/home/settings/email-configurations`)
- Payment Gateway (`/home/settings/payment-gateway`)
- Invoicing Gateway (`/home/settings/invoicing-gateway`)

## Dependencies

- `@angular/material` - MatSelect, MatFormField
- `@angular/core` - signals, computed, effect
- `AccountsDataService` - API calls
- `AuthService` - Permission checking (signal-based)
