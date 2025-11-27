# Header Component

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/shared/components/header-component/`

## Overview

Filter toolbar for table views. Provides search inputs, column visibility control, and add button.

## API

### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `config` | `HeaderConfig` | Dynamic filter field configuration |
| `tableConfig$` | `Observable<TableConfig>` | Table config for column control |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `filteredData` | `any` | Filter values (debounced 400ms) |
| `onAddAction` | `void` | Add button clicked |
| `columnSelectionChange` | `Set<string>` | Column visibility changed |

## Usage

### With Content Projection (Recommended)

```html
<app-header
  class="os-header-sticky"
  [formGroup]="filterForm"
  [tableConfig$]="tableConfig$"
  (onAddAction)="createEntity()"
  (columnSelectionChange)="onColumnSelectionChanged($event)">

  <ng-container header-custom-inputs>
    <input cFormControl formControlName="name" placeholder="{{ 'entity.name' | translate }}">
    <input cFormControl formControlName="status" placeholder="{{ 'entity.status' | translate }}">
    <button cButton color="secondary" [disabled]="filterForm.pristine" (click)="resetForm()">
      <svg cIcon name="cilReload"></svg>
    </button>
  </ng-container>
</app-header>
```

### With Config-Based Filters

```typescript
headerConfig: HeaderConfig = {
  name: {
    type: 'text',
    placeholder: 'Search by name',
    defaultValue: ''
  },
  status: {
    type: 'select',
    placeholder: 'Select status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ]
  }
};
```

```html
<app-header
  [config]="headerConfig"
  [tableConfig$]="tableConfig$"
  (filteredData)="onFilter($event)">
</app-header>
```

## Content Projection Slots

| Selector | Description |
|----------|-------------|
| `[header-custom-inputs]` | Custom filter inputs |
| `[header-actions]` | Additional action buttons |

## Behavior

- Debounces filter changes by 400ms
- Resets column visibility on `resetForm()`
- Integrates with `ColumnControlComponent` for column visibility

## CSS Class

Use `os-header-sticky` for sticky positioning:
```html
<app-header class="os-header-sticky" ...>
```
