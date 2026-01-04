# Tasks: SCSS Architecture Refactor

**Input**: Design documents from `/specs/018-scss-refactor/`
**Prerequisites**: plan.md (complete), spec.md (complete)
**Last Updated**: 2026-01-04

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[X]**: Completed

## Current Progress

| Phase | Tasks | Completed | Pending |
|-------|-------|-----------|---------|
| Phase 1: Level 1-3 Mixins | T001-T025 | 25 | 0 |
| Phase 2: Utility Mixins | T086-T094 | 9 | 0 |
| Phase 3: Shared Components | T095-T120 | 26 | 0 |
| Phase 4: View Components | T121-T177 | 57 | 0 |
| Phase 5: Verification | T178-T182 | 1 | 4 |
| **Total** | **182** | **118** | **4** |

---

## Phase 1: Level 1-3 Mixins ✅ COMPLETE

- [X] T001 Create `os-surface-base($bg, $border, $radius)` mixin
- [X] T002 Create `os-interactive-base($transition)` mixin
- [X] T003 Create `os-feedback-base($color-var)` mixin
- [X] T004 Add JSDoc documentation for Level 1 mixins
- [X] T005 Refactor `os-input-base` to use `os-surface-base`
- [X] T006 Refactor `os-dropdown-base` to use `os-surface-base`
- [X] T007 Refactor `os-card-base` to use `os-surface-base`
- [X] T008 Create `os-panel-base` using `os-surface-base`
- [X] T009 Create `os-overlay-base` using `os-surface-base`
- [X] T010 Create `os-table-base` using `os-surface-base`
- [X] T011 Create `os-button-base` using `os-surface-base` + `os-interactive-base`
- [X] T012 Refactor `os-option-item` → `os-list-item-base`
- [X] T013 Refactor `os-nav-button` → `os-icon-button-base`
- [X] T014 Create `os-table-sortable-base` using `os-interactive-base`
- [X] T015 Create `os-table-header-base`
- [X] T016 Create `os-table-row-base`
- [X] T017 Create `os-table-cell-base`
- [X] T018 Create `os-table-actions-base`
- [X] T019 Create `os-spinner-base` using `os-feedback-base`
- [X] T020 Create `os-alert-base` using `os-feedback-base`
- [X] T021 Create `os-badge-base` using `os-feedback-base`
- [X] T022 Consolidate `os-btn-outline-*` variants
- [X] T023 Review `dashboard-*` mixins
- [X] T024 Remove deprecated/unused mixins
- [X] T025 Add JSDoc documentation for Level 2 & Level 3 mixins

---

## Phase 2: Utility Mixins ✅ COMPLETE

**Purpose**: Add utility mixins based on duplicate pattern analysis (20 patterns found)

### Batch 2.1: Layout Utilities

- [X] T086 Create `flex-center()` mixin in `src/scss/_mixins.scss`
- [X] T087 Create `flex-column($gap)` mixin in `src/scss/_mixins.scss`
- [X] T088 Create `flex-space-between()` mixin in `src/scss/_mixins.scss`

### Batch 2.2: Interactive Utilities

- [X] T089 Create `focus-primary-outline($offset)` mixin in `src/scss/_mixins.scss`
- [X] T090 Create `active-primary-state()` mixin in `src/scss/_mixins.scss`

### Batch 2.3: Text & Icon Utilities

- [X] T091 Create `text-truncate($max-width)` mixin in `src/scss/_mixins.scss`
- [X] T092 Create `icon-size($size)` mixin in `src/scss/_mixins.scss`

### Batch 2.4: Dialog & Responsive Utilities

- [X] T093 Create `dialog-section-border($position)` mixin in `src/scss/_mixins.scss`
- [X] T094 Create `responsive-grid($min-width, $gap)` mixin in `src/scss/_mixins.scss`

**Checkpoint**: All utility mixins created and documented ✅

---

## Phase 3: Shared Components Migration (26 files) ✅ COMPLETE

**Purpose**: Migrate all shared components to use mixin system

### Batch 3.1: High-Traffic Components

- [X] T095 [P] Migrate `src/app/shared/components/tabs/tabs.component.scss`
- [X] T096 [P] Migrate `src/app/shared/components/tooltip/tooltip.component.scss`
- [X] T097 [P] Migrate `src/app/shared/components/generic-table/generic-table.component.scss`

### Batch 3.2: Dialog Components

- [X] T098 [P] Migrate `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.scss`
- [X] T099 [P] Migrate `src/app/shared/components/dynamic-entity-details-dialog/dynamic-entity-details-dialog.component.scss`

### Batch 3.3: Display Components

