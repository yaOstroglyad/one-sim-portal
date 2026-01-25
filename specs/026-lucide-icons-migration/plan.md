# Implementation Plan: Lucide Icons Migration

**Branch**: `026-lucide-icons-migration` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/026-lucide-icons-migration/spec.md`

## Summary

Migrate from CoreUI icons (`@coreui/icons`, `@coreui/icons-angular`) to Lucide Icons, using a unified `<os-icon>` component. This removes 2 CoreUI icon packages while keeping `@coreui/coreui` (SCSS) for a separate PR.

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5 (Zoneless)
**Primary Dependencies**: `lucide-angular` (new), `@angular/common`, `@angular/core`
**Storage**: N/A (frontend only)
**Testing**: Manual testing (no automated tests requested)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge)
**Project Type**: Angular SPA (single frontend)
**Performance Goals**: Icons render < 16ms, tree-shaking for minimal bundle
**Constraints**: Zero visual regression, maintain existing icon sizes
**Scale/Scope**: 97 CoreUI icons → Lucide + custom, 43 components to migrate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Compliance | Notes |
|------|------------|-------|
| **Standalone components** | ✅ Will comply | `OsIconComponent` will be standalone |
| **OnPush change detection** | ✅ Will comply | Already has OnPush |
| **inject() for DI** | ✅ Will comply | Already uses inject() |
| **Signal APIs** | ⚠️ Partial | Will migrate @Input to input() |
| **Code organization order** | ✅ Will comply | Will reorder members |
| **os- selector prefix** | ⚠️ Migration needed | `app-icon` → `os-icon` |
| **@use SCSS syntax** | ✅ N/A | No SCSS changes needed |
| **as const types** | ✅ Will comply | Icon sizes, sources as const |

**Gate Status**: ✅ PASS — All violations have migration path

## Project Structure

### Documentation (this feature)

```text
specs/026-lucide-icons-migration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Lucide integration research
├── quickstart.md        # Phase 1: Quick start guide
└── tasks.md             # Phase 2: Task list (created by /speckit.tasks)
```

### Source Code (affected files)

```text
src/app/
├── shared/components/icon/
│   ├── os-icon.component.ts      # RENAME from icon.component.ts
│   ├── icon.service.ts           # KEEP (custom SVG loader)
│   ├── icon-registry.service.ts  # NEW (Lucide registry)
│   ├── icon-mapping.ts           # NEW (CoreUI → Lucide map)
│   ├── icon.types.ts             # NEW (types as const)
│   └── index.ts                  # UPDATE exports
├── app.component.ts              # MODIFY (remove IconSetService)
├── icons/
│   └── icon-subset.ts            # DELETE after migration
└── [43 components]               # MODIFY (cIcon → os-icon)

src/assets/icons/
├── brands/                       # NEW folder
│   ├── facebook.svg
│   ├── google.svg
│   └── ...
├── payment/                      # NEW folder
│   ├── visa.svg
│   ├── mastercard.svg
│   └── ...
├── flags/                        # NEW folder
│   ├── us.svg
│   ├── br.svg
│   └── ...
└── [existing custom icons]       # KEEP
```

**Structure Decision**: Single Angular SPA, modifications to existing shared component structure.

## Complexity Tracking

> No constitution violations requiring justification.

## Architecture Decisions

### AD-1: Icon Resolution Strategy

```
<os-icon name="user" />
        │
        ▼
┌─────────────────────────────────────┐
│ 1. Check if name starts with "cil"  │
│    → Apply legacy mapping           │
│    → cilUser → user                 │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ 2. Check source input               │
│    source="lucide" (default)        │
│    source="custom"                  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ 3a. Lucide: IconRegistryService     │
│     → Return registered SVG         │
│                                     │
│ 3b. Custom: IconService             │
│     → Load from /assets/icons/      │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ 4. Render SVG with:                 │
│    - Applied size                   │
│    - currentColor inheritance       │
│    - aria-hidden="true"             │
└─────────────────────────────────────┘
```

### AD-2: Component API

```typescript
// Usage examples
<os-icon name="user" />                    // Lucide icon, default size
<os-icon name="user" size="lg" />          // Lucide icon, large
<os-icon name="chart-line" source="custom" />  // Custom SVG
<os-icon name="cilUser" />                 // Legacy mapping (auto-detected)
```

### AD-3: Icon Size System

```typescript
export const ICON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  '2XL': '2xl',
  '3XL': '3xl',
  '4XL': '4xl',
} as const;
export type IconSize = typeof ICON_SIZES[keyof typeof ICON_SIZES];

