# OsIcon Component Refactoring

> **Version:** 2.0 | **Updated:** 2026-01-25
> **Status:** Completed
> **Branch:** `release`

---

## Summary

Refactored the icon system to create a unified `OsIconComponent` that supports both CoreUI icons and custom SVGs with a single API. The component uses modern Angular signals and auto-detects the icon source based on naming convention.

**Decision:** Kept CoreUI icons instead of migrating to Lucide because:
- CoreUI icons are independent packages (`@coreui/icons`, `@coreui/icons-angular`)
- They don't depend on CoreUI SCSS/components
- Visual consistency was already good
- Migration to Lucide caused visual regression

---

## Goals (Achieved)

1. **Unified icon component** — single `<os-icon>` for all icons
2. **Modern API** — Angular signals (`input()`, `computed()`, `effect()`)
3. **Auto-detection** — CoreUI icons detected by `cil`/`cib`/`cif` prefix
4. **Backward compatible** — existing CoreUI icon names work
5. **Custom SVG support** — `/assets/icons/` integration preserved

---

## Architecture

### Component Structure

```
src/app/shared/components/icon/
├── os-icon.component.ts    # Unified icon component (NEW)
├── icon.service.ts         # Custom SVG loader (unchanged)
└── index.ts                # Exports
```

### Icon Resolution Flow

```
<os-icon name="cilUser" />
        │
        ▼
┌─────────────────────────────┐
│ 1. Check prefix             │
│    cil* / cib* / cif*       │
│    → CoreUI icon            │
│    else → Custom SVG        │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│ 2a. CoreUI: IconSetService  │
│     → render inline SVG     │
│                             │
│ 2b. Custom: IconService     │
│     → load from /assets/    │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│ 3. Render SVG               │
│    - Apply size             │
│    - Apply currentColor     │
└─────────────────────────────┘
```

---

## API Reference

### OsIconComponent

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | required | Icon name (CoreUI or custom) |
| `size` | `IconSize \| string` | `'md'` | Predefined or custom CSS size |
| `folder` | `string` | - | Subfolder for custom icons |

### Icon Sizes

| Size | Pixels |
|------|--------|
| `xs` | 12px |
| `sm` | 16px |
| `md` | 24px (default) |
| `lg` | 32px |
| `xl` | 48px |
| `2xl` | 64px |
| `3xl` | 80px |
| `4xl` | 96px |

### Usage Examples

```html
<!-- CoreUI icon (auto-detected by prefix) -->
<os-icon name="cilUser" />
<os-icon name="cilSettings" size="lg" />
<os-icon name="cilPlus" size="sm" />

<!-- Custom SVG from /assets/icons/ -->
<os-icon name="chart-line" />
<os-icon name="avatar-user" />

<!-- Custom SVG from subfolder -->
<os-icon name="facebook" folder="brands" />

<!-- Custom CSS size -->
<os-icon name="cilHome" size="48px" />
```

---

## Migration Completed

### What Changed

| Before | After |
|--------|-------|
| `<app-icon icon="name">` | `<os-icon name="name">` |
| `<svg cIcon name="cilX">` | `<os-icon name="cilX">` |
| `IconComponent` | `OsIconComponent` |
| `IconDirective` | Not needed |

### Files Migrated (7)

1. `sidebar.component.ts/html`
2. `global-fab.component.ts/html`
3. `support-chat.shell.component.ts/html`
4. `admin-overview.component.ts`
5. `reports.component.ts/html`
6. `refunds-summary.component.ts/html`
7. `company-product-prices-table.component.ts/html`

### Files Modified

| File | Changes |
|------|---------|
| `os-icon.component.ts` | New unified component with signals |
| `icon/index.ts` | Updated exports |

### Files Deleted

| File | Reason |
|------|--------|
| `icon.component.ts` | Replaced by `os-icon.component.ts` |

---

## Technical Details

### OsIconComponent Features

```typescript
@Component({
  standalone: true,
  selector: 'os-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsIconComponent {
  // Signal-based inputs
  readonly name = input.required<string>();
  readonly size = input<IconSize | string>(ICON_SIZES.MD);
  readonly folder = input<string>();

  // Auto-detection via computed
  private readonly isCoreUIIcon = computed(() => {
    const iconName = this.name();
    return iconName.startsWith('cil') ||
           iconName.startsWith('cib') ||
           iconName.startsWith('cif');
  });

  // Proper cleanup with takeUntilDestroyed
  private loadCustomIcon(iconName: string, folder?: string): void {
    this.iconService.getIcon(iconName, folder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(content => {
        this.customIconContent.set(content);
      });
  }
}
```

### Dependencies

```json
{
  "@coreui/icons": "^3.x",
  "@coreui/icons-angular": "^5.6.2"
}
```

---

## Import Rules

```typescript
// Components OUTSIDE shared/ — use @shared barrel
import { OsIconComponent } from '@shared';

// Components INSIDE shared/ — use specific path (avoids circular dependency)
import { OsIconComponent } from '@shared/components/icon';
```

---

## Not Implemented (Out of Scope)

- ~~Lucide icons migration~~ — Decided against due to visual regression
- ~~icon-mapping.ts~~ — Not needed, CoreUI names used directly
- ~~icon-registry.service.ts~~ — Not needed, using CoreUI's IconSetService
- Brand/payment/flag custom icons — Can be added as needed

---

## Success Criteria (All Met)

- [x] Unified `<os-icon>` component created
- [x] Modern signals API implemented
- [x] CoreUI icons work via auto-detection
- [x] Custom SVGs work via IconService
- [x] All usages migrated from `app-icon` and `cIcon`
- [x] Build passes with no errors
- [x] Memory leak fixed (takeUntilDestroyed)
- [x] Old IconComponent deleted
