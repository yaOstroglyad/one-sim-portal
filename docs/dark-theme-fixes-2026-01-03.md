# Dark Theme Fixes - January 3, 2026

## Overview

This document describes all CSS/SCSS changes made to fix dark theme support across multiple components in the One SIM Portal application.

## Key Principles

### CSS Variable System

The application uses two types of CSS custom properties:

| Variable Type | Auto-adapts to Dark Theme | Usage |
|---------------|---------------------------|-------|
| `--layout-*` | Yes | Backgrounds, borders, text colors |
| `--os-color-*` | No (accent colors only) | Primary, danger, success, info, warning |

### Variable Mapping Reference

| Old Variable | New Variable | Purpose |
|--------------|--------------|---------|
| `--os-color-white` | `--layout-content-bg` | Content backgrounds |
| `--os-color-text` | `--layout-content-text` | Primary text |
| `--os-color-medium` | `--layout-content-text-muted` | Secondary/muted text |
| `--os-color-subtle-bg` | `--layout-frame-bg` | Frame/panel backgrounds |
| `--os-color-light-shade` | `--layout-content-border` | Borders |
| `#fff`, `white` | `--layout-content-bg` | White backgrounds |
| `#f5f5f5`, `#eeeeee` | `--layout-frame-bg` | Light gray backgrounds |
| `#ccc`, `#ddd` | `--layout-content-border` | Gray borders |
| `rgba(0,0,0,0.x)` | `var(--layout-content-border)` or appropriate variable | Semi-transparent overlays |
| `rgba(255,255,255,0.x)` | `var(--layout-content-bg)` with opacity | Light overlays |

### Available Layout Variables

```scss
// Backgrounds
--layout-content-bg      // Main content background
--layout-frame-bg        // Frame/panel background
--layout-menu-bg         // Menu/dropdown background
--layout-input-bg        // Input field background

// Text
--layout-content-text        // Primary text
--layout-content-text-muted  // Secondary/muted text
--layout-input-text          // Input text

// Borders
--layout-content-border  // Standard border color

// Interactive
--layout-menu-hover      // Hover state for menu items
```

---

## Components Fixed

### 1. Rich Text Input Component

**File:** `src/app/shared/components/form-inputs/rich-text-input/rich-text-input.component.scss`

**Changes:**

```scss
// Before
.rich-text-label {
  color: #666;
}

.rich-text-toolbar {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.rich-text-editor {
  background-color: #fff;
  color: #333;
}

.html-dialog {
  background-color: white;
  border: 1px solid #ccc;
}

// After
.rich-text-label {
  color: var(--layout-content-text);
}

.rich-text-toolbar {
  background-color: var(--layout-frame-bg);
  border: 1px solid var(--layout-content-border);
}

.rich-text-editor {
  background-color: var(--layout-input-bg);
  color: var(--layout-input-text);
}

.html-dialog {
  background-color: var(--layout-menu-bg);
  border: 1px solid var(--layout-content-border);
}
```

---

### 2. Settings Component

**File:** `src/app/views/settings/settings.component.scss`

**Changes:**

```scss
// Before
mat-card {
  background: white;
}

// After
mat-card {
  background: var(--layout-menu-bg);
}
```

---

### 3. Email Configurations Component

**File:** `src/app/views/settings/email-configurations/email-configurations.component.scss`

**Changes:**

```scss
// Before
.template-type-card {
  background: white;
  border: 1px solid #e0e0e0;
}

.template-type-card__title {
  color: #333;
}

.template-type-card__icon svg {
  fill: #666;
}

// After
.template-type-card {
  background: var(--layout-menu-bg);
  border: 1px solid var(--layout-content-border);
}

.template-type-card__title {
  color: var(--layout-content-text);
}

.template-type-card__icon svg {
  fill: var(--layout-content-text-muted);
}
```

**Note:** Removed incorrect `[data-theme="dark"]` selector - the `--layout-*` variables handle dark theme automatically.

---

### 4. View Configuration Styles

**File:** `src/scss/components/_view-configuration.scss`

**Changes:**

