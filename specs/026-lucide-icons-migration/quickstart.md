# Quickstart: OsIcon Component

## Using the Icon Component

### Import

```typescript
import { OsIconComponent } from '@shared';
// or for components inside shared/:
import { OsIconComponent } from '@shared/components/icon';
```

### Basic Usage

```html
<!-- CoreUI icon (auto-detected by cil/cib/cif prefix) -->
<os-icon name="cilUser" />
<os-icon name="cilSettings" size="lg" />

<!-- Custom SVG from /assets/icons/ -->
<os-icon name="chart-line" />
<os-icon name="avatar-user" />
```

### Available Sizes

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

Or use custom CSS value: `size="20px"`, `size="2rem"`

### Custom Icons with Folder

```html
<!-- Load from /assets/icons/avatars/user.svg -->
<os-icon name="user" folder="avatars" />
```

## How It Works

The component auto-detects the icon source:

| Icon Name | Source | Example |
|-----------|--------|---------|
| `cil*` | CoreUI (linear) | `cilUser`, `cilSettings` |
| `cib*` | CoreUI (brand) | `cibFacebook` |
| `cif*` | CoreUI (flag) | `cifUs` |
| Other | Custom SVG | `chart-line`, `avatar-user` |

## Common Issues

### Icon Not Showing

1. **CoreUI icon**: Check name in `icon-subset.ts`
2. **Custom icon**: Check file exists at `/assets/icons/{name}.svg`

### Wrong Size

Use predefined sizes or valid CSS value:
```html
<os-icon name="cilUser" size="lg" />
<os-icon name="cilUser" size="48px" />
```

### Color Not Changing

Icons use `currentColor` — set color on parent:
```html
<span style="color: red">
  <os-icon name="cilWarning" />
</span>
```

## File Locations

| File | Purpose |
|------|---------|
| `shared/components/icon/os-icon.component.ts` | Main component |
| `shared/components/icon/icon.service.ts` | Custom SVG loader |
| `assets/icons/` | Custom SVG files |
| `app/icons/icon-subset.ts` | CoreUI icons registration |
