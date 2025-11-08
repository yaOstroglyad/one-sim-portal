# Email Logs Component - Quick Summary

## 🎯 Purpose
Standalone Angular component for displaying email event logs with role-based access support and filtering.

## 📁 Location
```
src/app/views/email-logs/
├── email-logs.component.ts              # Main component
├── email-logs.component.html            # HTML template
├── email-logs.component.scss            # SCSS styles
├── email-logs-table-config.service.ts   # Table configuration service
└── index.ts                            # Exports
```

## 🔧 Quick Start

### Import
```typescript
import { EmailLogsComponent } from './views/email-logs';
```

### Usage
```html
<app-email-logs></app-email-logs>
```

### Data Models
```typescript
// src/app/shared/model/email-log.ts
export interface EmailLog { ... }
export enum EmailLogStatus { ... }
export interface EmailLogFilterParams { ... }
export interface EmailLogResponse { ... }
```

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| **Role-based Access** | Admins - account selection, Users - own account |
| **Filtering** | By ICCID with 700ms debounce |
| **Pagination** | Server-side, 20 records per page |
| **Sorting** | All columns except errorMessage |
| **Performance** | OnPush strategy + Observable streams |
| **Responsive** | Adaptive layout for mobile |

## 🔐 Access Rights

### Administrator
- Sees `account-selector` for account selection
- Can view logs of any account
- Determined via `AuthService.hasPermission(ADMIN_PERMISSION)`

### Regular User
- Automatically uses their `accountId` from `AuthService.loggedUser`
- Account selector is hidden
- Sees only their own email logs

## 📊 API Endpoint
```
GET /api/v1/email-logs/{accountId}?iccid=&page=0&size=20&sort=
```

## 🎨 Appearance

### Table Columns
1. **Sent At** - send time
2. **Email Address** - recipient
3. **Subject** - email subject
4. **Email Type** - email type
5. **Status** - delivery status
6. **ICCID** - SIM card
7. **Delivered At** - delivery time
8. **Opened At** - open time
9. **Error Message** - errors

### Filters
- **Account Selector** (admins only)
- **ICCID Filter** - text field with debounce

## 🏗️ Architectural Decisions

### Following Project Standards
✅ Extends `TableConfigAbstractService<EmailLog>`  
✅ OnInit/OnDestroy with `takeUntil(unsubscribe$)`  
✅ Server-side pagination with fallback to 20  
✅ 700ms debounce for filters  
✅ OnPush change detection  
✅ Standalone component  

### Dependencies
- `GenericTableComponent` - base table
- `AccountSelectorComponent` - account selection (admins)
- `AuthService` - access rights verification
- Angular Material - UI components

## 🔄 Data Lifecycle

1. **Initialization**
   - Access rights check
   - Account setup (auto for users)
   - Reactive filters configuration

2. **Filtering**
   - Account change → instant loading
   - ICCID change → 700ms debounce → loading
   - Combined filters work together

3. **Pagination/Sorting**
   - Reset to first page on sorting
   - Preserve current filters
   - Automatic table configuration update

## 💡 Integration Examples

### In Routing
```typescript
{ path: 'email-logs', component: EmailLogsComponent }
```

### In Component
```typescript
@Component({
  imports: [EmailLogsComponent],
  template: '<app-email-logs></app-email-logs>'
})
```

### With Guard
```typescript
{ 
  path: 'email-logs', 
  component: EmailLogsComponent,
  canActivate: [AuthGuard]
}
``` 