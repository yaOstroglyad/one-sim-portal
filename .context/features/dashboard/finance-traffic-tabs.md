# Technical Requirements: Finance & Traffic Tabs (eSIM Dashboard)

## 🔷 Finance Tab

### Purpose
Provide financial analytics on eSIM performance: revenue, margins, top regions and bundles.

### Components

#### 1. Margin by Month
- **Type:** Line chart
- **X-Axis:** Month
- **Y-Axis:** Margin (%)
- **Mock Data:**
```json
[
  { "month": "2025-03", "margin": 45 },
  { "month": "2025-04", "margin": 40 },
  { "month": "2025-05", "margin": 50 }
]
```

#### 2. Top 10 Countries
- **Type:** Horizontal bar chart
- **X-Axis:** Revenue (USD)
- **Y-Axis:** Country
- **Mock Data:**
```json
[
  { "country": "Germany", "revenue": 5000 },
  { "country": "USA", "revenue": 4500 }
]
```

#### 3. Top 10 Bundles
- **Type:** Horizontal bar chart
- **X-Axis:** Revenue (USD)
- **Y-Axis:** Bundle name
- **Mock Data:**
```json
[
  { "bundle": "Europe 3GB", "revenue": 3200 },
  { "bundle": "Asia 1GB", "revenue": 2700 }
]
```

#### 4. Revenue
- **Type:** Line chart
- **X-Axis:** Month
- **Y-Axis:** Revenue
- **Mock Data:**
```json
[
  { "month": "2025-04", "revenue": 7000 },
  { "month": "2025-05", "revenue": 8000 }
]
```

#### 5. Balance for Invoice
- **Type:** Table
- **Columns:** Company | Amount | Due Date
- **Mock Data:**
```json
[
  { "company": "Client A", "amount": 1200, "dueDate": "2025-07-10" }
]
```

#### 6. Bundle Purchases to be Invoiced
- **Type:** Table
- **Columns:** Bundle | Quantity | Customer | Total Price
- **Mock Data:**
```json
[
  { "bundle": "Europe 1GB", "quantity": 5, "customer": "Client B", "total": 100 }
]
```

---

## 🟦 Traffic Tab

### Purpose
Provide detailed analytics on mobile data usage: volume, shares, and active users.

### Components

#### 1. Traffic by Country
- **Type:** Horizontal bar chart
- **X-Axis:** Data traffic (GB)
- **Y-Axis:** Country
- **Mock Data:**
```json
[
  { "country": "France", "traffic": 300 },
  { "country": "Israel", "traffic": 250 }
]
```

#### 2. Traffic Shares by Country
- **Type:** Pie chart
- **Mock Data:**
```json
[
  { "country": "France", "share": 40 },
  { "country": "Israel", "share": 30 },
  { "country": "Germany", "share": 30 }
]
```

#### 3. Active Users by Country
- **Type:** Horizontal bar chart
- **Mock Data:**
```json
[
  { "country": "France", "users": 100 },
  { "country": "USA", "users": 80 }
]
```

#### 4. Average Traffic
- **Type:** KPI block
- **Mock Data:**
```json
{
  "averageTrafficGB": 1.8
}
```

---

## Behavior & Error States

- **Loading state:** Show "Waiting on ClickHouse Connect (Superset)"
- **Error state:** Show "Unexpected error" with "See more" link
- **Data mode:** Toggle between mock data and real API integration

---

## Future Enhancements

- Filters by date, region, bundle
- Export to CSV/Excel
- Drill-down on click (details view)
