# SCSS Architecture Rules

> **Created:** 2025-10-16 | **Last Updated:** 2025-11-15
> **Context Tags:** `@styling` `@creating-new` `@learn-patterns`
> **Read when:** Writing SCSS/CSS or styling components

---

## 📋 File Structure & Organization

### Core Foundation Files
```
src/scss/
├── _variables.scss         // Variables and maps ONLY
├── _mixins.scss           // All mixins (generate-colors, component patterns)
├── _utilities.scss        // All utility classes (spacing, shadows, etc.)
├── _components.scss       // Shared component patterns
├── _vendor-overrides.scss // AG-Grid, Material, CoreUI overrides
├── _layout.scss          // Layout and grid systems
├── _fixes.scss           // Temporary fixes (should be minimal)
└── styles.scss           // Main entry point
```

**Import order matters**: Variables → Mixins → Utilities → Components → Vendor → Layout → Fixes

---

## 🚨 CRITICAL Rules

### ❌ FORBIDDEN

1. **Duplicating Utilities**
   ```scss
   // ❌ WRONG - Creating new spacing utilities
   .my-component-spacing { margin: 16px; }

   // ✅ CORRECT - Use existing utilities
   .my-component {
     margin: map-get($spacing, '4');
   }
   ```

2. **Hardcoded Values**
   ```scss
   // ❌ WRONG - Magic numbers
   box-shadow: 0 4px 8px rgba(0,0,0,0.1);
   color: #2c2c2c;

   // ✅ CORRECT - System values
   box-shadow: map-get($shadows, 'md');
   color: var(--os-color-text-primary);
   ```