```scss
// Before
.preview-section {
  background-color: #fff;
}

.preview-header {
  background: #f5f5f5;
}

.preview-title {
  color: #666;
}

.settings-section {
  background-color: #fff;
}

.preview-svg {
  background-color: #eeeeee;
}

// After
.preview-section {
  background-color: var(--layout-menu-bg);
}

.preview-header {
  background: var(--layout-frame-bg);
}

.preview-title {
  color: var(--layout-content-text-muted);
}

.settings-section {
  background-color: var(--layout-menu-bg);
}

.preview-svg {
  background-color: var(--layout-frame-bg);
}
```

---

### 5. Edit Domain Name Component

**File:** `src/app/views/settings/email-configurations/components/edit-domain-name/edit-domain-name.component.scss`

**Changes:**

```scss
// Before
.form-control {
  border: 1px solid #ccc;
  background-color: white;
  color: #333;
}

.error-message {
  color: red;
}

// After
.form-control {
  border: 1px solid var(--layout-content-border);
  background-color: var(--layout-input-bg);
  color: var(--layout-input-text);
}

.error-message {
  color: var(--os-color-danger);
}
```

---

### 6. Edit Domain Owner Component

**File:** `src/app/views/settings/email-configurations/components/edit-domain-owner/edit-domain-owner.component.scss`

**Changes:**

```scss
// Before
.form-control {
  border: 1px solid #ccc;
  background-color: white;
  color: #333;
}

.error-message {
  color: red;
}

// After
.form-control {
  border: 1px solid var(--layout-content-border);
  background-color: var(--layout-input-bg);
  color: var(--layout-input-text);
}

.error-message {
  color: var(--os-color-danger);
}
```

---

### 7. Edit Payment Gateway Component

**File:** `src/app/views/settings/email-configurations/components/edit-payment-gateway/edit-payment-gateway.component.scss`

**Changes:**

```scss
// Before
.loading-container {
  color: rgba(0, 0, 0, 0.6);
}

.loading-spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #0083e1;
}

// After
.loading-container {
  color: var(--layout-content-text-muted);
}

.loading-spinner {
  border: 2px solid var(--layout-content-border);
  border-top: 2px solid var(--os-color-primary);
}
```

---

### 8. Edit Invoices Component

**File:** `src/app/views/settings/email-configurations/components/edit-invoices/edit-invoices.component.scss`

**Changes:**

```scss
// Before
.loading-container {
  color: rgba(0, 0, 0, 0.6);
}

.loading-spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #0083e1;
}

// After
.loading-container {
  color: var(--layout-content-text-muted);
}

.loading-spinner {
  border: 2px solid var(--layout-content-border);
  border-top: 2px solid var(--os-color-primary);
}
```

---

### 9. Color Picker Component

**File:** `src/app/shared/components/form-inputs/color-picker/color-picker.component.ts`

**Changes (inline styles):**

```scss
// Before
label {
  color: #666;
}

.color-preview {
  border: 2px solid #ddd;
}

.color-value {
  color: #333;
  border: 1px solid #ccc;
  background-color: white;

  &:focus {
    border-color: #007bff;
  }
}

// After
label {
  color: var(--layout-content-text-muted);
}

.color-preview {
  border: 2px solid var(--layout-content-border);
}

.color-value {
  color: var(--layout-input-text);
  border: 1px solid var(--layout-content-border);
  background-color: var(--layout-input-bg);

  &:focus {
    border-color: var(--os-color-primary);
  }
}
```

---

### 10. Material Buttons (Vendor Overrides)

**File:** `src/scss/_vendor-overrides.scss`

**Changes (added new rules):**

```scss
// Material Raised/Unelevated Button dark theme support
.mat-mdc-raised-button,
.mat-mdc-unelevated-button {
  &.mat-primary:not(.mat-mdc-button-disabled) {
    background-color: var(--os-color-primary) !important;
    color: var(--os-color-primary-contrast) !important;
  }

  &.mat-accent:not(.mat-mdc-button-disabled) {
    background-color: var(--os-color-accent) !important;
    color: var(--os-color-accent-contrast) !important;
  }

  &.mat-warn:not(.mat-mdc-button-disabled) {
    background-color: var(--os-color-danger) !important;
    color: var(--os-color-danger-contrast) !important;
  }

  // Disabled state - works for both light and dark themes
  &.mat-mdc-button-disabled,
  &[disabled] {
    background-color: var(--layout-frame-bg) !important;
    color: var(--layout-content-text-muted) !important;
    opacity: 0.6;
  }
}
```

---

### 11. General Settings Component

