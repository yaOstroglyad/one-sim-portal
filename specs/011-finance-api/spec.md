# Feature Specification: Finance Dashboard API Integration

**Feature Branch**: `011-finance-api`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "Integrate Finance Dashboard tab with real API endpoint /api/v1/reports/dashboards/finance/period-revenue-summary instead of mock data"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Real Revenue Data by Period (Priority: P1)

As a business user, I want to see actual revenue data from the backend when viewing the Finance tab of the dashboard, so that I can make informed financial decisions based on real data.

**Why this priority**: Core functionality - without real data, the Finance tab provides no business value. Users need accurate, live financial metrics to track company performance.

**Independent Test**: Can be fully tested by navigating to Dashboard > Finance tab and verifying that revenue charts display data retrieved from the real API endpoint with current period parameters.

**Acceptance Scenarios**:

1. **Given** the user is on the Dashboard page with Finance tab selected and has selected an account, **When** the page loads, **Then** the system fetches data from `/api/v1/reports/dashboards/finance/period-revenue-summary` with the current period parameters
2. **Given** the API returns valid data, **When** response is received, **Then** revenue by bundle chart displays data grouped by period with correct totals
3. **Given** the API returns valid data, **When** response is received, **Then** revenue by country chart displays data grouped by period with correct totals
4. **Given** the API returns valid data, **When** response is received, **Then** margin by country chart displays data grouped by period with correct totals

---

### User Story 2 - Period Filtering for Finance Data (Priority: P1)

As a business user, I want to filter financial data by different time periods, so that I can analyze revenue trends over specific date ranges.

**Why this priority**: Essential for data analysis - users need to compare different time periods to identify trends and make forecasts.

**Independent Test**: Can be fully tested by changing the period selector and verifying that the Finance tab refreshes with data for the new period.

**Acceptance Scenarios**:

1. **Given** the Finance tab is displayed, **When** the user changes the period filter (e.g., from "Last Month" to "Last Quarter"), **Then** the system makes a new API call with updated `dateFrom`, `dateTo`, and `period` parameters
2. **Given** the period is changed, **When** new data is received, **Then** all finance charts update to reflect the new period data

---

### User Story 3 - Handle API Errors Gracefully (Priority: P2)

As a user, I want to see meaningful error messages when the Finance API is unavailable, so that I understand the issue and can retry when appropriate.

**Why this priority**: Important for user experience - users should not see broken UI or confusing states when backend issues occur.

**Independent Test**: Can be tested by simulating API failure (e.g., network disconnect) and verifying error display and retry functionality.

**Acceptance Scenarios**:

1. **Given** the Finance tab is loading, **When** the API returns an error (4xx/5xx), **Then** the user sees an error message with description and retry option
2. **Given** an error is displayed, **When** the user clicks "Retry", **Then** the system attempts to fetch data again

---

### User Story 4 - Loading State Indication (Priority: P2)

As a user, I want to see a loading indicator while finance data is being fetched, so that I know the system is working on my request.

**Why this priority**: Good UX practice - prevents user confusion about whether the system is responsive.

**Independent Test**: Can be tested by observing the UI during data fetch and verifying loading indicator appears.

**Acceptance Scenarios**:

1. **Given** the Finance tab is selected, **When** data is being fetched from API, **Then** a loading indicator is displayed
2. **Given** loading is in progress, **When** data is received, **Then** loading indicator disappears and charts are displayed

---

### Edge Cases

- What happens when the API returns empty data arrays? → Display empty state with appropriate message
- What happens when accountId is not yet selected? → Do not call API until account is selected
- What happens when currency field is missing from response? → Use default currency (EUR)
- How does system handle network timeout? → Display error with retry option after timeout

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST call `/api/v1/reports/dashboards/finance/period-revenue-summary` GET endpoint with query parameters: `accountId`, `period`, `dateFrom`, `dateTo`
- **FR-002**: System MUST transform API response to match existing `FinanceAnalytics` interface for chart rendering
- **FR-003**: System MUST map `revenueByBundle` array from API to revenue by bundle chart data
- **FR-004**: System MUST map `revenueByCountry` array from API to revenue by country chart data
- **FR-005**: System MUST map `marginByCountry` array from API to margin chart data
- **FR-006**: System MUST disable mock data for finance tab by setting `finance: false` in `DEFAULT_MOCK_CONFIG`
- **FR-007**: System MUST re-fetch data when period or accountId changes (handled by existing effect)
- **FR-008**: System MUST display loading state while API request is in progress
- **FR-009**: System MUST display error state with retry option when API fails
- **FR-010**: System MUST extract and display currency from API response

### Key Entities

- **PeriodRevenueSummaryResponse**: API response containing `currency`, `revenueByBundle[]`, `revenueByCountry[]`, `marginByCountry[]`
- **RevenueByGroup**: Array item with `period` (date string), `totalRevenue` (number), `revenueByGroup[]` (name/revenue pairs)
- **FinanceAnalytics**: Existing interface for Finance tab data (to be mapped from API response)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Finance tab displays live data from backend API within 3 seconds of tab selection
- **SC-002**: All three chart sections (revenue by bundle, revenue by country, margin by country) populate correctly from API data
- **SC-003**: Period changes trigger new API calls and update all charts within 3 seconds
- **SC-004**: Error states display user-friendly messages and functional retry button
- **SC-005**: No mock data is used in production mode for the Finance tab
