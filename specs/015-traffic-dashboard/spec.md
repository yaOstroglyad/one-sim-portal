# Feature Specification: Traffic Dashboard Tab

**Feature Branch**: `015-traffic-dashboard`
**Created**: 2025-12-16
**Status**: Draft
**Input**: Implement Traffic tab in dashboard with real API integration. Clean implementation from scratch based on API data structure and proper UX/UI design.

## Pre-Implementation Requirements

### Cleanup Tasks

Before implementing the new Traffic tab, the following legacy code MUST be removed:

**Files to Delete:**
- `src/app/views/analytics/dashboard/tabs/traffic/` (entire directory)
- `src/app/views/analytics/dashboard/services/traffic-data.service.ts`
- `src/app/views/analytics/dashboard/models/traffic.types.ts`

**Code to Remove from Existing Files:**
- Remove TrafficTabComponent import and usage from `dashboard.component.ts`
- Remove traffic tab pane section from `dashboard.component.html`
- Remove traffic-related methods from `dashboard-data.service.ts`
- Remove `getTrafficData()` method from `mock-data.service.ts`
- Remove traffic configuration from `utils/config.utils.ts`

## API Data Structure

The Traffic tab receives data from `GET /api/v1/reports/dashboards/trafic/traffic-usage-period`:

```
Request Parameters:
- accountId: UUID (company account)
- period: string (DAY, WEEK, MONTH)
- dateFrom: datetime
- dateTo: datetime

Response:
{
  currentPeriodTraffic: {
    period: date,
    totalTraffic: number,
    countryTraffics: [{ country: string, traffic: number }]
  },
  trafficByCountry: [{
    period: date,
    totalTraffic: number,
    countryTraffics: [{ country: string, traffic: number }]
  }],
  subscribersByCountry: [{
    period: date,
    totalSubscribers: number,
    countrySubscribers: [{ country: string, subscribers: number }]
  }],
  subscriberAverageTraffic: [{
    period: date,
    traffic: number
  }]
}
```

## UX/UI Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TRAFFIC TAB                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Total       │  │ Countries   │  │ Top Country │  │ Avg Traffic │    │
│  │ Traffic     │  │ Active      │  │             │  │ /Subscriber │    │
│  │ 1.24 TB     │  │ 12          │  │ Turkey      │  │ 2.4 GB      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │ Traffic by Country (GB)        │  │ Subscribers by Country         │ │
│  │                                │  │                                │ │
│  │  800 ┤      ████               │  │  500 ┤      ████               │ │
│  │      │      ████               │  │      │      ████               │ │
│  │  600 ┤      ████               │  │  400 ┤ ████ ████               │ │
│  │      │      ████               │  │      │ ████ ████               │ │
│  │  400 ┤ ████ ████               │  │  300 ┤ ████ ████               │ │
│  │      │ ████ ████               │  │      │ ████ ████               │ │
│  │  200 ┤ ████ ████               │  │  200 ┤ ████ ████               │ │
│  │      │ ████ ████               │  │      │ ████ ████               │ │
│  │    0 └─Aug──Sep──Oct───────────│  │    0 └─Aug──Sep──Oct───────────│ │
│  │                                │  │                                │ │
│  │  Legend: ■ Turkey ■ China ...  │  │  Legend: ■ Turkey ■ China ...  │ │
│  └────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Average Traffic per Subscriber (GB)                              │   │
│  │                                                                  │   │
│  │  3.0 ┤                    ●────●                                 │   │
│  │      │              ●────●                                       │   │
│  │  2.0 ┤        ●────●                                             │   │
│  │      │  ●────●                                                   │   │
│  │  1.0 ┤                                                           │   │
│  │      │                                                           │   │
│  │    0 └──Aug────Sep────Oct────Nov────Dec──────────────────────────│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. KPI Cards Row (4 cards)**
- **Total Traffic**: Sum of all traffic for current period, formatted as MB/GB/TB
- **Active Countries**: Count of unique countries with traffic > 0
- **Top Country**: Country name with highest traffic in current period
- **Avg Traffic/Subscriber**: Latest value from `subscriberAverageTraffic`, formatted as MB/GB

**2. Traffic by Country Chart (Stacked Bar)**
- X-axis: Time periods (formatted based on date range)
- Y-axis: Traffic in GB (auto-scaled)
- Stacks: Top 15 countries by total traffic across all periods
- Colors: Dashboard color palette (20 colors, cycling)
- Custom Legend: Below chart, shows country name + color + total traffic
- Tooltip: Country, Period, Traffic value

