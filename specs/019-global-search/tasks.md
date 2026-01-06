# Tasks: Global Search (Command Palette)

**Branch**: `019-global-search` | **Generated**: 2025-01-04
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Legend

- `[ ]` - Pending
- `[X]` - Completed
- `[P]` - Can be parallelized with adjacent [P] tasks
- `[B]` - Blocked by previous task

## Phase 1: Core Infrastructure ✅

### T001 - Install Dependencies ✅
- [X] Run `npm install @tanstack/match-sorter-utils`
- [X] Verify package in package.json

### T002 - Create Search Types [P] ✅
- [X] Create `/src/app/shared/models/search/search.constants.ts`
  - `SEARCH_ITEM_TYPES` (navigation, action)
  - `MATCH_SOURCES` (label, keyword, url)
  - `RESULT_SOURCES` (client, backend)
  - `BACKEND_ENTITY_TYPES` (customer, order, product, ticket, provider)
- [X] Create `/src/app/shared/models/search/search.types.ts`
  - `SearchItemType`, `MatchSource`, `ResultSource`, `BackendEntityType`
  - `SearchMetadata` interface
  - `SearchableItem` interface
  - `SearchResult` interface
  - `BackendSearchItem` interface
  - `BackendSearchResponse` interface
  - `MergedSearchResult` interface
- [X] Create `/src/app/shared/models/search/index.ts` barrel export
- [X] Add to `/src/app/shared/models/index.ts`

### T003 - Create Search Provider Interface [P] ✅
- [X] Create `/src/app/shared/services/search/providers/search-provider.interface.ts`
  - `SearchProvider` interface with `name`, `priority`, `search()`, `isAvailable()`
- [X] Create `/src/app/shared/services/search/providers/index.ts` barrel

### T004 - Create Client Search Provider [B: T002, T003] ✅
- [X] Create `/src/app/shared/services/search/providers/client-search.provider.ts`
  - Inject TranslateService for localized labels
  - Build index from `_nav.ts` (flattened)
  - Use `rankItem` from @tanstack/match-sorter-utils
  - Implement `search()` returning `Observable<SearchResult[]>`
  - Implement highlight range calculation
  - Filter by user permissions (inject AuthService)
- [X] Add keywords support via `searchMeta`

### T005 - Create Backend Search Provider [P with T004] ✅
- [X] Create `/src/app/shared/services/search/providers/backend-search.provider.ts`
  - Implement as disabled by default (`isAvailable() → false`)
  - Inject HttpClient
  - Implement `search()` calling `/api/search?q={query}`
  - Handle timeout (configurable, default 2000ms)
  - Transform `BackendSearchItem` → `SearchResult`
- [X] Add enable/disable toggle via injection token or config

### T006 - Create Search Index Service [B: T004, T005] ✅
- [X] Create `/src/app/shared/services/search/search-index.service.ts`
  - `providedIn: 'root'`
  - Signals: `query`, `isLoading`, `results`, `error`, **`isOpen`**
  - Computed: `groupedResults`, `hasResults`
  - Methods: `registerProvider()`, **`openPalette()`**, **`closePalette()`**
  - `search(query: string)` - debounced (150ms), queries all providers in parallel
  - `mergeResults()` - deduplicate by id, sort by score
  - **Limit max 10 results per category (FR-015)**
  - **Mark backend results with `source: 'backend'` for visual distinction (FR-036)**
  - Subscribe to `TranslateService.onLangChange` → rebuild client index (SC-007)
- [X] Create `/src/app/shared/services/search/index.ts` barrel

---

## Phase 2: UI Components ✅

### T007 - Create Command Palette Item Component [P] ✅
- [X] Create `/src/app/shared/components/command-palette/command-palette-item/`
- [X] `command-palette-item.component.ts`
  - Selector: `os-command-palette-item`
  - Inputs: `item: SearchResult`, `isSelected: boolean`, `query: string`
  - Output: `select`
  - Display: icon, label (with highlights), url path, matched keyword indicator
