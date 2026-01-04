# Implementation Plan: Global Search (Command Palette)

**Branch**: `019-global-search` | **Date**: 2025-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-global-search/spec.md`

## Summary

Implement a Command Palette / Spotlight Search pattern for quick navigation using Cmd+K keyboard shortcut or header search input. Uses @tanstack/match-sorter-utils for client-side fuzzy search with pluggable backend API support for future expansion.

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5 (Zoneless)
**Primary Dependencies**: @tanstack/match-sorter-utils, @angular/router, @ngx-translate/core
**Storage**: N/A (client-side index in memory, no persistence)
**Testing**: Manual testing (unit tests out of scope for initial implementation)
**Target Platform**: Web (Desktop + Mobile responsive)
**Project Type**: Web SPA (Angular)
**Performance Goals**: <100ms palette open, <50ms search results (after debounce)
**Constraints**: Must work offline (client-side search), graceful degradation if backend unavailable
**Scale/Scope**: ~50-100 searchable items (nav + deep links + future actions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| Standalone components | ✅ PASS | CommandPaletteComponent will be standalone |
| OnPush change detection | ✅ PASS | Will use OnPush |
| inject() for DI | ✅ PASS | No constructor injection |
| Signal APIs (input/output) | ✅ PASS | Using signals for state |
| signal()/computed() for state | ✅ PASS | FR-039, FR-040, FR-042 require signals |
| as const types | ✅ PASS | FR-041, all types defined as const |
| @if/@for/@switch | ✅ PASS | Modern control flow in templates |
| os- selector prefix | ✅ PASS | `os-command-palette` |
| :host { display: block } | ✅ PASS | Overlay component |
| SCSS @use syntax | ✅ PASS | FR-030 |
| CSS variables | ✅ PASS | FR-029, FR-031 |
| SCSS mixins | ✅ PASS | FR-028, FR-032 |
| English documentation | ✅ PASS | All code/comments in English |

## Project Structure

### Documentation (this feature)

```text
specs/019-global-search/
├── spec.md              # Feature specification
├── plan.md              # This file
├── data-model.md        # Data model definitions
└── tasks.md             # Task breakdown
```

### Source Code (repository root)

```text
src/app/
├── shared/
│   ├── components/
│   │   └── command-palette/
│   │       ├── command-palette.component.ts
│   │       ├── command-palette.component.html
│   │       ├── command-palette.component.scss
│   │       ├── command-palette-item/
│   │       │   ├── command-palette-item.component.ts
│   │       │   ├── command-palette-item.component.html
│   │       │   └── command-palette-item.component.scss
│   │       └── index.ts
│   ├── directives/
│   │   └── global-search/
│   │       ├── global-search.directive.ts
│   │       └── index.ts
│   ├── services/
│   │   └── search/
│   │       ├── search-index.service.ts
│   │       ├── providers/
│   │       │   ├── search-provider.interface.ts
│   │       │   ├── client-search.provider.ts
│   │       │   └── backend-search.provider.ts
│   │       └── index.ts
│   └── models/
│       └── search/
│           ├── search.types.ts          # Const types + interfaces
│           ├── search.constants.ts      # SEARCH_ITEM_TYPES, etc.
│           └── index.ts
├── containers/
│   └── default-layout/
│       └── components/
│           └── header/
│               └── header.component.ts  # Update to trigger palette
└── views/
    └── analytics/
        └── dashboard/
            └── dashboard.component.ts   # Add fragment support
```

**Structure Decision**: Feature follows existing project structure with shared components/services. Command palette is a shared component since it's used globally.

## Architecture

### Component Hierarchy

```
DefaultLayoutComponent
├── HeaderComponent
│   └── [search input] ──triggers──> CommandPaletteComponent
└── CommandPaletteComponent (overlay, CDK portal)
    ├── Search input
    ├── Results list
    │   └── CommandPaletteItemComponent (repeated)
    └── Empty state / Loading state

GlobalSearchDirective (attached to document)
└── Listens for Cmd+K → opens CommandPaletteComponent
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SearchIndexService                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ providers: SearchProvider[]                              ││
│  │   ├─ ClientSearchProvider (always enabled)              ││
│  │   └─ BackendSearchProvider (opt-in, disabled by default)││
│  └─────────────────────────────────────────────────────────┘│
│                           │                                  │
│                    search(query)                            │
│                           │                                  │
│            ┌──────────────┴──────────────┐                  │
│            ↓                             ↓                  │
│    ClientSearchProvider          BackendSearchProvider      │
│    (match-sorter-utils)          (HTTP /api/search)        │
│            │                             │                  │
│            └──────────────┬──────────────┘                  │
│                           │                                  │
│                     merge + dedupe                          │
│                           │                                  │
│                           ↓                                  │
│               Signal<SearchResult[]>                        │
└─────────────────────────────────────────────────────────────┘
```

### State Management (Signals)

```typescript
// SearchIndexService
readonly query = signal('');
readonly isLoading = signal(false);
readonly results = signal<SearchResult[]>([]);
readonly error = signal<string | null>(null);

// Computed
readonly groupedResults = computed(() => groupByType(this.results()));
readonly hasResults = computed(() => this.results().length > 0);

// CommandPaletteComponent
readonly isOpen = signal(false);
readonly selectedIndex = signal(0);
readonly selectedItem = computed(() => this.flatResults()[this.selectedIndex()] ?? null);
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Install @tanstack/match-sorter-utils
2. Create search types and constants
3. Create SearchProvider interface
4. Create ClientSearchProvider
5. Create SearchIndexService

### Phase 2: UI Components
1. Create CommandPaletteComponent (overlay)
2. Create CommandPaletteItemComponent
3. Implement keyboard navigation
4. Implement match highlighting

### Phase 3: Integration
1. Create GlobalSearchDirective (Cmd+K)
2. Update HeaderComponent with search trigger
3. Wire up to Router for navigation

### Phase 4: Enhancements
1. Add deep link registry (dashboard tabs)
2. Update Dashboard for fragment support
3. Add BackendSearchProvider (disabled)
4. Mobile responsive styles

## Dependencies

### New Package

```bash
npm install @tanstack/match-sorter-utils
```

### Existing Dependencies Used
- `@angular/router` - Navigation
- `@angular/cdk` - Overlay/Portal (if needed)
- `@ngx-translate/core` - Translations
- `@coreui/icons-angular` - Icons

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| match-sorter-utils doesn't provide highlight ranges | Medium | Medium | Implement custom highlight function |
| Cmd+K conflicts with browser | Low | Low | Use standard pattern, provide fallback |
| Performance with large index | Low | Medium | Limit to ~200 items, lazy load deep links |
| RTL layout issues | Medium | Low | Test early, use logical CSS properties |

## Success Metrics

- [ ] Palette opens on Cmd+K from any page
- [ ] Fuzzy search works ("cust" → "Customers")
- [ ] Results highlight matched text
- [ ] Keyboard navigation works (arrows + enter)
- [ ] Mobile displays full-screen overlay
- [ ] Permission filtering hides unauthorized items
- [ ] Dark theme supported via CSS variables