**File:** `src/app/views/settings/general/general-settings.component.ts`

**Changes (inline styles + template):**

```scss
// Added inline styles
.card {
  background-color: var(--layout-content-bg);
  border: 1px solid var(--layout-content-border);
  border-radius: 0.375rem;
}

.card-header {
  background-color: var(--layout-frame-bg);
  border-bottom: 1px solid var(--layout-content-border);
  color: var(--layout-content-text);
  padding: 1rem 1.5rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.info-box {
  padding: 1rem 1.25rem;
  border-radius: 0.375rem;
  background-color: rgba(var(--os-color-info-rgb), 0.1);
  border: 1px solid rgba(var(--os-color-info-rgb), 0.2);
  color: var(--layout-content-text);

  .info-heading {
    color: var(--os-color-info);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 0.75rem;
    color: var(--layout-content-text);
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;

    li {
      margin-bottom: 0.25rem;
      color: var(--layout-content-text);
    }
  }
}
```

**Template change:** Replaced `alert alert-info` class with custom `info-box` class.

---

### 12. Global FAB Component

**File:** `src/app/shared/components/fab-layout/components/global-fab/global-fab.component.scss`

**Changes:**

```scss
// Before
.bottom-nav {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(255, 255, 255, 0.9);
}

&__item {
  background: rgba(255, 255, 255, 0.8);
  color: #666;
}

&__menu {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

&__menu-item {
  color: #666;
}

// After
.bottom-nav {
  border: 1px solid var(--layout-content-border);
  background-color: var(--layout-menu-bg);
}

&__item {
  background: var(--layout-frame-bg);
  color: var(--layout-content-text-muted);
}

&__menu {
  background-color: var(--layout-menu-bg);
  border: 1px solid var(--layout-content-border);
}

&__menu-item {
  color: var(--layout-content-text-muted);
}
```

---

### 13. Flyout Layout Component

**File:** `src/app/shared/components/fab-layout/components/flyout-layout/flyout-layout.component.scss`

**Changes:**

```scss
// Before
.flyout {
  background-color: var(--os-color-white);
  border-left: 1px solid var(--os-color-medium);
}

&__header {
  border-bottom: 1px solid var(--os-color-light-shade);
  background-color: var(--os-color-subtle-bg);
}

&__title {
  color: var(--os-color-text);
}

&__nav {
  background-color: var(--os-color-subtle-bg);
  border-right: 1px solid var(--os-color-light-shade);
}

&__nav-item {
  color: var(--os-color-text);

  &.active {
    color: white;
  }
}

&__action, &__close {
  color: var(--os-color-medium);
}

&__resize::after {
  background-color: var(--os-color-medium);
}

// After
.flyout {
  background-color: var(--layout-content-bg);
  border-left: 1px solid var(--layout-content-border);
}

&__header {
  border-bottom: 1px solid var(--layout-content-border);
  background-color: var(--layout-frame-bg);
}

&__title {
  color: var(--layout-content-text);
}

&__nav {
  background-color: var(--layout-frame-bg);
  border-right: 1px solid var(--layout-content-border);
}

&__nav-item {
  color: var(--layout-content-text);

  &.active {
    color: var(--os-color-primary-contrast);
  }
}

&__action, &__close {
  color: var(--layout-content-text-muted);
}

&__resize::after {
  background-color: var(--layout-content-border);
}
```

---

### 14. Support Chat Shell Component

**File:** `src/app/features/support-chat/support-chat.shell.component.scss`

**Changes:**

#### Main Container
```scss
// Before
.support-chat {
  background-color: var(--os-color-white);
}

// After
.support-chat {
  background-color: var(--layout-content-bg);
}
```

#### Search State
```scss
// Before
.search-state__title {
  color: var(--os-color-text);
}

.search-state__description {
  color: var(--os-color-medium);
}

// After
.search-state__title {
  color: var(--layout-content-text);
}

.search-state__description {
  color: var(--layout-content-text-muted);
}
```

#### Empty State
```scss
// Before
.empty-state__title {
  color: var(--os-color-text);
}

.empty-state__description {
  color: var(--os-color-medium);
}

// After
.empty-state__title {
  color: var(--layout-content-text);
}

.empty-state__description {
  color: var(--layout-content-text-muted);
}
```

