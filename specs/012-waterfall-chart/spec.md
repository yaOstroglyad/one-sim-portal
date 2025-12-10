# Feature Specification: Waterfall Chart Component

**Feature Branch**: `012-waterfall-chart`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "Implement Waterfall Chart component in shared components, fix subscribers tab translation, sort bundle statuses by lifecycle, replace stacked bar with waterfall chart, write documentation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reusable Waterfall Chart Component (Priority: P1)

As a developer, I need a reusable waterfall chart component in the shared components library so that I can visualize cumulative data flows (increases/decreases) across different features of the application.

**Why this priority**: This is the foundation for all other stories - the waterfall chart component must exist before it can be used in the Subscribers tab or anywhere else.

**Independent Test**: Can be fully tested by creating a simple test page with the waterfall chart component and providing sample data. Delivers a reusable visualization component for the entire application.

**Acceptance Scenarios**:

1. **Given** an array of data points with labels and values, **When** the waterfall chart renders, **Then** it displays floating bars where each bar starts where the previous one ended
2. **Given** positive values in the data, **When** the chart renders, **Then** those bars are displayed in green color indicating increases
3. **Given** negative values in the data, **When** the chart renders, **Then** those bars are displayed in red color indicating decreases
4. **Given** a data point marked as "total", **When** the chart renders, **Then** it displays as a blue bar starting from zero showing the cumulative result
5. **Given** the component receives new data, **When** data changes, **Then** the chart updates to reflect the new values

---

### User Story 2 - Bundle Statuses Lifecycle Ordering (Priority: P2)

As an analyst viewing the Subscribers dashboard, I need the bundle statuses chart to display statuses in the correct lifecycle order (PAID → FAILED_ACTIVATE → REFUNDED → ACTIVE → SPENT → EXPIRED) so that I can understand the natural flow of bundle states.

**Why this priority**: This improves the existing chart's usability without requiring the new waterfall component, and clarifies the business logic of bundle lifecycle.

**Independent Test**: Can be tested by viewing the Subscribers tab and verifying that bundle status datasets appear in the correct lifecycle order in both the legend and stacked bars.

**Acceptance Scenarios**:

1. **Given** the bundle statuses chart is rendered, **When** viewing the legend, **Then** statuses appear in order: PAID, FAILED_ACTIVATE, REFUNDED, ACTIVE, SPENT, EXPIRED
2. **Given** a period with multiple status values, **When** the stacked bar renders, **Then** the segments are stacked in lifecycle order from bottom to top

---

### User Story 3 - Subscribers Tab Translation Fix (Priority: P2)

As a user viewing the Subscribers dashboard in any supported language, I need the "Bundle Statuses" chart title to be properly translated so that the interface is consistent in my language.

**Why this priority**: Translation fixes improve user experience for non-English users and require minimal effort.

**Independent Test**: Can be tested by switching the application language and verifying the chart title displays correctly in each supported language.

**Acceptance Scenarios**:

1. **Given** the application is set to English, **When** viewing the Subscribers tab, **Then** the chart title displays "Bundle Statuses"
2. **Given** the application is set to Russian, **When** viewing the Subscribers tab, **Then** the chart title displays "Статусы бандлов"
3. **Given** the application is set to Ukrainian, **When** viewing the Subscribers tab, **Then** the chart title displays "Статуси бандлів"
4. **Given** the application is set to Hebrew, **When** viewing the Subscribers tab, **Then** the chart title displays "סטטוסי חבילות"

---

### User Story 4 - Replace Bundle Statuses with Waterfall Chart (Priority: P3)

As an analyst, I want to see the bundle statuses as a waterfall chart instead of a stacked bar chart so that I can better visualize how bundles flow through their lifecycle stages over time.

**Why this priority**: This enhances the visualization but depends on P1 (waterfall component) being completed first.

**Independent Test**: Can be tested by viewing the Subscribers tab and verifying the bundle statuses section displays a waterfall chart showing the cumulative flow through lifecycle stages.

