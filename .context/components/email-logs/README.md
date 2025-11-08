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

| Field | Description | Type | Sortable | API Field |
|-------|-------------|------|----------|-----------|
| createdAt | Creation time | Date | ✓ | `createdAt` |
| email | Recipient email | Text | ✓ | `email` |
| type | Email type | Text | ✓ | `type` |
| event | Email event | Text | ✓ | `event` |
| status | Email status | Text | ✓ | `status` |
| iccids | SIM card ICCIDs | Text | ✓ | `iccids` (array) |
| messageId | Message ID | Text | ✓ | `messageId` |
| metadata | Metadata status | Text | - | `metadata.status` |

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
  senderAccountId: string;
  iccids: string[];
  email: string;
  type: string;
  event: string;
  status: string;
  createdAt: string;
  messageId?: string;
  initialId?: string;
  metadata?: {
    status: number;
    response: string;
  };
}
```

### EmailLogFilterParams
```typescript
interface EmailLogFilterParams {
  accountId: string;
  iccid?: string;
  page?: number;
  size?: number;
  sort?: string[];
}
```

### EmailLogResponse
```typescript
interface EmailLogResponse {
  content: EmailLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

## Implementation Features

### Data Transformation
The component transforms API data for display:
- **ICCID Arrays**: `iccids` array converted to comma-separated string
- **Metadata**: `metadata.status` extracted as readable number
- **Fallbacks**: Empty or null values displayed as "-"

```typescript
private transformDataForDisplay(data: EmailLog[]): any[] {
  return data.map(item => ({
    ...item,
    iccids: item.iccids && item.iccids.length > 0 
      ? item.iccids.join(', ') 
      : '-',
    metadata: item.metadata 
      ? `${item.metadata.status}` 
      : '-'
  }));
}
```

### Change Detection
- Uses `OnPush` strategy for optimal performance
- All data is passed through Observable streams
- Manual change detection triggered after data updates

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

## Translation Support

### Supported Languages
- **English**: Full translation support
- **Russian**: Полная поддержка переводов
- **Ukrainian**: Повна підтримка перекладів  
- **Hebrew**: תמיכה מלאה בתרגום

### Translation Keys
```json
{
  "email_logs": {
    "title": "Email Logs",
    "filter_by_iccid": "Filter by ICCID",
    "iccid_placeholder": "Enter ICCID to filter",
    "created_at": "Created At",
    "email_address": "Email Address",
    "email_type": "Email Type",
    "event": "Event",
    "status": "Status",
    "iccids": "ICCIDs",
    "message_id": "Message ID",
    "metadata_status": "Metadata Status"
  }
}
```

## Performance Optimizations

1. **OnPush Change Detection** - minimal re-renders
2. **Reactive Streams** - efficient data management
3. **Debounced Filtering** - reduced number of API requests
4. **Server-side Pagination** - handling large datasets
5. **Data Transformation** - optimized display formatting
6. **Lazy Loading** - data loads only when needed

## Usage Example

```typescript
// Component automatically handles initialization
export class EmailLogsComponent implements OnInit, OnDestroy {
  // Form initialized at declaration level
  public filterForm = new FormGroup({
    iccid: new FormControl(null),
  });

  ngOnInit(): void {
    this.checkPermissions();
    this.initializeAccount();
    this.initializeTable();
    this.setupFilters();
  }
}
```

```html
<!-- Template with admin account selector -->
<app-account-selector *ngIf="isAdmin"
                      (accountSelected)="onAccountSelected($event)">
</app-account-selector>

<app-header [formGroup]="filterForm"
            [tableConfig$]="tableConfig$">
    <ng-container header-custom-inputs>
        <input formControlName="iccid" 
               placeholder="{{ 'email_logs.iccid_placeholder' | translate }}">
    </ng-container>
</app-header>

<generic-table [config$]="tableConfig$"
               [data$]="dataList$">
</generic-table>
```

## Error Prevention

Following the established patterns from `.context/common-errors-and-solutions/`:

### ✅ **Form Safety**
- Form initialized at property declaration level
- Safe navigation operators (`?.`) used throughout
- Proper null checks for all form operations

### ✅ **OnPush Compatibility**
- Manual change detection after async operations
- Reactive data streams for all table updates
- Proper subscription management

### ✅ **Memory Management**
- `takeUntil(unsubscribe$)` pattern implemented
- Proper cleanup in `ngOnDestroy`
- No memory leaks from observables

## Maintenance Notes

- Component follows Angular best practices
- Comprehensive type safety with TypeScript
- Reactive programming patterns throughout
- Clean separation of concerns
- Extensible architecture for future features
- Consistent with One Sim Portal standards 