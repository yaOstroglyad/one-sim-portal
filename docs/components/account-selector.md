# Account Selector Component

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/shared/components/account-selector/`

## Overview

Dropdown component for selecting owner accounts. Used in admin interfaces where data is filtered by account.

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `helperText` | `string` | `'common.selectAccountFirst'` | Translation key for helper message |
| `defaultAccountName` | `string \| null` | `null` | Auto-select account by name (partial match) |
| `preSelectedAccountId` | `string \| null` | `null` | Auto-select account by ID |
| `selectFirstByDefault` | `boolean` | `false` | Auto-select first account in list |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `accountSelected` | `Account` | Emitted when account is selected |

### Auto-Selection Priority

1. `preSelectedAccountId` - exact match by ID
2. `defaultAccountName` - partial match by name (case-insensitive)
3. `selectFirstByDefault` - first account in list

## Usage

### Basic Usage

```html
<app-account-selector
  (accountSelected)="onAccountSelected($event)">
</app-account-selector>
```

### With Pre-Selection

```html
<!-- Pre-select by ID (from route params) -->
<app-account-selector
  [preSelectedAccountId]="accountIdFromRoute"
  (accountSelected)="onAccountSelected($event)">
</app-account-selector>

<!-- Auto-select first account -->
<app-account-selector
  [selectFirstByDefault]="true"
  (accountSelected)="onAccountSelected($event)">
</app-account-selector>

<!-- Custom helper text -->
<app-account-selector
  helperText="emailLogs.selectAccountToViewLogs"
  (accountSelected)="onAccountSelected($event)">
</app-account-selector>
```

### In Component

```typescript
export class MyComponent {
  selectedAccountId: string | null = null;

  onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    this.loadData();
  }
}
```

## Behavior

- Loads accounts via `AccountsDataService.ownerAccounts()`
- Emits selection after 100ms delay (ensures parent is ready)
- Adds `isAdmin` property if account name is 'admin'
- Uses OnPush change detection

## Dependencies

- `@angular/material` - MatSelect, MatFormField
- `AccountsDataService` - Data loading
- `@ngx-translate` - Translations
