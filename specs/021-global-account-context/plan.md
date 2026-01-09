# Implementation Plan: Global Account Context

**Branch**: `021-global-account-context` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-global-account-context/spec.md`

## Summary

Move account selector from individual page components to the global header. Implement a signal-based `AccountContextService` that provides reactive account state management with module-level configuration (visibility, required flag, auto-select), localStorage persistence, and visual attention indicator for required selections. Admin-only feature - non-admin users never see the selector and the context remains dormant.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: Angular 21.0.5 (Zoneless), RxJS, Angular Material (MatSelect, MatFormField)
**Storage**: localStorage for persistence
**Testing**: Manual testing (no unit tests specified)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge)
**Project Type**: Web SPA (Angular)
**Performance Goals**: Account selection reflects in UI within 2 seconds
**Constraints**: Admin-only initialization, OnPush change detection, signals for state
**Scale/Scope**: 8 pages to migrate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| **Absolute Paths Only** | ✅ PASS | Will use absolute paths |
| **Standalone Components** | ✅ PASS | New components will be standalone |
| **OnPush Change Detection** | ✅ PASS | Will use OnPush |
| **inject() DI** | ✅ PASS | Will use inject() |
| **Signal APIs** | ✅ PASS | Core requirement - signal-based state |
| **@if/@for Control Flow** | ✅ PASS | Will use modern syntax |
| **os- Selector Prefix** | ✅ PASS | Will use `os-account-selector-chip` |
| **SCSS Variables** | ✅ PASS | Will use CSS variables for colors |
| **Error Handling** | ✅ PASS | Service won't show notifications |
| **Search Before Creating** | ✅ PASS | Reusing existing Account model, AccountsDataService |

**Gate Status: PASSED**

## Project Structure

### Documentation (this feature)

```text
specs/021-global-account-context/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no new APIs)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/app/
├── shared/
│   ├── services/
│   │   └── account-context/
│   │       ├── account-context.service.ts    # NEW - Signal-based global state
│   │       └── index.ts                       # Barrel export
│   │
│   ├── components/
│   │   └── account-selector-chip/
│   │       ├── account-selector-chip.component.ts    # NEW - Header UI
│   │       ├── account-selector-chip.component.html
│   │       └── account-selector-chip.component.scss
│   │
│   └── models/
│       └── ui/
│           └── account-context.model.ts      # NEW - Configuration interface
│
├── containers/
│   └── default-layout/
│       └── components/
│           └── header/
│               ├── header.component.ts       # MODIFY - Add chip
│               └── header.component.html     # MODIFY - Render chip
│
└── views/
    ├── analytics/
    │   ├── reports/reports.component.ts      # MIGRATE
    │   └── dashboard/dashboard.component.ts  # MIGRATE
    ├── email-logs/email-logs.component.ts    # MIGRATE
    ├── tickets/.../ticket-list.component.ts  # MIGRATE
    ├── product-constructor/.../company-product-list.component.ts  # MIGRATE
    └── settings/
        ├── email-configurations/email-configurations.component.ts  # MIGRATE
        ├── payment-gateway-table/payment-gateway-table.component.ts # MIGRATE
        └── invoicing-gateway/invoicing-gateway.component.ts         # MIGRATE
```

**Structure Decision**: Single project structure, feature adds to existing `/shared/services/` and `/shared/components/` directories per project conventions.

## Complexity Tracking

> No violations detected - architecture follows existing patterns.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| State Management | Signal-based service | Constitution requires signals for state (Section II) |
| UI Component | Compact chip in header | Fits existing header layout (right side) |
| Migration | 8 pages refactor | Remove local selectors, use global context |
