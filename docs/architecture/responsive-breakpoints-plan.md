# Responsive Breakpoints Architecture Plan

> **Status:** Draft | **Created:** 2026-01-22

## Problem Statement

Current responsive implementation has several issues:
- Hardcoded breakpoint `768px` used in 52+ places
- Inconsistent values (`768px` vs `767px` vs `769px`)
- No centralized breakpoint variables
- Breakpoint too small for modern devices (tablets in landscape: 1024px)
- Gap between `tablet` (768px) and `desktop` (1024px) mixins

## Current State Analysis

### Breakpoint Usage Statistics

| Breakpoint | Count | Context |
|------------|-------|---------|
| `max-width: 768px` | 52 | Layout, content, components |
| `max-width: 767px` | 8 | Inconsistent (1px difference) |
| `max-width: 480px` | 5 | Small screens |
| `min-width: 769px` | 2 | Desktop overlay |
| `max-width: 1024px` | 2 | Large screens |
| `max-width: 1200px` | 3 | XL screens |

### Existing Mixins (Underutilized)

```scss
// _mixins.scss:548-564 — Only 4 components use these!
@mixin mobile {
  @media (max-width: 480px) { @content; }
}

@mixin tablet {
  @media (max-width: 768px) { @content; }
}

@mixin desktop {
  @media (min-width: 1024px) { @content; }
}
```

### Device Viewport Reference

```
                    320    480    640    768    900    1024   1280   1440   1920
                     │      │      │      │      │       │      │      │      │
Phone portrait       ├──────┤
Phone landscape             ├──────────────┤
Tablet portrait                    ├───────┤
Tablet landscape                           ├───────┤
Laptop                                             ├──────────────┤
Desktop                                                           ├──────►

Current breakpoint:                ▲
                                  768px (too small for tablets landscape)

Proposed layout breakpoint:               ▲
                                         900px
```

---

## Proposed Architecture

### Principle: Separate Layout and Content Breakpoints

| Type | Purpose | Calculation |
|------|---------|-------------|
| **Layout** | Sidebar visible/hidden | Based on available content space |
| **Content** | Component adaptation | Standard grid breakpoints |

### Layout Breakpoint Calculation

```
Sidebar width:              256px
Minimum content width:      600px (comfortable for tables, forms)
────────────────────────────────
Total:                      856px → rounded to 900px
```

---

## Implementation Plan

### Phase 1: Add Variables (`_variables.scss`)

```scss
// ==============================================
// RESPONSIVE BREAKPOINTS
// Mobile-first approach, based on content needs
// ==============================================

// Content breakpoints (for component adaptation)
$breakpoint-sm: 480px !default;   // Phone portrait max
$breakpoint-md: 768px !default;   // Tablet portrait max
$breakpoint-lg: 1024px !default;  // Tablet landscape max
$breakpoint-xl: 1280px !default;  // Laptop max
$breakpoint-xxl: 1440px !default; // Desktop

// Layout breakpoint (for sidebar behavior)
// Sidebar hides when: viewport < sidebar-width + minimum-content-width
// 256px (sidebar) + 600px (min content) = 856px → rounded to 900px
$layout-breakpoint: 900px !default;
```

### Phase 2: Update Mixins (`_mixins.scss`)

```scss
// ==============================================
// RESPONSIVE BREAKPOINTS (Content)
// ==============================================

@mixin breakpoint-down($size) {
  @if $size == 'sm' {
    @media (max-width: vars.$breakpoint-sm) { @content; }
  } @else if $size == 'md' {
    @media (max-width: vars.$breakpoint-md) { @content; }
  } @else if $size == 'lg' {
    @media (max-width: vars.$breakpoint-lg) { @content; }
  } @else if $size == 'xl' {
    @media (max-width: vars.$breakpoint-xl) { @content; }
  }
}

@mixin breakpoint-up($size) {
  @if $size == 'sm' {
    @media (min-width: vars.$breakpoint-sm + 1) { @content; }
  } @else if $size == 'md' {
    @media (min-width: vars.$breakpoint-md + 1) { @content; }
  } @else if $size == 'lg' {
    @media (min-width: vars.$breakpoint-lg + 1) { @content; }
  } @else if $size == 'xl' {
    @media (min-width: vars.$breakpoint-xl + 1) { @content; }
  }
}

// ==============================================
// LAYOUT BREAKPOINTS (Sidebar/Header)
// ==============================================

@mixin layout-mobile {
  @media (max-width: vars.$layout-breakpoint) {
    @content;
  }
}

@mixin layout-desktop {
  @media (min-width: vars.$layout-breakpoint + 1) {
    @content;
  }
}
```

### Phase 3: Migrate Layout Components

**Files to update:**
- `src/app/containers/default-layout/default-layout.component.scss`
- `src/app/containers/default-layout/components/header/header.component.scss`
- `src/app/containers/default-layout/components/sidebar/sidebar.component.scss`

**Example migration:**

```scss
// BEFORE
&__mobile-toggle {
  display: none;
  @media (max-width: 768px) {
    display: flex;
  }
}

// AFTER
&__mobile-toggle {
  display: none;
  @include mixins.layout-mobile {
    display: flex;
  }
}
```

### Phase 4: Gradual Migration of Content Components

Migrate remaining 52+ hardcoded breakpoints to use mixins:

```scss
// BEFORE
@media (max-width: 768px) {
  padding: 12px;
}

// AFTER
@include mixins.breakpoint-down('md') {
  padding: map.get(vars.$os-spacing, '3');
}
```

---

## Coverage After Implementation

| Device | Viewport | Sidebar | Layout Mode |
|--------|----------|---------|-------------|
| iPhone SE | 375px | Hidden | Mobile |
| iPhone 14 Pro | 393px | Hidden | Mobile |
| iPhone 14 Pro Max (portrait) | 430px | Hidden | Mobile |
| iPhone 14 Pro Max (landscape) | 932px | Hidden | Mobile |
| iPad Mini (portrait) | 768px | Hidden | Mobile |
| iPad Mini (landscape) | 1024px | Visible | Desktop |
| iPad Pro 11" (portrait) | 834px | Hidden | Mobile |
| iPad Pro 11" (landscape) | 1194px | Visible | Desktop |
| MacBook Air 13" | 1440px | Visible | Desktop |
| Desktop | 1920px+ | Visible | Desktop |

---

## Migration Checklist

### Phase 1: Variables
- [ ] Add breakpoint variables to `_variables.scss`
- [ ] Document in constitution.md

### Phase 2: Mixins
- [ ] Update/add mixins in `_mixins.scss`
- [ ] Keep backward compatibility with existing `mobile`, `tablet`, `desktop` mixins
- [ ] Add deprecation notices to old mixins

### Phase 3: Layout Components
- [ ] `default-layout.component.scss` — Replace hardcoded breakpoints
- [ ] `header.component.scss` — Replace hardcoded breakpoints
- [ ] `sidebar.component.scss` — Replace hardcoded breakpoints
- [ ] Test on multiple viewports

### Phase 4: Content Components (Future)
- [ ] Identify all files with hardcoded `768px`
- [ ] Create migration script or manual migration
- [ ] Update component-by-component

---

## Benefits

1. **Single source of truth** — All breakpoints defined in one place
2. **Easy to adjust** — Change `$layout-breakpoint` to affect all layout components
3. **Semantic naming** — `layout-mobile` clearer than `max-width: 768px`
4. **Consistent behavior** — No more 1px discrepancies
5. **Future-proof** — Easy to add new breakpoints as devices evolve

---

## References

- [Bootstrap Breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Material Design Layout](https://m3.material.io/foundations/layout/understanding-layout)
