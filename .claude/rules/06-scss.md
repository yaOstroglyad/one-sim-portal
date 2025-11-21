# SCSS Architecture Rules

> **Created:** 2025-10-16 | **Last Updated:** 2025-11-21
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

## 🔧 Modern @use Syntax with Alias (CRITICAL)

**SCSS Module System is configured with `includePaths` in `angular.json`:**

```json
// angular.json configuration
"stylePreprocessorOptions": {
  "includePaths": [
    "src/scss"
  ]
}
```

### 🚨 CRITICAL: ALWAYS Import sass:map First

**When using `map.get()`, you MUST import `sass:map` module first:**

```scss
// ✅ CORRECT - Import sass:map FIRST (MANDATORY if using map.get)
@use "sass:map";
@use "variables" as vars;
@use "mixins" as mixins;

// ✅ CORRECT - Use map.get() (modern syntax)
.my-component {
  @include mixins.interactive-states();
  color: var(--os-color-primary);
  padding: map.get(vars.$os-spacing, '4');              // ✅ Modern
  font-size: map.get(vars.$os-font-sizes, 'sm');        // ✅ Modern
  border-radius: map.get(vars.$os-border-radius, 'medium'); // ✅ Modern
  box-shadow: map.get(vars.$os-shadows, 'lg');          // ✅ Modern
}
```

```scss
// ❌ WRONG - Global map-get() is deprecated in Dart Sass 3.0
@use "variables" as vars;

.my-component {
  padding: map-get(vars.$os-spacing, '4');  // ❌ Deprecated!
}
```

```scss
// ❌ WRONG - Legacy @import (deprecated in Dart Sass)
@import "../../../../scss/variables";
@import "../../../../scss/mixins";

// ❌ WRONG - Long relative paths (no longer needed)
@use "../../../../scss/variables" as vars;
```

### Import Order Template (COPY THIS)

```scss
// ✅ CORRECT - Standard import order for ALL component SCSS files
@use "sass:map";           // FIRST (if using map.get())
@use "variables" as vars;  // SECOND (always needed)
@use "mixins" as mixins;   // THIRD (if using mixins)

// Your styles here
```

### Available SCSS Maps in _variables.scss

**CRITICAL: These are MAPS, not direct variables. Use `map.get()` to access:**

```scss
// Spacing map (Tailwind-inspired)
$os-spacing: (
  '0': 0,
  'px': 1px,
  '1': 0.25rem,
  '2': 0.5rem,
  '3': 0.75rem,
  '4': 1rem,
  '5': 1.25rem,
  '6': 1.5rem,
  '8': 2rem,
  '10': 2.5rem,
  '12': 3rem
);

// Font size map
$os-font-sizes: (
  'xs': 0.75rem,
  'sm': 0.875rem,
  'base': 1rem,
  'lg': 1.125rem,
  'xl': 1.25rem,
  '2xl': 1.5rem
);

// Border radius map
$os-border-radius: (
  'none': 0,
  'small': 0.125rem,
  'medium': 0.375rem,
  'large': 0.5rem,
  'xl': 0.75rem,
  'full': 9999px
);

// Shadow map
$os-shadows: (
  'none': none,
  'sm': (0 1px 2px rgba(0, 0, 0, 0.05)),
  'default': (0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)),
  'md': (0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)),
  'lg': (0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05))
);
```

### Import Order in Component Files (MANDATORY)
```scss
@use "sass:map";           // ALWAYS FIRST (if using map.get())
@use "variables" as vars;  // ALWAYS SECOND
@use "mixins" as mixins;   // ALWAYS THIRD (if needed)
```

**Why this order?**
- `sass:map` provides the `map.get()` function (replaces deprecated global `map-get()`)
- `variables` contains all maps that you'll access with `map.get()`
- `mixins` may depend on variables, so comes last

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

## 🔄 Decision Tree: Adding New Styles (CRITICAL - READ FIRST)

**🚨 STRICT RULE: MAXIMIZE REUSABILITY - DON'T DUPLICATE CODE**

**Before writing ANY new styles, follow this MANDATORY process:**

