# Feature Specification: SCSS Architecture Refactor

**Feature Branch**: `017-gmail-layout` (continuation)
**Created**: 2026-01-03
**Status**: Draft
**Input**: Analysis of dark theme fixes commit (e8b0221) + docs/dark-theme-fixes-2026-01-03.md

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abstract Base Mixins (Priority: P1)

As a developer, I want abstract base mixins for each UI pattern type so that I can compose component styles without duplicating code.

**Why this priority**: Foundation for all other work. Abstract bases enable consistent styling across the entire application.

**Independent Test**: Any new component can be styled using only base mixins with parameters, without writing custom CSS for common patterns.

**Key Concept - Hierarchical Composition**:

```scss
// Level 1: Super-abstract base (shared by all surfaces)
@mixin os-surface-base($bg, $border, $radius: 0.375rem) {
  background-color: var(#{$bg});
  border: 1px solid var(#{$border});
  border-radius: $radius;
}

// Level 2: Specialized bases inherit from surface
@mixin os-input-base($height: 44px) {
  @include os-surface-base(--layout-input-bg, --layout-input-border);
  height: $height;
  // + focus, disabled, placeholder states
}

@mixin os-dropdown-base($min-width: 280px) {
  @include os-surface-base(--layout-menu-bg, --layout-menu-border, 0.5rem);
  position: absolute;
  z-index: 1050;
  box-shadow: var(--layout-menu-shadow);
  // + animation
}

// Level 3: Component uses specialized base
.my-select__input { @include os-input-base(40px); }
.my-popup { @include os-dropdown-base(300px); }

// Or directly use surface for custom components
.my-custom-panel {
  @include os-surface-base(--layout-frame-bg, --layout-frame-border, 0.5rem);
  padding: map.get($os-spacing, '4');
}
```

**Acceptance Scenarios**:

1. **Given** I need a themed surface, **When** I use `@include os-surface-base(...)`, **Then** I get background + border + radius
2. **Given** I need an input field, **When** I use `@include os-input-base($height)`, **Then** I get surface + input-specific states
3. **Given** I need a custom component, **When** I compose bases, **Then** I don't duplicate any styling code

**Mixin Hierarchy**:

```
os-surface-base (bg, border, radius)
│
├── os-input-base (+ height, focus, disabled, placeholder)
├── os-dropdown-base (+ position, z-index, shadow, animation)
├── os-card-base (+ padding, optional shadow)
├── os-panel-base (+ header, content areas)
├── os-overlay-base (+ fixed position, backdrop)
│
└── os-table-base (+ overflow, structure)
    ├── os-table-header-base (+ bg, text, border-bottom)
    ├── os-table-row-base (+ border, hover, selected)
    ├── os-table-cell-base (+ padding, alignment)
    └── os-table-actions-base (+ button group)

os-interactive-base (cursor, transition, hover states)
│
├── os-button-base (+ height, padding, disabled)
├── os-list-item-base (+ padding, selected state)
├── os-icon-button-base (+ size, centered content)
└── os-table-sortable-base (+ cursor, icon, active state)

os-feedback-base (colors for status)
│
├── os-spinner-base (+ animation)
├── os-alert-base (+ icon area, padding)
└── os-badge-base (+ small size, inline)
```

**Base Mixins Summary**:

| Level | Mixin | Inherits From | Adds |
|-------|-------|---------------|------|
| 1 | `os-surface-base` | — | bg, border, radius |
| 1 | `os-interactive-base` | — | cursor, transition, hover |
| 1 | `os-feedback-base` | — | status colors |
| 2 | `os-input-base` | surface | height, focus, disabled |
| 2 | `os-dropdown-base` | surface | position, shadow, animation |
| 2 | `os-card-base` | surface | padding, shadow |
| 2 | `os-button-base` | surface + interactive | height, padding |
| 2 | `os-list-item-base` | interactive | padding, selected |
| 2 | `os-spinner-base` | feedback | size, animation |
| 2 | `os-table-base` | surface | overflow, structure |
| 3 | `os-table-header-base` | table | bg, text, border-bottom |
| 3 | `os-table-row-base` | table | border, hover, selected |
| 3 | `os-table-cell-base` | table | padding, alignment |
| 3 | `os-table-actions-base` | table | button group |
| 2 | `os-table-sortable-base` | interactive | cursor, icon, active |

---

### User Story 2 - No Mixin Duplication (Priority: P1)

As a developer, I want each concept to have exactly ONE mixin so that I don't have to choose between similar mixins or accidentally create duplicates.

**Why this priority**: Prevents code bloat and confusion. One source of truth per pattern.

**Independent Test**: Searching for similar functionality in `_mixins.scss` returns only ONE mixin per concept.

**Acceptance Scenarios**:

1. **Given** I search for "input" mixins, **When** I look at results, **Then** I find only `os-input-base` (not multiple input mixins)
2. **Given** I need a card style, **When** I search mixins, **Then** I find only `os-card-base` (not card, panel, section mixins separately)
3. **Given** existing duplicate mixins, **When** refactor completes, **Then** duplicates are consolidated into one abstract base

**Consolidation Map**:

| Concept | Consolidate These | Into This | Inherits From |
|---------|-------------------|-----------|---------------|
| Surfaces | bg + border patterns | `os-surface-base` | — (Level 1) |
| Inputs | `os-input-base`, form-control styles | `os-input-base` | `os-surface-base` |
| Dropdowns | `os-dropdown-base`, popup, menu styles | `os-dropdown-base` | `os-surface-base` |
| Cards | `os-card-base`, panel, section styles | `os-card-base` | `os-surface-base` |
| Buttons | button styles, `os-btn-*` | `os-button-base` | `os-surface-base` + `os-interactive-base` |
| Items | `os-option-item`, list items, menu items | `os-list-item-base` | `os-interactive-base` |
| Spinners | loading spinner patterns | `os-spinner-base` | `os-feedback-base` |

---

### User Story 3 - Update Project SCSS Rules (Priority: P2)

As a team member, I want updated SCSS rules in constitution.md so that everyone follows the same patterns and the codebase stays consistent.

**Why this priority**: Documentation ensures long-term consistency.

**Independent Test**: A new developer reading constitution.md understands how to write SCSS in this project.

**Acceptance Scenarios**:

1. **Given** constitution.md, **When** I read SCSS section, **Then** I understand: use base mixins, no hardcoded colors, use CSS variables
2. **Given** I want to add new styles, **When** I follow the rules, **Then** my code matches existing patterns
3. **Given** existing components, **When** I compare to rules, **Then** they follow the documented patterns

**Rules to Document**:
- Always use `--layout-*` variables for theme-adaptive colors
- Always use `--os-color-*` variables for accent colors only
- Use base mixins for common patterns
- Max nesting: 3-4 levels
- Use `@include`, avoid `@extend`
- Use design tokens (`$os-spacing`, `$os-shadows`, etc.)

---

### User Story 4 - Clean Code Principles (Priority: P2)

As a maintainer, I want SCSS that follows clean code principles so that the codebase is easy to maintain and extend.

**Why this priority**: Prevents technical debt accumulation.

**Independent Test**: Any component SCSS file is under 100 lines and uses composition.

**Acceptance Scenarios**:

1. **Given** a component SCSS file, **When** I count nesting levels, **Then** max depth is 3-4
2. **Given** numeric values in SCSS, **When** I check them, **Then** they come from design tokens (not magic numbers)
3. **Given** a component needing multiple patterns, **When** I style it, **Then** I compose multiple base mixins

**Clean Code Rules**:

| Rule | Description | Example |
|------|-------------|---------|
| **Max Nesting 3-4** | Avoid deep nesting | `.block { &__element { &--modifier { ... }}}` max |
| **No Magic Numbers** | Use tokens | `padding: map.get($os-spacing, '4')` not `padding: 16px` |
| **Composition** | Combine bases | `@include os-card-base(); @include os-input-base();` |
| **No @extend** | Prefer @include | Avoids specificity issues |
| **Consistent Units** | rem for text, px for borders | `font-size: 0.875rem; border: 1px solid` |
| **Single Responsibility** | One mixin = one job | `os-input-base` does inputs only |

---

### Edge Cases

- What about third-party component overrides (Material, CoreUI)? → Use `_vendor-overrides.scss`
- What if mixin doesn't fit my case? → Extend with parameters, don't create new mixin
- What about inline styles in TypeScript? → Migrate to CSS variables where possible

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mixins MUST follow 2-level hierarchy (Level 1 abstract → Level 2 specialized)
- **FR-002**: Level 1 mixins: `os-surface-base`, `os-interactive-base`, `os-feedback-base`
- **FR-003**: Level 2 mixins MUST inherit from Level 1 bases
- **FR-004**: Base mixins MUST accept parameters for customization
- **FR-005**: Mixins MUST use `--layout-*` CSS variables for theme colors
- **FR-006**: Existing duplicate mixins MUST be consolidated into hierarchy
- **FR-007**: Component SCSS files MUST use base mixins via composition
- **FR-008**: Nesting MUST NOT exceed 4 levels
- **FR-009**: Numeric values SHOULD use design tokens
- **FR-010**: `constitution.md` MUST be updated with SCSS rules
- **FR-011**: `@extend` SHOULD NOT be used (prefer `@include`)

### Key Entities

- **Level 1 Mixins (Abstract)**: `os-surface-base`, `os-interactive-base`, `os-feedback-base`
- **Level 2 Mixins (Specialized)**: `os-input-base`, `os-dropdown-base`, `os-card-base`, `os-button-base`, `os-list-item-base`, `os-spinner-base`, `os-overlay-base`, `os-panel-base`, `os-icon-button-base`, `os-alert-base`, `os-badge-base`, `os-table-base`, `os-table-sortable-base`
- **Level 3 Mixins (Table)**: `os-table-header-base`, `os-table-row-base`, `os-table-cell-base`, `os-table-actions-base`
- **Design Tokens**: `$os-spacing`, `$os-shadows`, `$os-border-radius`, `$os-font-sizes`
- **CSS Variables**: `--layout-*` (theme-adaptive), `--os-color-*` (accent)
- **Documentation**: `constitution.md` Section VII (SCSS)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each UI pattern has exactly 1 base mixin (no duplicates)
- **SC-002**: 0 hardcoded colors in component SCSS files
- **SC-003**: Max nesting depth ≤ 4 in all SCSS files
- **SC-004**: 80%+ numeric values use design tokens
- **SC-005**: constitution.md has complete SCSS rules section
- **SC-006**: All component SCSS files use composition (base mixins)
- **SC-007**: Dark theme works correctly for all components