- [X] `command-palette-item.component.html`
  - Use `@if` for conditional icon/keyword
  - Highlight matched text with `<strong>`
  - **Hierarchical label for fragment items (FR-016a)**: "Dashboard > Finance"
  - **"matched: {keyword}" indicator (FR-014a)** when matched by keyword
- [X] `command-palette-item.component.scss`
  - Use mixins: `os-list-item-base`
  - Selected state styling
  - Icon styling
  - Backend result badge styling (FR-036)

### T008 - Create Highlight Pipe [P] ✅
- [X] Highlight logic implemented inline in `command-palette-item.component.ts`
  - Input: text, query, highlightRanges
  - Output: SafeHtml with `<strong>` tags around matches

### T009 - Create Command Palette Component Structure [B: T006, T007, T008] ✅
- [X] Create `/src/app/shared/components/command-palette/`
- [X] `command-palette.component.ts`
  - Selector: `os-command-palette`
  - Signals: `isOpen`, `selectedIndex`
  - Inject: SearchIndexService, Router
  - Methods: `open()`, `close()`, `selectItem()`, `navigateToSelected()`
  - **Navigation with fragment support (FR-025)**: `router.navigate([url], { fragment })`
- [X] `command-palette.component.html`
  - Overlay backdrop
  - Search input (autofocus)
  - Results list with `@for` and `os-command-palette-item`
  - Category headers (Navigation, Actions, Backend Results)
  - Empty state / No results message
  - Loading indicator
  - **Backend results badge/icon distinction (FR-036)**
- [X] `command-palette.component.scss`
  - Use mixins: `os-dropdown-base`, `os-overlay-base`
  - Position: fixed, centered
  - Max-height with scroll
  - Dark theme support
- [X] Create `index.ts` barrel

### T009a - Command Palette Keyboard Navigation [B: T009] ✅
- [X] Implement keyboard handling in component:
  - ArrowUp/ArrowDown - move selection
  - Enter - navigate to selected
  - Escape - close palette
  - Skip category headers in navigation
- [X] HostListener for keydown events

### T009b - Command Palette Close Behaviors [B: T009] ✅
- [X] Close on click outside (HostListener document:click)
- [X] **Close on route change (FR-005)** - subscribe to Router.events
- [X] Close after successful navigation
- [X] Return focus to previous element on close

### T010 - Add to Shared Components Barrel [B: T009b] ✅
- [X] Update `/src/app/shared/components/index.ts`
- [X] Export `CommandPaletteComponent`, `CommandPaletteItemComponent`

---

## Phase 3: Integration ✅

### T011 - Create Global Search Directive ✅
- [X] Create `/src/app/shared/directives/global-search/global-search.directive.ts`
  - Selector: `[osGlobalSearch]` (applied to document/body)
  - HostListener for `keydown` (Cmd+K / Ctrl+K)
  - Prevent default browser behavior
  - **Inject SearchIndexService and call `openPalette()` method**
- [X] Add `isOpen` signal to SearchIndexService for palette state
- [X] Create `index.ts` barrel
- [X] Add to shared directives barrel

### T012 - Update Header Component [B: T009] ✅
- [X] Created `SearchTriggerComponent` (later replaced by `HeaderSearchComponent` in Phase 6)
- [X] Integrated into Header template

### T012a - Add Command Palette to Layout [B: T009] ✅
- [X] Update `/src/app/containers/default-layout/default-layout.component.ts`
  - Import CommandPaletteComponent
  - Add to imports array
- [X] Update template
  - Add `<os-command-palette />` at root level (for overlay positioning)

### T013 - Add Directive to App [B: T011] ✅
- [X] Applied `osGlobalSearch` directive to default-layout component

### T014 - Test Basic Search Flow ✅
- [X] Verify Cmd+K opens palette
- [X] Verify clicking header search opens palette
- [X] Verify typing shows results
- [X] Verify clicking result navigates
- [X] Verify Enter navigates to selected
- [X] Verify Escape closes palette
- [X] Verify click outside closes palette

---

## Phase 4: Enhancements ✅

### T015 - Create Deep Link Registry [P] ✅
- [X] Create `/src/app/shared/services/search/deep-links.registry.ts`
  - Static array of deep link items (dashboard tabs: executive, subscribers, traffic, finance)
  - Export function to get all deep link items