#### Threads List
```scss
// Before
.support-chat__threads {
  background-color: var(--os-color-subtle-bg);
}

.threads__header {
  border-bottom: 1px solid var(--os-color-light-shade);

  h3 {
    color: var(--os-color-text);
  }
}

.thread-item {
  background-color: var(--os-color-white);
}

.thread-item__id {
  color: var(--os-color-text);
}

.thread-item__status {
  color: var(--os-color-medium);
}

.thread-item__status-dot {
  background-color: var(--os-color-medium);
}

// After
.support-chat__threads {
  background-color: var(--layout-frame-bg);
}

.threads__header {
  border-bottom: 1px solid var(--layout-content-border);

  h3 {
    color: var(--layout-content-text);
  }
}

.thread-item {
  background-color: var(--layout-content-bg);
}

.thread-item__id {
  color: var(--layout-content-text);
}

.thread-item__status {
  color: var(--layout-content-text-muted);
}

.thread-item__status-dot {
  background-color: var(--layout-content-text-muted);
}
```

#### Loading Overlay
```scss
// Before
.support-chat__loading-overlay {
  background-color: rgba(255, 255, 255, 0.95);
}

.loading-overlay__text {
  color: var(--os-color-text);
}

// After
.support-chat__loading-overlay {
  background-color: var(--layout-content-bg);
  opacity: 0.95;
}

.loading-overlay__text {
  color: var(--layout-content-text);
}
```

#### Thread View
```scss
// Before
.support-chat__thread-view {
  background-color: var(--os-color-white);
}

.thread__header {
  border-bottom: 1px solid var(--os-color-light-shade);
  background-color: var(--os-color-subtle-bg);

  h3 {
    color: var(--os-color-text);
  }
}

.thread__messages {
  background-color: var(--os-color-white);
}

.thread__loading {
  color: var(--os-color-medium);
}

// After
.support-chat__thread-view {
  background-color: var(--layout-content-bg);
}

.thread__header {
  border-bottom: 1px solid var(--layout-content-border);
  background-color: var(--layout-frame-bg);

  h3 {
    color: var(--layout-content-text);
  }
}

.thread__messages {
  background-color: var(--layout-content-bg);
}

.thread__loading {
  color: var(--layout-content-text-muted);
}
```

#### Messages
```scss
// Before
.message__content {
  background-color: var(--os-color-subtle-bg);
}

.message__time {
  color: var(--os-color-medium);
}

.typing-dots span {
  background-color: var(--os-color-medium);
}

// After
.message__content {
  background-color: var(--layout-frame-bg);
}

.message__time {
  color: var(--layout-content-text-muted);
}

.typing-dots span {
  background-color: var(--layout-content-text-muted);
}
```

#### Message Input
```scss
// Before
.thread__input {
  border-top: 1px solid var(--os-color-light-shade);
  background-color: var(--os-color-white);
}

.thread__input-field {
  border: 1px solid var(--os-color-light-shade);
  background-color: var(--os-color-subtle-bg);
  color: var(--os-color-text);

  &::placeholder {
    color: var(--os-color-medium);
  }

  &:focus {
    background-color: var(--os-color-white);
  }

  &:disabled {
    background-color: rgba(var(--os-color-medium-rgb), 0.05);
  }
}

.thread__send-button:disabled {
  background-color: var(--os-color-medium);
}

// After
.thread__input {
  border-top: 1px solid var(--layout-content-border);
  background-color: var(--layout-content-bg);
}

.thread__input-field {
  border: 1px solid var(--layout-content-border);
  background-color: var(--layout-frame-bg);
  color: var(--layout-content-text);

  &::placeholder {
    color: var(--layout-content-text-muted);
  }

  &:focus {
    background-color: var(--layout-content-bg);
  }

  &:disabled {
    background-color: var(--layout-frame-bg);
  }
}

.thread__send-button:disabled {
  background-color: var(--layout-content-text-muted);
}
```

