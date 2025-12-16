# Implementation Plan: Zoneless Angular Migration

**Branch**: `014-zoneless` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-zoneless/spec.md`

## Summary

Migrate the One-Sim-Portal Angular application to zoneless change detection by removing Zone.js and configuring Angular to use `provideExperimentalZonelessChangeDetection()`. The project is well-prepared for this migration as it already uses OnPush change detection and Angular Signals extensively (from Angular 21 upgrade).

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5
**Primary Dependencies**: Angular Core, Angular Material, CoreUI, RxJS, Chart.js
**Storage**: N/A (frontend-only change)
**Testing**: Manual testing across all application flows
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Angular SPA)
**Performance Goals**: <100ms UI response time, 30KB+ bundle size reduction
**Constraints**: No regressions in existing functionality
**Scale/Scope**: ~170 components, ~50 services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| I. Absolute Paths Only | ✅ Pass | All file operations use absolute paths |
| II. Component Architecture | ✅ Pass | Already uses OnPush, Signals, inject() |
| III. HTTP Error Handling | ✅ Pass | No changes to HTTP layer |
| IV. Models & Interfaces | ✅ Pass | No new models required |
| V. Services Organization | ✅ Pass | No new services required |
| VI. Utility Functions | ✅ Pass | No new utilities required |
| VII. SCSS Architecture | ✅ Pass | No SCSS changes |
| VIII. Icons & SVG | ✅ Pass | No icon changes |
| IX. Documentation Language | ✅ Pass | All docs in English |
| X. Search Before Creating | ✅ Pass | Configuration-only change |
| XI. TypeScript Configuration | ✅ Pass | No TS config changes |
| XII. Quality Gates | ✅ Pass | All gates applicable |

**Gate Result**: PASSED - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/014-zoneless/
├── plan.md              # This file
├── research.md          # Phase 0: Zoneless patterns research
├── data-model.md        # Phase 1: Configuration changes
├── quickstart.md        # Phase 1: Quick reference
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code Changes

```text
src/
├── main.ts                          # Add provideExperimentalZonelessChangeDetection()
├── polyfills.ts                     # Remove zone.js import (if present)
└── app/
    └── [components requiring fixes] # Components that need change detection fixes

angular.json                         # Remove zone.js from polyfills
tsconfig.app.json                    # Optional: Add skipLibCheck if needed
```

**Structure Decision**: Minimal configuration changes in bootstrap files. No new directories or major structural changes required.

## Implementation Phases

### Phase 1: Enable Zoneless Mode
1. Configure `provideExperimentalZonelessChangeDetection()` in main.ts
2. Remove Zone.js from angular.json polyfills
3. Remove zone.js import from polyfills.ts (if exists)

### Phase 2: Audit & Fix Components
1. Test all application routes and features
2. Identify components with stale UI (missing signal/async pipe usage)
3. Fix any components not updating correctly

### Phase 3: Verification
1. Build production bundle and verify size reduction
2. Run full application testing
3. Performance benchmarking

## Complexity Tracking

> No constitution violations requiring justification.

| Item | Status | Notes |
|------|--------|-------|
| New dependencies | None | Using built-in Angular APIs |
| Breaking changes | Minimal | Configuration-only at bootstrap level |
| Risk level | Low | Project already OnPush + Signals ready |
