# Info Strip Component

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/shared/components/info-strip/`

## Overview

Simple banner for displaying informational, warning, or error messages with an icon.

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `icon` | `string` | `'info'` | Material icon name |
| `text` | `string` | `''` | Message text (supports HTML via innerHTML) |
| `type` | `InfoStripType` | `'primary'` | Visual style |

### Types

```typescript
type InfoStripType = 'primary' | 'warning' | 'alert';
```

| Type | Use Case | Colors |
|------|----------|--------|
| `primary` | General information | Blue |
| `warning` | Caution messages | Orange |
| `alert` | Errors, critical alerts | Red |

## Usage

```html
<!-- Basic info -->
<app-info-strip text="Your data has been saved"></app-info-strip>

<!-- Warning -->
<app-info-strip
  icon="warning"
  text="This action cannot be undone"
  type="warning">
</app-info-strip>

<!-- Error -->
<app-info-strip
  icon="error"
  text="Failed to save changes"
  type="alert">
</app-info-strip>

<!-- With HTML content -->
<app-info-strip
  text="Visit our <a href='/help'>help center</a> for more info"
  type="primary">
</app-info-strip>

<!-- Conditional display -->
<app-info-strip
  *ngIf="!hasActiveProducts"
  text="You don't have any active packages">
</app-info-strip>
```

## Security Note

Uses `innerHTML` - ensure content is trusted/sanitized when displaying user-generated content.