#### Not Found State
```scss
// Before
.thread__not-found h3 {
  color: var(--os-color-text);
}

// After
.thread__not-found h3 {
  color: var(--layout-content-text);
}
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Files Modified | 14 |
| CSS Variables Replaced | ~100+ |
| Hardcoded Colors Removed | ~50+ |
| Components Fixed | 14 |

## Testing Checklist

- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly
- [ ] Theme toggle transitions smoothly
- [ ] All text is readable in both themes
- [ ] All borders are visible in both themes
- [ ] All interactive states (hover, focus, active) work correctly
- [ ] Form inputs are usable in both themes
- [ ] Loading states display correctly
- [ ] Error states display correctly

## Best Practices for Future Development

1. **Never use hardcoded colors** - Always use CSS variables
2. **Use `--layout-*` variables** for elements that should adapt to theme
3. **Use `--os-color-*` variables** only for accent colors (primary, danger, success, etc.)
4. **Test in both themes** before committing changes
5. **Avoid `[data-theme="dark"]` selectors** - the `--layout-*` variables handle this automatically
6. **Use rgba with CSS variable RGB values** for transparency: `rgba(var(--os-color-primary-rgb), 0.1)`

---

## Improvement Plan

Based on the patterns discovered during this dark theme fix session, here is a comprehensive plan to prevent similar issues and improve the theming system.

---

### Phase 1: Immediate Actions (1-2 days)

#### 1.1 Complete Component Audit

**Priority:** Critical

Scan the entire codebase for remaining hardcoded colors and non-adaptive variables.

```bash
# Find hardcoded hex colors
grep -rn --include="*.scss" --include="*.css" "#[0-9a-fA-F]\{3,6\}" src/

# Find hardcoded color keywords
grep -rn --include="*.scss" --include="*.css" -E ":\s*(white|black|gray|grey|red|blue|green)" src/

# Find rgba with hardcoded values
grep -rn --include="*.scss" --include="*.css" "rgba\s*\(\s*[0-9]" src/

# Find non-adaptive --os-color-* variables used for backgrounds/text
grep -rn --include="*.scss" --include="*.css" -E "(background|color|border).*--os-color-(white|text|medium|subtle|light)" src/
```

**Components likely needing review:**
| Directory | Priority | Reason |
|-----------|----------|--------|
| `src/app/views/` | High | Many view components may have inline styles |
| `src/app/shared/components/` | High | Shared components affect entire app |
| `src/scss/components/` | Medium | Global component styles |
| `src/app/features/` | Medium | Feature-specific components |

#### 1.2 Create Stylelint Configuration

**Priority:** High

Add stylelint rules to prevent hardcoded colors in future development.

**File:** `.stylelintrc.json`

```json
{
  "extends": ["stylelint-config-standard-scss"],
  "rules": {
    "color-no-hex": true,
    "color-named": "never",
    "declaration-property-value-disallowed-list": {
      "background": ["/^#/", "/^rgb/", "/^rgba\\([0-9]/", "white", "black"],
      "background-color": ["/^#/", "/^rgb/", "/^rgba\\([0-9]/", "white", "black"],
      "color": ["/^#/", "/^rgb/", "/^rgba\\([0-9]/", "white", "black", "red", "green", "blue"],
      "border": ["/^#/", "/^rgb/", "/^rgba\\([0-9]/"],
      "border-color": ["/^#/", "/^rgb/", "/^rgba\\([0-9]/"],
      "box-shadow": ["/^#/", "/rgba\\([0-9]/"]
    },
    "scss/no-global-function-names": null
  }
}
```

**Package installation:**
```bash
npm install --save-dev stylelint stylelint-config-standard-scss
```

**Add to package.json scripts:**
```json
{
  "scripts": {
    "lint:styles": "stylelint \"src/**/*.scss\"",
    "lint:styles:fix": "stylelint \"src/**/*.scss\" --fix"
  }
}
```

#### 1.3 Add Pre-commit Hook

**Priority:** High

Prevent commits with hardcoded colors.

**File:** `.husky/pre-commit` (or equivalent)

```bash
#!/bin/sh
npm run lint:styles
```

---

### Phase 2: Structural Improvements (1 week)

#### 2.1 Consolidate CSS Variables

**Priority:** High

Create a single source of truth for all theme variables.

**File:** `src/scss/_theme-tokens.scss`

```scss
// ===========================================
// THEME TOKENS - Single Source of Truth
// ===========================================

// This file defines all CSS custom properties
// used throughout the application.

