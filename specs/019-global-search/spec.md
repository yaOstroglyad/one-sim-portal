# Feature Specification: Global Search (Command Palette)

**Feature Branch**: `019-global-search`
**Created**: 2025-01-04
**Status**: Draft
**Input**: Client-side global search for quick navigation without backend API

## Overview

Implement a Command Palette / Spotlight Search pattern that allows users to quickly navigate to any point in the application using keyboard shortcuts or the search input in the header. The search operates entirely client-side using a JSON-based index built from navigation structure and static content.

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🔍  Search or press Cmd+K...                    [Cmd+K]││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Command Palette Dropdown                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🔍  cust                                               ││
│  ├─────────────────────────────────────────────────────────┤│
│  │  Navigation                                              ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  👥  Customers                      /customers      │││
│  │  │  📊  Customer Analytics    /analytics/customers     │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  Actions                                                 ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  ➕  Create Customer                                │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
_nav.ts  ────┐
             │
static       ├──→  SearchIndexService  ──→  @tanstack/match-sorter-utils
actions ─────┤            │
             │            ↓
permissions ─┘     CommandPaletteComponent
                          │
                          ↓
                   Router.navigate()
```

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keyboard Activation (Priority: P1)

As a power user, I want to open the command palette with a keyboard shortcut (Cmd+K / Ctrl+K), so that I can quickly navigate without using the mouse.

**Why this priority**: Core UX pattern for command palettes; expected by users familiar with VS Code, Slack, Notion.

**Independent Test**: Press Cmd+K on any page, verify palette opens with focus on search input.

**Acceptance Scenarios**:

1. **Given** user is on any page, **When** they press Cmd+K (Mac) or Ctrl+K (Windows/Linux), **Then** the command palette dropdown opens
2. **Given** command palette is open, **When** user presses Escape, **Then** the palette closes and focus returns to previous element
3. **Given** command palette is open, **When** user clicks outside the palette, **Then** the palette closes
4. **Given** user is typing in a form input, **When** they press Cmd+K, **Then** the command palette still opens (shortcut works globally)

---

### User Story 2 - Search Input Activation (Priority: P1)

As a user, I want to click on the search input in the header to open the command palette, so that I have a visible entry point for search.

**Why this priority**: Provides discoverability for users who don't know the keyboard shortcut.

**Independent Test**: Click on header search input, verify palette opens.

**Acceptance Scenarios**:

1. **Given** user sees the search input in header, **When** they click on it, **Then** the command palette dropdown opens
2. **Given** search input is clicked, **When** palette opens, **Then** the search input inside palette is focused
3. **Given** search input in header shows placeholder, **When** viewing on desktop, **Then** placeholder shows "Search or press ⌘K..."

---

### User Story 3 - Fuzzy Search (Priority: P1)

As a user, I want to find navigation items using partial or approximate text matches, so that I don't need to remember exact menu names.

**Why this priority**: Core functionality; without fuzzy search, users must type exact matches.

**Independent Test**: Type "cust" and verify "Customers" appears in results.

**Acceptance Scenarios**:

1. **Given** user types "cust", **When** viewing results, **Then** "Customers" appears as a match
2. **Given** user types "ordrs" (typo), **When** viewing results, **Then** "Orders" still appears (fuzzy tolerance)
3. **Given** user types a search term, **When** results appear, **Then** they are sorted by relevance (best match first)
4. **Given** item has keywords defined, **When** user searches by keyword, **Then** the item appears in results

---

### User Story 4 - Navigation Results (Priority: P1)

As a user, I want to see navigation destinations in search results, so that I can quickly jump to any page.

**Why this priority**: Primary use case for the command palette.

**Independent Test**: Search for any nav item, click result, verify navigation occurs.

**Acceptance Scenarios**:

1. **Given** search results show navigation items, **When** user clicks on a result, **Then** they navigate to that URL
2. **Given** search results show navigation items, **When** user presses Enter on highlighted result, **Then** they navigate to that URL
3. **Given** results are shown, **When** user presses ArrowDown/ArrowUp, **Then** the highlight moves between results
4. **Given** navigation item has an icon in _nav.ts, **When** shown in results, **Then** the icon is displayed

---

### User Story 5 - Grouped Results (Priority: P2)

As a user, I want search results grouped by category (Navigation, Actions), so that I can quickly scan and find what I need.

**Why this priority**: Improves UX for longer result lists.

**Independent Test**: Search for term matching both navigation and action, verify grouping.

**Acceptance Scenarios**:

1. **Given** search returns mixed results, **When** viewing the dropdown, **Then** results are grouped under category headers
2. **Given** a category has no results, **When** viewing the dropdown, **Then** that category header is not shown
3. **Given** results are grouped, **When** navigating with keyboard, **Then** category headers are skipped (only items are selectable)

---

### User Story 6 - Permission Filtering (Priority: P2)

As a user, I want search results filtered by my permissions, so that I only see destinations I can access.

**Why this priority**: Security and UX; users shouldn't see items they can't access.

**Independent Test**: Log in as user with limited permissions, verify restricted items don't appear.

**Acceptance Scenarios**:

1. **Given** user has CUSTOMER_PERMISSION, **When** searching for "Companies", **Then** "Companies" does not appear (admin only)
2. **Given** user has ADMIN_PERMISSION, **When** searching for "Companies", **Then** "Companies" appears in results
3. **Given** nav item has no permissions defined, **When** any user searches, **Then** item appears for all users

---

### User Story 7 - Recent Searches (Priority: P3)

As a user, I want to see my recent searches when opening the palette with no query, so that I can quickly repeat common navigations.

**Why this priority**: Nice-to-have for power users; can be deferred.

**Independent Test**: Navigate via palette, reopen palette, verify recent item shown.

**Acceptance Scenarios**:

1. **Given** user opens palette with no query, **When** they have previous navigations, **Then** up to 5 recent items are shown
2. **Given** recent items are shown, **When** user selects one, **Then** navigation occurs
3. **Given** user navigates via palette, **When** reopening palette, **Then** that destination appears in recents
4. **Given** recents exist, **When** user types a query, **Then** recents disappear and search results appear

---

### User Story 8 - Match Highlighting (Priority: P1)

As a user, I want to see WHY a search result matched my query, so that I understand the relevance and can refine my search if needed.

**Why this priority**: Core UX for search; users need visual feedback on match reason.

**Independent Test**: Search "cust", verify "Cust" is bold/highlighted in "Customers" result.

**Acceptance Scenarios**:

1. **Given** user types "cust", **When** "Customers" appears in results, **Then** the matched portion "Cust" is visually highlighted (bold)
2. **Given** item matched by keyword, **When** viewing result, **Then** show keyword match indicator (e.g., "matched: клиенты")
3. **Given** multiple matches in label, **When** viewing result, **Then** all matched portions are highlighted
4. **Given** match is in URL path, **When** viewing result, **Then** matched portion in path is also highlighted

---

### User Story 9 - Deep Link Navigation (Priority: P2)

As a user, I want to navigate directly to specific tabs or sections within pages (e.g., Dashboard Finance tab), so that the command palette provides granular navigation.

**Why this priority**: Enables true "go anywhere" functionality; requires route anchor support in target components.

**Independent Test**: Search "Finance", select result, verify Dashboard opens with Finance tab active.

**Acceptance Scenarios**:

1. **Given** Dashboard has multiple tabs, **When** user searches "Finance", **Then** result "Dashboard > Finance" appears
2. **Given** user selects "Dashboard > Finance", **When** navigation occurs, **Then** Dashboard opens with Finance tab selected via URL fragment
3. **Given** page supports anchor navigation, **When** URL contains fragment (e.g., `/dashboard#finance`), **Then** page scrolls/activates corresponding section
4. **Given** searchable item has fragment, **When** shown in results, **Then** display shows parent > child hierarchy (e.g., "Dashboard > Finance")

