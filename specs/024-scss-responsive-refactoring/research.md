# Research: SCSS Responsive Architecture Refactoring

**Date**: 2026-01-22
**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Overview

This document captures research findings for the SCSS responsive architecture refactoring. All decisions are documented with rationale and alternatives considered.

---

## Research Task 1: Breakpoint Value Analysis

### Question
What is the optimal layout breakpoint value for showing/hiding the sidebar?

### Analysis

**Current State:**
- Breakpoint: 768px
- Problem: iPhone 14 Pro Max in landscape = 932px (still shows sidebar, not enough content space)
- Device coverage gaps identified

**Calculation Method:**
```
Sidebar width:           256px (from $layout-sidebar-width)
Minimum content width:   600px (comfortable for tables, forms)
──────────────────────────────────────────────────────
Total:                   856px → rounded to 900px
```

**Device Coverage at 900px:**

| Device | Viewport | Mode | Sidebar |
|--------|----------|------|---------|
| iPhone SE | 375px | Portrait | Hidden ✓ |
| iPhone 14 Pro Max | 430px | Portrait | Hidden ✓ |
| iPhone 14 Pro Max | 932px | Landscape | Hidden ✓ |
| iPad Mini | 768px | Portrait | Hidden ✓ |
| iPad Mini | 1024px | Landscape | Visible ✓ |
| iPad Pro 11" | 834px | Portrait | Hidden ✓ |
| iPad Pro 11" | 1194px | Landscape | Visible ✓ |
| MacBook Air 13" | 1440px | - | Visible ✓ |

### Decision
**Use 900px as the layout breakpoint**

### Rationale
- Covers all modern phones in landscape mode
- Provides adequate content space (600px min) when sidebar visible
- Clean round number for maintainability
- Matches sidebar + content calculation

### Alternatives Considered

| Value | Pros | Cons | Rejected Because |
|-------|------|------|------------------|
| 850px | Closer to calculation | Not round number | No buffer for edge cases |
| 1024px | Covers all tablets | Hides sidebar on many desktops | Too aggressive, bad UX |
| 992px (Bootstrap) | Industry standard | Arbitrary for our layout | Doesn't match our calculation |
| 768px (current) | Existing behavior | Fails on landscape phones | The original bug |

---

## Research Task 2: Mixin Architecture Strategy

### Question
Should we replace existing mixins or extend them?

### Analysis

**Existing Mixins (lines 548-564 of _mixins.scss):**
```scss
@mixin mobile { @media (max-width: 480px) { @content; } }
@mixin tablet { @media (max-width: 768px) { @content; } }
@mixin desktop { @media (min-width: 1024px) { @content; } }
```

**Usage Statistics:**
- `@include mobile`: 2 usages
- `@include tablet`: 4 usages
- `@include desktop`: 0 usages
- Hardcoded media queries: 79 usages

**Gap Analysis:**
- Missing: `min-width` variants for most breakpoints
- Missing: Layout-specific breakpoint (900px)
- Issue: Inconsistent values (767 vs 768 vs 769)

### Decision
**Extend existing architecture, don't replace**

### Implementation

1. **Keep existing mixins** - update to use centralized variables:
   ```scss
   @mixin mobile { @media (max-width: vars.$breakpoint-sm) { @content; } }
   @mixin tablet { @media (max-width: vars.$breakpoint-md) { @content; } }
   @mixin desktop { @media (min-width: vars.$breakpoint-lg) { @content; } }
   ```

2. **Add new generic mixins**:
   ```scss
   @mixin breakpoint-down($size) { ... }
   @mixin breakpoint-up($size) { ... }
   ```

3. **Add layout-specific mixins**:
   ```scss
   @mixin layout-mobile { ... }
   @mixin layout-desktop { ... }
   ```

### Rationale
- Maintains backward compatibility
- Clear semantic separation (content vs layout)
- Follows existing mixin hierarchy (Level 1/2/3)

### Alternatives Considered

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| Replace all | Clean slate | Breaking change | Unnecessary disruption |
| CSS Container Queries | Modern approach | Limited browser support | Not needed for viewport-based layout |
| Tailwind-style utilities | Flexible | Different paradigm | Doesn't match project architecture |

---

## Research Task 3: Layout Code Duplication Strategy

### Question
How to eliminate ~111 duplicated lines between default-layout and docs-layout?

### Analysis

**Duplicated Code in docs-layout.component.scss:**

| Selector | Lines | Status |
|----------|-------|--------|
| `.layout` base | ~10 | Identical |
| `.layout--rtl` | ~3 | Identical |
| `.layout__main` | ~30 | Nearly identical (missing inverted corner) |
| `.layout__content` | ~10 | Identical |
| `.layout__container` | ~12 | Identical |
| `.layout__mobile-overlay` | ~20 | Identical |
| **Total** | **~111** | **Duplicate** |

