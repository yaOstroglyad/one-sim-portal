# Table Menu Architecture

> **Status:** Implemented
> **Last Updated:** 2025-11-26

## Overview

This document describes how action menus work in GenericTable component. The project uses Angular Material `mat-icon-button` with `matMenu` for row actions, with custom CSS overrides to achieve compact sizing.

## Current Implementation

### Architecture

```
GenericTable Component
├── [menu] Input - accepts ng-template
├── showMenu config flag
└── actions-column (sticky, 45px width)

Parent Component
├── #menuTemplate ng-template
├── mat-icon-button (trigger)
└── mat-menu (dropdown)
```

### Usage Pattern

```html
<!-- Parent component template -->
<generic-table
  [config$]="tableConfig$"
  [menu]="menuTemplate"
  [data$]="dataList$">
</generic-table>

<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <button mat-menu-item (click)="onEdit(item)">
      {{ 'common.edit' | translate }}
    </button>
    <button mat-menu-item (click)="onDelete(item)">
      {{ 'common.delete' | translate }}
    </button>
  </mat-menu>
</ng-template>
```

### TableConfig Setup

```typescript
// In service extending TableConfigAbstractService
protected override getBaseConfig(): Partial<TableConfig> {
  return {
    showMenu: true,  // Enable actions column
    // ... other config
  };
}
```

## Styling Solution

The project solves Material Design's default 48px button size through CSS overrides in `src/scss/_vendor-overrides.scss`:

### Table-Specific Button Sizing (28px)

```scss
// Material icon button styles for tables
.ag-grid-table .mat-mdc-icon-button,
.ag-cell .mat-mdc-icon-button,
:host ::ng-deep .mat-mdc-icon-button.mat-mdc-button-base {
  --mdc-icon-button-state-layer-size: 28px;
  --mdc-icon-button-icon-size: 18px;
  width: var(--mdc-icon-button-state-layer-size) !important;
  height: var(--mdc-icon-button-state-layer-size) !important;
  padding: 0 !important;
  margin: 0 !important;
  min-width: unset !important;
  line-height: 1 !important;
}

// Icon sizing inside table buttons
.ag-grid-table .mat-mdc-icon-button .mat-icon,
.ag-cell .mat-mdc-icon-button .mat-icon {
  width: var(--mdc-icon-button-icon-size) !important;
  height: var(--mdc-icon-button-icon-size) !important;
  font-size: var(--mdc-icon-button-icon-size) !important;
  line-height: 1 !important;
}
```

### Actions Column Styling

```scss
// Column width defined in template
<col *ngIf="vm.config.showMenu" style="width:45px;min-width:45px">

// Sticky positioning
.sticky-column.actions-column {
  border-left: none;
  box-shadow: -1px 0 0 var(--ag-cell-horizontal-border) inset;
}

.ag-header-cell.actions-column {
  background-color: var(--ag-header-background-color);
  position: sticky;
  right: 0;
  border-left: 1px solid var(--ag-header-column-separator-color);
}

.ag-cell.actions-column {
  background-color: #fff;
  border-left: 1px solid var(--ag-cell-horizontal-border);
  padding: $os-spacing-1 !important;
}
```

## Alternative: Edit Button Only

For simple edit-only actions, use `showEditButton` instead of `showMenu`:

```typescript
protected override getBaseConfig(): Partial<TableConfig> {
  return {
    showEditButton: true,  // Shows pencil icon
    showMenu: false,
    // ... other config
  };
}
```

This renders a CoreUI icon directly:

```html
<td class="actions-column" (click)="onEdit(item)">
  <svg cIcon name="cilPencil" class="ag-action-icon"></svg>
</td>
```

## File Locations

| File | Purpose |
|------|---------|
| `src/app/shared/components/generic-table/generic-table.component.html` | Template with menu slot |
| `src/app/shared/components/generic-table/generic-table.component.ts` | Component with `@Input() menu` |
| `src/scss/_vendor-overrides.scss` | Material button size overrides |

## Examples in Codebase

| Component | Menu Actions |
|-----------|--------------|
| `companies.component.html` | Send invite email |
| `customers.component.html` | Edit, View orders, Activate/Deactivate |
| `products.component.html` | Edit, Clone, Delete |
| `orders.component.html` | View details, Refund |
| `users/user-list.component.html` | Edit, Reset password, Delete |

## Best Practices

1. **Always use `mat-menu`** - Don't create custom dropdowns
2. **Use translation keys** - `{{ 'common.edit' | translate }}`
3. **Stop propagation** - The GenericTable handles this, but be aware for custom templates
4. **Conditional items** - Use `*ngIf` on `mat-menu-item` for role-based visibility

```html
<mat-menu #menu="matMenu">
  <button mat-menu-item (click)="onEdit(item)">
    {{ 'common.edit' | translate }}
  </button>
  <button mat-menu-item
          *ngIf="canDelete(item)"
          (click)="onDelete(item)">
    {{ 'common.delete' | translate }}
  </button>
</mat-menu>
```
