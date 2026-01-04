# Tasks: Global Search (Command Palette)

**Branch**: `019-global-search` | **Generated**: 2025-01-04
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Legend

- `[ ]` - Pending
- `[X]` - Completed
- `[P]` - Can be parallelized with adjacent [P] tasks
- `[B]` - Blocked by previous task

## Phase 1: Core Infrastructure

### T001 - Install Dependencies
- [ ] Run `npm install @tanstack/match-sorter-utils`
- [ ] Verify package in package.json

### T002 - Create Search Types [P]
- [ ] Create `/src/app/shared/models/search/search.constants.ts`
  - `SEARCH_ITEM_TYPES` (navigation, action)
  - `MATCH_SOURCES` (label, keyword, url)
  - `RESULT_SOURCES` (client, backend)
  - `BACKEND_ENTITY_TYPES` (customer, order, product, ticket, provider)
- [ ] Create `/src/app/shared/models/search/search.types.ts`
  - `SearchItemType`, `MatchSource`, `ResultSource`, `BackendEntityType`
  - `SearchMetadata` interface
  - `SearchableItem` interface
  - `SearchResult` interface
  - `BackendSearchItem` interface
  - `BackendSearchResponse` interface
  - `MergedSearchResult` interface
- [ ] Create `/src/app/shared/models/search/index.ts` barrel export
- [ ] Add to `/src/app/shared/models/index.ts`

### T003 - Create Search Provider Interface [P]
- [ ] Create `/src/app/shared/services/search/providers/search-provider.interface.ts`
  - `SearchProvider` interface with `name`, `priority`, `search()`, `isAvailable()`
- [ ] Create `/src/app/shared/services/search/providers/index.ts` barrel

### T004 - Create Client Search Provider [B: T002, T003]
- [ ] Create `/src/app/shared/services/search/providers/client-search.provider.ts`
  - Inject TranslateService for localized labels
  - Build index from `_nav.ts` (flattened)
  - Use `rankItem` from @tanstack/match-sorter-utils
  - Implement `search()` returning `Observable<SearchResult[]>`
  - Implement highlight range calculation
  - Filter by user permissions (inject AuthService)
- [ ] Add keywords support via `searchMeta`

### T005 - Create Backend Search Provider [P with T004]
- [ ] Create `/src/app/shared/services/search/providers/backend-search.provider.ts`
  - Implement as disabled by default (`isAvailable() → false`)
  - Inject HttpClient
  - Implement `search()` calling `/api/search?q={query}`
  - Handle timeout (configurable, default 2000ms)
  - Transform `BackendSearchItem` → `SearchResult`
- [ ] Add enable/disable toggle via injection token or config

### T006 - Create Search Index Service [B: T004, T005]
- [ ] Create `/src/app/shared/services/search/search-index.service.ts`
  - `providedIn: 'root'`
  - Signals: `query`, `isLoading`, `results`, `error`, **`isOpen`**
  - Computed: `groupedResults`, `hasResults`
  - Methods: `registerProvider()`, **`openPalette()`**, **`closePalette()`**
  - `search(query: string)` - debounced (150ms), queries all providers in parallel
  - `mergeResults()` - deduplicate by id, sort by score
  - **Limit max 10 results per category (FR-015)**
  - **Mark backend results with `source: 'backend'` for visual distinction (FR-036)**
  - Subscribe to `TranslateService.onLangChange` → rebuild client index (SC-007)
- [ ] Create `/src/app/shared/services/search/index.ts` barrel

---

## Phase 2: UI Components

### T007 - Create Command Palette Item Component [P]
- [ ] Create `/src/app/shared/components/command-palette/command-palette-item/`
- [ ] `command-palette-item.component.ts`
  - Selector: `os-command-palette-item`
  - Inputs: `item: SearchResult`, `isSelected: boolean`, `query: string`
  - Output: `select`
  - Display: icon, label (with highlights), url path, matched keyword indicator