**3. Subscribers by Country Chart (Stacked Bar)**
- X-axis: Time periods (formatted based on date range)
- Y-axis: Subscriber count (auto-scaled)
- Stacks: Top 15 countries by total subscribers across all periods
- Colors: Same palette as traffic chart (consistent country colors)
- Custom Legend: Below chart, shows country name + color + total subscribers
- Tooltip: Country, Period, Subscriber count

**4. Average Traffic per Subscriber Chart (Line)**
- X-axis: Time periods
- Y-axis: Traffic in GB (auto-scaled)
- Single line with data points
- Tooltip: Period, Average traffic value
- Area fill under line (subtle gradient)

### Responsive Behavior

- **Desktop (>1200px)**: 2-column layout for bar charts
- **Tablet (768-1200px)**: 2-column layout, smaller charts
- **Mobile (<768px)**: Single column, stacked vertically

### Loading States

- Skeleton loaders for KPI cards (4 placeholder cards)
- Skeleton loaders for chart areas (rectangular placeholders)
- Progressive loading: KPI cards can show data before charts

### Error States

- Full-tab error: "Unable to load traffic data" + Retry button
- Partial error: Individual chart shows "No data available"

### Empty States

- No traffic data: "No traffic recorded for the selected period"
- Single country: Show as single-color bars (no stacking needed)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Traffic Overview (Priority: P1)

As a business user, I want to see key traffic metrics summarized in KPI cards so I can quickly assess traffic performance.

**Why this priority**: KPI cards provide instant insight without requiring chart analysis. First thing users see when opening the tab.

**Independent Test**: Open Traffic tab and verify 4 KPI cards display correct data from API.

**Acceptance Scenarios**:

1. **Given** user navigates to Traffic tab, **When** data loads, **Then** 4 KPI cards display: Total Traffic, Active Countries, Top Country, Avg Traffic/Subscriber
2. **Given** currentPeriodTraffic has totalTraffic=1500000 (bytes), **When** displayed, **Then** shows "1.43 GB" (properly formatted)
3. **Given** countryTraffics array has 8 entries, **When** Active Countries card displays, **Then** shows "8"
4. **Given** Turkey has highest traffic, **When** Top Country card displays, **Then** shows "Turkey"

---

### User Story 2 - Analyze Traffic Distribution by Country (Priority: P1)

As a business analyst, I want to see how traffic is distributed across countries over time so I can identify regional trends and growth patterns.

**Why this priority**: Core analytical feature - understanding geographic distribution of traffic is essential for business decisions.

**Independent Test**: View stacked bar chart with country breakdown per period.

**Acceptance Scenarios**:

1. **Given** trafficByCountry has data for 3 periods, **When** chart renders, **Then** X-axis shows 3 period labels (e.g., "Aug 2025", "Sep 2025", "Oct 2025")
2. **Given** 20 countries have traffic, **When** chart renders, **Then** only top 15 by total traffic are shown
3. **Given** user views legend, **When** examining entries, **Then** each country shows: color square, name, total traffic value
4. **Given** user hovers on Turkey segment in Sep 2025, **When** tooltip appears, **Then** shows "Turkey | Sep 2025 | 36.3 GB"

---

### User Story 3 - Compare Subscriber Distribution by Country (Priority: P2)

As a business analyst, I want to see subscriber distribution alongside traffic to understand user density per region.

**Why this priority**: Correlating subscribers with traffic reveals usage intensity per user in each region.

**Independent Test**: View subscribers by country stacked bar chart with proper country ordering.

**Acceptance Scenarios**:

1. **Given** subscribersByCountry has data, **When** chart renders, **Then** stacked bar chart shows subscriber counts per period
2. **Given** both charts display same countries, **When** comparing legends, **Then** same country has same color in both charts
3. **Given** China has most subscribers but less traffic than Turkey, **When** charts render, **Then** subscriber chart shows China higher, traffic chart shows Turkey higher

---

### User Story 4 - Track Average Usage Trend (Priority: P2)

As a business analyst, I want to see how average traffic per subscriber changes over time to identify usage pattern shifts.

**Why this priority**: Trend analysis helps predict future capacity needs and understand user behavior changes.

**Independent Test**: View line chart showing average traffic progression over time.

**Acceptance Scenarios**:

1. **Given** subscriberAverageTraffic has 6 periods, **When** chart renders, **Then** line chart shows 6 connected data points
2. **Given** traffic values range from 1.5 to 3.2 GB, **When** Y-axis renders, **Then** scale appropriately fits data range
3. **Given** user hovers on October data point, **When** tooltip appears, **Then** shows "Oct 2025: 2.4 GB"

---

### User Story 5 - Filter by Account and Period (Priority: P1)

As an admin user, I want to filter traffic data by account and date range to analyze specific business segments.

**Why this priority**: Multi-tenant platform requires account filtering; period selection is essential for trend analysis.