**Implementation Note**: Requires adding fragment support to components with tabs/sections. Each tab needs a URL anchor that activates it on load.

---

### Edge Cases

- What happens when no results match the query?
  - Show "No results found" message with suggestion to refine search
- How does the palette behave on mobile (<768px)?
  - Full-screen overlay with larger touch targets, close button in header
- What happens if user navigates while palette is open?
  - Palette closes automatically on route change
- How are localized menu names handled?
  - Search index uses translated labels; search works in user's current language

## Requirements *(mandatory)*

### Functional Requirements

**Keyboard & Activation:**
- **FR-001**: Palette MUST open on Cmd+K (Mac) or Ctrl+K (Windows/Linux) from any page
- **FR-002**: Palette MUST open when clicking header search input
- **FR-003**: Palette MUST close on Escape key press
- **FR-004**: Palette MUST close when clicking outside
- **FR-005**: Palette MUST close after successful navigation

**Search:**
- **FR-006**: Search MUST use @tanstack/match-sorter-utils for fuzzy matching
- **FR-007**: Search MUST index all items from _nav.ts (flattened)
- **FR-008**: Search MUST respect searchMeta.keywords for additional match terms
- **FR-009**: Search MUST filter results by user permissions
- **FR-010**: Search MUST return results sorted by relevance score
- **FR-011**: Search MUST debounce input by 150ms

