# Feature Specification: Subscribers Tab API Integration

**Feature Branch**: `010-subscribers-api`
**Created**: 2025-12-06
**Status**: Draft
**Input**: Connect Subscribers tab to SubscriberReports API endpoints and enable the disabled tab

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Subscriber Summary Report (Priority: P1)

As an admin user, I want to see a summary of subscriber data for a selected period so that I can understand overall subscriber metrics and KPIs.

**Why this priority**: Core functionality - the subscriber summary provides the foundational metrics (KPIs) that all other reports build upon.

**Independent Test**: Can be fully tested by selecting a date range and verifying KPI cards display real data from the API.

**Acceptance Scenarios**:

1. **Given** I am on the Dashboard, **When** I navigate to the Subscribers tab, **Then** the tab should be enabled and clickable
2. **Given** I am on the Subscribers tab, **When** the page loads, **Then** I see KPI metric cards populated with data from `/api/v1/reports/dashboards/subscribers/subscriber-summary`
3. **Given** I change the period filter, **When** the new period is selected, **Then** the subscriber summary data refreshes with the new date range
4. **Given** the API returns an error, **When** I view the tab, **Then** I see an error message with a retry option

---

### User Story 2 - View Network Status Distribution (Priority: P1)

As an admin user, I want to see subscriber distribution by network status so that I can monitor connectivity health across my subscriber base.

**Why this priority**: Critical for understanding subscriber connectivity and identifying potential network issues.

**Independent Test**: Can be tested by viewing the demographics chart and verifying it shows real network status data.

**Acceptance Scenarios**:

1. **Given** I am on the Subscribers tab, **When** the page loads, **Then** I see a chart showing subscriber distribution by network status from `/api/v1/reports/dashboards/subscribers/network-statuses`
2. **Given** the network status data loads successfully, **When** I view the demographics section, **Then** I see labels and values for each network status category
3. **Given** the API is slow, **When** data is loading, **Then** I see a loading indicator in the chart area

---

### User Story 3 - View Bundle Subscribers Report (Priority: P2)

As an admin user, I want to see subscriber distribution by bundle so that I can understand which bundles are most popular among my subscribers.

**Why this priority**: Important for business decisions about bundle offerings, but secondary to core connectivity metrics.

**Independent Test**: Can be tested by viewing the lifecycle chart and verifying it displays bundle subscription data.

**Acceptance Scenarios**:

1. **Given** I am on the Subscribers tab, **When** the page loads, **Then** I see a chart showing subscribers by bundle from `/api/v1/reports/dashboards/subscribers/bundle-subscribers`
2. **Given** bundle subscriber data is available, **When** I view the lifecycle section, **Then** I see each bundle with its subscriber count and percentage
3. **Given** no bundle data exists for the period, **When** I view the chart, **Then** I see an empty state message

---

### User Story 4 - View Bundle Status Distribution (Priority: P2)

As an admin user, I want to see the distribution of bundle statuses so that I can monitor active, pending, and expired bundles.

**Why this priority**: Useful for operational monitoring but builds on top of the core subscriber data.

**Independent Test**: Can be tested by viewing the growth chart and verifying bundle status data displays correctly.

**Acceptance Scenarios**:

1. **Given** I am on the Subscribers tab, **When** the page loads, **Then** I see a chart showing bundle status distribution from `/api/v1/reports/dashboards/subscribers/bundle-statuses`
2. **Given** bundle status data loads, **When** I view the growth section, **Then** I see status categories (active, pending, expired, etc.) with counts
3. **Given** I change the account filter (admin), **When** a new account is selected, **Then** all charts refresh with data for the selected account

---

### Edge Cases

- What happens when API returns empty data? → Show appropriate empty state for each chart section
- What happens when one API fails but others succeed? → Show error only in affected section, other sections display normally
- What happens when accountId is not set (admin)? → Do not make API calls until account is selected
- What happens when period is very long (>1 year)? → API handles aggregation, UI shows data as returned

## Clarifications