- [X] T100 [P] Migrate `src/app/shared/components/debug-display/debug-display.component.scss`
- [X] T101 [P] Migrate `src/app/shared/components/header-component/header.component.scss`
- [X] T102 [P] Migrate `src/app/shared/components/detail-section/detail-section.component.scss`
- [X] T103 [P] Migrate `src/app/shared/components/info-strip/info-strip.component.scss`
- [X] T104 [P] Migrate `src/app/shared/components/contextual-text/contextual-text.component.scss`
- [X] T105 [P] Migrate `src/app/shared/components/chart/chart.component.scss`
- [X] T106 [P] Migrate `src/app/shared/components/status-badge/status-badge.component.scss`
- [X] T107 [P] Migrate `src/app/shared/components/empty-state/empty-state.component.scss`
- [X] T108 [P] Migrate `src/app/shared/components/refund-product/refund-product.component.scss`
- [X] T109 [P] Migrate `src/app/shared/components/qr-code/qr-code.component.scss`
- [X] T110 [P] Migrate `src/app/shared/components/chart-legend/chart-legend.component.scss`
- [X] T111 [P] Migrate `src/app/shared/components/display-key-value/display-key-value.component.scss`
- [X] T112 [P] Migrate `src/app/shared/components/price-comparison/price-preview.component.scss`
- [X] T113 [P] Migrate `src/app/shared/components/price-comparison/price-info-display.component.scss`
- [X] T114 [P] Migrate `src/app/shared/components/loader/loader.component.scss`
- [X] T115 [P] Migrate `src/app/shared/components/detail-row/detail-row.component.scss`
- [X] T116 [P] Migrate `src/app/shared/components/usage-units-grid/usage-units-grid.component.scss`

### Batch 3.4: Form Components

- [X] T117 [P] Migrate `src/app/shared/components/form-generator/form-generator.component.scss`
- [X] T118 [P] Migrate `src/app/shared/components/form-inputs/form-array-item/form-array-item.component.scss`
- [X] T119 [P] Migrate `src/app/shared/components/form-inputs/chips-input/chips-input.component.scss`
- [X] T120 [P] Migrate `src/app/shared/components/smart-filter-header/smart-filter-header.component.scss`

**Checkpoint**: All 26 shared components migrated ✅

---

## Phase 4: View Components Migration (57 files) ✅ COMPLETE

### Batch 4.1: Customers Views (12 files)

- [X] T121 [P] Migrate `src/app/views/customers/edit-customer/edit-customer.component.scss`
- [X] T122 [P] Migrate `src/app/views/customers/customers.component.scss`
- [X] T123 [P] Migrate `src/app/views/customers/corporate-customer-details/corporate-customer-details.component.scss`
- [X] T124 [P] Migrate `src/app/views/customers/private-customer-details/add-subscriber/add-subscriber.component.scss`
- [X] T125 [P] Migrate `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.scss`
- [X] T126 [P] Migrate `src/app/views/customers/private-customer-details/private-customer-details.component.scss`
- [X] T127 [P] Migrate `src/app/views/customers/private-customer-details/show-qr-code-dialog/show-qr-code-dialog.component.scss`
- [X] T128 [P] Migrate `src/app/views/customers/private-customer-details/transaction-orders-table/transaction-orders-table.component.scss`
- [X] T129 [P] Migrate `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.component.scss`
- [X] T130 [P] Migrate `src/app/views/customers/private-customer-details/subscriber-details/purchased-products/purchased-products.component.scss`
- [X] T131 [P] Migrate `src/app/views/customers/private-customer-details/subscriber-details/subscriber-details.component.scss`
- [X] T132 [P] Migrate `src/app/views/customers/private-customer-details/subscriber-details/event-status/event-status.component.scss`

### Batch 4.2: Settings Views (13 files)

- [X] T133 [P] Migrate `src/app/views/settings/invoicing-gateway/edit-invoices/edit-invoices.component.scss`
- [X] T134 [P] Migrate `src/app/views/settings/domains/edit-domain-name/edit-domain-name.component.scss`
- [X] T135 [P] Migrate `src/app/views/settings/domains/edit-domain-owner/edit-domain-owner.component.scss`
- [X] T136 [P] Migrate `src/app/views/settings/domains/domains.component.scss`
- [X] T137 [P] Migrate `src/app/views/settings/domains/create-domain/create-domain.component.scss`
- [X] T138 [P] Migrate `src/app/views/settings/view-configuration/portal/portal-preview/portal-preview.component.scss`
- [X] T139 [P] Migrate `src/app/views/settings/view-configuration/portal/portal.component.scss`
- [X] T140 [P] Migrate `src/app/views/settings/view-configuration/view-configuration.component.scss`
- [X] T141 [P] Migrate `src/app/views/settings/view-configuration/retail/retail.component.scss`
- [X] T142 [P] Migrate `src/app/views/settings/view-configuration/retail/retail-preview/retail-preview.component.scss`
- [X] T143 [P] Migrate `src/app/views/settings/payment-gateway-table/edit-payment-gateway/edit-payment-gateway.component.scss`
- [X] T144 [P] Migrate `src/app/views/settings/email-configurations/template-type-grid/template-type-grid.component.scss`
- [X] T145 [P] Migrate `src/app/views/settings/settings.component.scss`

### Batch 4.3: Product Constructor Views (6 files)

