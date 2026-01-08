# Feature Specification: Gmail-Style Layout Redesign

**Feature Branch**: `017-gmail-layout`
**Created**: 2025-12-28
**Status**: Draft
**Input**: Gmail-style layout redesign with full-width header, content border radius, sidebar under header, and improved mobile experience

## Overview

Redesign the application layout architecture to follow a Gmail-inspired pattern where the header spans the full width of the viewport, and both sidebar and content area are positioned below the header. This creates a more modern, clean visual hierarchy with improved content focus through rounded corners.

### Current vs Target Architecture

**Current Layout:**
```
┌──────────┬────────────────────────────────┐
│  Logo    │         Header                 │
│          ├────────────────────────────────┤
│  Menu    │         Content                │
│          │                                │
└──────────┴────────────────────────────────┘
  Sidebar (100vh)
```

**Target Layout (Gmail-style):**
```
┌──────────────────────────────────────────────┐
│  [Menu]        [Search...]           [User]  │  Header (full width)
├──────────┬───────────────────────────────────┤
│  Logo    │ ╭───────────────────────────────╮ │
│          │ │  Breadcrumbs                  │ │
│  Menu    │ │  Content with rounded corners │ │
│          │ │                               │ │
│  [Toggle]│ ╰───────────────────────────────╯ │
└──────────┴───────────────────────────────────┘
  Sidebar        Content area
  (under header)
```

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Navigation Experience (Priority: P1)

As a desktop user, I want a cleaner visual hierarchy where the header provides global actions (search, user menu) while the sidebar handles navigation, so that I can efficiently navigate the application with clear separation of concerns.

**Why this priority**: This is the core layout change that affects all users on desktop. Without this, no other features make sense.

**Independent Test**: Can be fully tested by loading any page and verifying header spans full width, sidebar starts below header, and content has rounded corners.

**Acceptance Scenarios**:

1. **Given** user opens the application on desktop (>768px), **When** the page loads, **Then** the header spans the full viewport width from left edge to right edge
2. **Given** user is on any page, **When** viewing the layout, **Then** the sidebar starts directly below the header (not from top of viewport)
3. **Given** user is on any page, **When** viewing the content area, **Then** the content has rounded corners on top-left and top-right
4. **Given** user interacts with sidebar, **When** they click the toggle button at the bottom, **Then** the sidebar collapses/expands as currently implemented (256px to 56px)

---

### User Story 2 - Header Functionality (Priority: P1)

As a user, I want the header to provide quick access to search, sections menu, and my account, so that I can efficiently perform common actions from any page.

**Why this priority**: Header is a key component of the new layout that provides global functionality.

**Independent Test**: Can be tested by interacting with each header element: dropdown menu, search bar, user menu.

**Acceptance Scenarios**:

1. **Given** user is on any page, **When** viewing the header, **Then** they see (left to right): dropdown menu button (disabled), search bar, user menu (no logo in header)
2. **Given** user sees the dropdown menu button, **When** viewing its state, **Then** it appears visually disabled (grayed out or reduced opacity)
3. **Given** user focuses on the search bar, **When** they type, **Then** the search field accepts input (full search logic to be implemented later)
4. **Given** user clicks on user avatar, **When** the menu opens, **Then** they see the existing user menu options (profile, language, logout)

---

### User Story 3 - Sidebar Logo Behavior (Priority: P2)

As a user, I want the logo in the sidebar to change between full and narrow versions based on sidebar state, so that branding remains visible regardless of sidebar width.

**Why this priority**: Maintains brand consistency from current implementation while adapting to new layout.

**Independent Test**: Can be tested by toggling sidebar state and observing logo changes.

**Acceptance Scenarios**:

1. **Given** sidebar is expanded (256px), **When** viewing the sidebar header, **Then** the full logo is displayed
2. **Given** sidebar is collapsed (56px), **When** viewing the sidebar header, **Then** the narrow (icon) logo is displayed
3. **Given** user hovers over collapsed sidebar (desktop), **When** sidebar expands on hover, **Then** the full logo appears during hover state