**Results Display:**
- **FR-012**: Results MUST be grouped by type (Navigation, Actions)
- **FR-013**: Each result MUST show icon (if available), label, and URL path
- **FR-014**: Results MUST highlight matched text portions using bold (`<strong>`) styling
- **FR-014a**: If match occurred via keyword (not label), MUST show "matched: {keyword}" indicator
- **FR-015**: Maximum 10 results per category MUST be shown
- **FR-016**: "No results" message MUST appear for empty results
- **FR-016a**: For items with fragments, MUST display hierarchical label (e.g., "Dashboard > Finance")

**Navigation:**
- **FR-017**: ArrowDown/ArrowUp MUST move selection through results
- **FR-018**: Enter MUST navigate to selected result
- **FR-019**: Click on result MUST navigate to that URL
- **FR-020**: Navigation MUST use Angular Router

**Mobile:**
- **FR-021**: On mobile (<768px), palette MUST display as full-screen overlay
- **FR-022**: Mobile overlay MUST have a close button
- **FR-023**: Mobile palette MUST have larger touch targets for results

**Deep Link / Fragment Navigation:**
- **FR-024**: Search items MAY include URL fragment for in-page navigation (e.g., `/dashboard#finance`)
- **FR-025**: Router navigation MUST preserve and apply URL fragments
- **FR-026**: Target components (Dashboard, etc.) MUST read fragment on init and activate corresponding tab/section
- **FR-027**: Fragment-based items MUST be searchable as separate entries in index

**SCSS & Styling Standards:**
- **FR-028**: CommandPaletteComponent SCSS MUST follow project mixin architecture (Level 1-3 mixins from `_mixins.scss`)
- **FR-029**: Component MUST use CSS variables from `_variables.scss` (e.g., `--layout-*`, `--os-color-*`)
- **FR-030**: Component MUST use `@use` syntax for SCSS imports (no `@import`)
- **FR-031**: Component MUST support dark theme via existing CSS variable system
- **FR-032**: Component MUST use `$os-spacing`, `$os-border-radius`, `$os-shadows` maps for consistent spacing

**Angular & TypeScript Standards:**
- **FR-039**: Component MUST use Angular Signals for reactive state (not BehaviorSubject/Observable for local state)
- **FR-040**: Use `signal()`, `computed()`, `effect()` for state management
- **FR-041**: Use `const` type definitions instead of inline union types (e.g., `SEARCH_ITEM_TYPES` instead of `'customer' | 'order'`)
- **FR-042**: SearchIndexService MUST expose results as `Signal<SearchResult[]>`

**Backend API Integration (Future-Ready):**
- **FR-033**: SearchIndexService MUST support pluggable search providers (client-side + backend API)
- **FR-034**: When backend API is available, search MUST query both client index AND backend API in parallel
- **FR-035**: Results from client and backend MUST be merged and deduplicated by `id`
- **FR-036**: Backend results MUST be clearly distinguishable in UI (e.g., different category or icon badge)
- **FR-037**: Backend API timeout MUST be configurable (default: 2000ms); client results shown immediately
- **FR-038**: If backend fails/times out, client results MUST still be displayed (graceful degradation)