**Acceptance Scenarios**:

1. **Given** bundle status data is available, **When** viewing the Subscribers tab, **Then** the Bundle Statuses section displays a waterfall chart
2. **Given** the waterfall chart renders, **When** viewing the chart, **Then** it shows cumulative transitions between lifecycle stages
3. **Given** the waterfall chart is displayed, **When** hovering over a bar, **Then** a tooltip shows the value and what it represents

---

### User Story 5 - Waterfall Chart Documentation (Priority: P3)

As a developer, I need documentation for the waterfall chart component so that I can understand how to use it correctly in other parts of the application.

**Why this priority**: Documentation ensures long-term maintainability but can be done after the component is implemented.

**Independent Test**: Can be tested by a new developer reading the documentation and successfully implementing a waterfall chart without additional guidance.

**Acceptance Scenarios**:

1. **Given** the documentation exists, **When** reading it, **Then** it explains all available input properties
2. **Given** the documentation exists, **When** reading it, **Then** it includes usage examples with code snippets
3. **Given** the documentation exists, **When** reading it, **Then** it explains how to customize colors and styling

---

### Edge Cases

- What happens when all values in the waterfall data are zero? Chart displays flat bars at the baseline
- How does the chart handle extremely large values that would make smaller values invisible? Uses standard Chart.js scaling
- What happens when there are no data points provided? Displays empty chart with appropriate message
- How does the chart handle mixed positive and negative values in the same dataset? Correctly renders floating bars going up (positive) or down (negative) from the previous cumulative value

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a standalone Angular component `os-waterfall-chart` in the shared components library
- **FR-002**: The waterfall chart MUST accept an array of data points, each containing a label, value, and optional type (increase/decrease/total)
- **FR-003**: The waterfall chart MUST render bars as "floating bars" where each bar starts at the cumulative sum of previous values
- **FR-004**: The waterfall chart MUST automatically color positive values green, negative values red, and total values blue
- **FR-005**: The waterfall chart MUST support customizable colors through input properties
- **FR-006**: The waterfall chart MUST display tooltips on hover showing the value and label
- **FR-007**: The waterfall chart MUST be responsive and adapt to container size
- **FR-008**: The waterfall chart MUST support both light and dark themes
- **FR-009**: The bundle statuses chart in Subscribers tab MUST order datasets by lifecycle: PAID → FAILED_ACTIVATE → REFUNDED → ACTIVE → SPENT → EXPIRED
- **FR-010**: The bundle statuses chart title MUST be translated in all supported languages (EN, RU, UA, HE)
- **FR-011**: The Subscribers tab MUST use the waterfall chart component to display bundle statuses
- **FR-012**: Documentation MUST be created explaining waterfall chart usage, inputs, and customization options

### Key Entities

- **WaterfallDataPoint**: Represents a single bar in the waterfall chart with label, value, and optional type (increase/decrease/total)
- **WaterfallChartConfig**: Configuration object containing chart options like colors, responsive settings, and tooltip format
- **BundleStatusLifecycle**: Ordered list of bundle status stages: PAID, FAILED_ACTIVATE, REFUNDED, ACTIVE, SPENT, EXPIRED

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can integrate the waterfall chart component into any view with less than 10 lines of template code
- **SC-002**: The waterfall chart correctly renders floating bars with cumulative positioning for 100% of test cases
- **SC-003**: Bundle statuses appear in correct lifecycle order in 100% of Subscribers tab views
- **SC-004**: All chart titles in Subscribers tab display correctly translated text for all 4 supported languages
- **SC-005**: Documentation covers all component inputs and includes at least 2 usage examples
- **SC-006**: Component renders within 500ms for datasets up to 50 data points

## Assumptions

- The existing Chart.js library supports floating bars via the `[start, end]` data format
- The bundle status API returns status names that match the lifecycle enum values
- The shared components follow the existing pattern established by `os-bar-chart` and `os-line-chart`
- Documentation will be placed in the `docs/components/` directory following existing conventions