### Step 1: Check if it Already Exists
```
❓ Does this style pattern already exist?
├── ✅ YES → USE IT, don't recreate
└── ❓ NO → Continue to Step 2
```

### Step 2: Is it Reusable?
```
❓ Will this style be used in multiple places (now or in the future)?
├── ✅ YES → Add to shared system (_variables.scss, _mixins.scss, etc.)
└── ❓ ONLY IN THIS COMPONENT → Component-specific file (component.scss)
```

### Step 3: Where to Add Reusable Styles
```
Need new style?
├── Is it a value (spacing, color, size)? → _variables.scss (add to appropriate map)
├── Is it a pattern/mixin? → _mixins.scss
├── Is it a utility class? → _utilities.scss
├── Is it a shared component pattern? → _components.scss
├── Is it a vendor override? → _vendor-overrides.scss
├── Is it a layout style? → _layout.scss
└── Is it truly component-specific? → component.scss file
```

### 🚨 CRITICAL ANTI-PATTERNS TO AVOID

**❌ FORBIDDEN - Hardcoding Values:**
```scss
// ❌ WRONG - Magic numbers
.my-component {
  margin: 16px;           // Should use map-get(vars.$os-spacing, '4')
  padding: 12px 8px;      // Should use spacing map values
  font-size: 14px;        // Should use map-get(vars.$os-font-sizes, 'sm')
  border-radius: 6px;     // Should use map-get(vars.$os-border-radius, 'medium')
  color: #2c2c2c;         // Should use var(--os-color-text-primary)
}
```

**❌ FORBIDDEN - Duplicating Existing Patterns:**
```scss
// ❌ WRONG - This pattern already exists in _mixins.scss
.my-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // This is ALREADY in @include mixins.dashboard-card-header()
}
```

**✅ REQUIRED - Before Adding Any Style:**

1. **Check _variables.scss** - Is there a map value?
   ```scss
   // ✅ CORRECT - Use existing map values (with sass:map import)
   @use "sass:map";
   @use "variables" as vars;

   padding: map.get(vars.$os-spacing, '4');  // 1rem - Modern syntax
   font-size: map.get(vars.$os-font-sizes, 'sm'); // 0.875rem - Modern syntax
   ```

2. **Check _mixins.scss** - Is there a mixin for this?
   ```scss
   // ✅ CORRECT - Use existing mixin
   @include mixins.dashboard-card-header();
   ```

3. **Check CSS Variables** - Use semantic colors
   ```scss
   // ✅ CORRECT - Use CSS variables
   color: var(--os-color-text-primary);
   background: var(--os-color-gray-50);
   ```

4. **If value doesn't exist and is reusable** → ADD IT to _variables.scss
   ```scss
   // ✅ CORRECT - Add new spacing value to map if needed
   // In _variables.scss, add to $os-spacing map:
   '2-5': 0.65rem,  // New reusable value
   ```

**Quick Checklist (MANDATORY):**
1. ✅ Did I import `@use "sass:map";` FIRST (before other imports)?
2. ✅ Does similar value/pattern already exist in variables/mixins?
3. ✅ Am I using `map.get()` (NOT `map-get()`) for spacing, fonts, border-radius?
4. ✅ Am I using CSS variables (var(--os-color-*)) for colors?
5. ✅ If this is reusable, did I add it to shared files?
6. ✅ Am I following the design system (no magic numbers)?

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
// ✅ CORRECT - Import sass:map FIRST, then simple alias imports
@use "sass:map";           // FIRST - Required for map.get()
@use "variables" as vars;  // SECOND
@use "mixins" as mixins;   // THIRD

.os-my-component {
  @include mixins.generate-os-colors('my-component');
  @include mixins.responsive-spacing();

  // ✅ Using map.get() for spacing, border-radius, shadows
  padding: map.get(vars.$os-spacing, '4');                  // 1rem
  border-radius: map.get(vars.$os-border-radius, 'medium'); // 0.375rem
  color: var(--os-color-text-primary);

  &__element {
    font-size: map.get(vars.$os-font-sizes, 'sm');   // 0.875rem
    color: var(--os-color-text-secondary);
  }

  &--variant {
    box-shadow: map.get(vars.$os-shadows, 'lg');
    background-color: var(--os-color-gray-50);       // CSS variable
  }
}
```

### ❌ BAD Component SCSS
```scss
// Multiple issues here:
@import "../../../../scss/variables";          // ❌ Using @import (deprecated)
@use "../../../../scss/variables" as vars;     // ❌ Long relative path
// ❌ MISSING: @use "sass:map";

