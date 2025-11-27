# Generic Right Panel Component

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/shared/components/generic-right-panel/`

## Overview

Resizable slide-in panel from the right side. Used for details views, edit forms, and confirmations as an alternative to modal dialogs.

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | `''` | Panel header title |
| `subtitle` | `string` | `''` | Panel header subtitle |
| `isOpen` | `boolean` | `false` | Controls visibility |
| `actions` | `PanelAction[]` | `[]` | Custom header actions |
| `hasFooter` | `boolean` | `false` | Show footer slot |
| `resizable` | `boolean` | `true` | Enable drag-to-resize |
| `minWidth` | `number` | `400` | Minimum width (px) |
| `maxWidth` | `number` | `800` | Maximum width (px) |
| `defaultWidth` | `number` | `500` | Initial width (px) |
| `showOverlay` | `boolean` | `true` | Show backdrop overlay |
| `topOffset` | `number` | `64` | Top offset from viewport |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `close` | `void` | Panel should close |
| `widthChange` | `number` | Panel width changed |

### PanelAction Interface

```typescript
interface PanelAction {
  id: string;
  icon: string;       // CoreUI icon name
  label: string;      // Tooltip text
  disabled?: boolean;
  handler: () => void;
}
```

## Content Projection

| Selector | Description |
|----------|-------------|
| `[panel-content]` | Main content area |
| `[panel-actions]` | Footer buttons (requires `hasFooter="true"`) |

## Usage

### Details Panel

```html
<app-generic-right-panel
  [title]="'Item Details'"
  [isOpen]="showDetails"
  [resizable]="true"
  [defaultWidth]="600"
  (close)="showDetails = false">

  <div panel-content>
    <!-- Read-only content -->
  </div>
</app-generic-right-panel>
```

### Edit Form Panel

```html
<app-generic-right-panel
  [title]="'Edit Item'"
  [isOpen]="showEdit"
  [hasFooter]="true"
  [resizable]="false"
  [defaultWidth]="500"
  (close)="onCancel()">

  <div panel-content>
    <form [formGroup]="editForm">
      <!-- Form fields -->
    </form>
  </div>

  <div panel-actions>
    <button cButton color="secondary" (click)="onCancel()">Cancel</button>
    <button cButton color="primary" (click)="onSave()">Save</button>
  </div>
</app-generic-right-panel>
```

### With Custom Actions

```typescript
panelActions: PanelAction[] = [
  {
    id: 'edit',
    icon: 'cilPencil',
    label: 'Edit',
    handler: () => this.onEdit()
  },
  {
    id: 'delete',
    icon: 'cilTrash',
    label: 'Delete',
    handler: () => this.onDelete()
  }
];
```

```html
<app-generic-right-panel
  [actions]="panelActions"
  ...>
</app-generic-right-panel>
```

## Default Actions

The panel always includes:
1. **Expand/Collapse** - Toggles between default and max width (only if `resizable`)
2. **Close** - Closes the panel

## Behavior

- Locks body scroll when open (`overflow: hidden`)
- Supports RTL via `LanguageService`
- Clicking overlay closes panel (if `showOverlay`)
- Uses CoreUI icons

## Width Guidelines

| Use Case | Recommended Width |
|----------|-------------------|
| Forms | 400-600px |
| Details | 500-800px |
| Confirmations | 350-450px |
