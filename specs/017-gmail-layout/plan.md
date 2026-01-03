# Implementation Plan: Gmail-Style Layout Redesign

**Branch**: `017-gmail-layout` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-gmail-layout/spec.md`

## Summary

Redesign the application layout architecture from sidebar-first (100vh) to Gmail-style header-first pattern. The header will span full viewport width, with sidebar and content positioned below it. Content area will have rounded corners with sidebar background extending behind to create visual frame effect.

**Key Changes:**
- Header: full width, contains dropdown button (disabled), search bar, user menu
- Sidebar: starts below header (top: 64px), maintains logo with full/narrow switching
- Content: rounded corners (top-left, top-right), breadcrumbs inside
- Mobile: same toggle position (bottom of sidebar) but enlarged

## Technical Context

**Language/Version**: TypeScript 5.9
**Framework**: Angular 21.0.5 (Zoneless, Standalone Components)
**Primary Dependencies**: CoreUI, Angular Material, RxJS
**Storage**: N/A (no backend changes)
**Testing**: Manual testing (no unit tests for layout changes)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SPA (Angular)
**Performance Goals**: Animation transitions ≤300ms
**Constraints**: RTL support required, mobile responsive (320px - 2560px)
**Scale/Scope**: Affects all pages through default-layout component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| Absolute paths only | PASS | Will use absolute paths in all file operations |
| Standalone components | PASS | All modified components are already standalone |
| OnPush change detection | PASS | Existing components use OnPush |
| inject() for DI | PASS | Existing components use inject() |
| Signal APIs | PASS | Will maintain existing signal patterns |
| @if/@for/@switch | PASS | Will use modern control flow |
| os- selector prefix | N/A | No new components with selectors |
| SCSS @use syntax | PASS | Will use @use for all imports |
| CSS variables for colors | PASS | Will use --os-color-* variables |
| English documentation | PASS | All code comments in English |
| Search before creating | PASS | Modifying existing components only |

**Constitution Compliance: PASS** - No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/017-gmail-layout/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - frontend only)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify)

```text
src/app/containers/default-layout/
├── default-layout.component.ts      # Main layout container
├── default-layout.component.html    # Layout template
├── default-layout.component.scss    # Layout styles (MAJOR CHANGES)
├── components/
│   ├── header/
│   │   ├── header.component.ts      # Add search bar, remove breadcrumb
│   │   ├── header.component.html    # New header structure
│   │   └── header.component.scss    # Full-width header styles
│   └── sidebar/
│       ├── sidebar.component.ts     # Adjust positioning
│       ├── sidebar.component.html   # Minor template adjustments
│       └── sidebar.component.scss   # Top offset, height calc
├── services/
│   └── layout.service.ts            # No changes expected
└── models/
    └── layout.model.ts              # No changes expected

src/scss/
├── _variables.scss                  # Add border-radius variable if needed
└── _layout.scss                     # Global layout adjustments
```

**Structure Decision**: Modifying existing Angular layout components. No new components created. Pure refactoring of CSS positioning and minor template changes.

## Architecture Changes

### Current Layout CSS Model

```
┌──────────────────────────────────────────┐
│ .sidebar { position: fixed; top: 0;      │
│            height: 100vh; left: 0; }     │
├──────────┬───────────────────────────────┤
│ SIDEBAR  │ .header { position: fixed;    │
│ (100vh)  │          left: 256px; }       │
│          ├───────────────────────────────┤
│          │ .content { margin-left: 256px;│
│          │            padding-top: 64px; }│
└──────────┴───────────────────────────────┘
```

### Target Layout CSS Model

```
┌──────────────────────────────────────────┐
│ .header { position: fixed; top: 0;       │
│           left: 0; right: 0; z-index: 1001 }
├──────────┬───────────────────────────────┤
│ SIDEBAR  │ .content-wrapper {            │
│ top: 64px│   background: sidebar-bg;     │
│ height:  │   padding-top: 64px;          │
│ calc()   │ }                             │
│          │ .content {                    │
│          │   background: white;          │
│          │   border-radius: 16px 16px 0 0│
│          │ }                             │
└──────────┴───────────────────────────────┘
```

### Component Responsibility Matrix

| Component | Current | Target |
|-----------|---------|--------|
| **Header** | Breadcrumb, user menu | Search bar, disabled dropdown, user menu |
| **Sidebar** | Logo, nav, toggle (100vh) | Logo, nav, toggle (calc(100vh - 64px)) |
| **Content** | Flat background | Rounded corners, breadcrumb inside |
| **Layout** | Sidebar-first hierarchy | Header-first hierarchy |

## Implementation Phases

### Phase 1: Header Restructure
1. Update header.component.scss: `left: 0; right: 0;` (full width)
2. Update header.component.html: add search bar, add disabled dropdown button
3. Remove breadcrumb from header (will move to content)
4. Adjust z-index hierarchy (header > sidebar)

### Phase 2: Sidebar Repositioning
1. Update sidebar.component.scss: `top: 64px; height: calc(100vh - 64px);`
2. Ensure logo remains in sidebar (already there)
3. Verify toggle button works with new positioning
4. Test hover-expand behavior

### Phase 3: Content Area Styling
1. Update default-layout.component.scss:
   - Add wrapper with sidebar background color
   - Add content container with border-radius
2. Move breadcrumb component into content area
3. Ensure proper spacing and alignment

### Phase 4: Mobile Adaptation
1. Update mobile breakpoint styles
2. Enlarge toggle button on mobile
3. Test sidebar slide-in animation
4. Verify overlay behavior

### Phase 5: RTL Support
1. Mirror all directional properties
2. Test with Hebrew language
3. Verify animations work in RTL

## CSS Variables to Add/Use

```scss
// Existing (use these)
--os-color-dark          // Sidebar background
--os-color-light         // Content background
--os-color-primary       // Active states

// New (if needed)
$layout-header-height: 64px;
$layout-sidebar-width: 256px;
$layout-sidebar-collapsed: 56px;
$layout-content-radius: 16px;
```

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| RTL positioning complex | Test early with Hebrew locale |
| Mobile sidebar timing | Use existing animation duration (300ms) |
| Z-index conflicts | Document hierarchy: header(1001) > sidebar(1000) > content |
| Breadcrumb placement | Ensure consistent padding in all views |

## Complexity Tracking

> No constitution violations requiring justification.

## Dependencies

- No external dependencies
- No backend changes
- No new npm packages

## Success Verification

After implementation, verify:
1. [ ] Header spans full width on all viewport sizes
2. [ ] Sidebar starts at 64px from top
3. [ ] Content has visible rounded corners
4. [ ] Breadcrumbs appear inside content area
5. [ ] Mobile toggle is enlarged and functional
6. [ ] RTL layout mirrors correctly
7. [ ] All existing navigation works
8. [ ] Animations complete in ≤300ms