const SIZE_VALUES: Record<IconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  '3xl': '80px',
  '4xl': '96px',
};
```

### AD-4: Icon Sources

```typescript
export const ICON_SOURCES = {
  LUCIDE: 'lucide',
  CUSTOM: 'custom',
} as const;
export type IconSource = typeof ICON_SOURCES[keyof typeof ICON_SOURCES];
```

## Migration Phases

### Phase 1: Infrastructure Setup

1. Install `lucide-angular` package
2. Rename `icon.component.ts` → `os-icon.component.ts`
3. Update selector from `app-icon` to `os-icon`
4. Migrate `@Input()` to `input()` signal API
5. Create `icon-registry.service.ts` for Lucide icons
6. Create `icon-mapping.ts` with CoreUI → Lucide mappings
7. Create `icon.types.ts` with const types
8. Update component to support both Lucide and custom sources

### Phase 2: Template Migration

1. Find all `<svg cIcon ...>` usages (43 files)
2. Replace with `<os-icon name="..." />`
3. Remove `IconDirective` imports
4. Add `OsIconComponent` to imports

### Phase 3: Cleanup (Icons Only)

1. Remove `IconSetService` from `app.component.ts`
2. Delete `src/app/icons/icon-subset.ts`
3. Remove `@coreui/icons` from package.json
4. Remove `@coreui/icons-angular` from package.json
5. **Keep** `@coreui/coreui` (SCSS) — separate PR

### Phase 4: Custom Icons

1. Create `/assets/icons/brands/` with brand SVGs
2. Create `/assets/icons/payment/` with payment method SVGs
3. Create `/assets/icons/flags/` with country flag SVGs
4. Add `sim-card.svg` for `cilSim` replacement

### Phase 5: Update Rules & Documentation

1. Update `constitution.md` — add Icon System section:
   - `<os-icon>` as the only way to use icons
   - Lucide as primary source, custom SVGs as fallback
   - Rule: "If no suitable Lucide icon exists, create custom SVG in `/assets/icons/`"
   - Naming conventions for custom icons
2. Update `project-map.md` — document icon component and services
3. Update/create skill for icon usage (optional)
4. Remove any references to CoreUI icons from documentation

## Component Design

### OsIconComponent (Final)

```typescript
import { Component, ChangeDetectionStrategy, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconRegistryService } from './icon-registry.service';
import { IconService } from './icon.service';
import { ICON_SIZES, ICON_SOURCES, IconSize, IconSource, SIZE_VALUES } from './icon.types';
import { ICON_MAPPING } from './icon-mapping';

@Component({
  standalone: true,
  selector: 'os-icon',
  imports: [CommonModule],
  template: `
    @if (svgContent(); as svg) {
      <span class="os-icon"
            [style.width]="sizeValue()"
            [style.height]="sizeValue()"
            [innerHTML]="svg"
            aria-hidden="true"></span>
    }
  `,
  styles: [`
    :host { display: inline-flex; }
    .os-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: currentColor;
    }
    .os-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsIconComponent {
  // Dependencies
  private readonly iconRegistry = inject(IconRegistryService);
  private readonly iconService = inject(IconService);

  // Inputs
  readonly name = input.required<string>();
  readonly size = input<IconSize | string>(ICON_SIZES.MD);
  readonly source = input<IconSource>(ICON_SOURCES.LUCIDE);

  // Computed: Resolve legacy CoreUI names
  private readonly resolvedName = computed(() => {
    const name = this.name();
    // Check if it's a legacy CoreUI name
    if (name.startsWith('cil') || name.startsWith('cib') || name.startsWith('cif')) {
      return ICON_MAPPING[name] || name;
    }
    return name;
  });

  // Computed: Determine actual source
  private readonly resolvedSource = computed(() => {
    const name = this.name();
    // Brand/payment/flag icons → custom source
    if (name.startsWith('cib') || name.startsWith('cif')) {
      return ICON_SOURCES.CUSTOM;
    }
    return this.source();
  });

  // Computed: Get SVG content
  readonly svgContent = computed(() => {
    const name = this.resolvedName();
    const source = this.resolvedSource();

    if (source === ICON_SOURCES.CUSTOM) {
      // Delegate to IconService for custom SVGs
      return this.iconService.getIconSync(name);
    }

    // Get from Lucide registry
    return this.iconRegistry.getIcon(name);
  });

  // Computed: Size value
  readonly sizeValue = computed(() => {
    const size = this.size();
    if (size in SIZE_VALUES) {
      return SIZE_VALUES[size as IconSize];
    }
    return size; // Custom CSS value
  });
}
```

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Visual differences between icon sets | Medium | Medium | Compare side-by-side, adjust if needed |
| Missing Lucide equivalents | Low | Low | Use custom SVG fallback |
| Bundle size increase | Low | Low | Tree-shaking, only import used icons |
| Template migration errors | Medium | Low | Automated find/replace + manual review |

## Success Criteria

- [ ] All 97 CoreUI icons mapped to Lucide or custom
- [ ] `<os-icon>` component works with both sources
- [ ] All 43 components migrated from `cIcon` to `os-icon`
- [ ] `@coreui/icons` and `@coreui/icons-angular` removed
- [ ] Build passes with no errors
- [ ] Icons render correctly (visual check)
- [ ] Constitution updated with Icon System rules
- [ ] Project-map updated with icon services

## Dependencies

### New Package

```json
{
  "lucide-angular": "^0.469.0"
}
```

### Packages to Remove

```json
{
  "@coreui/icons": "^3.0.1",
  "@coreui/icons-angular": "^5.6.2"
}
```

### Packages to Keep

```json
{
  "@coreui/coreui": "^5.1.0",
  "@coreui/angular": "^5.6.2"
}
```

## Out of Scope

- Removing `@coreui/coreui` (SCSS/CSS) — separate PR
- Removing `@coreui/angular` directives — separate PR
- Icon animations
- Dark mode variants