- [X] T146 [P] Migrate `src/app/views/product-constructor/components/company-products/company-product-details/company-product-details.component.scss`
- [X] T147 [P] Migrate `src/app/views/product-constructor/components/company-products/modify-tariff-offer-dialog/modify-tariff-offer-dialog.component.scss`
- [X] T148 [P] Migrate `src/app/views/product-constructor/components/company-products/modify-price-dialog/modify-price-dialog.component.scss`
- [X] T149 [P] Migrate `src/app/views/product-constructor/components/company-products/company-product-prices-table/company-product-prices-table.component.scss`
- [X] T150 [P] Migrate `src/app/views/product-constructor/components/products/product-details/product-details.component.scss`
- [X] T151 [P] Migrate `src/app/views/product-constructor/components/provider-products/provider-product-upload-dialog/provider-product-upload-dialog.component.scss`

### Batch 4.4: Tickets Views (2 files)

- [X] T152 [P] Migrate `src/app/views/tickets/components/tickets/ticket-list/ticket-list.component.scss`
- [X] T153 [P] Migrate `src/app/views/tickets/components/tickets/ticket-form/ticket-form.component.scss`

### Batch 4.5: Products Views (4 files)

- [X] T154 [P] Migrate `src/app/views/products/create-product/create-product.component.scss`
- [X] T155 [P] Migrate `src/app/views/products/products.component.scss`
- [X] T156 [P] Migrate `src/app/views/products/edit-product/edit-product.component.scss`
- [X] T157 [P] Migrate `src/app/views/products/change-status-dialog/change-status-dialog.component.scss`

### Batch 4.6: Other Views (20 files)

- [X] T158 [P] Migrate `src/app/views/providers/providers.component.scss`
- [X] T159 [P] Migrate `src/app/views/roles/components/role-form/role-form.component.scss`
- [X] T160 [P] Migrate `src/app/views/inventory/setup-resource/setup-resource.component.scss`
- [X] T161 [P] Migrate `src/app/views/inventory/upload-dialog/upload-dialog.component.scss`
- [X] T162 [P] Migrate `src/app/views/inventory/inventory.component.scss`
- [X] T163 [P] Migrate `src/app/views/inventory/move-resource/move-resource.component.scss`
- [X] T164 [P] Migrate `src/app/views/orders/orders.component.scss`
- [X] T165 [P] Migrate `src/app/views/orders/edit-order-description/edit-order-description.component.scss`
- [X] T166 [P] Migrate `src/app/views/orders/revert-order/revert-order.component.scss`
- [X] T167 [P] Migrate `src/app/views/email-logs/email-logs.component.scss`
- [X] T168 [P] Migrate `src/app/views/pages/no-permissions/no-permissions.component.scss`
- [X] T169 [P] Migrate `src/app/views/pages/page500/page500.component.scss`
- [X] T170 [P] Migrate `src/app/views/pages/register/register.component.scss`
- [X] T171 [P] Migrate `src/app/views/pages/page403/page403.component.scss`
- [X] T172 [P] Migrate `src/app/views/pages/page404/page404.component.scss`
- [X] T173 [P] Migrate `src/app/views/pages/login/login.component.scss`
- [X] T174 [P] Migrate `src/app/views/companies/edit-company/edit-company.component.scss`
- [X] T175 [P] Migrate `src/app/views/companies/send-invite-email/send-invite-email.component.scss`
- [X] T176 [P] Migrate `src/app/views/companies/companies.component.scss`
- [X] T177 [P] Migrate `src/app/views/storybook/storybook.component.scss`

**Checkpoint**: All 57 view components migrated ✅

---

## Phase 5: Verification

- [ ] T178 Verify all components in light theme
- [ ] T179 Verify all components in dark theme
- [X] T180 Run `ng build` and verify CSS bundle size ✅ (Build successful)
- [ ] T181 Check for remaining hardcoded colors (`grep "#[0-9a-fA-F]"`)
- [ ] T182 Check for remaining hardcoded px values (`grep "padding:.*px\|margin:.*px"`)

**Checkpoint**: All verification complete, 100% migration achieved

---

## Dependencies & Execution Order

```
Phase 1 (Level 1-3 Mixins) ✅ DONE
    ↓
Phase 2 (Utility Mixins) ← START HERE
    ↓
Phase 3 (Shared Components) ← Can run in parallel with Phase 4
    ↓
Phase 4 (View Components) ← Can run in parallel with Phase 3
    ↓
Phase 5 (Verification)
```

## Parallel Opportunities

- All tasks marked [P] within each batch can run in parallel
- Phase 3 and Phase 4 can run in parallel after Phase 2

---

## Summary

| Category | Files | Status |
|----------|-------|--------|
| Already migrated | 65 | ✅ |
| Shared components | 26 | ✅ Complete |
| View components | 57 | ✅ Complete |
| **Total** | **148** | **100% done** |

---

## Notes

- Always test component in both themes after migration
- Commit after each batch for easy rollback
- Keep visual appearance identical - this is a refactor, not redesign
- Prefer Level 2 mixins over Level 1 for standard patterns
- Use utility mixins for common layout patterns