### Data Model

**Const Type Definitions:**
```typescript
// Search item types (client-side navigation)
export const SEARCH_ITEM_TYPES = {
  NAVIGATION: 'navigation',
  ACTION: 'action',
} as const;
export type SearchItemType = typeof SEARCH_ITEM_TYPES[keyof typeof SEARCH_ITEM_TYPES];

// Match source types
export const MATCH_SOURCES = {
  LABEL: 'label',
  KEYWORD: 'keyword',
  URL: 'url',
} as const;
export type MatchSource = typeof MATCH_SOURCES[keyof typeof MATCH_SOURCES];

// Result source (for merged results)
export const RESULT_SOURCES = {
  CLIENT: 'client',
  BACKEND: 'backend',
} as const;
export type ResultSource = typeof RESULT_SOURCES[keyof typeof RESULT_SOURCES];
```

**SearchableItem** (base interface):
```typescript
interface SearchableItem {
  id: string;
  label: string;                    // Translated display name
  url: string;
  fragment?: string;                // URL fragment for deep linking (e.g., 'finance')
  parentLabel?: string;             // Parent page label for hierarchical display
  icon?: string;                    // CoreUI icon name
  type: SearchItemType;             // Uses const type
  permissions?: string[];
  searchMeta?: SearchMetadata;
}

interface SearchMetadata {
  keywords?: string[];              // Additional search terms
  category?: string;                // Group header in results
  priority?: number;                // Higher = shown first in ties
}

interface SearchResult extends SearchableItem {
  score: number;                    // Relevance score from match-sorter
  matchedOn: MatchSource;           // Uses const type
  matchedKeyword?: string;          // If matched by keyword, which one
  highlightRanges?: Array<[number, number]>;  // Character ranges to highlight
}
```

**NavItem extension** (in _nav.ts):
```typescript
interface NavItemExtended extends NavItem {
  searchMeta?: SearchMetadata;      // Optional search configuration
}
```

**Deep Link Registry** (static, for tabs/sections):
```typescript
// Example: items with fragments for dashboard tabs
const deepLinkItems: SearchableItem[] = [
  {
    id: 'dashboard-finance',
    label: 'Finance',
    parentLabel: 'Dashboard',
    url: '/home/analytics/dashboard',
    fragment: 'finance',
    icon: 'cilDollar',
    type: 'navigation',
    searchMeta: { keywords: ['money', 'revenue', 'financial'] }
  },
  // ... more tab entries
];
```

**Backend API Response Structure** (expected format):
```typescript
// Backend entity types
export const BACKEND_ENTITY_TYPES = {
  CUSTOMER: 'customer',
  ORDER: 'order',
  PRODUCT: 'product',
  TICKET: 'ticket',
  PROVIDER: 'provider',
} as const;
export type BackendEntityType = typeof BACKEND_ENTITY_TYPES[keyof typeof BACKEND_ENTITY_TYPES];

// GET /api/search?q={query}&limit={limit}
interface BackendSearchResponse {
  results: BackendSearchItem[];
  totalCount: number;
  hasMore: boolean;
}

interface BackendSearchItem {
  id: string;                       // Unique ID (e.g., 'customer-123', 'order-456')
  type: BackendEntityType;          // Uses const type
  label: string;                    // Display name (e.g., "John Doe", "Order #12345")
  description?: string;             // Secondary text (e.g., "john@example.com")
  url: string;                      // Navigation URL (e.g., "/customers/123")
  icon?: string;                    // Optional icon override
  metadata?: Record<string, any>;   // Additional context (e.g., { status: 'active' })
}

// Merged result in UI
interface MergedSearchResult extends SearchResult {
  source: ResultSource;             // Uses const type
}
```

**Search Provider Interface** (for pluggable architecture):
```typescript
interface SearchProvider {
  readonly name: string;
  readonly priority: number;        // Lower = shown first in merged results
  search(query: string): Observable<SearchResult[]>;
  isAvailable(): boolean;           // Check if provider is ready (e.g., API configured)
}

// Implementations:
// - ClientSearchProvider: Uses @tanstack/match-sorter-utils on local index
// - BackendSearchProvider: Calls /api/search endpoint (disabled until API ready)
```