:root {
  // =========================================
  // LAYOUT VARIABLES (Auto-adapt to theme)
  // =========================================

  // Backgrounds
  --layout-content-bg: #ffffff;
  --layout-frame-bg: #f8f9fa;
  --layout-menu-bg: #ffffff;
  --layout-input-bg: #ffffff;

  // Text
  --layout-content-text: #212529;
  --layout-content-text-muted: #6c757d;
  --layout-input-text: #212529;

  // Borders
  --layout-content-border: #dee2e6;

  // Interactive
  --layout-menu-hover: rgba(0, 0, 0, 0.05);

  // =========================================
  // ACCENT COLORS (Same in both themes)
  // =========================================

  --os-color-primary: #007bff;
  --os-color-primary-rgb: 0, 123, 255;
  --os-color-primary-contrast: #ffffff;
  --os-color-primary-shade: #0056b3;

  --os-color-success: #28a745;
  --os-color-success-rgb: 40, 167, 69;

  --os-color-danger: #dc3545;
  --os-color-danger-rgb: 220, 53, 69;

  --os-color-warning: #ffc107;
  --os-color-warning-rgb: 255, 193, 7;

  --os-color-info: #17a2b8;
  --os-color-info-rgb: 23, 162, 184;
}

// Dark Theme Overrides
html.dark {
  // Backgrounds
  --layout-content-bg: #1a1a2e;
  --layout-frame-bg: #16213e;
  --layout-menu-bg: #1a1a2e;
  --layout-input-bg: #16213e;

  // Text
  --layout-content-text: #e4e6eb;
  --layout-content-text-muted: #b0b3b8;
  --layout-input-text: #e4e6eb;

  // Borders
  --layout-content-border: #3a3b3c;

  // Interactive
  --layout-menu-hover: rgba(255, 255, 255, 0.1);
}
```

#### 2.2 Create Theme Mixins

**Priority:** Medium

Create reusable mixins for common themed patterns.

**File:** `src/scss/_theme-mixins.scss`

```scss
// ===========================================
// THEME MIXINS
// ===========================================

