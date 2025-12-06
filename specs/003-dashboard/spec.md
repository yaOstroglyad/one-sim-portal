# Feature Specification: Dashboard

**Feature Branch**: `003-dashboard`
**Created**: 2025-12-03
**Status**: Implemented
**Input**: Analytics dashboard for eSIM portal with key metrics

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Overview Metrics (Priority: P1)

As an admin, I want to see key business metrics at a glance so that I can monitor overall performance.

**Why this priority**: Primary entry point for dashboard - provides immediate business value.

**Independent Test**: Can be tested by loading overview and verifying KPI cards show data.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I open the dashboard, **Then** I see Overview tab with KPI cards
2. **Given** Overview is loaded, **When** I look at metrics, **Then** I see subscribers, revenue, usage
3. **Given** data is available, **When** I view recent activity, **Then** I see latest events

---

### User Story 2 - Analyze Subscriber Metrics (Priority: P1)

As an admin, I want to view subscriber analytics so that I can understand growth trends.

**Why this priority**: Subscribers are core business metric - essential for decision making.

**Independent Test**: Can be tested by switching to Subscribers tab and verifying charts render.

**Acceptance Scenarios**:

1. **Given** I am on dashboard, **When** I click Subscribers tab, **Then** I see subscriber charts
2. **Given** Subscribers tab is active, **When** I view growth trend, **Then** line chart shows data
3. **Given** I view distribution, **When** I hover on pie chart, **Then** I see segment details

---

### User Story 3 - Monitor Traffic by Country (Priority: P2)

As an admin, I want to see traffic analytics by country so that I can identify top markets.

**Why this priority**: Important for business strategy but not blocking for basic monitoring.

**Independent Test**: Can be tested by viewing Traffic tab and checking bar charts.

**Acceptance Scenarios**:

1. **Given** I am on dashboard, **When** I click Traffic tab, **Then** I see traffic charts
2. **Given** Traffic tab is active, **When** I view by country, **Then** horizontal bar chart shows data
3. **Given** I view active users, **When** I compare countries, **Then** I see relative usage

---

### User Story 4 - Review Financial Performance (Priority: P2)

As an admin, I want to see financial metrics so that I can track revenue and margins.

**Why this priority**: Critical for business but can start with simpler metrics first.

**Independent Test**: Can be tested by viewing Finance tab and checking revenue charts.

**Acceptance Scenarios**:

1. **Given** I am on dashboard, **When** I click Finance tab, **Then** I see financial charts
2. **Given** Finance tab is active, **When** I view margin by month, **Then** line chart shows trend
3. **Given** I view top countries, **When** I check revenue, **Then** I see ranked list

---

### User Story 5 - Switch Time Periods (Priority: P2)

As a user, I want to filter dashboard by time period so that I can analyze different timeframes.

**Why this priority**: Enhances analysis but default period works for MVP.

**Independent Test**: Can be tested by changing period selector and verifying data updates.

**Acceptance Scenarios**:

1. **Given** I am viewing dashboard, **When** I select "week", **Then** all charts update
2. **Given** I select "month", **When** charts reload, **Then** data reflects monthly range

---

### Edge Cases

- What if data is not available for a period? → Show "No data available" message
- How to handle slow ClickHouse queries? → Show loading state with message
- What if chart has too many data points? → Aggregate or paginate

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display Overview tab with KPI cards
- **FR-002**: System MUST display Subscribers tab with growth/distribution charts
- **FR-003**: System MUST display Traffic tab with country analytics
- **FR-004**: System MUST display Finance tab with revenue/margin charts
- **FR-005**: System MUST support period filtering (day/week/month)
- **FR-006**: System MUST show loading states during data fetch
- **FR-007**: System MUST handle errors gracefully with retry option
- **FR-008**: System MUST use Chart.js for visualizations
- **FR-009**: Charts MUST be responsive for desktop and tablet
- **FR-010**: System MUST cache dashboard data with CacheHubService

### Key Entities

- **OverviewMetrics**: Total subscribers, revenue, usage summary
- **SubscriberMetrics**: Active/inactive, growth trend, distribution
- **TrafficMetrics**: By country, shares, active users
- **FinanceMetrics**: Margin, revenue, invoices

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard initial load in under 2 seconds
- **SC-002**: Tab switching in under 500ms (cached data)
- **SC-003**: Charts render correctly on 1024px+ screens
- **SC-004**: Period change updates all charts in under 1 second

---

## Technical Implementation

### Data Models

```typescript
interface DashboardData {
  overview: OverviewMetrics;
  subscribers: SubscriberMetrics;
  traffic: TrafficMetrics;
  finance: FinanceMetrics;
}

interface OverviewMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  dataUsage: number;
}

interface SubscriberMetrics {
  activeVsInactive: ChartData;
  growthTrend: TimeSeriesData;
  distributionByPlan: PieChartData;
}

interface TrafficMetrics {
  byCountry: BarChartData;
  sharesByCountry: PieChartData;
  activeUsersByCountry: BarChartData;
}

interface FinanceMetrics {
  marginByMonth: TimeSeriesData;
  topCountries: BarChartData;
  topBundles: BarChartData;
  revenue: TimeSeriesData;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/overview` | Overview metrics |
| GET | `/api/v1/dashboard/subscribers` | Subscriber analytics |
| GET | `/api/v1/dashboard/traffic` | Traffic metrics |
| GET | `/api/v1/dashboard/finance` | Financial data |

### File Structure

```
src/app/views/dashboard/
├── dashboard.component.ts
├── components/
│   ├── dashboard-tabs/
│   ├── metric-card/
│   └── charts/
│       ├── bar-chart/
│       ├── line-chart/
│       └── pie-chart/
├── tabs/
│   ├── overview-tab/
│   ├── subscribers-tab/
│   ├── traffic-tab/
│   └── finance-tab/
└── services/
    └── dashboard-data.service.ts
```

### Reusable Components

- **MetricCardComponent**: KPI display with value and label
- **DashboardTabsComponent**: Tab navigation
- **BarChartComponent**: Horizontal/vertical bar charts
- **LineChartComponent**: Time series charts
- **PieChartComponent**: Distribution charts

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-03