### Session 2025-12-06
- Q: API response structure for 4 endpoints? → A: Documented from Swagger - see "API Response Schemas" section
- Q: How to map API data to existing UI (mismatch)? → A: Полностью переделать UI под новую структуру API
- Q: Chart types for new UI sections? → A: Deferred to implementation phase

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enable the Subscribers tab in the dashboard navigation (remove disabled state)
- **FR-002**: System MUST call `/api/v1/reports/dashboards/subscribers/subscriber-summary` endpoint with `accountId`, `period`, `dateFrom`, `dateTo` parameters
- **FR-003**: System MUST call `/api/v1/reports/dashboards/subscribers/network-statuses` endpoint with query parameters
- **FR-004**: System MUST call `/api/v1/reports/dashboards/subscribers/bundle-subscribers` endpoint with query parameters
- **FR-005**: System MUST call `/api/v1/reports/dashboards/subscribers/bundle-statuses` endpoint with query parameters
- **FR-006**: System MUST display loading states while API calls are in progress
- **FR-007**: System MUST display error states with retry capability when API calls fail
- **FR-008**: System MUST refresh all data when period or accountId changes
- **FR-009**: System MUST redesign subscribers-tab UI to match API response structure (remove mock-based sections like retention, churnAnalysis)
- **FR-010**: System MUST NOT make API calls until accountId is set (for admin users)
- **FR-011**: System MUST display 5 KPI cards from subscriber-summary: newSubscribers, downloadedSims, activeSubscribers, spentBundles, avrBundleSize
- **FR-012**: System MUST display network status chart from network-statuses API
- **FR-013**: System MUST display bundle subscribers chart from bundle-subscribers API (by bundle and by country)
- **FR-014**: System MUST display bundle statuses chart from bundle-statuses API

### Key Entities

- **SubscriberSummary**: Aggregated subscriber metrics (total, new, active, churned) for KPI display
- **NetworkStatus**: Distribution of subscribers by network connectivity status
- **BundleSubscribers**: Count of subscribers per bundle type
- **BundleStatuses**: Distribution of bundles by status (active, pending, expired, etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Subscribers tab loads and displays data within 3 seconds of navigation
- **SC-002**: All 4 API endpoints are successfully integrated and return data to the UI
- **SC-003**: Period and account filter changes trigger data refresh within 1 second
- **SC-004**: Error states display meaningful messages and retry functionality works correctly
- **SC-005**: Tab is accessible and not disabled in the dashboard navigation

---

## Technical Implementation

### API Endpoints

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/api/v1/reports/dashboards/subscribers/subscriber-summary` | GET | accountId, period, dateFrom, dateTo | Get subscriber KPI metrics |
| `/api/v1/reports/dashboards/subscribers/network-statuses` | GET | accountId, period, dateFrom, dateTo | Get network status distribution |
| `/api/v1/reports/dashboards/subscribers/bundle-subscribers` | GET | accountId, period, dateFrom, dateTo | Get subscribers by bundle |
| `/api/v1/reports/dashboards/subscribers/bundle-statuses` | GET | accountId, period, dateFrom, dateTo | Get bundle status distribution |

### Query Parameters

```typescript
interface SubscriberReportParams {
  accountId: string;      // Required - account UUID
  period: string;         // Period identifier
  dateFrom: string;       // ISO 8601 date-time
  dateTo: string;         // ISO 8601 date-time
}
```

### API Response Schemas

**1. subscriber-summary response:**
```typescript
interface SubscriberSummaryResponse {
  newSubscribers: number;
  downloadedSims: number;
  activeSubscribers: number;
  spentBundles: number;
  avrBundleSize: number;
}
```

**2. network-statuses response:**
```typescript
interface NetworkStatusesResponse {
  periodStatuses: PeriodStatus[];
}

interface PeriodStatus {
  period: string;        // "2025-12-06" (date)
  totalCount: number;
  statuses: StatusCount[];
}

interface StatusCount {
  status: string;
  count: number;
}
```

**3. bundle-subscribers response:**
```typescript
interface BundleSubscribersResponse {
  subscribersByBundle: BundleGroup[];
  subscribersByCountry: BundleGroup[];
}

interface BundleGroup {
  groupName: string;
  subscribers: number;
  statuses: StatusCount[];
}
```

**4. bundle-statuses response:**
```typescript
interface BundleStatusesResponse {
  periodStatuses: PeriodStatus[];  // Same structure as network-statuses
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `dashboard.component.ts` | Remove `disabled: true` from subscribers tab |
| `dashboard-data.service.ts` | Add 4 new API methods for subscriber reports |
| `config.utils.ts` | Add new endpoint URLs, set `subscribers: false` in mock config |
| `subscribers-tab.component.ts` | **Redesign**: New template matching API structure |
| `subscribers-tab.component.html` | **Redesign**: 5 KPI cards + 3 chart sections (network, bundles, statuses) |
| `subscribers-tab.component.scss` | Update styles for new layout |
| `subscribers.types.ts` | Replace mock types with API response interfaces |

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-06