---

### User Story 4 - Breadcrumbs in Content Area (Priority: P2)

As a user, I want breadcrumbs displayed at the top of the content area (not in header), so that I can always see my current location within the application hierarchy.

**Why this priority**: Improves navigation context without cluttering the header.

**Independent Test**: Can be tested by navigating to nested pages and verifying breadcrumb placement.

**Acceptance Scenarios**:

1. **Given** user is on any page, **When** viewing the content area, **Then** breadcrumbs appear at the top of content area (inside rounded container)
2. **Given** user is on a nested page (e.g., Analytics > Dashboard), **When** viewing breadcrumbs, **Then** the full navigation path is displayed
3. **Given** user is on a top-level page, **When** viewing breadcrumbs, **Then** only the current page name is shown

---

### User Story 5 - Mobile Navigation Experience (Priority: P2)

As a mobile user, I want to easily toggle the sidebar navigation using a prominent button, so that I can access all menu items without sacrificing screen space.

**Why this priority**: Mobile experience is critical for users on smaller devices.

**Independent Test**: Can be tested on mobile viewport by toggling sidebar and navigating.

**Acceptance Scenarios**:

1. **Given** user is on mobile device (<768px), **When** the page loads, **Then** the sidebar is hidden (collapsed off-screen)
2. **Given** sidebar is hidden on mobile, **When** user taps the toggle button, **Then** the sidebar slides in from the left
3. **Given** sidebar is open on mobile, **When** user taps the toggle button or overlay, **Then** the sidebar slides out
4. **Given** sidebar is open on mobile, **When** user selects a menu item, **Then** the sidebar closes and navigation occurs
5. **Given** user is on mobile, **When** viewing the toggle button, **Then** it is positioned at the bottom of sidebar area (same location as desktop) but visually enlarged and more prominent

---

### User Story 6 - Collapsed Sidebar Interaction (Priority: P3)

As a desktop user with collapsed sidebar, I want to quickly access navigation without permanently expanding the sidebar, so that I maximize content area while maintaining accessibility.

**Why this priority**: Enhances power user experience with efficient navigation.

**Independent Test**: Can be tested by collapsing sidebar and hovering/interacting with it.

**Acceptance Scenarios**:

1. **Given** sidebar is collapsed on desktop, **When** user hovers over the sidebar, **Then** it temporarily expands showing full menu items
2. **Given** sidebar is temporarily expanded on hover, **When** user moves mouse away, **Then** sidebar collapses back to icon-only state
3. **Given** sidebar collapsed state, **When** user clicks toggle button at bottom, **Then** sidebar permanently expands/collapses

---

### Edge Cases

- What happens when browser window is resized from desktop to mobile width?
  - Sidebar should automatically collapse and adapt to mobile behavior
- How does the layout handle RTL (right-to-left) languages?
  - All positioning should mirror (sidebar on right, content on left)
- What happens when content is taller than viewport?
  - Content area scrolls independently, header remains fixed
- How does the layout behave when sidebar hover-expand overlaps with content?
  - Sidebar expands over content (overlay), not pushing content

## Requirements *(mandatory)*

### Functional Requirements

**Header:**
- **FR-001**: Header MUST span full viewport width (left: 0, right: 0)
- **FR-002**: Header MUST be fixed at top of viewport (position: fixed, top: 0)
- **FR-003**: Header MUST contain a dropdown menu button on the left side
- **FR-004**: Header MUST contain a search input field in the center area
- **FR-005**: Header MUST contain user menu (avatar, notifications) on the right side
- **FR-006**: Header height MUST be 64px
- **FR-007**: Header MUST NOT contain application logo (logo is only in sidebar)

**Sidebar:**
- **FR-008**: Sidebar MUST start below the header (top: 64px)
- **FR-009**: Sidebar height MUST be calculated as viewport height minus header (calc(100vh - 64px))
- **FR-010**: Sidebar MUST contain the brand logo that switches between full and narrow variants
- **FR-011**: Sidebar MUST have a toggle button at the bottom (arrow icon)
- **FR-012**: Sidebar MUST support collapsed (56px) and expanded (256px) states
- **FR-013**: Sidebar MUST expand on hover when in collapsed state (desktop only)
- **FR-014**: Sidebar MUST maintain current navigation menu structure and behavior

