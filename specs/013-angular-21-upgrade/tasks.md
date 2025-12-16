# Tasks: Angular 21 Upgrade

**Input**: Design documents from `/specs/013-angular-21-upgrade/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: No automated tests requested. Manual verification at checkpoints.

**Organization**: Tasks follow the 8-phase upgrade plan from plan.md, mapped to user stories from spec.md.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

## Path Conventions

- **Root**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`
- **Package config**: `package.json`
- **Angular config**: `angular.json`
- **TypeScript config**: `tsconfig.json`, `tsconfig.app.json`
- **Source**: `src/app/`

---

## Phase 1: Preparation (Setup)

**Purpose**: Record baseline metrics and prepare environment for upgrade

- [x] T001 Record current production bundle size by running `npm run build-prod` and noting output in `dist/` folder size → **Baseline: 6.7 MB**
- [x] T002 Verify Node.js version is >=20.19.0 by running `node --version` → **v20.11.1 (needs upgrade for Ang21)**
- [x] T003 [P] Backup current `package.json` and `package-lock.json` (copy to `.backup/`)
- [x] T004 Clean npm cache and remove node_modules: `rm -rf node_modules && npm cache clean --force`
- [x] T005 Fresh install of current dependencies: `npm install`
- [x] T006 Verify current build works: `npm run build-prod` → **Build time: 18.7s**

**Checkpoint**: Baseline recorded, environment clean, ready for upgrade

---

## Phase 2: Angular 19 → 20 (Foundational)

**Purpose**: First major version upgrade - BLOCKS all subsequent phases

**⚠️ CRITICAL**: Must complete successfully before proceeding

- [x] T007 [US1] Run Angular core upgrade: `ng update @angular/core@20 @angular/cli@20` → **20.3.15**
- [x] T008 [US1] Run Angular Material upgrade: `ng update @angular/material@20 @angular/cdk@20` → **20.2.14**
- [x] T009 [US1] Resolve any compilation errors reported by ng update → **Updated CoreUI to 5.5.x**
- [x] T010 [US1] Verify build succeeds: `npm run build-prod` → **Success, 6.8 MB**
- [ ] T011 [US1] Verify dev server starts: `npm start` and check http://localhost:4200 → **Deferred to Phase 8**

**Checkpoint**: Angular 20 running, build successful, dev server works

---

## Phase 3: Angular 20 → 21 (US1: Successful Build)

**Goal**: Complete Angular 21 upgrade with TypeScript 5.9

**Independent Test**: Run `npm run build-prod` - must complete without errors

- [x] T012 [US1] Run Angular core upgrade: `ng update @angular/core@21 @angular/cli@21` → **21.0.5 + 163 files migrated**
- [x] T013 [US1] Run Angular Material upgrade: `ng update @angular/material@21 @angular/cdk@21` → **21.0.3**
- [x] T014 [US1] Update TypeScript to 5.9.x → **5.9.3 (auto-updated)**
- [x] T015 [US1] Resolve any compilation errors from ng update migrations → **Fixed HostListener + async issues**
- [x] T016 [US1] Update zone.js if needed for Angular 21 compatibility → **Compatible**
- [x] T017 [US1] Verify production build: `npm run build-prod` → **Success, 15.5s**
- [ ] T018 [US1] Verify dev server: `npm start` → **Deferred to Phase 8**
- [x] T019 [US1] Compare bundle size to baseline (must be within 15%) → **6.8 MB (+1.5%) ✓**

**Checkpoint**: Angular 21 core upgrade complete, US1 acceptance criteria met

---

## Phase 4: Angular Code Migrations (Optional Optimization)

**Goal**: Modernize code using official Angular schematics

**Independent Test**: Build still succeeds after each migration

- [ ] T020 [P] [US1] Run CommonModule to standalone migration: `ng generate @angular/core:common-to-standalone`
- [ ] T021 [P] [US1] Run NgStyle to native style migration: `ng generate @angular/core:ngstyle-to-style`
- [ ] T022 [P] [US1] Run NgClass to native class migration: `ng generate @angular/core:ngclass-to-class`
- [ ] T023 [US1] Verify build after migrations: `npm run build-prod`
- [ ] T024 [US1] Review and commit migration changes

