# Implementation Plan: Public API Documentation

**Branch**: `023-public-api-docs` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-public-api-docs/spec.md`

## Summary

Create a publicly accessible API documentation page that renders Markdown content from a backend API, providing GitBook-like experience with navigation, search, and code examples. Key technical approach: reuse existing search infrastructure (SearchProvider, CommandPalette) via DI and existing CSS variables for theming.

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5 (Zoneless)
**Primary Dependencies**: Angular HttpClient, Angular CDK, marked (Markdown parsing), highlight.js (syntax highlighting)
**Storage**: N/A (content fetched from API, no local persistence)
**Testing**: Jasmine/Karma (existing project setup)
**Target Platform**: Web (Desktop & Mobile responsive)
**Project Type**: Web application (Angular SPA)
**Performance Goals**: Initial load < 3s, search results < 500ms
**Constraints**: Public route (no auth), reuse existing infrastructure
**Scale/Scope**: Single documentation page with multiple sections

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| Absolute paths only | PASS | Will use absolute paths in all file operations |
| Standalone components | PASS | All new components will be `standalone: true` |
| OnPush change detection | PASS | All components will use `ChangeDetectionStrategy.OnPush` |
| inject() for DI | PASS | Will use `inject()` function, no constructor injection |
| Signal APIs | PASS | Will use `signal()`, `computed()`, `input()`, `output()` |
| @if/@for control flow | PASS | Will use modern control flow syntax |
| os- selector prefix | PASS | All selectors will use `os-docs-*` prefix |
| :host display block | PASS | Block-level components will declare `:host { display: block }` |
| CSS variables | PASS | Will use existing `--layout-*` and `--os-color-*` variables |
| SCSS mixins | PASS | Will use existing mixins from `_mixins.scss` |
| Error handling 4-layer | PASS | Components handle errors, services propagate |
| NotificationService | PASS | Will use for any user notifications |
| English documentation | PASS | All code comments in English |
| Search before creating | PASS | Will reuse SearchProvider, CommandPalette, CSS variables |

**Gate Result**: PASS - No violations.

## Project Structure

### Documentation (this feature)

```text
specs/023-public-api-docs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── docs-api.yaml    # OpenAPI spec for docs endpoint
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/app/
├── views/
│   └── docs/                           # NEW: Public API Docs feature
│       ├── docs.routes.ts              # Public routes (no AuthGuard)
│       ├── docs-layout/
│       │   ├── docs-layout.component.ts
│       │   ├── docs-layout.component.html
│       │   └── docs-layout.component.scss
│       ├── components/
│       │   ├── docs-header/            # Simplified header (logo + search)
│       │   ├── docs-sidebar/           # Navigation sidebar
│       │   ├── docs-toc/               # Table of contents (right)
│       │   ├── docs-content/           # Main content area
│       │   ├── code-block/             # Code with copy + highlighting
│       │   └── endpoint-block/         # API endpoint display
│       ├── services/
│       │   ├── docs-data.service.ts    # Fetch docs from API
│       │   └── docs-search.provider.ts # SearchProvider for docs
│       └── models/
│           └── docs.model.ts           # Documentation data models

├── shared/
│   ├── services/search/providers/
│   │   └── index.ts                    # Export DocsSearchProvider
│   └── models/
│       └── docs/                       # Shared docs models if needed

src/main.ts                             # Add /docs route (no AuthGuard)

src/scss/
└── _docs-theme.scss                    # Docs-specific theme variables
```

**Structure Decision**: Feature-based structure under `views/docs/` following existing patterns. Public route added to `main.ts` without AuthGuard. Reuses existing shared infrastructure (SearchProvider interface, CSS variables).

## Architecture Decisions

### 1. Layout Strategy

**Decision**: Create separate `DocsLayoutComponent` instead of reusing `DefaultLayoutComponent`.

**Rationale**:
- DefaultLayout has account selector, admin navigation - not needed for public docs
- DocsLayout needs 3-column structure (sidebar + content + TOC)
- Cleaner separation of concerns
- Can still reuse CSS variables and mixins

### 2. Search Integration

**Decision**: Create `DocsSearchProvider` implementing existing `SearchProvider` interface, register via component-level DI.

**Rationale**:
- SearchIndexService already supports `registerProvider()`
- Component-level providers allow context-specific search
- CommandPalette component works unchanged
- Pattern proven in existing codebase

### 3. Markdown Rendering

**Decision**: Use `marked` library for Markdown parsing + `highlight.js` for syntax highlighting.

**Rationale**:
- `marked` is lightweight, widely used, well-maintained
- `highlight.js` supports JSON, bash, and many languages
- Both have good TypeScript support
- Can be tree-shaken if not needed elsewhere

### 4. Theme Support

**Decision**: Leverage existing CSS variables (`--layout-*`, `--os-color-*`) and add docs-specific variables.

**Rationale**:
- Existing dark theme infrastructure via CSS variables
- No need to reinvent theming
- Consistent with rest of application

### 5. Routing

**Decision**: Add `/docs` route in `main.ts` without `AuthGuardService`.

**Rationale**:
- Simple, explicit public access
- No complex guard logic needed
- Clear separation from authenticated routes

## Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| marked | ^14.0.0 | Markdown parsing |
| highlight.js | ^11.9.0 | Syntax highlighting |
| @types/marked | ^6.0.0 | TypeScript definitions |

## Complexity Tracking

No violations - no complexity justification needed.
