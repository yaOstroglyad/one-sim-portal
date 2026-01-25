# Tasks: OsIcon Component Refactoring

**Status:** Completed
**Updated:** 2026-01-25

---

## Completed Tasks

### Phase 1: Component Creation

- [x] Create `os-icon.component.ts` with modern signals API
- [x] Implement `input.required<string>()` for name
- [x] Implement `input<IconSize | string>()` for size with default
- [x] Implement `input<string>()` for folder
- [x] Add CoreUI icon detection via `computed()` (cil/cib/cif prefix)
- [x] Integrate `IconSetService` for CoreUI icons
- [x] Integrate `IconService` for custom SVGs
- [x] Add `takeUntilDestroyed()` for subscription cleanup
- [x] Export `ICON_SIZES` constant and `IconSize` type

### Phase 2: Migration

- [x] Migrate `sidebar.component` from `app-icon` to `os-icon`
- [x] Migrate `global-fab.component` from `app-icon` to `os-icon`
- [x] Migrate `support-chat.shell.component` from `app-icon` to `os-icon`
- [x] Migrate `admin-overview.component` from `app-icon` to `os-icon`
- [x] Migrate `reports.component` from `app-icon` to `os-icon`
- [x] Migrate `refunds-summary.component` from `app-icon` to `os-icon`
- [x] Migrate `company-product-prices-table.component` from `app-icon` to `os-icon`
- [x] Update all imports from `IconComponent` to `OsIconComponent`

### Phase 3: Cleanup

- [x] Delete old `icon.component.ts`
- [x] Update `icon/index.ts` exports
- [x] Verify build passes

### Phase 4: Code Quality

- [x] Fix memory leak (add `takeUntilDestroyed`)
- [x] Fix deprecated `:deep()` → `::ng-deep`
- [x] Code review completed

### Phase 5: Documentation

- [x] Update `spec.md` with actual implementation
- [x] Update `quickstart.md` with usage guide

---

## Not Implemented (Decided Against)

- [ ] ~~Lucide icons migration~~ — Visual regression, kept CoreUI
- [ ] ~~icon-mapping.ts~~ — Not needed
- [ ] ~~icon-registry.service.ts~~ — Using CoreUI's IconSetService
- [ ] ~~Remove @coreui/icons packages~~ — Kept for visual consistency

---

## Future Tasks (Optional)

- [ ] Migrate remaining `<svg cIcon>` usages across codebase
- [ ] Add brand icons to `/assets/icons/brands/` if needed
- [ ] Add payment icons to `/assets/icons/payment/` if needed
- [ ] Update `constitution.md` with icon usage rules
- [ ] Update `project-map.md` with OsIconComponent docs
