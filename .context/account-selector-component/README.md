# Account Selector Component

## Overview

The `account-selector` component is a specialized form control designed for administrative interfaces in the One Sim Portal application. It provides a dropdown selection interface for choosing from available owner accounts, with integrated data loading and user guidance features.

## Component Architecture

### Core Files
- `account-selector.component.ts` - Main component logic (92 lines)
- `account-selector.component.html` - Template with Material Design select (16 lines)  
- `account-selector.component.scss` - Custom styling with responsive design (40 lines)

### Key Dependencies
- Angular Material (MatSelectModule, MatFormFieldModule, MatIconModule)
- Angular Translation (ngx-translate)
- Custom services (AccountsDataService)
- Reactive Forms (FormControl)

## Features

### Core Functionality
- **Account Loading**: Automatically fetches available owner accounts
- **Dropdown Selection**: Material Design select interface
- **Event Emission**: Emits selected account with enhanced metadata
- **Helper Text**: Displays guidance message when no account is selected
- **Responsive Design**: Mobile-friendly interface with adaptive styling

### User Experience
- **Visual Feedback**: Info icon with helper text
- **Clear Labeling**: Translated labels and placeholders
- **Accessibility**: Material Design compliance
- **Loading States**: Handles async data loading gracefully

### Technical Features
- **Memory Management**: Proper cleanup with takeUntil pattern
- **Change Detection**: OnPush strategy for performance
- **Form Integration**: Uses ReactiveFormsModule with FormControl
- **Standalone Component**: Self-contained with all necessary imports

## Component Interface

### Input Properties
```typescript
@Input() helperText: string = 'common.selectAccountFirst';
```

### Output Events
```typescript
@Output() accountSelected = new EventEmitter<Account>();
```

### Public Properties
```typescript
public accountControl = new FormControl<string | null>(null);
public accounts: Account[] = [];
public selectedAccountId: string | null = null;
```

### Public Methods
```typescript
public getAccountDisplayName(account: Account): string;
```

## Data Flow

### Account Loading Process
```mermaid
graph TD
    A[Component Init] --> B[loadAccounts()]
    B --> C[AccountsDataService.ownerAccounts()]
    C --> D[Update accounts array]
    D --> E[markForCheck()]
    
    F[User Selection] --> G[accountControl.valueChanges]
    G --> H[onAccountSelected()]
    H --> I[Find selected account]
    I --> J[Enhance with isAdmin flag]
    J --> K[Emit accountSelected event]
```

### Account Selection Logic
```typescript
private onAccountSelected(accountId: string): void {
  this.selectedAccountId = accountId;
  const selectedAccount = this.accounts.find(account => account.id === accountId);
  if (selectedAccount) {
    selectedAccount['isAdmin'] = selectedAccount.name === 'admin';
    this.accountSelected.emit(selectedAccount);
  }
}
```

## Usage Patterns

### Basic Implementation
```typescript
export class AdminComponent {
  public selectedAccount: Account | null = null;

  onAccountSelected(account: Account): void {
    this.selectedAccount = account;
    console.log('Selected account:', account);
    console.log('Is admin account:', account.isAdmin);
  }
}
```

```html
<app-account-selector 
  [helperText]="'your.custom.helper.text'"
  (accountSelected)="onAccountSelected($event)">
</app-account-selector>
```

### Conditional Display (Admin Only)
```typescript
export class SettingsComponent {
  public isAdmin: boolean;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  onAccountSelected(account: Account): void {
    if (account.isAdmin) {
      // Handle admin account selection
      this.showAdminWarning();
    } else {
      // Handle regular account selection
      this.loadAccountData(account.id);
    }
  }
}
```

```html
<app-account-selector *ngIf="isAdmin"
                      [helperText]="'admin.selectAccount'"
                      (accountSelected)="onAccountSelected($event)">
</app-account-selector>
```

## Styling System

### Component Styling
```scss
.account-selector {
  background: #fff;
  border: 1px solid var(--ag-border-color);
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  padding: 24px;
  
  .helper-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ag-secondary-color, #666);
    font-size: 14px;
  }
}
```

### Responsive Design
```scss
@media screen and (max-width: 768px) {
  .account-selector {
    max-width: 100%;
    margin: 0 16px;
    padding: 16px;
  }
}
```

## Integration with Application

### Common Use Cases
- **Email Configurations**: Select account for email template management
- **Payment Gateway Settings**: Choose account for payment configuration
- **Domain Management**: Select owner account for domain settings
- **Multi-tenant Administration**: Switch between different account contexts

### Service Integration
```typescript
constructor(
  private accountsService: AccountsDataService,
  private cdr: ChangeDetectorRef
) {}

private loadAccounts(): void {
  this.accountsService.ownerAccounts()
    .pipe(takeUntil(this.destroy$))
    .subscribe(accounts => {
      this.accounts = accounts;
      this.cdr.markForCheck();
    });
}
```

## Account Enhancement Logic

### Admin Detection
The component automatically enhances selected accounts with admin status:

```typescript
selectedAccount['isAdmin'] = selectedAccount.name === 'admin';
```

### Display Name Resolution
```typescript
public getAccountDisplayName(account: Account): string {
  return account.name || account.email || account.id;
}
```

## Performance Considerations

### Change Detection
- Uses OnPush strategy for optimal performance
- Manual change detection trigger with `markForCheck()`
- Efficient subscription management with `takeUntil()`

### Memory Management
```typescript
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Accessibility Features

- **Material Design Compliance**: Follows Material Design accessibility guidelines
- **Screen Reader Support**: Proper labeling and aria attributes
- **Keyboard Navigation**: Full keyboard accessibility through Material Select
- **Focus Management**: Appropriate focus states and indicators

## Translation Support

### Default Translations
- `domains.ownerAccount` - Field label
- `common.selectAccountFirst` - Default helper text
- Custom helper text via `helperText` input

### Usage in Templates
```html
<mat-label>{{ 'domains.ownerAccount' | translate }}</mat-label>
{{ helperText | translate }}
```

## Error Handling

### Graceful Degradation
- Handles empty account lists gracefully
- Provides fallback display names
- Safe property access with optional chaining

### Service Error Handling
```typescript
this.accountsService.ownerAccounts()
  .pipe(
    takeUntil(this.destroy$),
    catchError(error => {
      console.error('Failed to load accounts:', error);
      return of([]);
    })
  )
  .subscribe(accounts => {
    this.accounts = accounts;
    this.cdr.markForCheck();
  });
```

## Future Enhancements

### Potential Improvements
- **Loading States**: Add spinner during account loading
- **Error Feedback**: Display error messages for failed loads
- **Account Filtering**: Add search/filter functionality
- **Caching**: Implement account data caching
- **Bulk Selection**: Support for multiple account selection
- **Account Hierarchy**: Display nested account relationships

## Maintenance Notes

- **Standalone Component**: Self-contained with minimal dependencies
- **Service Dependency**: Requires AccountsDataService for data fetching
- **Permission Integration**: Works with application's permission system
- **Translation Ready**: Fully internationalized
- **Responsive**: Mobile-friendly design 