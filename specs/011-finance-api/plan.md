# Implementation Plan: Finance Dashboard API Integration

**Branch**: `011-finance-api` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-finance-api/spec.md`

## Summary

Replace mock data in Finance Dashboard tab with real API integration. The endpoint `/api/v1/reports/dashboards/finance/period-revenue-summary` provides revenue data by bundle, country, and margin — to be mapped to existing chart components. Implementation follows the established pattern from `subscribers-data.service.ts`.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19.2.15
**Primary Dependencies**: Angular HttpClient, RxJS, Chart.js, CoreUI, Angular Material
**Storage**: N/A (read-only API integration)
**Testing**: Manual testing via dev server
**Target Platform**: Web (SPA)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: API response displayed within 3 seconds
**Constraints**: Must follow existing dashboard service patterns
**Scale/Scope**: Single tab update, 1 service + 1 config update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| II. Standalone Components | ✅ PASS | Existing component already standalone |
| II. OnPush Change Detection | ✅ PASS | Already uses OnPush |
| II. inject() for DI | ✅ PASS | Already uses inject() |
| III. HTTP Error Handling | ⚠️ CHECK | Must use handleArrayError/handleObjectError |
| VII. SCSS Architecture | ✅ N/A | No SCSS changes needed |
| X. Search Before Creating | ✅ PASS | Reusing existing patterns from subscribers-data.service |
| XII. Quality Gates | ✅ PASS | Will verify before commit |

**Gate Result**: PASS — No violations detected. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/011-finance-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify)

```text
src/app/views/analytics/dashboard/
├── services/
│   └── finance-data.service.ts    # UPDATE: Add real API call
├── models/
│   └── finance.types.ts           # UPDATE: Add API response interface
└── utils/
    └── config.utils.ts            # UPDATE: Set finance mock to false
```

**Structure Decision**: Minimal changes to existing dashboard architecture. Only updating FinanceDataService to call real API instead of mock, plus adding API response type.

## Complexity Tracking

No violations requiring justification. Implementation is straightforward:
- Single API endpoint integration
- Follows established patterns from subscribers-data.service.ts
- No new abstractions needed
