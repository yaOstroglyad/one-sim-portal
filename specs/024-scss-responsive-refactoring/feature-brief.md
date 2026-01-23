# SCSS Responsive Architecture Refactoring

> **Feature Brief for Speckit**

## Goal

Refactor SCSS architecture to achieve:
- **Adaptive application** — works on all devices (phones, tablets, laptops, desktops)
- **Clean SCSS** — no duplication, well-organized, consistent
- **Proper architecture** — centralized variables and mixins
- **Reusability** — everything extractable goes into mixins/variables

---

## Current State Analysis

### Problem 1: Inconsistent Breakpoints

| Breakpoint | Count | Location |
|------------|-------|----------|
| `max-width: 768px` | 52 | Multiple files |
| `max-width: 767px` | 8 | `_vendor-overrides.scss` |
| `min-width: 769px` | 2 | `default-layout.component.scss` |
| `max-width: 480px` | 5 | Various |
| `max-width: 1024px` | 2 | `_fab-layout.scss` |
| `max-width: 1200px` | 3 | Various |

**Issue:** 12 different breakpoint values, no centralization, off-by-one errors (767 vs 768 vs 769).

### Problem 2: Code Duplication (~111 lines)

`docs-layout.component.scss` copies styles from `default-layout.component.scss`:

| Duplicated Selector | Lines |
|---------------------|-------|
| `.layout` base | ~10 |
| `.layout--rtl` | ~3 |
| `.layout__main` | ~30 |
| `.layout__content` | ~10 |
| `.layout__container` | ~12 |
| `.layout__mobile-overlay` | ~20 |

Comment says "Reuse the same layout styles" but code is copied, not reused.

### Problem 3: Underutilized Mixins

Existing mixins in `_mixins.scss`:
```scss
@mixin mobile { @media (max-width: 480px) { @content; } }
@mixin tablet { @media (max-width: 768px) { @content; } }
@mixin desktop { @media (min-width: 1024px) { @content; } }
```

**Usage:** Only 4 out of 79 media queries use these mixins. Rest are hardcoded.

### Problem 4: Layout Breakpoint Too Small

Current `768px` breakpoint doesn't cover:
- iPhone 14 Pro Max landscape: 932px
- iPad Mini landscape: 1024px
- Most tablets in landscape mode

Sidebar remains visible when there's not enough space for content.

### Problem 5: Deprecated/Orphaned Files

- `_custom.scss` — Empty, marked DEPRECATED (14 lines of comments)

---

## Device Viewport Reference

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
                                  768px (too small)

Proposed layout breakpoint:               ▲
                                         900px
```

### Layout Breakpoint Calculation

```
Sidebar width:              256px
Minimum content width:      600px (comfortable for tables, forms)
────────────────────────────────
Total:                      856px → rounded to 900px
```

---

## Target Architecture

### 1. Centralized Breakpoint Variables (`_variables.scss`)

```scss
// Content breakpoints (for component adaptation)
$breakpoint-sm: 480px !default;   // Phone portrait
$breakpoint-md: 768px !default;   // Tablet portrait
$breakpoint-lg: 1024px !default;  // Tablet landscape
$breakpoint-xl: 1280px !default;  // Laptop
$breakpoint-xxl: 1440px !default; // Desktop

// Layout breakpoint (sidebar behavior)
$layout-breakpoint: 900px !default;
```

### 2. Responsive Mixins (`_mixins.scss`)

```scss
// Content breakpoints
@mixin breakpoint-down($size) {
  @if $size == 'sm' { @media (max-width: vars.$breakpoint-sm) { @content; } }
  @else if $size == 'md' { @media (max-width: vars.$breakpoint-md) { @content; } }
  @else if $size == 'lg' { @media (max-width: vars.$breakpoint-lg) { @content; } }
  @else if $size == 'xl' { @media (max-width: vars.$breakpoint-xl) { @content; } }
}

@mixin breakpoint-up($size) {
  @if $size == 'sm' { @media (min-width: vars.$breakpoint-sm + 1) { @content; } }
  @else if $size == 'md' { @media (min-width: vars.$breakpoint-md + 1) { @content; } }
  @else if $size == 'lg' { @media (min-width: vars.$breakpoint-lg + 1) { @content; } }
  @else if $size == 'xl' { @media (min-width: vars.$breakpoint-xl + 1) { @content; } }
}

// Layout breakpoints (sidebar/header)
@mixin layout-mobile {
  @media (max-width: vars.$layout-breakpoint) { @content; }
}

