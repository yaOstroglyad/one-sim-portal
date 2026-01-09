# Quickstart: Global Account Context

**Feature**: 021-global-account-context
**Date**: 2026-01-08

## Overview

The Global Account Context provides a centralized account selection mechanism in the application header. It replaces per-page `AccountSelectorComponent` with a shared service that maintains account state across navigation.

---

## Quick Integration (for page components)

### Step 1: Inject the service

```typescript
import { AccountContextService } from '@shared/services/account-context';

@Component({ ... })
export class MyPageComponent {
  private readonly accountContext = inject(AccountContextService);
}
```

### Step 2: Configure on init

```typescript
ngOnInit(): void {
  this.accountContext.configure({
    visible: true,      // Show selector in header
    required: true,     // Show attention indicator if no selection
    selectFirstByDefault: false  // Don't auto-select
  });
}
```

### Step 3: Reset on destroy

```typescript
ngOnDestroy(): void {
  this.accountContext.reset();
}
```

### Step 4: React to account changes

```typescript
constructor() {
  effect(() => {
    const account = this.accountContext.selectedAccount();
    if (account) {
      this.loadData(account.id);
    }
  });
}
```

### Step 5: Access selected account ID

```typescript
// In component
readonly accountId = computed(() => this.accountContext.selectedAccountId());

// In template
@if (accountContext.selectedAccountId()) {
  <div>Selected: {{ accountContext.selectedAccount()?.name }}</div>
}
```

---

## Complete Example

```typescript
import { Component, OnInit, OnDestroy, inject, effect, computed } from '@angular/core';
import { AccountContextService } from '@shared/services/account-context';

@Component({
  standalone: true,
  selector: 'app-my-page',
  template: `
    @if (accountContext.selectedAccountId()) {
      <div>Loading data for: {{ accountContext.selectedAccount()?.name }}</div>
    } @else {
      <div class="placeholder">Select an account to view data</div>
    }
  `
})
export class MyPageComponent implements OnInit, OnDestroy {
  protected readonly accountContext = inject(AccountContextService);

  constructor() {
    // React to account changes
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account) {
        this.loadPageData();
      }
    });
  }

  ngOnInit(): void {
    // Configure account selector for this page
    this.accountContext.configure({
      visible: true,
      required: true
    });
  }

  ngOnDestroy(): void {
    // Clean up on page exit
    this.accountContext.reset();
  }

  private loadPageData(): void {
    const accountId = this.accountContext.selectedAccountId();
    if (accountId) {
      // Load your page-specific data
      this.dataService.loadData(accountId).subscribe(...);
    }
  }
}
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `visible` | `boolean` | required | Show account selector in header |
| `required` | `boolean` | `false` | Show attention indicator if no selection |
| `selectFirstByDefault` | `boolean` | `false` | Auto-select first account on page load |

---

## Available Signals (read-only)

| Signal | Type | Description |
|--------|------|-------------|
| `accounts()` | `Account[]` | All available accounts |
| `selectedAccount()` | `Account \| null` | Currently selected account |
| `selectedAccountId()` | `string \| null` | ID of selected account |
| `isVisible()` | `boolean` | Whether selector is shown |
| `isRequired()` | `boolean` | Whether selection is required |
| `needsAttention()` | `boolean` | Whether attention indicator is shown |
| `isLoading()` | `boolean` | Whether accounts are loading |

---

## Methods

| Method | Description |
|--------|-------------|
| `configure(options)` | Set visibility/required/autoSelect for current page |
| `reset()` | Hide selector and clear configuration |
| `selectAccount(account)` | Programmatically select an account |
| `clearSelection()` | Clear current selection |

---

## Migration from AccountSelectorComponent

### Before (old pattern)

```typescript
@Component({
  imports: [AccountSelectorComponent, ...],
  template: `
    <app-account-selector
      (accountSelected)="onAccountSelected($event)">
    </app-account-selector>
  `
})
export class OldPageComponent {
  selectedAccountId: string | null = null;

  onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    this.loadData();
  }
}
```

### After (new pattern)

```typescript
@Component({
  imports: [...], // No AccountSelectorComponent
  template: `
    <!-- No account selector in template - it's in the header now -->
  `
})
export class NewPageComponent implements OnInit, OnDestroy {
  private readonly accountContext = inject(AccountContextService);

  constructor() {
    effect(() => {
      if (this.accountContext.selectedAccount()) {
        this.loadData();
      }
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

## Notes

- **Admin-only**: The account selector only appears for admin users
- **Persistence**: Selection is saved to localStorage and restored on page refresh
- **Cross-page**: Selected account persists across navigation
- **Cleanup**: Always call `reset()` in `ngOnDestroy()` to hide selector when leaving the page
