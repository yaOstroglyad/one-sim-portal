# SCSS Duplication & Redundancy Analysis

> **Status:** Analysis Complete | **Date:** 2026-01-22

## Executive Summary

Found significant code duplication and inconsistencies in responsive SCSS:
- **~111 lines duplicated** between `default-layout` and `docs-layout`
- **Inconsistent breakpoints**: `767px` vs `768px` vs `769px`
- **Hardcoded values** instead of using existing mixins
- **No centralized breakpoint variables**

---

## 1. Critical Duplication: Layout Styles

### Files Involved
| File | Lines | Purpose |
|------|-------|---------|
| `default-layout.component.scss` | 259 | Main app layout |
| `docs-layout.component.scss` | 176 | Docs section layout |

### Duplicated Code (~111 lines)

`docs-layout.component.scss` contains a comment on line 5:
```scss
// Reuse the same layout styles as DefaultLayout
```

But instead of actual reuse, it **copies** the following:

| Selector | Lines in docs-layout | Notes |
|----------|---------------------|-------|
| `.layout` | 6-16 | Identical |
| `.layout--rtl` | 13-15 | Identical |
| `.layout__main` | 17-47 | Nearly identical (missing inverted corner) |
| `.layout__content` | 49-59 | Identical |
| `.layout__container` | 61-73 | Identical |
| `.layout__mobile-overlay` | 90-110 | Identical |

### Recommendation

**Option A: Extract to shared partial**
```scss
// src/scss/_layout-base.scss
@mixin layout-base {
  display: flex;
  min-height: 100vh;
  background: var(--layout-frame-bg);
  // ... shared styles
}

// Usage in components:
.layout {
  @include layout-base;
  // Component-specific additions
}
```

**Option B: docs-layout extends default-layout**
- Docs layout should import/extend default layout styles
- Only add docs-specific styles (`.docs-grid`, `.docs-grid__toc`)

---

## 2. Breakpoint Inconsistencies

### Found Values

| Breakpoint | Occurrences | Files |
|------------|-------------|-------|
| `max-width: 768px` | 52 | Multiple |
| `max-width: 767px` | 8 | `_vendor-overrides.scss` |
| `min-width: 769px` | 2 | `default-layout.component.scss` |

### Problem

The `767px` vs `768px` vs `769px` creates:
- **Off-by-one errors** in responsive behavior
- **Unpredictable breakpoint gaps**
- **Maintenance nightmare**

### Location of 767px Usage

```scss
// _vendor-overrides.scss:39
@media (max-width: 767px) {
  :root {
    --table-offset: 220px;
    --page-header-height: 48px;
  }
}

// _vendor-overrides.scss:512
@media (max-width: 767px) {
  .ag-header-cell,
  .ag-cell {
    padding: ...
  }
}
```

### Recommendation

Standardize to single breakpoint variable and use `<=` consistently:
```scss
$layout-breakpoint: 900px;

// All queries should use:
@media (max-width: $layout-breakpoint) { }      // Mobile
@media (min-width: $layout-breakpoint + 1) { }  // Desktop
```

---

## 3. Underutilized Mixins

### Existing Mixins (barely used)

```scss
// _mixins.scss:548-564
@mixin mobile { @media (max-width: 480px) { @content; } }
@mixin tablet { @media (max-width: 768px) { @content; } }
@mixin desktop { @media (min-width: 1024px) { @content; } }
```

### Usage Statistics

| Mixin | Usage Count | Expected |
|-------|-------------|----------|
| `@include mobile` | 2 | Should be ~5 |
| `@include tablet` | 4 | Should be ~52 |
| `@include desktop` | 0 | Should be used |

### Files Using Hardcoded Instead of Mixins

- `default-layout.component.scss` - 7 hardcoded media queries
- `header.component.scss` - 6 hardcoded media queries
- `sidebar.component.scss` - 1 hardcoded media query
- `docs-layout.component.scss` - 6 hardcoded media queries
- `_vendor-overrides.scss` - 2 hardcoded media queries
- `_dashboard-layout.scss` - 3 hardcoded media queries
- `_detail-section.scss` - 1 hardcoded media query
- `_fab-layout.scss` - 2 hardcoded media queries
- `_searchable-select-overlay.scss` - 1 hardcoded media query
- ...and ~40 more component files

---

## 4. Redundant/Orphaned Styles

### `_custom.scss` - DEPRECATED

```scss
// File contains only comments, marked as DEPRECATED
// 14 lines, essentially empty
// Should be deleted
```

### Potential Orphaned Selectors

Need verification if these are still used:

| File | Selector | Status |
|------|----------|--------|
| `_detail-section.scss` | `.os-status-badge` | Check usage |
| `_dashboard-layout.scss` | `.db-status-card` | Check usage |

---

## 5. Responsive Styles in Wrong Location

### Global vs Component Styles

| Style | Current Location | Better Location |
|-------|------------------|-----------------|
| `.sidebar--mobile-open` | `sidebar.component.scss` | Correct |
| `.layout__mobile-overlay` | `default-layout.component.scss` | Correct |
| `.layout__mobile-overlay` | `docs-layout.component.scss` | **DUPLICATE - Remove** |
| Flyout mobile width | `_fab-layout.scss` (global) | Could be in component |

---

## 6. Action Items

### Priority 1: Fix Duplication
- [ ] Extract shared layout styles to `_layout-base.scss` mixin
- [ ] Refactor `docs-layout.component.scss` to use shared styles
- [ ] Delete redundant code (~111 lines)

### Priority 2: Standardize Breakpoints
- [ ] Add breakpoint variables to `_variables.scss`
- [ ] Add `layout-mobile` / `layout-desktop` mixins
- [ ] Fix `767px` → use consistent breakpoint
- [ ] Migrate hardcoded values to mixins

### Priority 3: Cleanup
- [ ] Delete `_custom.scss` (deprecated, empty)
- [ ] Audit orphaned selectors
- [ ] Document breakpoint system in constitution.md

---

## 7. Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `_variables.scss` | Add breakpoint variables | High |
| `_mixins.scss` | Add `layout-mobile`, `layout-desktop` mixins | High |
| `docs-layout.component.scss` | Remove duplicated styles | High |
| `_vendor-overrides.scss` | Fix `767px` → use variable | Medium |
| `default-layout.component.scss` | Use mixins instead of hardcoded | Medium |
| `header.component.scss` | Use mixins instead of hardcoded | Medium |
| `sidebar.component.scss` | Use mixins instead of hardcoded | Medium |
| `_custom.scss` | Delete file | Low |

---

## 8. Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Duplicated lines | ~111 | 0 |
| Hardcoded breakpoints | 79 | 0 |
| Breakpoint values used | 12 different | 5 standard |
| Mixin usage | 4% | 100% |
| Maintainability | Low | High |
