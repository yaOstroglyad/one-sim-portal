# Implementation Plan: Waterfall Chart Component

**Branch**: `012-waterfall-chart` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-waterfall-chart/spec.md`

## Summary

Create a reusable waterfall chart component (`os-waterfall-chart`) in the shared components library using Chart.js floating bars. Additionally, fix translations in Subscribers tab, sort bundle statuses by lifecycle order (PAID → FAILED_ACTIVATE → REFUNDED → ACTIVE → SPENT → EXPIRED), replace the existing stacked bar chart with waterfall visualization, and create component documentation.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19.2.15
**Primary Dependencies**: Chart.js (existing), @angular/core, RxJS
**Storage**: N/A (visualization component only)
**Testing**: Manual testing via dev server
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (Angular SPA)
**Performance Goals**: Render within 500ms for up to 50 data points
**Constraints**: Must follow existing `os-bar-chart` patterns, standalone component
**Scale/Scope**: Single shared component + 1 tab integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| II. Standalone Components | ✅ PASS | New component will be standalone |
| II. OnPush Change Detection | ✅ PASS | Will use OnPush |
| II. inject() for DI | ✅ PASS | Will use inject() pattern |
| II. Signal APIs | ✅ PASS | Will use input()/output() |
| II. Control Flow | ✅ PASS | Will use @if/@for |
| II. os- Selector Prefix | ✅ PASS | Will use `os-waterfall-chart` |
| III. HTTP Error Handling | ⚪ N/A | No HTTP calls in component |
| VII. SCSS @use Syntax | ✅ PASS | Will use @use imports |
| VII. CSS Variables | ✅ PASS | Will use --os-color-* variables |
| IX. English Documentation | ✅ PASS | Docs will be in English |
| X. Search Before Creating | ✅ PASS | Verified no existing waterfall component |

**Gate Status**: ✅ ALL PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/012-waterfall-chart/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/app/shared/
├── components/
│   └── waterfall-chart/
│       ├── os-waterfall-chart.component.ts      # Main component
│       ├── os-waterfall-chart.component.html    # Template
│       ├── os-waterfall-chart.component.scss    # Styles
│       └── waterfall-chart.types.ts             # Interfaces
├── models/
│   └── charts/
│       └── waterfall.model.ts                   # WaterfallDataPoint interface
└── index.ts                                     # Re-export new component

src/app/views/analytics/dashboard/
├── tabs/subscribers/
│   └── subscribers-tab.component.ts             # Update to use waterfall
└── utils/
    └── bundle-status.utils.ts                   # Lifecycle ordering logic

src/assets/i18n/
├── en.json                                      # Verify translations
├── ru.json                                      # Add missing translations
├── ua.json                                      # Add missing translations
└── he.json                                      # Add missing translations

docs/components/
└── waterfall-chart.md                           # Component documentation
```

**Structure Decision**: Web application (Angular SPA) - new shared component in existing component library structure, following established patterns from `os-bar-chart`.

## Complexity Tracking

No violations - all implementations follow existing patterns.

## Implementation Phases

### Phase 1: Waterfall Chart Component (P1)
1. Create `WaterfallDataPoint` interface
2. Create `os-waterfall-chart` component following `os-bar-chart` pattern
3. Implement floating bar data transformation
4. Add color coding (green/red/blue)
5. Export from shared barrel

### Phase 2: Bundle Status Ordering & Translations (P2)
1. Create bundle status lifecycle ordering utility
2. Update `buildBundleStatusChartConfig()` to use lifecycle order
3. Verify/fix translations in all 4 language files

### Phase 3: Integration & Documentation (P3)
1. Replace stacked bar with waterfall in Subscribers tab
2. Create component documentation in docs/components/