**Comment in docs-layout (line 5):**
```scss
// Reuse the same layout styles as DefaultLayout
```
*But code is copied, not reused.*

### Decision
**Create layout mixins in `_mixins.scss`**

### Implementation

```scss
// New mixins to add:
@mixin layout-base { ... }
@mixin layout-main-base { ... }
@mixin layout-main-rtl { ... }
@mixin layout-mobile-overlay { ... }
@mixin layout-content-base { ... }
@mixin layout-container-base { ... }
```

**Usage in components:**
```scss
// default-layout.component.scss
.layout {
  @include mixins.layout-base;

  &__main {
    @include mixins.layout-main-base;
    // + inverted corners specific to default-layout
  }
}

// docs-layout.component.scss
.layout {
  @include mixins.layout-base;

  &__main {
    @include mixins.layout-main-base;
    // + docs-specific styles
  }
}
```

### Rationale
- Follows DRY principle (Constitution Section VII)
- Mixins belong in `_mixins.scss` per project architecture
- Each component can add its specific styles
- Changes propagate to all layouts automatically

### Alternatives Considered

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| Separate `_layout-base.scss` | Clear separation | Another file | Mixins belong in `_mixins.scss` |
| CSS inheritance via `::ng-deep` | Works | Anti-pattern | Breaks encapsulation |
| Shared SCSS partial imported | Simple | Still duplication-prone | No component isolation |

---

## Research Task 4: RTL Support Pattern

### Question
How to maintain RTL support in the new breakpoint system?

### Analysis

**Current RTL Implementation:**
- Uses `.layout--rtl` modifier class
- Applied via `[dir="rtl"]` attribute on `<html>`
- Sidebar position flipped via margin properties
- Some components use `ltr-rtl()` mixin

**RTL-Specific Behaviors:**
1. Sidebar slides from RIGHT in RTL mode
2. Main content has `margin-right` instead of `margin-left`
3. Header elements reversed
4. Mobile overlay covers appropriate side

### Decision
**Use existing `layout--rtl` class with layout mixins**

### Implementation

```scss
@mixin layout-main-base {
  margin-left: vars.$layout-sidebar-width;

  @include layout-mobile {
    margin-left: 0;
  }
}

@mixin layout-main-rtl {
  margin-left: 0;
  margin-right: vars.$layout-sidebar-width;

  @include layout-mobile {
    margin-right: 0;
  }
}
```

**Component usage:**
```scss
.layout {
  &__main {
    @include mixins.layout-main-base;
  }

  &--rtl .layout__main {
    @include mixins.layout-main-rtl;
  }
}
```

### Rationale
- Maintains existing RTL pattern
- No breaking changes
- Clear separation of LTR/RTL styles
- Works with new breakpoint system

---

## Research Task 5: Accessibility - Reduced Motion

### Question
How to support users who prefer reduced motion?

### Analysis

**Spec Edge Case:**
> "What happens if user has reduced motion preference enabled? Transitions should be instant or minimal per accessibility guidelines."

**Existing Pattern in _mixins.scss:**
```scss
@mixin chart-accessibility($component-name) {
  @media (prefers-reduced-motion: reduce) {
    .#{$component-name} {
      &__container {
        transition: none;
      }
    }
  }
}
```

### Decision
**Add `prefers-reduced-motion` to all transition mixins**

### Implementation

```scss
@mixin layout-base {
  transition: background 0.3s ease, color 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

@mixin layout-main-base {
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
```

### Rationale
- Accessibility requirement per spec
- Follows existing project pattern
- No visual impact for users without preference
- WCAG 2.1 compliance

---

## Summary of Decisions

| Research Area | Decision | Impact |
|---------------|----------|--------|
| Layout breakpoint | 900px | Fixes mobile landscape issue |
| Mixin architecture | Extend, don't replace | Backward compatible |
| Duplication elimination | Create layout mixins | -111 lines |
| RTL support | Use existing pattern | No breaking changes |
| Reduced motion | Add to all transitions | Accessibility compliance |

---

## Dependencies Identified

1. **No external dependencies** - All changes are SCSS-only
2. **No TypeScript changes** - Layout logic remains unchanged
3. **No HTML changes** - Class names and structure preserved
4. **No breaking changes** - Existing behavior maintained

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression | Medium | High | Phase-by-phase testing |
| RTL breakage | Low | High | Explicit RTL testing |
| Performance impact | Very Low | Low | CSS-only, no runtime |
| Mixin conflicts | Low | Medium | Unique naming convention |