- [X] Update ClientSearchProvider to include deep links in index

### T016 - Update Dashboard for Fragment Support [P] ✅
- [X] Update `/src/app/views/analytics/dashboard/dashboard.component.ts`
  - Already has ActivatedRoute
  - Subscribe to `route.fragment`
  - Map fragment to tab index
  - Activate tab on fragment change
- [X] Test: `/home/analytics/dashboard#finance` opens Finance tab

### T017 - Mobile Responsive Styles [P] ✅
- [X] Update `command-palette.component.scss`
  - Full-screen on mobile (<768px)
  - Larger touch targets
  - Close button in header
- [X] Test on mobile viewport

### T018 - Permission Filtering [B: T004] ✅
- [X] Ensure ClientSearchProvider filters by user permissions
- [X] `filterByPermissions()` method uses `AuthService.hasPermission()`

### T019 - Recent Items (P3 - Optional) ✅
- [X] Add `recentItems` signal to SearchIndexService
- [X] Store last 5 navigated items (session only, no localStorage)
- [X] Show recents when palette opens with empty query
- [X] Hide recents when user types

---

## Phase 5: Final Polish ✅

### T020 - RTL Support ✅
- [X] Test all components in RTL mode
- [X] Added `:host-context(.layout--rtl)` styles to all components

### T021 - Dark Theme Verification ✅
- [X] Test command palette in dark theme
- [X] Verify all colors use CSS variables
- [X] Added `:host-context(.dark-theme)` styles to all components

### T022 - Translations ✅
- [X] Add i18n keys to all language files (en.json, ru.json, ua.json, he.json):
  - `search.placeholder`: "Search navigation..."
  - `search.noResults`: "No results found"
  - `search.hint`: "Type to search pages and actions"
  - `search.openPalette`: "Open search"
  - `search.categories.recent`: "Recent"
  - `search.categories.navigation`: "Navigation"
  - `search.categories.actions`: "Actions"
  - `search.categories.backend`: "Search Results"
  - `search.matchedKeyword`: "matched: {{keyword}}"
  - `search.shortcuts.navigate`: "navigate"
  - `search.shortcuts.select`: "select"
  - `search.shortcuts.close`: "close"

### T023 - Code Review Checklist ✅
- [X] All components standalone with OnPush
- [X] All DI uses inject()
- [X] All state uses signals
- [X] All types use as const pattern
- [X] SCSS uses mixins and CSS variables
- [X] No @import in SCSS
- [X] English comments/docs
- [X] os- selector prefix used

---

## Phase 6: Inline Header Search ✅

> **Goal**: Add real-time search directly in the header input with dropdown results.
> Cmd+K overlay remains as alternative for power users and mobile.

### T024 - Create Search Dropdown Component [P] ✅
- [X] Create `/src/app/shared/components/command-palette/search-dropdown/`
- [X] `search-dropdown.component.ts`
  - Selector: `os-search-dropdown`
  - Inputs: `results: GroupedSearchResults`, `isLoading: boolean`, `query: string`, `isOpen: boolean`, `selectedIndex: number`
  - Outputs: `selectItem`, `close`
  - Reuse `os-command-palette-item` for rendering results
- [X] `search-dropdown.component.html`
  - Absolute positioned dropdown container
  - Category sections (Navigation, Actions, Backend)
  - Loading spinner
  - Empty state / No results
  - Max-height with scroll
- [X] `search-dropdown.component.scss`
  - Position: absolute, below input
  - Box-shadow, border-radius
  - Dark theme support
  - RTL support
- [X] Create `index.ts` barrel

### T025 - Create Header Search Component [B: T024] ✅
- [X] Create `/src/app/shared/components/command-palette/header-search/`
- [X] `header-search.component.ts`
  - Selector: `os-header-search`
  - Inject: SearchIndexService, Router
  - Signals: `isFocused`, `isDropdownOpen`, `selectedIndex`
  - Real `<input>` element (not button)
  - `(input)` → call `searchService.search()`
  - `(focus)` → open dropdown if has query
  - Keyboard: ↑↓ navigate, Enter select, Esc close & blur, Tab close