- [ ] `command-palette-item.component.html`
  - Use `@if` for conditional icon/keyword
  - Highlight matched text with `<strong>`
  - **Hierarchical label for fragment items (FR-016a)**: "Dashboard > Finance"
  - **"matched: {keyword}" indicator (FR-014a)** when matched by keyword
- [ ] `command-palette-item.component.scss`
  - Use mixins: `os-list-item-base`
  - Selected state styling
  - Icon styling
  - Backend result badge styling (FR-036)

### T008 - Create Highlight Pipe [P]
- [ ] Create `/src/app/shared/pipes/highlight/highlight.pipe.ts`
  - Input: text, query, highlightRanges
  - Output: SafeHtml with `<strong>` tags around matches
- [ ] Add to shared pipes barrel

### T009 - Create Command Palette Component Structure [B: T006, T007, T008]
- [ ] Create `/src/app/shared/components/command-palette/`
- [ ] `command-palette.component.ts`
  - Selector: `os-command-palette`
  - Signals: `isOpen`, `selectedIndex`
  - Inject: SearchIndexService, Router
  - Methods: `open()`, `close()`, `selectItem()`, `navigateToSelected()`
  - **Navigation with fragment support (FR-025)**: `router.navigate([url], { fragment })`
- [ ] `command-palette.component.html`
  - Overlay backdrop
  - Search input (autofocus)
  - Results list with `@for` and `os-command-palette-item`
  - Category headers (Navigation, Actions, Backend Results)
  - Empty state / No results message
  - Loading indicator
  - **Backend results badge/icon distinction (FR-036)**
- [ ] `command-palette.component.scss`
  - Use mixins: `os-dropdown-base`, `os-overlay-base`
  - Position: fixed, centered
  - Max-height with scroll
  - Dark theme support
- [ ] Create `index.ts` barrel

### T009a - Command Palette Keyboard Navigation [B: T009]
- [ ] Implement keyboard handling in component:
  - ArrowUp/ArrowDown - move selection
  - Enter - navigate to selected
  - Escape - close palette
  - Skip category headers in navigation
- [ ] HostListener for keydown events

### T009b - Command Palette Close Behaviors [B: T009]
- [ ] Close on click outside (HostListener document:click)
- [ ] **Close on route change (FR-005)** - subscribe to Router.events
- [ ] Close after successful navigation
- [ ] Return focus to previous element on close

### T010 - Add to Shared Components Barrel [B: T009b]
- [ ] Update `/src/app/shared/components/index.ts`
- [ ] Export `CommandPaletteComponent`, `CommandPaletteItemComponent`

---

## Phase 3: Integration

### T011 - Create Global Search Directive
- [ ] Create `/src/app/shared/directives/global-search/global-search.directive.ts`
  - Selector: `[osGlobalSearch]` (applied to document/body)
  - HostListener for `keydown` (Cmd+K / Ctrl+K)
  - Prevent default browser behavior
  - **Inject SearchIndexService and call `openPalette()` method**
- [ ] Add `isOpen` signal to SearchIndexService for palette state
- [ ] Create `index.ts` barrel
- [ ] Add to shared directives barrel

### T012 - Update Header Component [B: T009]
- [ ] Update `/src/app/containers/default-layout/components/header/header.component.ts`
  - Inject SearchIndexService
  - Add click handler: `openPalette() { this.searchService.openPalette(); }`
- [ ] Update template
  - Add `(click)="openPalette()"` to search input
  - Placeholder text: "Search or press ⌘K..."

### T012a - Add Command Palette to Layout [B: T009]
- [ ] Update `/src/app/containers/default-layout/default-layout.component.ts`
  - Import CommandPaletteComponent
  - Add to imports array
- [ ] Update template
  - Add `<os-command-palette />` at root level (for overlay positioning)

### T013 - Add Directive to App [B: T011]
- [ ] Update `/src/app/app.component.ts`
  - Import GlobalSearchDirective
  - Add to imports array
- [ ] Update template to apply directive (or apply to body)