@mixin layout-desktop {
  @media (min-width: vars.$layout-breakpoint + 1) { @content; }
}
```

### 3. Shared Layout Styles (`_layout-base.scss` or mixin)

Extract common layout styles used by both `default-layout` and `docs-layout`:

```scss
@mixin layout-base {
  display: flex;
  min-height: 100vh;
  background: var(--layout-frame-bg);
  color: var(--layout-frame-text);
  transition: background 0.3s ease, color 0.3s ease;
}

@mixin layout-main-base {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: vars.$layout-sidebar-width;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: vars.$layout-header-height;
  height: 100vh;
  box-sizing: border-box;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @include layout-mobile {
    margin-left: 0;
    margin-right: 0;
  }
}

@mixin layout-mobile-overlay {
  position: fixed;
  top: vars.$layout-header-height;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  &--visible {
    opacity: 1;
    visibility: visible;
  }

  @include layout-desktop {
    display: none;
  }
}
```

### 4. Component Usage Pattern

```scss
// default-layout.component.scss
.layout {
  @include mixins.layout-base;

  &__main {
    @include mixins.layout-main-base;
    // Component-specific additions (inverted corners, etc.)
  }

  &__mobile-overlay {
    @include mixins.layout-mobile-overlay;
  }
}

// docs-layout.component.scss
.layout {
  @include mixins.layout-base;

  &__main {
    @include mixins.layout-main-base;
  }

  &__mobile-overlay {
    @include mixins.layout-mobile-overlay;
  }
}
// + docs-specific styles (.docs-grid, .docs-grid__toc)
```

---

## Files to Modify

### Phase 1: Foundation
| File | Action |
|------|--------|
| `src/scss/_variables.scss` | Add breakpoint variables |
| `src/scss/_mixins.scss` | Add layout mixins, update existing responsive mixins |
| `src/scss/_custom.scss` | Delete (deprecated, empty) |

### Phase 2: Layout Components
| File | Action |
|------|--------|
| `default-layout.component.scss` | Use mixins, remove hardcoded breakpoints |
| `header.component.scss` | Use `layout-mobile` mixin |
| `sidebar.component.scss` | Use `layout-mobile` mixin |
| `docs-layout.component.scss` | Use shared mixins, remove duplication |

### Phase 3: Global SCSS
| File | Action |
|------|--------|
| `_vendor-overrides.scss` | Fix 767px → use breakpoint variable |
| `_dashboard-layout.scss` | Use breakpoint mixins |
| `_detail-section.scss` | Use breakpoint mixins |
| `_fab-layout.scss` | Use breakpoint mixins |
| `_searchable-select-overlay.scss` | Use breakpoint mixins |

### Phase 4: Component SCSS (52+ files)
| Pattern | Action |
|---------|--------|
| `@media (max-width: 768px)` | Replace with `@include breakpoint-down('md')` |
| `@media (max-width: 480px)` | Replace with `@include breakpoint-down('sm')` |
| `@media (min-width: 1024px)` | Replace with `@include breakpoint-up('lg')` |

---

## Expected Coverage After Implementation

| Device | Viewport | Sidebar | Layout Mode |
|--------|----------|---------|-------------|
| iPhone SE | 375px | Hidden | Mobile |
| iPhone 14 Pro Max (portrait) | 430px | Hidden | Mobile |
| iPhone 14 Pro Max (landscape) | 932px | Hidden | Mobile |
| iPad Mini (portrait) | 768px | Hidden | Mobile |
| iPad Mini (landscape) | 1024px | Visible | Desktop |
| iPad Pro 11" (portrait) | 834px | Hidden | Mobile |
| iPad Pro 11" (landscape) | 1194px | Visible | Desktop |
| MacBook Air 13" | 1440px | Visible | Desktop |
| Desktop | 1920px+ | Visible | Desktop |

---

## Success Criteria

1. **Zero hardcoded breakpoints** — all use variables/mixins
2. **Zero duplicated layout styles** — shared via mixins
3. **Consistent breakpoints** — no 767/768/769 confusion
4. **Sidebar works on all devices** — hides when viewport < 900px
5. **Single source of truth** — change breakpoint in one place, works everywhere
6. **Clean codebase** — deleted deprecated files, no orphaned styles

---

## Metrics

| Metric | Before | After |
|--------|--------|-------|
| Duplicated layout lines | ~111 | 0 |
| Hardcoded breakpoints | 79 | 0 |
| Different breakpoint values | 12 | 5 (standardized) |
| Mixin usage rate | 4% | 100% |
| Files with responsive issues | 15+ | 0 |
