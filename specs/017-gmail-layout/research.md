# Research: Gmail-Style Layout Redesign

**Feature**: 017-gmail-layout
**Date**: 2025-12-28

## Overview

This is a frontend-only CSS/Angular layout refactoring. No external APIs, backend changes, or new technologies involved. Research focuses on existing codebase patterns.

## Findings

### 1. Current Layout Structure

**Decision**: Modify existing components in `src/app/containers/default-layout/`
**Rationale**: All layout logic is centralized in this directory. No need to create new components.
**Alternatives considered**:
- Creating new layout component from scratch (rejected: unnecessary duplication)
- Using CSS Grid for layout (rejected: current Flexbox approach works well)

### 2. CSS Positioning Strategy

**Decision**: Use CSS `position: fixed` for header and sidebar, `calc()` for dynamic heights
**Rationale**:
- Header needs to stay fixed during scroll
- Sidebar height must be `calc(100vh - 64px)` to account for header
- This pattern is already used in the project
**Alternatives considered**:
- CSS Grid layout (rejected: requires more significant template changes)
- Sticky positioning (rejected: less predictable behavior across browsers)

### 3. Border Radius Implementation

**Decision**: Apply `border-radius` on content container with sidebar background extending behind
**Rationale**: Creates visual frame effect as seen in Bob/Gmail interfaces
**Alternatives considered**:
- Shadow on content edges (rejected: less visually distinct)
- Separate border element (rejected: adds unnecessary DOM complexity)

### 4. Z-Index Hierarchy

**Decision**: Header (1001) > Sidebar (1000) > Content (default)
**Rationale**: Header must overlay sidebar when both are fixed. Sidebar must overlay content for mobile slide-in.
**Alternatives considered**: None - this is standard practice

### 5. Mobile Toggle Button

**Decision**: Keep toggle at bottom of sidebar, enlarge for mobile via CSS media query
**Rationale**: Maintains UX consistency between desktop and mobile
**Alternatives considered**:
- FAB-style floating button (rejected: user preferred consistent positioning)
- Header hamburger menu (rejected: user explicitly declined)

### 6. Search Bar Implementation

**Decision**: Add non-functional search input in header center
**Rationale**: Placeholder for future search functionality per spec
**Alternatives considered**: None - spec explicitly states search logic is out of scope

### 7. Dropdown Menu Button

**Decision**: Add disabled button in header left side
**Rationale**: Placeholder for future sections/settings menu per spec
**Alternatives considered**: None - spec explicitly states dropdown is disabled for now

## Existing Patterns to Reuse

| Pattern | Location | Reuse For |
|---------|----------|-----------|
| Layout signals | `layout.service.ts` | Sidebar state management |
| RTL support | `languageService.isRtl()` | Directional CSS classes |
| Theme colors | `_variables.scss` | Sidebar/content backgrounds |
| Transitions | Existing 300ms cubic-bezier | All animations |
| Mobile overlay | `layout__mobile-overlay` | Sidebar backdrop |

## No Research Needed

- No new npm packages required
- No API changes
- No data model changes
- No authentication/security changes
- No performance optimization research

## Conclusion

All implementation decisions are straightforward. Proceed directly to implementation with existing Angular/SCSS patterns.