.my-component { // ❌ No 'os-' prefix
  padding: 16px;                  // ❌ Hardcoded value (should use map.get)
  margin: 8px 12px 16px 4px;      // ❌ Inconsistent spacing
  background: #f9a743;            // ❌ Hardcoded color
  border-radius: 6px;             // ❌ Magic number
  color: #2c2c2c;                 // ❌ Should use var(--os-color-text-primary)
  padding: map-get(vars.$os-spacing, '4'); // ❌ Deprecated map-get() (should use map.get)

  .element { // ❌ Not using BEM
    font-size: 14px; // ❌ Magic number (should use map.get)
  }
}
```

---

## 📝 Development Workflow

### Before Adding Styles - MANDATORY Checks:

1. ❓ Did I add `@use "sass:map";` as the FIRST import?
2. ❓ Does a similar value/pattern already exist in _variables.scss or _mixins.scss?
3. ❓ Can I use an existing mixin instead of writing custom CSS?
4. ❓ Am I using `map.get()` (NOT `map-get()`) for spacing, fonts, border-radius, shadows?
5. ❓ Am I using CSS variables (var(--os-color-*)) instead of hardcoded colors?
6. ❓ If this is reusable, did I add it to _variables.scss map?
7. ❓ Is this component-specific or should it be in shared files?
8. ❓ Am I using simple alias import (@use "variables" as vars)?

### Code Review Checklist (STRICT ENFORCEMENT):

- [ ] ✅ **CRITICAL**: `@use "sass:map";` imported FIRST (before all other imports)
- [ ] ✅ Simple alias import: `@use "variables" as vars;` (not long relative paths)
- [ ] ✅ Using `map.get()` (NOT `map-get()`) for all spacing, fonts, border-radius, shadows
- [ ] ✅ CSS variables (var(--os-color-*)) used for ALL colors
- [ ] ✅ No hardcoded values (16px, 14px, #2c2c2c, etc.)
- [ ] ✅ No duplication of existing utilities/mixins
- [ ] ✅ BEM methodology followed for component classes
- [ ] ✅ @use syntax (NEVER @import)
- [ ] ✅ Imports in correct order (sass:map → variables → mixins)
- [ ] ✅ Dashboard mixins used (if dashboard component)
- [ ] ✅ No deep nesting (max 3 levels)
- [ ] ✅ Reusable values added to _variables.scss maps
- [ ] ✅ Reusable patterns added to _mixins.scss

---

## 🎯 Summary

**Goal**: Maintainable, scalable, consistent SCSS architecture with ZERO code duplication

**Core Principles:**
1. **DRY (Don't Repeat Yourself)** - If a style is used twice, it belongs in shared files
2. **Single Source of Truth** - All reusable values in _variables.scss maps
3. **Modern SCSS Modules** - Use `@use "sass:map"` FIRST, then `@use "variables" as vars`
4. **Design System First** - Use `map.get()` and CSS variables, never hardcode
5. **Maximize Reusability** - Add new values to maps if they might be reused

**Result**: Faster development, easier maintenance, consistent UI, zero duplication

**Quick Reference (Copy-Paste Template):**
```scss
// Standard imports (MANDATORY ORDER)
@use "sass:map";           // FIRST - Required for map.get()
@use "variables" as vars;  // SECOND
@use "mixins" as mixins;   // THIRD (if needed)

// Values (use design system)
padding: map.get(vars.$os-spacing, '4');              // ✅ Not 16px
font-size: map.get(vars.$os-font-sizes, 'sm');        // ✅ Not 14px
border-radius: map.get(vars.$os-border-radius, 'medium'); // ✅ Not 6px
box-shadow: map.get(vars.$os-shadows, 'lg');          // ✅ Not custom
color: var(--os-color-text-primary);                  // ✅ Not #2c2c2c
```

