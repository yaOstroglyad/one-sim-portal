# Email Logs Component

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/views/email-logs/`

## Overview

Displays email event logs with filtering by ICCID, email, and date range. Supports both admin and regular user access.

## Access Control

| Role | Behavior |
|------|----------|
| Admin | Shows account selector, can view any account's logs |
| Regular User | Auto-uses own accountId, no selector shown |

## Filters

| Filter | Type | Description |
|--------|------|-------------|
| ICCID | text | Filter by SIM card ICCID |
| Email | text | Filter by recipient email |
| Date From | datepicker | Start date |
| Date To | datepicker | End date |

## Table Columns

| Column | Key | Type | Description |
|--------|-----|------|-------------|
| Created | `createdAt` | date | Email creation timestamp |
| Email | `email` | text | Recipient email address |
| Type | `type` | text | Email type |
| Event | `event` | text | Email event (sent, delivered, etc.) |
| Status | `status` | text | From metadata object |
| ICCIDs | `iccids` | text | Comma-separated list |

## File Structure

```
email-logs/
├── email-logs.component.ts      # Main component
├── email-logs.component.html    # Template
├── email-logs.component.scss    # Styles
├── email-logs-table-config.service.ts  # Table configuration
└── index.ts                     # Exports
```

## Usage

```typescript
// In routing
{ path: 'email-logs', component: EmailLogsComponent }
```

## API Integration

```typescript
interface EmailLogFilterParams {
  accountId: string;
  page?: number;
  size?: number;
  iccid?: string;
  email?: string;
  dateFrom?: string;  // ISO format
  dateTo?: string;    // ISO format
}
```

## Data Transformation

ICCIDs array is joined with commas for display:
```typescript
iccids: item.iccids?.join(', ') || '-'
```

## Dependencies

- `GenericTableComponent` - Table display
- `HeaderComponent` - Filters toolbar
- `AccountSelectorComponent` - Account selection (admin only)
- `DatePickerWrapperComponent` - Date filters
- `EmailLogsTableConfigService` - Table config and data loading