### Key Components

- **CommandPaletteComponent**: Main overlay/dropdown component
- **SearchIndexService**: Orchestrates search across all providers, merges results
- **GlobalSearchDirective**: Handles Cmd+K keyboard shortcut globally
- **ClientSearchProvider**: Local fuzzy search using @tanstack/match-sorter-utils
- **BackendSearchProvider**: HTTP client for /api/search (disabled by default, for future use)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Palette opens within 100ms of Cmd+K press
- **SC-002**: Search results appear within 50ms of typing (after debounce)
- **SC-003**: All _nav.ts items are searchable (100% coverage)
- **SC-004**: Permission filtering blocks 100% of unauthorized items
- **SC-005**: Keyboard navigation (arrows + enter) works without mouse
- **SC-006**: Mobile overlay is fully usable on 320px width screens
- **SC-007**: Search index rebuilds on language change
- **SC-008**: Matched text portions are visually highlighted in 100% of results
- **SC-009**: Deep link fragments activate correct tab/section in target components
- **SC-010**: SCSS passes project linting rules (no `@import`, uses CSS variables)

## Clarifications

### Session 2025-01-04

- Q: Should we reuse app-searchable-select? → A: No, it's designed for forms. Create dedicated CommandPaletteComponent.
- Q: Which fuzzy search library? → A: @tanstack/match-sorter-utils (lighter than fuse.js, TanStack ecosystem)
- Q: How to store search config in NavItem? → A: Add optional `searchMeta` field with self-describing name
- Q: How to show WHY a result matched? → A: Bold (`<strong>`) the matched portion of text; if matched by keyword, show "matched: {keyword}" below
- Q: How to navigate to specific tabs (e.g., Dashboard Finance)? → A: Use URL fragments (`/dashboard#finance`); target components must read fragment and activate tab
- Q: What SCSS standards to follow? → A: Use project mixin architecture (Level 1-3), CSS variables, `@use` syntax, dark theme support
- Q: How to prepare for backend API? → A: Use pluggable SearchProvider interface; BackendSearchProvider disabled by default, can be enabled for testing with mock data
- Q: Which state management approach? → A: Angular Signals (`signal()`, `computed()`, `effect()`) for all reactive state
- Q: How to define types for type fields? → A: Use `as const` objects with derived types (e.g., `SEARCH_ITEM_TYPES` → `SearchItemType`)

### Components Requiring Deep Link Support

The following components need fragment-based navigation to enable granular search:

| Component | Fragments Needed | Example URL |
|-----------|------------------|-------------|
| Dashboard | finance, traffic, overview | `/dashboard#finance` |
| Reports | (depends on tabs) | `/reports#monthly` |
| Settings | (if has tabs) | `/settings#general` |

**Implementation Pattern:**
```typescript
// In component with tabs
private route = inject(ActivatedRoute);

ngOnInit() {
  this.route.fragment.subscribe(fragment => {
    if (fragment) {
      this.activateTab(fragment);
    }
  });
}
```

## Assumptions

1. @tanstack/match-sorter-utils provides sufficient fuzzy matching capability
2. Search index is small enough to keep in memory (< 200 items typical)
3. Translations are available for all nav items via ngx-translate
4. User permissions are available via existing AuthService/PermissionService
5. Keyboard shortcuts don't conflict with browser defaults on any platform
6. Components with tabs can be refactored to support URL fragment navigation
7. @tanstack/match-sorter-utils provides match position info for highlighting (or we implement custom highlighting)
8. Backend API will follow the proposed response structure when implemented
9. Backend search will be opt-in (disabled by default) until API is production-ready

## Out of Scope

- Backend API implementation (frontend ready for integration, but API development is separate)
- Backend search enabled by default (opt-in only for testing)
- Search history persistence across sessions (localStorage can be added later)
- Voice search or other input methods
- Search analytics/telemetry
- Real-time entity indexing (backend will handle entity search when ready)