**Checkpoint**: Code modernized, build passes

---

## Phase 5: CoreUI Update (US3: Dependency Compatibility)

**Goal**: Update CoreUI packages to Angular 21 compatible versions

**Independent Test**: CoreUI components render correctly (navigation, cards, modals)

- [ ] T025 [US3] Install CoreUI Angular 21 compatible version: `npm install @coreui/angular@^5.6.2`
- [ ] T026 [P] [US3] Install CoreUI ChartJS: `npm install @coreui/angular-chartjs@^5.6`
- [ ] T027 [P] [US3] Install CoreUI Icons: `npm install @coreui/icons-angular@^5.6`
- [ ] T028 [US3] Verify build: `npm run build-prod`
- [ ] T029 [US3] Start dev server and verify CoreUI navigation renders in `/src/app/layout/`
- [ ] T030 [US3] Verify CoreUI cards render on dashboard `/src/app/views/analytics/dashboard/`
- [ ] T031 [US3] Verify CoreUI modals/dialogs work

**Checkpoint**: CoreUI fully functional with Angular 21

---

## Phase 6: Third-party Updates (US3: Dependency Compatibility)

**Goal**: Update remaining third-party packages

**Independent Test**: Translations work, scrollbar works, storage works

- [ ] T032 [US3] Update ngx-translate: `npm install @ngx-translate/core@^17 @ngx-translate/http-loader@^17`
- [ ] T033 [P] [US3] Update ngx-scrollbar: `npm update ngx-scrollbar`
- [ ] T034 [P] [US3] Update ngx-webstorage: `npm update ngx-webstorage`
- [ ] T035 [P] [US3] Update ngx-cookie-service: `npm update ngx-cookie-service`
- [ ] T036 [US3] Verify build: `npm run build-prod`
- [ ] T037 [US3] Verify translations work - change language in app and check UI updates
- [ ] T038 [US3] Verify scrollbar renders in components using ngx-scrollbar
- [ ] T039 [US3] Verify localStorage/sessionStorage still works via ngx-webstorage

**Checkpoint**: All third-party packages updated and functional

---

## Phase 7: flex-layout Removal (US2: Functionality Preserved)

**Goal**: Remove deprecated @angular/flex-layout and replace with native CSS

**Independent Test**: All layouts render correctly without flex-layout

- [ ] T040 [US2] Search for flex-layout usage: `grep -r "fxLayout\|fxFlex\|fxLayoutAlign\|fxLayoutGap\|fxHide\|fxShow" src/`
- [ ] T041 [US2] Document all files using flex-layout directives
- [ ] T042 [US2] For each file with fxLayout="row": replace with CSS `display: flex; flex-direction: row;`
- [ ] T043 [US2] For each file with fxLayout="column": replace with CSS `display: flex; flex-direction: column;`
- [ ] T044 [US2] For each file with fxFlex: replace with CSS `flex` property
- [ ] T045 [US2] For each file with fxLayoutAlign: replace with CSS `justify-content` and `align-items`
- [ ] T046 [US2] For each file with fxLayoutGap: replace with CSS `gap` property
- [ ] T047 [US2] For each file with fxHide/fxShow: replace with CSS media queries or CDK BreakpointObserver
- [ ] T048 [US2] Remove FlexLayoutModule imports from all component imports arrays
- [ ] T049 [US2] Uninstall flex-layout: `npm uninstall @angular/flex-layout`
- [ ] T050 [US2] Verify build: `npm run build-prod`
- [ ] T051 [US2] Manually verify all affected layouts render correctly

**Checkpoint**: flex-layout removed, all layouts working with native CSS

---

## Phase 8: Final Verification (US2: Functionality Preserved)

**Goal**: Complete verification of all application functionality

**Independent Test**: All routes load, all features work as before upgrade

### Build & Performance Verification

- [ ] T052 [US1] Final production build: `npm run build-prod`
- [ ] T053 [US1] Record final bundle size and compare to baseline (must be within 15%)
- [ ] T054 [US1] Verify build time is acceptable (under 5 minutes)

### Route & Navigation Verification (US2)

