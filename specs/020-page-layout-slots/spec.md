# Page Layout Slots

> **Feature ID:** 020-page-layout-slots
> **Created:** 2026-01-06
> **Status:** Draft

## Problem Statement

Currently, when users scroll pages with tables (Customers, Orders, etc.), the entire content including title and filters scrolls away. This causes:
- Loss of context (user doesn't know which page they're on)
- Filters become inaccessible without scrolling back up
- Poor UX compared to modern admin panels (Gmail, Linear, Notion)

## Solution

Implement a **Dynamic Page Layout Slots** system that allows pages to inject components into fixed header areas while only the main content scrolls.

---

## User Stories

### US-001: Fixed Page Header (P1)
**As a** user navigating table pages
**I want** the page title and actions to remain visible while scrolling
**So that** I always know where I am and can access primary actions

**Acceptance Criteria:**
- Page title stays fixed at top of content area
- Action buttons (Add, Refresh) stay fixed
- Only table/content area scrolls

### US-002: Fixed Subheader with Filters (P1)
**As a** user filtering table data
**I want** filters to remain visible while scrolling through results
**So that** I can modify filters without scrolling back up

**Acceptance Criteria:**
- Filter controls stay fixed below page header
- Column controls and export buttons stay fixed
- Table rows scroll independently

### US-003: Dynamic Slot Content (P2)
**As a** developer
**I want** to dynamically change slot content based on user actions
**So that** I can show contextual actions (e.g., bulk actions when rows selected)

**Acceptance Criteria:**
- Slot content can be changed at runtime
- Changes are reactive (immediate UI update)
- Smooth transitions between content changes

### US-004: Default Page Title (P2)
**As a** developer
**I want** automatic page title from route data
**So that** simple pages work without explicit configuration

**Acceptance Criteria:**
- If no header set, display title from `route.data.title`
- Falls back to empty state gracefully

### US-005: Auto-cleanup on Navigation (P1)
**As a** developer
**I want** slot content to auto-clear when navigating away
**So that** I don't need to manually clean up in ngOnDestroy

**Acceptance Criteria:**
- Slots clear automatically on NavigationStart
- No memory leaks from orphaned components
- Predictable behavior across all pages

### US-006: Mobile-Responsive Header (P1)
**As a** mobile user
**I want** the page header to adapt to small screens
**So that** I can still see the page title and access actions

**Acceptance Criteria:**
- Page title visible (simplified breadcrumb - current page only)
- Actions collapse to icon-only buttons
- Touch-friendly tap targets (min 44px)

### US-007: Mobile-Responsive Subheader (P1)
**As a** mobile user
**I want** filters to be accessible without taking too much screen space
**So that** I can filter data while seeing the results

**Acceptance Criteria:**
- Filters collapse into a single "Filters" button
- Button shows count of active filters (e.g., "Filters (2)")
- Tapping button opens filter drawer/panel
- Filter drawer allows applying/clearing filters

---

## Functional Requirements

### FR-001: PageLayoutService
- Service with signals for managing slots
- `header` signal with zones: `start`, `center?`, `end`
- `subheader` signal with zones: `start`, `end`
- Auto-cleanup on router NavigationStart event

### FR-002: Slot Zones Structure
```
pageHeader:
┌─────────────┬─────────────────────┬─────────────────┐
│ start       │ center (optional)   │ end             │
└─────────────┴─────────────────────┴─────────────────┘

pageSubheader:
┌─────────────┬─────────────────────┬─────────────────┐
│ start       │                     │ end             │
└─────────────┴─────────────────────┴─────────────────┘
```

### FR-003: Component Definition
```typescript
interface SlotComponent<T = unknown> {
  component: Type<T>;
  inputs?: Record<string, unknown>;
}

interface SlotZones {
  start?: SlotComponent[];
  center?: SlotComponent[];
  end?: SlotComponent[];
}
```

### FR-004: Dynamic Component Rendering
- Use `ngComponentOutlet` with inputs binding
- Support for any standalone component
- Preserve component order within zones

### FR-005: Layout Structure
- pageHeader and pageSubheader are INSIDE content area (not global header)
- Both are position: fixed relative to content area
- pageContent scrolls independently
- Respects sidebar width

### FR-006: Animations
- Smooth fade transitions when slot content changes
- No jarring layout shifts

### FR-007: Default Behavior
- If page doesn't set header, show PageTitleComponent with route.data.title
- If route.data.title is undefined, show nothing

### FR-008: Mobile Responsive - Header
- Breakpoint: 768px
- Below breakpoint:
  - Breadcrumb simplifies to current page title only
  - Action buttons show icons only (no labels)
  - Minimum touch target: 44x44px
  - Reduced padding for space efficiency

### FR-009: Mobile Responsive - Subheader
- Breakpoint: 768px
- Below breakpoint:
  - All filter controls collapse into single "Filters" button
  - Button displays active filter count badge
  - Tapping opens filter drawer (reuse existing flyout system)
  - Drawer contains full filter form
  - "Apply" and "Clear" actions in drawer

### FR-010: Filter Drawer
- Slides in from right (consistent with existing flyout)
- Contains filter components passed via subheader
- Header with title "Filters" and close button
- Footer with "Clear All" and "Apply" buttons
- Backdrop closes drawer

---

## Non-Functional Requirements

### NFR-001: Performance
- No unnecessary re-renders when slots don't change
- Efficient component creation/destruction

### NFR-002: Type Safety
- Full TypeScript support for component inputs
- IDE autocomplete for slot configuration

### NFR-003: Developer Experience
- Simple API for common cases
- Flexible API for advanced cases
- Clear documentation with examples

---

## API Design

### Basic Usage
```typescript
@Component({...})
export class CustomersComponent {
  private layout = inject(PageLayoutService);

  constructor() {
    this.layout.header.set({
      start: [
        { component: PageTitleComponent, inputs: { title: 'Customers' } }
      ],
      end: [
        { component: AddButtonComponent, inputs: { label: 'Add Customer' } }
      ],
    });

    this.layout.subheader.set({
      start: [{ component: SmartFilterComponent }],
      end: [{ component: ColumnControlComponent }],
    });
  }
}
```

### Dynamic Updates
```typescript
onSelectionChange(selected: Customer[]) {
  if (selected.length > 0) {
    this.layout.subheader.set({
      start: [{ component: BulkActionsComponent, inputs: { count: selected.length } }],
      end: [{ component: DeleteSelectedComponent }],
    });
  } else {
    this.layout.subheader.set({
      start: [{ component: SmartFilterComponent }],
      end: [{ component: ColumnControlComponent }],
    });
  }
}
```

---

## Out of Scope

- Global header modifications (logo, search, user menu)
- Footer slots
- Nested layout slots
- Server-side rendering considerations

---

## Success Criteria

- SC-001: Page title visible at all scroll positions on table pages
- SC-002: Filters accessible without scrolling on table pages
- SC-003: Smooth animations when slot content changes
- SC-004: Zero manual cleanup code needed in page components
- SC-005: Existing pages continue to work (backwards compatible)
- SC-006: Mobile: header readable and actions accessible on 375px screen
- SC-007: Mobile: filters accessible via drawer on 375px screen

---

## Open Questions

1. ~~Cleanup approach~~ → **Resolved: Auto-cleanup on NavigationStart**
2. ~~Default behavior~~ → **Resolved: PageTitle from route.data.title**
3. ~~Zone structure~~ → **Resolved: start/center/end for header, start/end for subheader**
