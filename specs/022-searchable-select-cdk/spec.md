# Feature Specification: Searchable Select CDK + Signals Refactor

**Feature Branch**: `022-searchable-select-cdk`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "Refactor searchable-select component to use Angular CDK Overlay and Signals"

## Overview

Modernize the existing `app-searchable-select` component by replacing custom dropdown positioning with Angular CDK Overlay and migrating from traditional class properties to Angular Signals. This refactoring improves code maintainability, accessibility, and aligns with Angular's modern reactive patterns.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Selection Dropdown (Priority: P1)

User opens a searchable dropdown, types to filter options, and selects a single value. The dropdown positions correctly relative to the trigger and handles viewport boundaries.

**Why this priority**: Core functionality that all users interact with. Single selection is the most common use case.

**Independent Test**: Can be fully tested by opening dropdown, typing search term, and selecting an option. Delivers complete single-select functionality.

**Acceptance Scenarios**:

1. **Given** a searchable-select with options, **When** user clicks the trigger, **Then** dropdown opens positioned below the trigger (or above if insufficient space below)
2. **Given** an open dropdown, **When** user types in search field, **Then** options are filtered in real-time
3. **Given** filtered options displayed, **When** user clicks an option, **Then** option is selected, dropdown closes, and value is emitted
4. **Given** an open dropdown, **When** user clicks outside the dropdown, **Then** dropdown closes

---

### User Story 2 - Keyboard Navigation (Priority: P1)

User navigates and selects options using only keyboard. Focus management and active descendant tracking work correctly for screen readers.

**Why this priority**: Essential for accessibility compliance. Keyboard navigation is required for users who cannot use a mouse.

**Independent Test**: Can be tested by focusing the trigger, opening with Enter/Space, navigating with Arrow keys, and selecting with Enter.

**Acceptance Scenarios**:

1. **Given** focus on select trigger, **When** user presses Enter/Space/ArrowDown, **Then** dropdown opens
2. **Given** an open dropdown, **When** user presses ArrowDown/ArrowUp, **Then** highlighted option moves accordingly with visual indicator
3. **Given** a highlighted option, **When** user presses Enter, **Then** option is selected and dropdown closes
4. **Given** an open dropdown, **When** user presses Escape, **Then** dropdown closes without changing selection
5. **Given** an open dropdown with searchable enabled, **When** user starts typing, **Then** search field receives input and filters options

---

### User Story 3 - Multiple Selection (Priority: P2)

User selects multiple options from the dropdown. Selected items appear as chips that can be individually removed.

**Why this priority**: Important for multi-select use cases but less common than single selection.

**Independent Test**: Can be tested by enabling multiple mode, selecting several options, verifying chips appear, and removing individual chips.

**Acceptance Scenarios**:

1. **Given** a multi-select dropdown, **When** user selects an option, **Then** option is added to selection and dropdown remains open
2. **Given** selected options as chips, **When** user clicks remove icon on a chip, **Then** that option is deselected
3. **Given** multiple selected options, **When** user opens dropdown, **Then** previously selected options show checkmarks

---

### User Story 4 - Form Integration (Priority: P2)

Component integrates seamlessly with Angular reactive forms through ControlValueAccessor, supporting validation states and disabled state.

**Why this priority**: Required for form-based workflows which are common in the application.

**Independent Test**: Can be tested by binding to formControlName, setting/getting values programmatically, and toggling disabled state.

**Acceptance Scenarios**:

1. **Given** component bound to a FormControl, **When** FormControl value changes programmatically, **Then** component displays the new value
2. **Given** component with selection, **When** user selects different option, **Then** FormControl value updates
3. **Given** FormControl is disabled, **When** rendered, **Then** component appears disabled and cannot be interacted with
4. **Given** FormControl has validation error, **When** error input is provided, **Then** error state is displayed

---

### User Story 5 - Dropdown Positioning & Scroll Behavior (Priority: P3)

Dropdown automatically repositions when near viewport edges and handles page scroll appropriately.

**Why this priority**: Important for UX but CDK Overlay handles most of this automatically.

**Independent Test**: Can be tested by placing component near bottom of viewport and verifying dropdown opens above.

**Acceptance Scenarios**:

1. **Given** component near bottom of viewport, **When** dropdown opens, **Then** dropdown positions above trigger
2. **Given** an open dropdown, **When** user scrolls the page, **Then** dropdown repositions to stay attached to trigger
3. **Given** component in a scrollable container, **When** container scrolls, **Then** dropdown follows trigger position

---

### Edge Cases

- What happens when options array is empty? Display "no results" message
- What happens when options change while dropdown is open? Filtered list updates, selection preserved if still valid
- What happens when selected value no longer exists in options? Clear selection or show orphaned value indicator
- How does component handle very long option labels? Text truncation with tooltip on hover
- What happens when dropdown would overflow both above and below? Constrain height and enable internal scrolling

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Component MUST use CDK Overlay for dropdown positioning instead of CSS absolute positioning
- **FR-002**: Component MUST use CDK ConnectedOverlay directive with configurable position strategy
- **FR-003**: Component MUST support fallback positions (below-first, above-fallback) for viewport edge cases
- **FR-004**: Component MUST use CDK scroll strategy to handle page/container scrolling
- **FR-005**: Component MUST use ActiveDescendantKeyManager from CDK A11y for keyboard navigation
- **FR-006**: Component MUST implement proper ARIA attributes for accessibility (aria-expanded, aria-activedescendant, role="listbox")
- **FR-007**: Component MUST use Angular Signals for all internal state management
- **FR-008**: Component MUST use signal-based inputs (`input()`) for all @Input properties
- **FR-009**: Component MUST use signal-based outputs (`output()`) for all @Output events
- **FR-010**: Component MUST use `computed()` for all derived state (filtered options, display text, etc.)
- **FR-011**: Component MUST maintain backward-compatible API (same inputs/outputs, same behavior)
- **FR-012**: Component MUST implement ControlValueAccessor for reactive form integration
- **FR-013**: Component MUST support single and multiple selection modes
- **FR-014**: Component MUST support searchable/non-searchable configurations
- **FR-015**: Component MUST support clearable option with "None" entry for single select
- **FR-016**: Component MUST support loading state with visual indicator
- **FR-017**: Component MUST support disabled state at component and option level
- **FR-018**: Component MUST support internationalization through existing translation system

### Key Entities

- **SearchableSelectOption**: Represents a selectable item with value, label, optional disabled flag, and optional additional data
- **SearchableSelectConfig**: Configuration object controlling component behavior (multiple, searchable, clearable, placeholder texts, etc.)
- **SearchableSelectChangeEvent**: Event payload emitted on selection change containing value and full option object(s)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing functionality preserved - no regression in features or behavior
- **SC-002**: Component renders and responds to interactions without manual change detection calls
- **SC-003**: Dropdown positions correctly in 100% of viewport edge cases (no overflow outside visible area)
- **SC-004**: Keyboard navigation works identically to before with proper focus management
- **SC-005**: Screen readers can navigate options using arrow keys with proper announcements
- **SC-006**: Component code reduced by removing manual ChangeDetectorRef calls, destroy$ subjects, and optionStates cache
- **SC-007**: All existing usages of the component continue to work without modification

## Assumptions

- Angular CDK is already installed in the project (part of Angular Material dependency)
- The existing component API (inputs, outputs, types) should remain backward compatible
- Performance improvements from signals are expected but not a primary goal
- Existing SCSS styles will be adapted but visual appearance should remain consistent
- The component will continue to use OnPush change detection strategy
