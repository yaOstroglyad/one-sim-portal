# Implementation Plan: Searchable Select CDK + Signals Refactor

**Branch**: `022-searchable-select-cdk` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-searchable-select-cdk/spec.md`

## Summary

Modernize the `app-searchable-select` component by replacing custom CSS-based dropdown positioning with Angular CDK Overlay and migrating all component state from traditional class properties to Angular Signals. This refactoring maintains full backward compatibility while improving code maintainability, accessibility, and alignment with Angular 21 best practices.

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5 (Zoneless)
**Primary Dependencies**: @angular/cdk@^21.0.3 (Overlay, A11y), @angular/core (Signals), RxJS (ControlValueAccessor)
**Storage**: N/A (UI component, no persistent storage)
**Testing**: Manual testing (no unit test framework configured for components)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (Angular SPA)
**Performance Goals**: Instant dropdown open (<16ms), smooth keyboard navigation (60fps)
**Constraints**: Full backward compatibility required (FR-011, SC-007)
**Scale/Scope**: Single component refactor, ~600 LOC → ~400 LOC expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| **II. Standalone Components** | ✅ PASS | Component already standalone |
| **II. OnPush Change Detection** | ✅ PASS | Already uses OnPush |
| **II. inject() for DI** | ⚠️ REFACTOR | Currently uses constructor injection → migrate to inject() |
| **II. Signal APIs** | ⚠️ REFACTOR | Currently uses @Input/@Output → migrate to input()/output() |
| **II. State with Signals** | ⚠️ REFACTOR | Currently uses class properties → migrate to signal()/computed() |
| **II. Control Flow Syntax** | ✅ PASS | Already uses @if/@for |
| **II. Component Selector** | ⚠️ NOTE | Current: `app-searchable-select` - keep for backward compat |
| **VII. SCSS Mixins** | ✅ PASS | Already uses os-input-base, os-dropdown-base, os-list-item-base |
| **VII. CSS Variables** | ✅ PASS | Already uses CSS variables |
| **X. Search Before Creating** | ✅ PASS | Refactoring existing component |

**Gate Status**: ✅ PASS (with planned refactoring items)

**Note on selector prefix**: The component currently uses `app-searchable-select` selector. Changing to `os-searchable-select` would break backward compatibility (FR-011). Decision: Keep existing selector for this refactor; selector migration can be a separate future task.

## Project Structure

### Documentation (this feature)

```text
specs/022-searchable-select-cdk/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify)

```text
src/app/shared/components/searchable-select/
├── searchable-select.component.ts    # Main refactoring target
├── searchable-select.component.html  # Template updates for CDK Overlay
├── searchable-select.component.scss  # Minor updates for overlay panel
└── searchable-select.types.ts        # No changes expected
```

**Structure Decision**: Single component refactor within existing `/shared/components/` structure. No new files or directories required.

## Complexity Tracking

> No violations to justify - this is a straightforward refactor following constitution guidelines.

| Item | Status |
|------|--------|
| New dependencies | None (CDK already installed) |
| New patterns | None (using existing Angular patterns) |
| Breaking changes | None (backward compatible) |