- [X] `header-search.component.html`
  - Search icon
  - Input with placeholder "Search..." and keyboard hint (⌘K)
  - Clear button (×) when has query
  - `<os-search-dropdown>` positioned below
  - Mobile: icon button that opens overlay
- [X] `header-search.component.scss`
  - Input styling matching current SearchTrigger
  - Focus states
  - Dark theme, RTL support
  - Mobile: icon-only button
- [X] Create `index.ts` barrel

### T026 - Update SearchIndexService for Dropdown Mode [B: T024] ✅
- [X] HeaderSearchComponent manages its own `isDropdownOpen` state locally
- [X] **Decision: Cmd+K → overlay, Header input → dropdown** (Option A)
  - Both modes share same `query`, `results`, `isLoading` signals
  - `isOpen` for overlay, local `isDropdownOpen` for header dropdown
- [X] `navigateTo()` calls `closePalette()` which clears query (works for both)

### T027 - Replace SearchTrigger with HeaderSearch [B: T025] ✅
- [X] Update Header component
  - Remove `SearchTriggerComponent` import
  - Add `HeaderSearchComponent` import
  - Replace `<os-search-trigger>` with `<os-header-search>`
- [X] Update shared components barrel
  - Export `HeaderSearchComponent`, `SearchDropdownComponent`

### T028 - Header Search Styles & Responsiveness [B: T027] ✅
- [X] Desktop: full input with dropdown
- [X] Tablet: narrower input, dropdown same width
- [X] Mobile: **icon-only button → opens overlay** (keeps current behavior)
  - On mobile (<768px): show search icon button, click opens CommandPalette overlay
  - On desktop/tablet: show full input with dropdown
- [X] Verify dark theme
- [X] Verify RTL layout

### T029 - Click Outside & Focus Management [B: T027] ✅
- [X] Close dropdown on click outside (`@HostListener('document:click')`)
- [X] Close dropdown on Escape
- [X] Close dropdown on route change (subscribe to `Router.events`)
- [X] Handle focus: Tab closes dropdown and moves focus

### T030 - Test Inline Search Flow ✅
- [X] Build passes successfully
- [X] All components compile without errors

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1 | T001-T006 | ✅ Complete |
| Phase 2 | T007-T010 | ✅ Complete |
| Phase 3 | T011-T014 | ✅ Complete |
| Phase 4 | T015-T019 | ✅ Complete |
| Phase 5 | T020-T023 | ✅ Complete |
| Phase 6 | T024-T030 | ✅ Complete |

**Total**: 33 tasks - **All Complete** ✅

---

## Files Created/Modified

### New Files (Phase 1-5):
```
src/app/shared/models/search/
├── search.constants.ts
├── search.types.ts
└── index.ts

src/app/shared/services/search/
├── search-index.service.ts
├── nav-items.token.ts
├── deep-links.registry.ts
├── index.ts
└── providers/
    ├── search-provider.interface.ts
    ├── client-search.provider.ts
    ├── backend-search.provider.ts
    └── index.ts

src/app/shared/components/command-palette/
├── command-palette.component.ts/html/scss
├── index.ts
├── command-palette-item/
│   ├── command-palette-item.component.ts/html/scss
│   └── index.ts
└── search-trigger/
    ├── search-trigger.component.ts/html/scss
    └── index.ts

src/app/shared/directives/attribute/global-search/
├── global-search.directive.ts
└── index.ts
```

### New Files (Phase 6):
```
src/app/shared/components/command-palette/
├── search-dropdown/
│   ├── search-dropdown.component.ts/html/scss
│   └── index.ts
└── header-search/
    ├── header-search.component.ts/html/scss
    └── index.ts
```

### Modified Files:
```
src/main.ts (NAV_ITEMS provider)
src/app/containers/default-layout/default-layout.component.ts/html
src/app/containers/default-layout/components/header/header.component.ts/html
src/app/views/analytics/dashboard/dashboard.component.ts
src/assets/i18n/en.json, ru.json, ua.json, he.json
```