- [ ] T055 [US2] Start dev server: `npm start`
- [ ] T056 [US2] Test login flow - verify authentication works
- [ ] T057 [US2] Navigate to Dashboard - verify page loads without errors
- [ ] T058 [US2] Navigate to Customers - verify GenericTableComponent works (sort, filter, paginate)
- [ ] T059 [US2] Navigate to Orders - verify data displays correctly
- [ ] T060 [US2] Navigate to Inventory - verify page functions
- [ ] T061 [US2] Navigate to Product Constructor - verify form interactions
- [ ] T062 [US2] Navigate to Tickets - verify ticket list and creation works
- [ ] T063 [US2] Test FormGeneratorComponent - submit a form and verify it works

### Chart & Visualization Verification (US3)

- [ ] T064 [US3] Verify Dashboard charts render correctly (Chart.js)
- [ ] T065 [US3] Verify all chart types display data properly

### Console & Error Check

- [ ] T066 [US2] Check browser console for errors on each major route
- [ ] T067 [US2] Verify no deprecation warnings from Angular 21

**Checkpoint**: Full verification complete, all user stories validated

---

## Phase 9: Documentation & Cleanup (Polish)

**Purpose**: Update documentation and clean up

- [ ] T068 [P] Update constitution.md with new Angular version (19.2.15 → 21.x)
- [ ] T069 [P] Update project-map.md if any structural changes occurred
- [ ] T070 [P] Update CLAUDE.md with Angular 21 in stack information
- [ ] T071 Remove `.backup/` folder if upgrade successful
- [ ] T072 Final commit with upgrade completion message

**Checkpoint**: Documentation updated, upgrade complete

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Preparation) → Phase 2 (Ang 19→20) → Phase 3 (Ang 20→21) → Phase 4 (Migrations)
                                                                            ↓
                                                        Phase 5 (CoreUI) ← ←
                                                                ↓
                                                        Phase 6 (Third-party)
                                                                ↓
                                                        Phase 7 (flex-layout)
                                                                ↓
                                                        Phase 8 (Verification)
                                                                ↓
                                                        Phase 9 (Documentation)
```

### User Story Mapping

| User Story | Primary Phases | Key Tasks |
|------------|----------------|-----------|
| **US1** - Successful Build | 2, 3, 4 | T007-T024, T052-T054 |
| **US2** - Functionality Preserved | 7, 8 | T040-T051, T055-T067 |
| **US3** - Dependency Compatibility | 5, 6, 8 | T025-T039, T064-T065 |
| **US4** - Zoneless Preparation | N/A | Out of scope (future task) |

### Parallel Opportunities

**Phase 1:**
- T003 can run parallel with other prep tasks

**Phase 4 (Code Migrations):**
- T020, T021, T022 can all run in parallel (different schematics)

**Phase 5-6 (Package Updates):**
- T026, T027 can run in parallel
- T033, T034, T035 can run in parallel

**Phase 9 (Documentation):**
- T068, T069, T070 can all run in parallel

---

## Implementation Strategy

### Sequential Execution (Recommended for this upgrade)

1. **Phase 1**: Preparation (30 min)
2. **Phase 2**: Angular 19 → 20 (1-2 hours, depends on errors)
3. **Phase 3**: Angular 20 → 21 (1-2 hours, depends on errors)
4. **Phase 4**: Code Migrations (30 min)
5. **Phase 5**: CoreUI Update (30 min)
6. **Phase 6**: Third-party Updates (30 min)
7. **Phase 7**: flex-layout Removal (1-3 hours, depends on usage)
8. **Phase 8**: Verification (1 hour)
9. **Phase 9**: Documentation (15 min)

**Estimated Total**: 6-10 hours

### MVP Delivery

**Minimum for deployment**: Complete Phases 1-3 (Angular 21 running)

Then incrementally:
- Add Phase 4 (code modernization)
- Add Phases 5-6 (dependency updates)
- Add Phase 7 (flex-layout cleanup)
- Final Phase 8-9 (verification & docs)

---

## Notes

- **Fix-forward approach**: No rollback strategy - resolve issues as they arise
- **Manual testing**: No automated tests requested for this upgrade
- **Zone.js retained**: Zoneless migration is a separate future task
- **CoreUI fallback**: If v5.6.x incompatible, use latest compatible version
- Commit after each phase checkpoint
- If ng update fails, check [Angular Update Guide](https://update.angular.io/)