3. **Component-Specific Files in src/scss/**
   ```scss
   // ❌ WRONG - Don't create _my-component-utilities.scss
   // ✅ CORRECT - Component styles belong in component.scss
   ```

4. **Using @import (Deprecated)**
   ```scss
   // ❌ WRONG - Legacy syntax
   @import "../../../../scss/variables";

   // ✅ CORRECT - Modern @use syntax
   @use "../../../../scss/variables" as vars;
   ```

### ✅ ALLOWED

1. **_variables.scss** - Variables only
   - Color maps, spacing scales, font sizes
   - CSS custom properties
   - NO mixins or utilities

2. **_mixins.scss** - All functions and mixins
   - Color generators
   - Component patterns
   - Responsive helpers

3. **_utilities.scss** - All utility classes
   - `.m-*`, `.p-*`, `.text-*`, `.bg-*`
   - Atomic CSS classes
   - NO component-specific logic

---

## 🎯 Responsibility Rules

**Each file has a single purpose:**

| File | Allowed | Forbidden |
|------|---------|-----------|
| `_variables.scss` | Variables, maps, CSS custom properties | Mixins, utilities, styles |
| `_mixins.scss` | Functions, mixins | Variables, utilities |
| `_utilities.scss` | Utility classes | Component-specific logic |
| `_components.scss` | Shared component patterns | Feature-specific styles |
| Component files | Component-specific styles | Global utilities, shared patterns |

---

## 🔧 Modern @use Syntax (CRITICAL)

**ALWAYS use @use instead of @import in all component files:**

```scss
// ✅ CORRECT - Modern @use syntax
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;
@use "../../../../scss/utilities" as utils;

// Usage with namespace
.my-component {
  @include mixins.interactive-states();
  color: var(--os-color-primary);
  padding: map-get(vars.$spacing, '4');
}
```

```scss
// ❌ WRONG - Legacy @import (deprecated in Dart Sass)
@import "../../../../scss/variables";
@import "../../../../scss/mixins";
```

### Import Order in Component Files
```scss
@use "../../../../scss/variables" as vars;  // ALWAYS first
@use "../../../../scss/mixins" as mixins;   // ALWAYS second
@use "../../../../scss/utilities" as utils; // Only if using utility maps
```

---

## 📐 Naming Conventions

### Component Classes (BEM Methodology)
```scss
// ✅ CORRECT - BEM naming
.os-component-name { }
.os-component-name__element { }
.os-component-name--modifier { }

// Example
.os-card { }
.os-card__header { }
.os-card__body { }
.os-card--primary { }
.os-card--outline { }
```

### Utility Classes (Tailwind-inspired)
```scss
// ✅ Standard utility naming
.m-{size}      // margin
.p-{size}      // padding
.text-{size}   // font-size
.bg-{color}    // background
.border-{color} // border
```

### Size Standards
```scss
// ✅ Consistent size scale
xs, sm, md, lg, xl, 2xl, 3xl  // For font, spacing, etc.
0, 1, 2, 3, 4, 5, 6           // For numeric spacing
```

---

## 🔄 Decision Tree: Adding New Styles

**Before adding styles, ask:**

```
Need new style?
├── Is it a CSS variable? → _variables.scss
├── Is it a mixin/function? → _mixins.scss
├── Is it a utility class? → _utilities.scss
├── Is it a component pattern? → _components.scss
├── Is it a vendor override? → _vendor-overrides.scss
├── Is it a layout style? → _layout.scss
└── Is it component-specific? → component.scss file
```

**Quick Checklist:**
1. ❓ Does similar utility already exist?
2. ❓ Can I use an existing mixin?
3. ❓ Does it follow our size scale?
4. ❓ Am I using CSS variables instead of hardcoded colors?

---

## 🎨 Color System

### CSS Variable Usage (REQUIRED)

**ALWAYS use CSS variables for colors. NEVER hardcode hex values.**

#### Global Gray Scale (Tailwind-inspired)
```scss
// Available gray shades (50-900)
--os-color-gray-50: #f9fafb;    // Lightest gray
--os-color-gray-100: #f3f4f6;
--os-color-gray-200: #e5e7eb;
--os-color-gray-300: #d1d5db;
--os-color-gray-400: #9ca3af;   // Muted text
--os-color-gray-500: #6b7280;   // Secondary text
--os-color-gray-600: #4b5563;
--os-color-gray-700: #374151;   // Dark backgrounds
--os-color-gray-800: #1f2937;   // Darker backgrounds
--os-color-gray-900: #111827;   // Darkest gray
```

#### Semantic Color Variables (Recommended)
```scss
// Text colors
--os-color-text-primary: #2c2c2c;    // Main headings, important text
--os-color-text-secondary: #6b7280;   // Subtitles, labels (gray-500)
--os-color-text-muted: #9ca3af;       // Disabled, subtle text (gray-400)

// Borders
--os-color-border: #e0e0e0;          // Default borders
--os-color-border-light: #f3f4f6;    // Very subtle borders (gray-100)

// Backgrounds
--os-color-bg-hover: #f5f5f5;        // Background on hover states
--os-color-bg-subtle: #f9fafb;       // Very light backgrounds (gray-50)
```

#### Usage Guide

| Use Case | Variable | Example |
|----------|----------|---------|
| Main headings, titles | `--os-color-text-primary` | Dashboard title |
| Labels, descriptions | `--os-color-text-secondary` | Form labels, card subtitles |
| Disabled/muted text | `--os-color-text-muted` | Disabled button text |
| Default borders | `--os-color-border` | Input borders, dividers |
| Subtle borders | `--os-color-border-light` | Card outlines |
| Hover backgrounds | `--os-color-bg-hover` | Button hover, row hover |
| Light backgrounds | `--os-color-bg-subtle` | Card backgrounds |
| Dark theme backgrounds | `--os-color-gray-700/800` | Dark mode cards |
| Dark theme text | `--os-color-gray-400` | Dark mode secondary text |

### Component Color Generation

```scss
// ✅ CORRECT - Use color generator
@use "../../../../scss/variables" as vars;

:host {
  @include vars.generate-os-colors('my-component');

  // This automatically creates:
  // .my-component--primary, .my-component--blue, etc. (solid)
  // .my-component--outline.my-component--primary (outline)
  // .my-component--subtle.my-component--primary (subtle)
}
```

**Available for**: badges, buttons, alerts, notifications, cards, and any component needing color variants.

**Benefits**:
- Single source of truth for colors
- Auto-generation of solid, outline, and subtle variants
- Full CSS variable support for theming
- Easy to add new colors globally

---

## 📱 Responsive Design

### Standard Breakpoints
```scss
// ✅ Use standard breakpoints
@media (max-width: 768px) { } // Tablet
@media (max-width: 480px) { } // Mobile

// ✅ Responsive mixins (if available)
@include mixins.responsive-spacing();
@include mixins.responsive-typography();
```

---

## 🚨 Dashboard Components (CRITICAL)

### Dashboard Mixins (ALWAYS Use These)

**CRITICAL: Use dashboard mixins from `src/scss/_mixins.scss` instead of duplicating styles:**

```scss
// ✅ ALWAYS use these mixins for dashboard components
@include mixins.dashboard-card-header();        // Consistent headers (1.25rem, proper spacing)
@include mixins.dashboard-chart-container($h);  // Chart containers with proper sizing
@include mixins.dashboard-kpi-grid($columns);   // Responsive KPI card grids
@include mixins.dashboard-chart-legend();       // Chart legends with colored dots
@include mixins.dashboard-demographics-row();   // Two-column responsive layout
@include mixins.dashboard-metric-summary();     // Metric displays (retention, churn)
@include mixins.dashboard-reason-bars();        // Horizontal bar charts for analysis
@include mixins.dashboard-dark-theme();         // Consistent dark theme support

// ❌ NEVER duplicate these patterns manually:
.card-header {
  display: flex;
  justify-content: space-between; // This is already in dashboard-card-header()
  // DON'T DO THIS!
}
```

### Chart Component Mixins
```scss
// ✅ ALWAYS use for chart components
@include mixins.chart-complete($component-name, $icon);  // Full chart styling
@include mixins.chart-canvas($component-name);           // Canvas styling
@include mixins.chart-responsive($component-name);       // Responsive behavior
@include mixins.chart-accessibility($component-name);    // A11y support

// ❌ NEVER duplicate canvas overflow fixes manually
```

---

## 🎯 Performance Guidelines

1. **Avoid deep nesting** (max 3 levels)
   ```scss
   // ✅ GOOD - Flat structure
   .component { }
   .component__element { }
   .component__element--modifier { }

   // ❌ BAD - Too nested
   .component {
     .wrapper {
       .element {
         .inner { } // 4 levels!
       }
     }
   }
   ```

2. **Use CSS custom properties** for runtime changes
3. **Group related styles** in one place
4. **Minimize @use imports** in component files (only what you need)

---

## 📚 Examples

### ✅ GOOD Component SCSS
```scss
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;

.os-my-component {
  @include mixins.generate-os-colors('my-component');
  @include mixins.responsive-spacing();

  padding: map-get(vars.$spacing, '4');
  border-radius: map-get(vars.$border-radius, 'medium');
  color: var(--os-color-text-primary);

  &__element {
    font-size: map-get(vars.$font-sizes, 'sm');
    color: var(--os-color-text-secondary);
  }

  &--variant {
    box-shadow: map-get(vars.$shadows, 'lg');
    background-color: var(--os-color-bg-subtle);
  }
}
```

### ❌ BAD Component SCSS
```scss
// Multiple issues here:
@import "../../../../scss/variables"; // ❌ Using @import

.my-component { // ❌ No 'os-' prefix
  padding: 16px; // ❌ Hardcoded value
  margin: 8px 12px 16px 4px; // ❌ Inconsistent spacing
  background: #f9a743; // ❌ Hardcoded color
  border-radius: 6px; // ❌ Magic number
  color: #2c2c2c; // ❌ Should use var(--os-color-text-primary)

  .element { // ❌ Not using BEM
    font-size: 14px; // ❌ Magic number
  }
}
```

---

## 📝 Development Workflow

### Before Adding Styles - Ask Yourself:

1. ❓ Does a similar utility already exist?
2. ❓ Can I use an existing mixin?
3. ❓ Does this follow our size scale?
4. ❓ Am I using CSS variables instead of hardcoded values?
5. ❓ Is this component-specific or should it be in shared files?

### Code Review Checklist:

- [ ] No duplication of existing utilities
- [ ] CSS variables used instead of hardcoded colors
- [ ] BEM methodology followed
- [ ] @use syntax (not @import)
- [ ] Imports in correct order
- [ ] Responsive design considered
- [ ] Dashboard mixins used (if dashboard component)
- [ ] No deep nesting (max 3 levels)

---

## 🎯 Summary

**Goal**: Maintainable, scalable, consistent SCSS architecture
**Principle**: DRY (Don't Repeat Yourself) + Single Source of Truth
**Result**: Faster development, easier maintenance, consistent UI

