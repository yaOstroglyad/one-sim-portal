# Implementation Plan: SCSS Architecture Refactor

**Branch**: `017-gmail-layout` (continuation) | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-scss-refactor/spec.md`

## Summary

Refactor SCSS architecture using a 2-level mixin hierarchy to eliminate code duplication. Level 1 provides abstract bases (`os-surface-base`, `os-interactive-base`, `os-feedback-base`), Level 2 provides specialized mixins that inherit from Level 1. Update constitution.md with SCSS rules.

## Technical Context

**Language/Version**: SCSS (Dart Sass via Angular CLI)
**Primary Dependencies**: Angular 21.0.5, CoreUI, Angular Material
**Storage**: N/A (styling only)
**Testing**: Visual inspection in light/dark themes
**Target Platform**: Web (all modern browsers)
**Project Type**: Angular SPA
**Performance Goals**: No increase in CSS bundle size
**Constraints**: Must maintain visual parity with existing styles
**Scale/Scope**: ~60+ component SCSS files, 1 mixin file, 1 constitution file

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Use CSS variables for theming | ✅ Pass | Using `--layout-*` variables |
| Standalone components | N/A | SCSS only |
| English documentation | ✅ Pass | All comments in English |

## Mixin Hierarchy Architecture

### Level 1: Abstract Bases

```scss
// Surface base - for any themed container
@mixin os-surface-base($bg, $border, $radius: 0.375rem) {
  background-color: var(#{$bg});
  border: 1px solid var(#{$border});
  border-radius: $radius;
}

// Interactive base - for clickable elements
@mixin os-interactive-base($transition: 0.15s ease-in-out) {
  cursor: pointer;
  transition: all $transition;

  &:hover { ... }
  &:active { ... }
  &:disabled { cursor: not-allowed; opacity: 0.6; }
}

// Feedback base - for status indicators
@mixin os-feedback-base($color-var) {
  color: var(#{$color-var});
}
```

### Level 2: Specialized Bases

| Mixin | Inherits | Purpose |
|-------|----------|---------|
| `os-input-base($height)` | surface | Text inputs, selects |
| `os-dropdown-base($width)` | surface | Popups, menus |
| `os-card-base($padding)` | surface | Cards, panels |
| `os-panel-base()` | surface | Panels with header/content |
| `os-overlay-base($opacity)` | surface | Modal backdrops |
| `os-table-base()` | surface | Table container |
| `os-button-base($height)` | surface + interactive | All buttons |
| `os-list-item-base($padding)` | interactive | List/menu items |
| `os-icon-button-base($size)` | interactive | Icon-only buttons |
| `os-table-sortable-base()` | interactive | Sortable table headers |
| `os-spinner-base($size)` | feedback | Loading spinners |
| `os-alert-base($variant)` | feedback | Alert messages |
| `os-badge-base($variant)` | feedback | Status badges |

### Level 3: Table Sub-components

| Mixin | Inherits | Purpose |
|-------|----------|---------|
| `os-table-header-base()` | table | Header row styling |
| `os-table-row-base()` | table | Body row + hover/selected |
| `os-table-cell-base($padding)` | table | Cell padding/alignment |
| `os-table-actions-base()` | table | Action buttons column |

### Usage Examples

```scss
// Simple - use Level 2 directly
.my-input { @include os-input-base(40px); }
.my-card { @include os-card-base(1.5rem); }

// Custom - compose from Level 1
.my-custom-surface {
  @include os-surface-base(--layout-frame-bg, --layout-frame-border, 0.5rem);
  padding: map.get($os-spacing, '4');
}

// Multiple inheritance
.my-button {
  @include os-surface-base(--os-color-primary, --os-color-primary-shade);
  @include os-interactive-base();
  height: 44px;
}

// Table composition (Level 2 + Level 3)
.my-table {
  @include os-table-base();

  &__header {
    @include os-table-header-base();

    &--sortable { @include os-table-sortable-base(); }
  }

  &__row { @include os-table-row-base(); }
  &__cell { @include os-table-cell-base(); }
  &__actions { @include os-table-actions-base(); }
}
```

## Project Structure

### Files to Modify

```text
src/scss/
├── _mixins.scss             # ADD Level 1 & Level 2 mixins
└── _variables.scss          # Already good

.specify/memory/
└── constitution.md          # ADD SCSS rules section

src/app/
├── shared/components/       # ~25 files to refactor
├── views/                   # ~35 files to refactor
└── features/                # ~5 files to refactor
```

### Existing Mixins to Consolidate

| Current Mixin | Action | New Mixin |
|---------------|--------|-----------|
| `os-input-base` | KEEP + refactor to use surface | `os-input-base` |
| `os-dropdown-base` | KEEP + refactor to use surface | `os-dropdown-base` |
| `os-card-base` | KEEP + refactor to use surface | `os-card-base` |
| `os-option-item` | RENAME + refactor | `os-list-item-base` |
| `os-btn-outline-*` | CONSOLIDATE | `os-button-base` |
| `os-nav-button` | CONSOLIDATE | `os-icon-button-base` |
| `dashboard-*` mixins | EVALUATE | Keep or consolidate |
| `ag-grid-*` mixins | KEEP | Vendor-specific |
| `chart-*` mixins | KEEP | Chart-specific |

## Migration Strategy

### Phase 1: Create Level 1 Bases
1. Add `os-surface-base` mixin
2. Add `os-interactive-base` mixin
3. Add `os-feedback-base` mixin
4. Document with JSDoc comments

### Phase 2: Refactor Level 2 Mixins
1. Refactor existing mixins to use Level 1 bases
2. Add missing Level 2 mixins
3. Consolidate duplicates
4. Remove deprecated mixins

### Phase 3: Migrate Components
1. Update shared components to use new mixins
2. Update view components
3. Verify visual parity in both themes

### Phase 4: Documentation
1. Update constitution.md with SCSS rules
2. Add mixin usage examples
3. Document hierarchy

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking visual appearance | Test each component in both themes |
| Specificity conflicts | Keep mixin selectors minimal |
| Circular dependencies | Clear hierarchy: L1 → L2 → Components |
| Bundle size increase | Verify with `ng build --stats-json` |

## Complexity Tracking

No constitution violations - this is a refactoring effort that reduces complexity.