### T014 - Test Basic Search Flow
- [ ] Verify Cmd+K opens palette
- [ ] Verify clicking header search opens palette
- [ ] Verify typing shows results
- [ ] Verify clicking result navigates
- [ ] Verify Enter navigates to selected
- [ ] Verify Escape closes palette
- [ ] Verify click outside closes palette

---

## Phase 4: Enhancements

### T015 - Create Deep Link Registry [P]
- [ ] Create `/src/app/shared/services/search/deep-links.registry.ts`
  - Static array of deep link items (dashboard tabs, etc.)
  - Export function to get all deep link items
- [ ] Update ClientSearchProvider to include deep links in index

### T016 - Update Dashboard for Fragment Support [P]
- [ ] Update `/src/app/views/analytics/dashboard/dashboard.component.ts`
  - Inject ActivatedRoute
  - Subscribe to `route.fragment`
  - Map fragment to tab index
  - Activate tab on fragment change
- [ ] Test: `/home/analytics/dashboard#finance` opens Finance tab

### T017 - Mobile Responsive Styles [P]
- [ ] Update `command-palette.component.scss`
  - Full-screen on mobile (<768px)
  - Larger touch targets
  - Close button in header
- [ ] Test on mobile viewport

### T018 - Permission Filtering [B: T004]
- [ ] Ensure ClientSearchProvider filters by user permissions
- [ ] Test: Login as non-admin, verify admin-only items hidden

### T019 - Recent Items (P3 - Optional)
- [ ] Add `recentItems` signal to SearchIndexService
- [ ] Store last 5 navigated items (session only, no localStorage)
- [ ] Show recents when palette opens with empty query
- [ ] Hide recents when user types

---

## Phase 5: Final Polish

### T020 - RTL Support
- [ ] Test all components in RTL mode
- [ ] Fix any layout issues using logical properties

### T021 - Dark Theme Verification
- [ ] Test command palette in dark theme
- [ ] Verify all colors use CSS variables
- [ ] Fix any contrast issues

### T022 - Translations
- [ ] Add i18n keys to all language files (en.json, ru.json, uk.json, he.json):
  - `search.placeholder`: "Search or press ⌘K..."
  - `search.noResults`: "No results found"
  - `search.categories.navigation`: "Navigation"
  - `search.categories.actions`: "Actions"
  - `search.categories.backend`: "Search Results"
  - `search.matchedKeyword`: "matched: {{keyword}}"

### T023 - Code Review Checklist
- [ ] All components standalone with OnPush
- [ ] All DI uses inject()
- [ ] All state uses signals
- [ ] All types use as const pattern
- [ ] SCSS uses mixins and CSS variables
- [ ] No @import in SCSS
- [ ] English comments/docs
- [ ] os- selector prefix used

---

## Dependency Graph

```
T001 ──────────────────────────────────────────────────────────────────────┐
                                                                           │
T002 ─┬─ T003 ─┬─ T004 ─┬─ T006 ─┬─ T009 ─ T009a ─ T009b ─ T010 ─┬─ T012  │
      │        │        │        │                               │   │     │
      │        └─ T005 ─┘        │                               └─ T012a │
      │                          │                                         │
T007 ─┼─ T008 ──────────────────┘                                         │
      │                                                                    │
T011 ─┴─────────────────────────────────────────────────────────── T013 ──┘
                                                                      │
                                                                    T014

T015 ─┬─ T016 ─┬─ T017 ─┬─ T018 ─┬─ T019 ─ T020 ─ T021 ─ T022 ─ T023
      │        │        │        │
      └────────┴────────┴────────┘ (parallel)
```

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | T001-T006 | Medium (core logic) |
| Phase 2 | T007-T010 (incl. T009a, T009b) | Medium (UI components) |
| Phase 3 | T011-T014 (incl. T012a) | Low (integration) |
| Phase 4 | T015-T019 | Medium (enhancements) |
| Phase 5 | T020-T023 | Low (polish) |

**Total**: 26 tasks