**Content Area:**
- **FR-015**: Content area MUST have border-radius on top-left corner
- **FR-016**: Content area MUST have border-radius on top-right corner
- **FR-016a**: Layout background MUST use sidebar background color extending behind content area to create visual frame effect (rounded corners become visible against this background)
- **FR-017**: Content area MUST contain breadcrumbs at the top (inside the container)
- **FR-018**: Content area MUST adjust width based on sidebar state
- **FR-019**: Content area MUST start below header (padding-top or margin-top: 64px)

**Mobile:**
- **FR-020**: On mobile (<768px), sidebar MUST be hidden by default (off-screen)
- **FR-021**: On mobile, toggle button MUST be positioned at the bottom of sidebar area (same as desktop) but visually enlarged and more prominent
- **FR-022**: On mobile, sidebar MUST slide in/out when toggle is activated
- **FR-023**: On mobile, an overlay MUST appear behind open sidebar
- **FR-024**: On mobile, tapping overlay or menu item MUST close sidebar

**RTL Support:**
- **FR-025**: Layout MUST mirror correctly for RTL languages (sidebar on right, content on left)
- **FR-026**: All animations and transitions MUST work correctly in RTL mode

**Dropdown Menu (Header):**
- **FR-027**: Dropdown menu button MUST be visible in header but disabled (non-functional) in initial implementation
- **FR-028**: Dropdown menu button MUST be styled to indicate disabled state (reduced opacity or grayed out)

**Search Bar:**
- **FR-029**: Search bar MUST be visible in header center area
- **FR-030**: Search bar MUST accept user input (functional search logic is out of scope)

### Key Entities

- **LayoutConfig**: Stores sidebar state (collapsed/expanded), theme, RTL direction
- **HeaderConfig**: Configuration for header elements (dropdown items, search visibility)
- **BrandConfig**: Logo URLs for full and narrow variants

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Layout renders correctly on all viewport sizes from 320px to 2560px width
- **SC-002**: Sidebar toggle animation completes within 300ms
- **SC-003**: Header remains fixed and visible during page scroll
- **SC-004**: All existing navigation functionality remains intact after redesign
- **SC-005**: RTL layout mirrors correctly without visual glitches
- **SC-006**: Mobile sidebar open/close gesture feels responsive (under 300ms transition)
- **SC-007**: Content border-radius is visible and consistent across all pages
- **SC-008**: Breadcrumbs display correctly for all navigation depths (1-4 levels)
- **SC-009**: Search input is focusable and accepts text input
- **SC-010**: Dropdown menu button is visible and styled as disabled

## Clarifications

### Session 2025-12-28

- Q: Where should the mobile toggle button be positioned? → A: Same position as desktop (bottom of sidebar area) but visually enlarged and more prominent
- Q: What background should be visible behind content area for rounded corners contrast? → A: Sidebar background color extends behind content area (creates frame effect like Bob)
- Q: What items should the dropdown menu contain initially? → A: Button disabled for now, functionality to be implemented later
- Q: Should the logo appear in both header AND sidebar, or only in sidebar? → A: Logo ONLY in sidebar (header contains: dropdown button, search, user menu)

## Assumptions

1. Header height of 64px is acceptable (matching current implementation)
2. Sidebar widths (56px collapsed, 256px expanded) remain unchanged
3. Border radius value will match the design system (approximately 16px)
4. Search functionality implementation is deferred to a future feature
5. Dropdown menu content will initially contain navigation sections, with settings added later
6. Current theme switching (dark/light) behavior remains unchanged
7. Current user menu functionality (profile, language, logout) remains unchanged

## Out of Scope

- Search functionality implementation (only UI shell)
- Settings integration in dropdown menu (placeholder for future)
- New navigation items or menu restructuring
- Changes to individual page content or components
- Performance optimizations beyond layout changes
