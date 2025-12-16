# Feature Specification: Angular 21 Upgrade

**Feature Branch**: `013-angular-21-upgrade`
**Created**: 2025-12-16
**Status**: Draft
**Input**: Upgrade Angular from version 19.2.15 to version 21.0.4 with all dependencies

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Successful Application Build (Priority: P1)

As a developer, I want the application to build successfully after the Angular upgrade so that I can deploy the updated version.

**Why this priority**: Without a successful build, no other functionality can be verified. This is the foundation for all other tests.

**Independent Test**: Run `npm run build-prod` and verify it completes without errors, producing deployable artifacts.

**Acceptance Scenarios**:

1. **Given** the Angular upgrade is complete, **When** developer runs `npm run build-prod`, **Then** the build completes successfully without errors
2. **Given** the Angular upgrade is complete, **When** developer runs `npm start`, **Then** the development server starts and the application loads in the browser
3. **Given** the build is complete, **When** the production bundle is analyzed, **Then** the bundle size is within 10% of the previous version

---

### User Story 2 - Application Functionality Preserved (Priority: P1)

As a user, I want all existing features to work exactly as before the upgrade so that my workflow is not disrupted.

**Why this priority**: Regression prevention is critical for user trust and business continuity.

**Independent Test**: Navigate through all major application routes and verify core functionality works (login, navigation, data display, forms).

**Acceptance Scenarios**:

1. **Given** the application is running, **When** user logs in with valid credentials, **Then** authentication works and user is redirected to dashboard
2. **Given** user is authenticated, **When** user navigates through menu items, **Then** all pages load without errors
3. **Given** user is on a data list page, **When** user interacts with tables (sort, filter, paginate), **Then** GenericTableComponent works correctly
4. **Given** user opens a form, **When** user submits valid data, **Then** FormGeneratorComponent handles submission correctly

---

### User Story 3 - Dependency Compatibility (Priority: P2)

As a developer, I want all third-party dependencies to be compatible with Angular 21 so that the application remains fully functional.

**Why this priority**: Incompatible dependencies can break specific features even if core Angular works.

**Independent Test**: Verify each major dependency works after upgrade (CoreUI, Material, Chart.js, ngx-translate, etc.).

**Acceptance Scenarios**:

1. **Given** Angular is upgraded, **When** CoreUI components are rendered, **Then** navigation, cards, and UI elements display correctly
2. **Given** Angular is upgraded, **When** Angular Material components are used, **Then** dialogs, form controls, and overlays function properly
3. **Given** Angular is upgraded, **When** Dashboard charts are displayed, **Then** Chart.js renders all chart types correctly
4. **Given** Angular is upgraded, **When** user changes language, **Then** ngx-translate switches translations correctly

---

### User Story 4 - Zoneless Migration Preparation (Priority: P3)

As a developer, I want the application to be ready for zoneless change detection so that we can benefit from improved performance in the future.

**Why this priority**: Angular 21 defaults to zoneless, but existing apps can continue using Zone.js. This is preparation for future optimization.

**Independent Test**: Verify the application works with Zone.js (current behavior) and document components that may need updates for zoneless.

**Acceptance Scenarios**:

1. **Given** Angular 21 is installed, **When** application runs with Zone.js enabled, **Then** all components update correctly on data changes
2. **Given** upgrade is complete, **When** developer reviews components with manual change detection, **Then** a list of zoneless-ready components is documented

---

### Edge Cases

- What happens when a deprecated API is used in existing code? Must be identified and migrated during upgrade
- How does system handle if @angular/flex-layout replacement is needed? Use Angular CDK Layout or CSS alternatives
- What happens if CoreUI is not compatible with Angular 21? Fall back to compatible version or find alternative
- How to handle breaking changes in RxJS operators? Update imports and operator usage as needed

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST upgrade @angular/core and all @angular/* packages from 19.2.15 to 21.x
- **FR-002**: System MUST upgrade @angular/cdk and @angular/material to compatible 21.x versions
- **FR-003**: System MUST update @angular-devkit/build-angular and @angular/cli to compatible versions
- **FR-004**: System MUST replace or remove @angular/flex-layout as it is deprecated
- **FR-005**: System MUST update TypeScript to version compatible with Angular 21
- **FR-006**: System MUST update zone.js to compatible version or configure zoneless mode
- **FR-007**: System MUST verify and update @coreui/angular packages for compatibility
- **FR-008**: System MUST verify and update ngx-translate, ngx-scrollbar, ngx-webstorage for compatibility
- **FR-009**: System MUST resolve all compilation errors after package updates
- **FR-010**: System MUST ensure all existing routes and lazy-loaded modules work correctly
- **FR-011**: System MUST verify that HTTP interceptors and error handlers function correctly
- **FR-012**: System MUST ensure CacheHubService and all data services work correctly

### Key Entities

- **Package Dependencies**: npm packages that need version updates (Angular, Material, CoreUI, utilities)
- **Breaking Changes**: API changes between Angular 19 and 21 that require code modifications
- **Deprecated APIs**: Features removed or deprecated that need alternatives

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Production build completes without errors in under 5 minutes
- **SC-002**: Development server starts and application loads within 30 seconds
- **SC-003**: All existing application routes load without console errors
- **SC-004**: All unit tests pass after upgrade (if any exist)
- **SC-005**: Bundle size remains within 15% of pre-upgrade size
- **SC-006**: Application startup time remains within 20% of pre-upgrade time
- **SC-007**: No visual regressions in UI components (verified by manual testing)

## Assumptions

- The project will continue using Zone.js for change detection initially (zoneless migration is a separate future task)
- CoreUI Angular packages have a compatible version for Angular 21 (to be verified)
- The upgrade will be performed sequentially: Angular 19 → 20 → 21 as recommended by Angular
- Existing OnPush change detection strategy will continue to work
- No major refactoring of business logic is required, only framework-related updates

## Risks

- **Risk-001**: CoreUI may not have Angular 21 compatible version → Mitigation: Use latest compatible CoreUI version even if older; UI library migration is out of scope
- **Risk-002**: Breaking changes may require significant code refactoring → Mitigation: Use ng update migration schematics; follow Angular upgrade guide
- **Risk-003**: Third-party packages may lag behind Angular releases → Mitigation: Check package compatibility matrix; use compatible versions even if not latest

## Out of Scope

- Migration to zoneless change detection (future task)
- Migration from CoreUI to different UI framework
- Major performance optimizations beyond framework upgrade
- Adding new features during upgrade
- Updating unit test framework or adding new tests
- Rollback strategy (fix-forward approach accepted)

## Clarifications

### Session 2025-12-16

- Q: Rollback strategy if upgrade fails? → A: No rollback needed, fix forward only
- Q: CoreUI incompatibility fallback? → A: Use latest compatible version (may be older)