/// Card styling with proper theme support
/// @param {String} $bg - Background variable (default: --layout-content-bg)
@mixin themed-card($bg: --layout-content-bg) {
  background-color: var(#{$bg});
  border: 1px solid var(--layout-content-border);
  border-radius: var(--os-border-radius-medium);
}

/// Panel/frame styling
@mixin themed-panel {
  background-color: var(--layout-frame-bg);
  border: 1px solid var(--layout-content-border);
}

/// Input field styling
@mixin themed-input {
  background-color: var(--layout-input-bg);
  color: var(--layout-input-text);
  border: 1px solid var(--layout-content-border);

  &::placeholder {
    color: var(--layout-content-text-muted);
  }

  &:focus {
    border-color: var(--os-color-primary);
    outline: none;
  }

  &:disabled {
    background-color: var(--layout-frame-bg);
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/// Loading spinner styling
@mixin themed-spinner($size: 20px, $border-width: 2px) {
  width: $size;
  height: $size;
  border: $border-width solid var(--layout-content-border);
  border-top-color: var(--os-color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/// Text styling
@mixin themed-text($type: 'primary') {
  @if $type == 'primary' {
    color: var(--layout-content-text);
  } @else if $type == 'muted' {
    color: var(--layout-content-text-muted);
  } @else if $type == 'heading' {
    color: var(--layout-content-text);
    font-weight: 600;
  }
}

/// Alert/notification box styling
/// @param {String} $variant - Alert variant (info, success, warning, danger)
@mixin themed-alert($variant: 'info') {
  padding: 1rem 1.25rem;
  border-radius: var(--os-border-radius-medium);
  background-color: rgba(var(--os-color-#{$variant}-rgb), 0.1);
  border: 1px solid rgba(var(--os-color-#{$variant}-rgb), 0.2);
  color: var(--layout-content-text);

  .alert-heading {
    color: var(--os-color-#{$variant});
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
}

/// Menu/dropdown styling
@mixin themed-menu {
  background-color: var(--layout-menu-bg);
  border: 1px solid var(--layout-content-border);
  box-shadow: var(--os-shadow-lg);
}

/// Menu item styling
@mixin themed-menu-item {
  color: var(--layout-content-text);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--layout-menu-hover);
  }

  &.active {
    background-color: var(--os-color-primary);
    color: var(--os-color-primary-contrast);
  }
}
```

#### 2.3 Update Component Templates

**Priority:** Medium

Create a component template that includes proper theme imports.

**File:** `.claude/templates/component.template.scss`

```scss
@use "path/to/scss/variables" as vars;
@use "path/to/scss/mixins" as mixins;
@use "path/to/scss/theme-mixins" as theme;

:host {
  display: block;
}

.component-name {
  // Use theme mixins
  @include theme.themed-card;

  &__header {
    @include theme.themed-text('heading');
  }

  &__content {
    @include theme.themed-text('primary');
  }

  &__input {
    @include theme.themed-input;
  }
}
```

---

### Phase 3: Tooling & Automation (1-2 weeks)

#### 3.1 Create Migration Script

**Priority:** Medium

Automate the migration of old color patterns to new variables.

**File:** `scripts/migrate-theme-colors.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const replacements = [
  // Hardcoded colors
  { pattern: /#fff(?![0-9a-f])/gi, replacement: 'var(--layout-content-bg)' },
  { pattern: /#ffffff/gi, replacement: 'var(--layout-content-bg)' },
  { pattern: /white(?![a-z-])/gi, replacement: 'var(--layout-content-bg)' },
  { pattern: /#f5f5f5/gi, replacement: 'var(--layout-frame-bg)' },
  { pattern: /#f8f9fa/gi, replacement: 'var(--layout-frame-bg)' },
  { pattern: /#eeeeee/gi, replacement: 'var(--layout-frame-bg)' },
  { pattern: /#333(?![0-9a-f])/gi, replacement: 'var(--layout-content-text)' },
  { pattern: /#212529/gi, replacement: 'var(--layout-content-text)' },
  { pattern: /#666(?![0-9a-f])/gi, replacement: 'var(--layout-content-text-muted)' },
  { pattern: /#6c757d/gi, replacement: 'var(--layout-content-text-muted)' },
  { pattern: /#ccc(?![0-9a-f])/gi, replacement: 'var(--layout-content-border)' },
  { pattern: /#dee2e6/gi, replacement: 'var(--layout-content-border)' },

  // Old variable names
  { pattern: /var\(--os-color-white\)/g, replacement: 'var(--layout-content-bg)' },
  { pattern: /var\(--os-color-text\)/g, replacement: 'var(--layout-content-text)' },
  { pattern: /var\(--os-color-medium\)/g, replacement: 'var(--layout-content-text-muted)' },
  { pattern: /var\(--os-color-subtle-bg\)/g, replacement: 'var(--layout-frame-bg)' },
  { pattern: /var\(--os-color-light-shade\)/g, replacement: 'var(--layout-content-border)' },
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Migrated: ${filePath}`);
  }
}

// Find all SCSS files
const files = glob.sync('src/**/*.scss');
files.forEach(migrateFile);

console.log('Migration complete!');
```

#### 3.2 Add Visual Regression Testing

**Priority:** Medium

Implement visual regression tests for both themes.

**Recommended tools:**
- Playwright with visual comparisons
- Chromatic (for Storybook)
- Percy

**File:** `e2e/theme-visual.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const themes = ['light', 'dark'];
const pages = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'settings', path: '/settings' },
  { name: 'tickets', path: '/tickets' },
  // Add more pages
];

themes.forEach(theme => {
  pages.forEach(page => {
    test(`${page.name} - ${theme} theme`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);

      // Set theme
      await browserPage.evaluate((t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
      }, theme);

      // Wait for theme transition
      await browserPage.waitForTimeout(300);

      // Screenshot comparison
      await expect(browserPage).toHaveScreenshot(`${page.name}-${theme}.png`);
    });
  });
});
```

#### 3.3 Create Theme Preview Tool

**Priority:** Low

Build a development tool to preview all themed components.

**File:** `src/app/dev/theme-preview/theme-preview.component.ts`

```typescript
@Component({
  standalone: true,
  selector: 'app-theme-preview',
  template: `
    <div class="theme-preview">
      <div class="theme-preview__controls">
        <button (click)="toggleTheme()">Toggle Theme</button>
      </div>

      <div class="theme-preview__sections">
        <section>
          <h3>Colors</h3>
          <div class="color-swatches">
            <div *ngFor="let color of colors"
                 [style.background-color]="'var(' + color + ')'"
                 class="color-swatch">
              {{ color }}
            </div>
          </div>
        </section>

        <section>
          <h3>Cards</h3>
          <div class="preview-card">Sample Card</div>
        </section>

        <section>
          <h3>Inputs</h3>
          <input type="text" placeholder="Sample input">
        </section>

        <!-- More component previews -->
      </div>
    </div>
  `
})
export class ThemePreviewComponent {
  colors = [
    '--layout-content-bg',
    '--layout-frame-bg',
    '--layout-menu-bg',
    '--layout-content-text',
    '--layout-content-text-muted',
    '--layout-content-border',
    '--os-color-primary',
    '--os-color-success',
    '--os-color-danger',
  ];

  toggleTheme(): void {
    document.documentElement.classList.toggle('dark');
  }
}
```

---

### Phase 4: Documentation & Training (Ongoing)

#### 4.1 Create Theming Guide

**Priority:** High

**File:** `docs/theming-guide.md`

Contents:
1. Theme architecture overview
2. Available CSS variables with descriptions
3. When to use `--layout-*` vs `--os-color-*`
4. Common patterns and examples
5. Migration guide from old patterns
6. Troubleshooting common issues

#### 4.2 Add Code Review Checklist

**Priority:** High

Add to PR template:

```markdown
## Theme Compatibility Checklist

- [ ] No hardcoded color values (#fff, white, rgba(0,0,0,...))
- [ ] Uses `--layout-*` variables for backgrounds, text, and borders
- [ ] Uses `--os-color-*` variables only for accent colors
- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] No `[data-theme="dark"]` selectors (use CSS variables instead)
```

#### 4.3 Update Component Documentation

**Priority:** Medium

Add theme section to component documentation:

```markdown
## Theming

This component uses the following CSS variables:

| Variable | Usage |
|----------|-------|
| `--layout-content-bg` | Main background |
| `--layout-content-text` | Primary text |
| `--layout-content-border` | Border color |

### Customization

To customize colors, override CSS variables in your theme:

```css
:root {
  --layout-content-bg: #custom-color;
}
```
```

---

### Phase 5: Long-term Maintenance

#### 5.1 Quarterly Audits

Schedule quarterly reviews to:
- Scan for new hardcoded colors
- Review new components for theme compliance
- Update documentation
- Address any theme-related issues

#### 5.2 Monitor Bundle Size

Track CSS bundle size to ensure theming doesn't bloat the application:

```bash
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

#### 5.3 Performance Testing

Measure theme toggle performance:
- CSS variable resolution time
- Repaint/reflow costs
- Animation smoothness during theme switch

---

## Priority Matrix

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Complete Component Audit | Critical | High | High |
| Add Stylelint Rules | High | Low | High |
| Add Pre-commit Hook | High | Low | Medium |
| Consolidate CSS Variables | High | Medium | High |
| Create Theme Mixins | Medium | Medium | Medium |
| Create Migration Script | Medium | Medium | Medium |
| Visual Regression Testing | Medium | High | High |
| Create Theming Guide | High | Low | High |
| Code Review Checklist | High | Low | Medium |
| Theme Preview Tool | Low | Medium | Low |

---

## Estimated Timeline

```
Week 1:
├── Phase 1: Immediate Actions
│   ├── Component Audit (2 days)
│   ├── Stylelint Configuration (0.5 day)
│   └── Pre-commit Hook (0.5 day)
│
Week 2:
├── Phase 2: Structural Improvements
│   ├── Consolidate CSS Variables (2 days)
│   ├── Create Theme Mixins (2 days)
│   └── Update Component Templates (1 day)
│
Week 3-4:
├── Phase 3: Tooling & Automation
│   ├── Migration Script (2 days)
│   ├── Visual Regression Testing (3 days)
│   └── Theme Preview Tool (2 days)
│
Ongoing:
├── Phase 4: Documentation
│   ├── Theming Guide (1 day)
│   ├── Code Review Checklist (0.5 day)
│   └── Component Documentation (ongoing)
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Hardcoded colors in SCSS | ~50+ | 0 |
| Components with theme issues | Unknown | 0 |
| Stylelint violations | Not measured | 0 |
| Visual regression test coverage | 0% | 80%+ |
| Theme toggle performance | Not measured | < 100ms |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing styles | High | Visual regression tests |
| Performance degradation | Medium | CSS variable optimization |
| Developer adoption | Medium | Documentation + training |
| Third-party component conflicts | Medium | Vendor override patterns |
| Bundle size increase | Low | CSS variable deduplication |
