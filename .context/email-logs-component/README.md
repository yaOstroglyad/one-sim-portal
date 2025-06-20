# Email Logs Component

## Overview

`EmailLogsComponent` is a specialized standalone Angular component for displaying email event logs in the One Sim Portal system. The component is built on top of `generic-table` and supports different access levels (admin/user).

## Key Features

### 🎯 Functionality
- **Email logs viewing** - display all email events for an account
- **ICCID filtering** - search logs by specific SIM card
- **Automatic account selection** - for regular users
- **Manual account selection** - for administrators
- **Server-side pagination** - efficient handling of large data volumes
- **Column sorting** - ability to sort by any field

### 🔐 Access Control
- **Admins**: can select any account via `account-selector`
- **Regular users**: automatically work with their own account

### 📊 Displayed Data

| Field | Description | Type | Sortable |
|-------|-------------|------|----------|
| sentAt | Send time | Date | ✓ |
| emailAddress | Recipient email | Text | ✓ |
| subject | Email subject | Text | ✓ |
| emailType | Email type | Text | ✓ |
| status | Delivery status | Text | ✓ |
| iccid | SIM card ICCID | Text | ✓ |
| deliveredAt | Delivery time | Date | ✓ |
| openedAt | Open time | Date | ✓ |
| errorMessage | Error message | Text | - |

## Architecture

### Component Structure
```
src/app/views/email-logs/
├── email-logs.component.ts          # Main component
├── email-logs.component.html        # HTML template  
├── email-logs.component.scss        # SCSS styles
├── email-logs-table-config.service.ts # Table configuration service
└── index.ts                         # Exports
```

### Dependencies

#### Internal Components
- `GenericTableComponent` - base table
- `AccountSelectorComponent` - account selector (for admins)

#### Angular Material Modules
- `MatFormFieldModule` - form fields
- `MatInputModule` - input fields

#### Services
- `AuthService` - access rights verification
- `EmailLogsTableConfigService` - table configuration

## API Integration

### Endpoint
```
GET /api/v1/email-logs/{accountId}
```

### Request Parameters
- `accountId` (path) - Account ID
- `iccid` (query) - ICCID filter
- `page` (query) - page number (default: 0)
- `size` (query) - page size (default: 20)
- `sort` (query) - sorting criteria

## Data Models

### EmailLog
```typescript
interface EmailLog {
  id: string;
  accountId: string;
  iccid?: string;
  emailAddress: string;
  subject: string;
  emailType: string;
  status: EmailLogStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  templateId?: string;
  templateName?: string;
}
```

### EmailLogStatus
```typescript
enum EmailLogStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  COMPLAINED = 'COMPLAINED'
}
```

## Implementation Features

### Change Detection
- Uses `OnPush` strategy for optimal performance
- All data is passed through Observable streams

### Memory Management
- Automatic unsubscription from all subscriptions in `ngOnDestroy`
- Uses `takeUntil(unsubscribe$)` pattern

### Filtering
- **Debounce**: 700ms delay for ICCID filter
- **Reactive filtering**: automatic updates on filter changes
- **Combined filters**: simultaneous operation of multiple filters

### Responsive Design
- Adaptive layout for mobile devices
- Flexible filter arrangement on narrow screens

## Performance Optimizations

1. **OnPush Change Detection** - minimal re-renders
2. **Reactive Streams** - efficient data management
3. **Debounced Filtering** - reduced number of API requests
4. **Server-side Pagination** - handling large datasets
5. **Lazy Loading** - data loads only when needed 