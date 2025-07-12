# Dashboard Analytics Feature Documentation

## Feature Name
Dashboard for eSIM Analytics

## Purpose
This dashboard visually represents key analytics data related to eSIM products using various charts and metrics. Initially, it will utilize mock data with backend services prepared for future integration with real data.

## Description
The dashboard is structured into four main tabs:

1. **Executive** – Overview metrics
2. **Subscribers** – Subscriber-related analytics
3. **Traffic** – Data on traffic usage
4. **Finance** – Financial analytics

## Core Components

### Executive Tab
- **Revenue**: Total revenue for the selected period.
- **Subscribers by Bundle**: Chart showing subscriber counts per eSIM bundle.
- **Revenue by Bundle**: Revenue distribution across different bundles.
- **Macro KPI Overview**: Summary of key performance indicators.
- **Inventory Status**: Current inventory levels for eSIMs.

### Subscribers Tab
- **New Subscribers**: Count of new subscribers.
- **Downloaded SIMs**: Number of downloaded eSIM profiles.
- **Active Subscribers**: Current active subscriber count.
- **Spent Bundles**: Data on used bundles.
- **Avg Bundle size (GB)**: Average data size per bundle.
- **Customer Journey**: Visualization of the customer lifecycle.
- **Bundle Status**: Status of eSIM bundles (active, expired, etc.).
- **Bundles by Country**: Country-wise distribution of bundles.
- **Subscribers by Bundle**: Subscriber count per bundle.

### Traffic Tab
- **Traffic by Country**: Data usage per country.
- **Traffic Shares by Country**: Traffic share per country.
- **Active Users by Country**: Active user count by country.
- **Average Traffic**: Average traffic data.

### Finance Tab
- **Margin by Month**: Monthly profit margins.
- **Top 10 Countries**: Financial performance ranking by country.
- **Top 10 Bundles**: Best-performing bundles financially.
- **Revenue**: Detailed revenue statistics.
- **Balance for Invoice**: Pending invoice balances.
- **Bundle Purchases to be invoiced**: Pending bundle invoices.

## Backend Services and Mock Data
- Backend REST services are required for frontend data retrieval.
- Mocked JSON responses must be implemented for initial testing and development.
- Clearly defined error and loading states:
    - Display `"Unexpected error"` for loading issues.
    - Display `"Waiting on ClickHouse Connect"` during data retrieval.

## Technology Stack
- **Frontend**: Angular or React with Chart.js or Recharts
- **Backend**: RESTful API providing JSON data (initially mocked using `json-server` or equivalent)
- **Database (future integration)**: ClickHouse

## Priority Tasks
- Structure dashboard and tabs into separate reusable components.
- Create universal data-fetching services capable of switching between real and mock data.
- Develop mock data endpoints mirroring expected real data responses.
- Implement robust error handling and loading states.
- Configure chart logic and visualization according to the data responses.

## UI/UX Requirements
- Interface must be intuitive and clear.
- Tabs and sections should be distinctly labeled and easily navigable.
- Implement user-friendly loading indicators and error messages.

## Integration Considerations
Prepare the architecture for seamless future integration with real data sources, minimizing code changes required during the integration phase.
