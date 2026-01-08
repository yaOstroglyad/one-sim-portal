# Implementation Plan: SCSS Architecture Refactor

**Branch**: `017-gmail-layout` (continuation) | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-scss-refactor/spec.md`
**Last Updated**: 2026-01-04

## Summary

Refactor SCSS architecture using a 3-level mixin hierarchy to eliminate code duplication. Level 1 provides abstract bases (`os-surface-base`, `os-interactive-base`, `os-feedback-base`), Level 2 provides specialized mixins that inherit from Level 1, and utility mixins for common patterns. Update constitution.md with SCSS rules.

## Technical Context

**Language/Version**: SCSS (Dart Sass via Angular CLI)
**Primary Dependencies**: Angular 21.0.5, CoreUI, Angular Material
**Storage**: N/A (styling only)
**Testing**: Visual inspection in light/dark themes
**Target Platform**: Web (all modern browsers)
**Project Type**: Angular SPA
**Performance Goals**: No increase in CSS bundle size
**Constraints**: Must maintain visual parity with existing styles
**Scale/Scope**: 148 component SCSS files total, 83 need migration

## Current Status (2026-01-04)

| Metric | Count | Status |
|--------|-------|--------|
| Total SCSS files | 148 | - |
| Files WITH mixins | 65 | ✅ Migrated |
| Files WITHOUT mixins | 83 | 🔄 Pending |
| Duplicate patterns found | 20 | Need new mixins |

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Use CSS variables for theming | ✅ Pass | Using `--layout-*` variables |
| Standalone components | N/A | SCSS only |
| English documentation | ✅ Pass | All comments in English |

---

## Duplicate Pattern Analysis

### High Priority Patterns (10+ occurrences)

| Pattern | Occurrences | Suggested Mixin |
|---------|-------------|-----------------|
| Flex center layout | 15+ | `flex-center()` |
| Hover background change | 16+ | Already in `os-interactive-base` |
| Focus outline primary | 14+ | `focus-primary-outline()` |
| Smooth transition | 13+ | Already in `os-interactive-base` |
| Flex column with gap | 12+ | `flex-column($gap)` |
| Disabled state | 11+ | Already in `os-interactive-base` |
| Button base styling | 10+ | `os-button-base` exists |
| Active/selected state | 10+ | `active-primary-state()` |

### Medium Priority Patterns (5-9 occurrences)

| Pattern | Occurrences | Suggested Mixin |
|---------|-------------|-----------------|
| Dialog header border | 8+ | `dialog-section-border($position)` |
| Dialog footer border | 8+ | `dialog-section-border($position)` |
| Text truncation ellipsis | 9+ | `text-truncate($max-width)` |
| Flex space-between | 9+ | `flex-space-between()` |
| Icon sizing | 8+ | `icon-size($size)` |
| Responsive grid | 7+ | `responsive-grid($min, $gap)` |
| Card container | 6+ | `os-card-base` exists |

### New Utility Mixins to Create

```scss
// Layout utilities
@mixin flex-center() {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-column($gap: null) {
  display: flex;
  flex-direction: column;
  @if $gap { gap: $gap; }
}

@mixin flex-space-between() {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// Interactive utilities
@mixin focus-primary-outline($offset: 2px) {
  &:focus {
    outline: 2px solid var(--os-color-primary);
    outline-offset: $offset;
  }
  &:focus:not(:focus-visible) {
    outline: none;
  }
}

@mixin active-primary-state() {
  &--active, &.active {
    background-color: var(--os-color-primary);
    color: var(--os-color-primary-contrast);
  }
}

// Text utilities
@mixin text-truncate($max-width: 100%) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: $max-width;
}

// Icon utilities
@mixin icon-size($size) {
  flex-shrink: 0;
  width: $size;
  height: $size;
}

// Dialog utilities
@mixin dialog-section-border($position: bottom) {
  @if $position == bottom {
    border-bottom: 1px solid var(--layout-content-border);
    padding-bottom: map.get(vars.$os-spacing, '3');
  } @else if $position == top {
    border-top: 1px solid var(--layout-content-border);
    padding-top: map.get(vars.$os-spacing, '3');
  }
}

// Responsive utilities
@mixin responsive-grid($min-width: 200px, $gap: 1rem) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax($min-width, 1fr));
  gap: $gap;
}
```

---

## Mixin Hierarchy Architecture

### Level 1: Abstract Bases (Existing)

```scss
@mixin os-surface-base($bg, $border, $radius: 0.375rem)
@mixin os-interactive-base($transition: 0.15s ease-in-out)
@mixin os-feedback-base($color-var)
```

### Level 2: Specialized Bases (Existing)

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
| `os-spinner-base($size)` | feedback | Loading spinners |
| `os-alert-base($variant)` | feedback | Alert messages |
| `os-badge-base($variant)` | feedback | Status badges |

### Level 3: Table Sub-components (Existing)

| Mixin | Purpose |
|-------|---------|
| `os-table-header-base()` | Header row styling |
| `os-table-row-base()` | Body row + hover/selected |
| `os-table-cell-base($padding)` | Cell padding/alignment |
| `os-table-actions-base()` | Action buttons column |

### Utility Mixins (NEW - to create)

| Mixin | Purpose |
|-------|---------|
| `flex-center()` | Center content horizontally and vertically |
| `flex-column($gap)` | Column layout with optional gap |
| `flex-space-between()` | Space between with center alignment |
| `focus-primary-outline($offset)` | Primary color focus ring |
| `active-primary-state()` | Active/selected state styling |
| `text-truncate($max-width)` | Text ellipsis overflow |
| `icon-size($size)` | Fixed icon dimensions |
| `dialog-section-border($pos)` | Dialog header/footer borders |
| `responsive-grid($min, $gap)` | Auto-fit responsive grid |

---

## Components to Migrate (83 files)

### Shared Components (26 files)

| # | Component | Path |
|---|-----------|------|
| 1 | tabs | `shared/components/tabs/` |
| 2 | debug-display | `shared/components/debug-display/` |
| 3 | tooltip | `shared/components/tooltip/` |
| 4 | header-component | `shared/components/header-component/` |
| 5 | generic-table | `shared/components/generic-table/` |
| 6 | detail-section | `shared/components/detail-section/` |
| 7 | info-strip | `shared/components/info-strip/` |
| 8 | contextual-text | `shared/components/contextual-text/` |
| 9 | dynamic-entity-details-dialog | `shared/components/dynamic-entity-details-dialog/` |
| 10 | chart | `shared/components/chart/` |
| 11 | confirmation-dialog | `shared/components/confirmation-dialog/` |
| 12 | status-badge | `shared/components/status-badge/` |
| 13 | empty-state | `shared/components/empty-state/` |
| 14 | refund-product | `shared/components/refund-product/` |
| 15 | qr-code | `shared/components/qr-code/` |
| 16 | chart-legend | `shared/components/chart-legend/` |
| 17 | display-key-value | `shared/components/display-key-value/` |
| 18 | price-preview | `shared/components/price-comparison/price-preview` |
| 19 | price-info-display | `shared/components/price-comparison/price-info-display` |
| 20 | loader | `shared/components/loader/` |
| 21 | detail-row | `shared/components/detail-row/` |
| 22 | usage-units-grid | `shared/components/usage-units-grid/` |
| 23 | form-generator | `shared/components/form-generator/` |
| 24 | form-array-item | `shared/components/form-inputs/form-array-item/` |
| 25 | chips-input | `shared/components/form-inputs/chips-input/` |
| 26 | smart-filter-header | `shared/components/smart-filter-header/` |

### Views - Customers (12 files)

| # | Component | Path |
|---|-----------|------|
| 27 | edit-customer | `views/customers/edit-customer/` |
| 28 | customers | `views/customers/` |
| 29 | corporate-customer-details | `views/customers/corporate-customer-details/` |
| 30 | add-subscriber | `views/customers/private-customer-details/add-subscriber/` |
| 31 | add-subscriber-product | `views/customers/private-customer-details/add-subscriber-product/` |
| 32 | private-customer-details | `views/customers/private-customer-details/` |
| 33 | show-qr-code-dialog | `views/customers/private-customer-details/show-qr-code-dialog/` |
| 34 | transaction-orders-table | `views/customers/private-customer-details/transaction-orders-table/` |
| 35 | send-registration-email | `views/customers/private-customer-details/send-registration-email/` |
| 36 | purchased-products | `views/customers/.../subscriber-details/purchased-products/` |
| 37 | subscriber-details | `views/customers/.../subscriber-details/` |
| 38 | event-status | `views/customers/.../subscriber-details/event-status/` |

### Views - Settings (13 files)

| # | Component | Path |
|---|-----------|------|
| 39 | edit-invoices | `views/settings/invoicing-gateway/edit-invoices/` |
| 40 | edit-domain-name | `views/settings/domains/edit-domain-name/` |
| 41 | edit-domain-owner | `views/settings/domains/edit-domain-owner/` |
| 42 | domains | `views/settings/domains/` |
| 43 | create-domain | `views/settings/domains/create-domain/` |
| 44 | portal-preview | `views/settings/view-configuration/portal/portal-preview/` |
| 45 | portal | `views/settings/view-configuration/portal/` |
| 46 | view-configuration | `views/settings/view-configuration/` |
| 47 | retail | `views/settings/view-configuration/retail/` |
| 48 | retail-preview | `views/settings/view-configuration/retail/retail-preview/` |
| 49 | edit-payment-gateway | `views/settings/payment-gateway-table/edit-payment-gateway/` |
| 50 | template-type-grid | `views/settings/email-configurations/template-type-grid/` |
| 51 | settings | `views/settings/` |

### Views - Product Constructor (6 files)

| # | Component | Path |
|---|-----------|------|
| 52 | company-product-details | `views/product-constructor/.../company-product-details/` |
| 53 | modify-tariff-offer-dialog | `views/product-constructor/.../modify-tariff-offer-dialog/` |
| 54 | modify-price-dialog | `views/product-constructor/.../modify-price-dialog/` |
| 55 | company-product-prices-table | `views/product-constructor/.../company-product-prices-table/` |
| 56 | product-details | `views/product-constructor/.../products/product-details/` |
| 57 | provider-product-upload-dialog | `views/product-constructor/.../provider-product-upload-dialog/` |

### Views - Tickets (2 files)

| # | Component | Path |
|---|-----------|------|
| 58 | ticket-list | `views/tickets/components/tickets/ticket-list/` |
| 59 | ticket-form | `views/tickets/components/tickets/ticket-form/` |

### Views - Products (4 files)

| # | Component | Path |
|---|-----------|------|
| 60 | create-product | `views/products/create-product/` |
| 61 | products | `views/products/` |
| 62 | edit-product | `views/products/edit-product/` |
| 63 | change-status-dialog | `views/products/change-status-dialog/` |

### Views - Other (20 files)

| # | Component | Path |
|---|-----------|------|
| 64 | providers | `views/providers/` |
| 65 | role-form | `views/roles/components/role-form/` |
| 66 | setup-resource | `views/inventory/setup-resource/` |
| 67 | upload-dialog | `views/inventory/upload-dialog/` |
| 68 | inventory | `views/inventory/` |
| 69 | move-resource | `views/inventory/move-resource/` |
| 70 | orders | `views/orders/` |
| 71 | edit-order-description | `views/orders/edit-order-description/` |
| 72 | revert-order | `views/orders/revert-order/` |
| 73 | email-logs | `views/email-logs/` |
| 74 | no-permissions | `views/pages/no-permissions/` |
| 75 | page500 | `views/pages/page500/` |
| 76 | register | `views/pages/register/` |
| 77 | page403 | `views/pages/page403/` |
| 78 | page404 | `views/pages/page404/` |
| 79 | login | `views/pages/login/` |
| 80 | edit-company | `views/companies/edit-company/` |
| 81 | send-invite-email | `views/companies/send-invite-email/` |
| 82 | companies | `views/companies/` |
| 83 | storybook | `views/storybook/` |

---

## Migration Strategy

### Phase 1: Create Utility Mixins ✅ DONE
- Level 1-3 mixins created

### Phase 2: Add New Utility Mixins (NEW)
1. Add `flex-center`, `flex-column`, `flex-space-between`
2. Add `focus-primary-outline`, `active-primary-state`
3. Add `text-truncate`, `icon-size`
4. Add `dialog-section-border`, `responsive-grid`

### Phase 3: Migrate Shared Components (26 files)
1. High-traffic components first (generic-table, tabs, tooltip)
2. Dialog components
3. Form input components
4. Remaining shared components

### Phase 4: Migrate View Components (57 files)
1. Customers views (12 files)
2. Settings views (13 files)
3. Product Constructor views (6 files)
4. Other views (26 files)

### Phase 5: Verification
1. Visual parity check in light theme
2. Visual parity check in dark theme
3. Build size verification

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking visual appearance | Test each component in both themes |
| Specificity conflicts | Keep mixin selectors minimal |
| Circular dependencies | Clear hierarchy: L1 → L2 → Components |
| Bundle size increase | Verify with `ng build --stats-json` |

## Success Criteria

- [ ] All 148 SCSS files use mixin system
- [ ] No hardcoded hex colors
- [ ] No hardcoded px values for spacing
- [ ] Build passes without errors
- [ ] Visual parity in light/dark themes