**Independent Test**: Change account/period and verify all visualizations update.

**Acceptance Scenarios**:

1. **Given** admin user selects different account, **When** selection changes, **Then** all 4 charts reload with new account's data
2. **Given** user selects "Last 30 days", **When** period changes, **Then** API called with correct dateFrom/dateTo and charts update
3. **Given** user selects "Current Month", **When** data loads, **Then** period parameter sent as "MONTH"

---

### Edge Cases

- **Empty API response**: All arrays empty → Show "No traffic data for selected period" message
- **Single country**: Only one country has data → Single-color bars, no stacking
- **Zero traffic periods**: Some periods have 0 total → Show bars with 0 height, maintain X-axis continuity
- **Very large values**: Traffic in petabytes → Format as "X.XX PB"
- **Very small values**: Traffic in kilobytes → Format as "X.XX KB"
- **API timeout**: Request exceeds 30 seconds → Show error with retry button
- **Partial data**: Some response fields missing → Render available data, show "No data" for missing sections

## Requirements *(mandatory)*

### Cleanup Requirements

- **CR-001**: System MUST delete all existing Traffic tab files before implementing new version
- **CR-002**: System MUST remove all Traffic-related mock data from mock-data.service.ts
- **CR-003**: System MUST remove Traffic configuration from config.utils.ts
- **CR-004**: System MUST remove Traffic imports from dashboard.component.ts
- **CR-005**: System MUST remove Traffic tab pane from dashboard.component.html

### Functional Requirements

- **FR-001**: System MUST fetch data from `GET /api/v1/reports/dashboards/trafic/traffic-usage-period`
- **FR-002**: System MUST send query parameters: accountId, period, dateFrom, dateTo
- **FR-003**: System MUST display 4 KPI cards: Total Traffic, Active Countries, Top Country, Avg Traffic/Subscriber
- **FR-004**: System MUST render stacked bar chart for trafficByCountry with periods on X-axis
- **FR-005**: System MUST render stacked bar chart for subscribersByCountry with periods on X-axis
- **FR-006**: System MUST render line chart for subscriberAverageTraffic trend
- **FR-007**: System MUST limit stacked bar charts to top 15 countries by total value
- **FR-008**: System MUST display custom legend below each stacked bar chart
- **FR-009**: System MUST use consistent colors for same country across all charts
- **FR-010**: System MUST format traffic values with appropriate units (KB/MB/GB/TB/PB)
- **FR-011**: System MUST show loading skeleton while data is being fetched
- **FR-012**: System MUST show error state with retry button on API failure
- **FR-013**: System MUST show empty state when no data available
- **FR-014**: System MUST enable Traffic tab in dashboard navigation (remove disabled flag)
- **FR-015**: System MUST refresh all visualizations when account or period changes
- **FR-016**: System MUST display tooltips on chart hover with contextual information
- **FR-017**: System MUST format period labels based on date range (e.g., "Aug 2025", "Week 32", "Dec 15")

### Non-Functional Requirements

- **NFR-001**: Traffic tab MUST load and display data within 3 seconds
- **NFR-002**: Chart interactions (hover, tooltip) MUST respond within 100ms
- **NFR-003**: Tab MUST handle up to 100 countries and 365 periods without performance degradation
- **NFR-004**: Layout MUST be responsive across desktop, tablet, and mobile viewports

### Key Entities

- **TrafficUsagePeriodResponse**: Root response object from API
- **CurrentPeriodTraffic**: Summary for current/latest period with country breakdown
- **PeriodTrafficData**: Traffic data for a single period with country array
- **PeriodSubscriberData**: Subscriber data for a single period with country array
- **AverageTrafficData**: Single period's average traffic per subscriber
- **CountryTraffic**: Country name and traffic value pair
- **CountrySubscribers**: Country name and subscriber count pair

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All legacy Traffic tab code is removed (0 files in tabs/traffic/, no traffic methods in services)
- **SC-002**: Traffic tab is enabled and accessible in dashboard navigation
- **SC-003**: API integration works - real data displayed (no mock data)
- **SC-004**: 4 KPI cards render with correct values from currentPeriodTraffic
- **SC-005**: Traffic by Country stacked bar chart renders with correct data mapping
- **SC-006**: Subscribers by Country stacked bar chart renders with correct data mapping
- **SC-007**: Average Traffic line chart renders with correct trend data
- **SC-008**: Custom legends display for both stacked bar charts
- **SC-009**: Data refreshes when account or period selection changes
- **SC-010**: Loading and error states function correctly

## Out of Scope

- Export functionality for traffic data
- Drill-down to individual subscriber details
- Real-time traffic monitoring
- Traffic cost calculations
- Comparison with previous periods (trend indicators on KPI cards)
- Chart animation transitions
