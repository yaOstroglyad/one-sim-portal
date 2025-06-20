# Account Selector Component - Real Usage Examples

## Real-world Examples from One Sim Portal

### 1. Email Configurations Management

This example shows how account selector is used in the email configurations module to allow admins to manage email templates for different accounts.

```typescript
// email-configurations.component.ts
export class EmailConfigurationsComponent implements OnInit {
  public templateTypes$: Observable<string[]>;
  public isAdmin: boolean = false;
  public selectedAccountId: string | null = null;
  public selectedTemplateType: string | null = null;

  constructor(
    private whiteLabelService: WhiteLabelDataService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.templateTypes$ = this.whiteLabelService.emailTemplateTypes();
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  // Handle account selection event
  public onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    
    // If template type was already selected, reapply selection
    if (this.selectedTemplateType) {
      this.selectTemplateType(this.selectedTemplateType);
    }
  }

  // Template type selection with account validation
  public selectTemplateType(type: string): void {
    if (this.isAdmin && !this.selectedAccountId) {
      this.snackBar.open('Please select an account first', null, {
        duration: 3000,
        panelClass: 'app-notification-warning'
      });
      return;
    }
    this.selectedTemplateType = type;
  }
}
```

```html
<!-- email-configurations.component.html -->
<div class="container">
  
  <!-- Account selector - only shown for admin users -->
  <app-account-selector *ngIf="isAdmin"
                        [helperText]="'email.configurations.selectAccountFirst'"
                        (accountSelected)="onAccountSelected($event)">
  </app-account-selector>

  <!-- Template types grid -->
  <div class="template-types-grid mx-3 mb-3">
    <div class="template-type-card" *ngFor="let type of templateTypes$ | async">
      <mat-card
        (click)="selectTemplateType(type)"
        [class.selected]="selectedTemplateType === type"
        [class.disabled]="isAdmin && !selectedAccountId">
        <mat-card-header>
          <mat-card-title>{{ type | translate }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-icon>email</mat-icon>
        </mat-card-content>
      </mat-card>
    </div>
  </div>

  <!-- Template grid component - receives selected account ID -->
  <ng-container *ngIf="selectedTemplateType">
    <app-template-type-grid
      [type]="selectedTemplateType"
      [ownerAccountId]="selectedAccountId">
    </app-template-type-grid>
  </ng-container>
</div>
```

### 2. Payment Gateway Configuration

This example demonstrates usage in payment gateway settings, including special handling for admin accounts.

```typescript
// payment-gateway-table.component.ts
export class PaymentGatewayTableComponent implements OnInit, OnDestroy {
  public isAdmin: boolean;
  public selectedAccount: Account | null = null;
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<any[]>;
  public strategyTypes$: Observable<string[]>;

  constructor(
    private authService: AuthService,
    private paymentGatewayService: PaymentGatewayService,
    private dialog: MatDialog
  ) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      // Non-admin users load their own payment gateways immediately
      this.loadPaymentGateways();
    }
  }

  // Handle account selection with admin account special case
  public onAccountSelected(account: Account): void {
    this.selectedAccount = account;
    
    if (!account.isAdmin) {
      // Load payment gateways for regular accounts
      this.loadPaymentGateways(account.id);
    }
    // For admin accounts, show warning message instead of loading data
  }

  private loadPaymentGateways(accountId?: string): void {
    this.paymentGatewayService.list(accountId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableService.updateTableData(data);
        this.tableConfig$ = this.tableService.getTableConfig();
        this.dataList$ = this.tableService.dataList$;
      });

    // Load available strategy types (filtered by existing ones)
    this.strategyTypes$ = combineLatest([
      this.paymentGatewayService.list(accountId),
      this.paymentGatewayService.getPaymentStrategyTypes()
    ]).pipe(
      switchMap(([metadata, types]) => {
        const filteredTypes = types.filter(type =>
          !metadata.some(meta => meta.name === type)
        );
        return of(filteredTypes);
      })
    );
  }

  public edit(item: PaymentStrategy): void {
    const dialogRef = this.dialog.open(EditPaymentGatewayComponent, {
      width: '650px',
      data: {
        ...item,
        accountId: this.selectedAccount?.id // Pass selected account ID to dialog
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        // Reload data after editing
        this.loadPaymentGateways(this.selectedAccount?.id);
      });
  }
}
```

```html
<!-- payment-gateway-table.component.html -->
<ng-container *ngIf="!isAdmin; else forAdmin">
  <!-- Non-admin view - no account selector needed -->
  <div class="d-flex justify-content-between align-items-center mb-3 mx-3">
    <mat-hint class="hint mb-1">
      <mat-icon fontIcon="info_outline"></mat-icon>
      {{ 'paymentGateway.hint' | translate }}
    </mat-hint>
    <!-- Setup new strategy dropdown -->
  </div>
  
  <generic-table [config$]="tableConfig$"
                 [menu]="menuTemplate"
                 [data$]="dataList$">
  </generic-table>
</ng-container>

<!-- Admin view template -->
<ng-template #forAdmin>
  <div class="container">
    <!-- Account selector for admin users -->
    <app-account-selector
      [helperText]="'paymentGateway.selectAccountFirst'"
      (accountSelected)="onAccountSelected($event)">
    </app-account-selector>

    <!-- Content shown after account selection -->
    <ng-container *ngIf="selectedAccount">
      <!-- Special warning for admin account selection -->
      <div *ngIf="selectedAccount.isAdmin" class="admin-account-message mx-3">
        <mat-icon color="warn">warning</mat-icon>
        <span>{{ 'paymentGateway.adminAccountWarning' | translate }}</span>
      </div>

      <!-- Regular content for non-admin accounts -->
      <ng-container *ngIf="!selectedAccount.isAdmin">
        <div class="d-flex justify-content-between align-items-center mb-3 mx-3">
          <mat-hint class="hint mb-1">
            <mat-icon fontIcon="info_outline"></mat-icon>
            {{ 'paymentGateway.hint' | translate }}
          </mat-hint>
          <!-- Setup new strategy dropdown -->
        </div>

        <generic-table [config$]="tableConfig$"
                       [menu]="menuTemplate"
                       [data$]="dataList$">
        </generic-table>
      </ng-container>
    </ng-container>
  </div>
</ng-template>
```

## Common Usage Patterns

### Pattern 1: Admin-Only Account Selection

This is the most common pattern where the account selector is only shown to admin users.

```typescript
export class AdminSettingsComponent {
  public isAdmin: boolean;
  public selectedAccount: Account | null = null;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  onAccountSelected(account: Account): void {
    this.selectedAccount = account;
    // Reload component data for selected account
    this.loadDataForAccount(account);
  }

  private loadDataForAccount(account: Account): void {
    // Implementation specific to each component
  }
}
```

```html
<app-account-selector *ngIf="isAdmin"
                      [helperText]="'settings.selectAccountFirst'"
                      (accountSelected)="onAccountSelected($event)">
</app-account-selector>

<!-- Content that depends on account selection -->
<ng-container *ngIf="!isAdmin || selectedAccount">
  <!-- Component content here -->
</ng-container>
```

### Pattern 2: Account Selection with Validation

This pattern includes validation to ensure an account is selected before proceeding.

```typescript
export class ValidatedSettingsComponent {
  public selectedAccount: Account | null = null;
  public isAdmin: boolean;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  onAccountSelected(account: Account): void {
    this.selectedAccount = account;
  }

  performAction(): void {
    if (this.isAdmin && !this.selectedAccount) {
      this.snackBar.open(
        'Please select an account first',
        null,
        {
          duration: 3000,
          panelClass: 'app-notification-warning'
        }
      );
      return;
    }
    
    // Proceed with action
    this.executeAction();
  }

  private executeAction(): void {
    const accountId = this.selectedAccount?.id;
    // Use accountId in service calls
  }
}
```

### Pattern 3: Account Selection with Content Filtering

This pattern shows/hides content based on account selection and account type.

```typescript
export class ContentFilteringComponent {
  public selectedAccount: Account | null = null;
  public isAdmin: boolean;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  onAccountSelected(account: Account): void {
    this.selectedAccount = account;
  }

  get shouldShowContent(): boolean {
    if (!this.isAdmin) return true;
    return this.selectedAccount && !this.selectedAccount.isAdmin;
  }

  get shouldShowAdminWarning(): boolean {
    return this.selectedAccount?.isAdmin || false;
  }
}
```

```html
<app-account-selector *ngIf="isAdmin"
                      [helperText]="'component.selectAccount'"
                      (accountSelected)="onAccountSelected($event)">
</app-account-selector>

<!-- Admin account warning -->
<div *ngIf="shouldShowAdminWarning" class="admin-warning">
  <mat-icon color="warn">warning</mat-icon>
  <span>{{ 'component.adminAccountWarning' | translate }}</span>
</div>

<!-- Main content -->
<div *ngIf="shouldShowContent">
  <!-- Component content here -->
</div>
```

## Integration with Services

### Service Call Pattern

Most components pass the selected account ID to service calls:

```typescript
export class ServiceIntegratedComponent {
  private selectedAccountId: string | null = null;

  onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    this.loadData();
  }

  private loadData(): void {
    // Pass account ID to service methods
    this.dataService.getData(this.selectedAccountId)
      .subscribe(data => {
        // Handle response
      });
  }

  saveData(formData: any): void {
    const payload = {
      ...formData,
      accountId: this.selectedAccountId
    };
    
    this.dataService.save(payload)
      .subscribe(response => {
        // Handle response
      });
  }
}
```

### Multi-Component Communication

In complex views, account selection might affect multiple child components:

```typescript
export class ParentComponent {
  public selectedAccountId: string | null = null;

  onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
    // All child components will receive the new account ID
  }
}
```

```html
<app-account-selector (accountSelected)="onAccountSelected($event)">
</app-account-selector>

<app-child-component-1 [accountId]="selectedAccountId">
</app-child-component-1>

<app-child-component-2 [accountId]="selectedAccountId">
</app-child-component-2>
```

## Error Handling Examples

### Handling Account Loading Errors

```typescript
export class ErrorHandlingComponent implements OnInit {
  public accountLoadError = false;

  ngOnInit(): void {
    // Account selector handles errors internally, but you can
    // add additional error handling if needed
  }

  onAccountSelected(account: Account): void {
    this.accountLoadError = false;
    // Proceed with normal flow
  }

  retryAccountLoading(): void {
    // Trigger account selector to reload
    // This would require additional implementation in the selector component
  }
}
```

### Handling Invalid Account Selection

```typescript
export class ValidationComponent {
  onAccountSelected(account: Account): void {
    if (!account || !account.id) {
      console.error('Invalid account selected');
      return;
    }

    if (account.isAdmin && this.requiresNonAdminAccount()) {
      this.showAdminNotAllowedMessage();
      return;
    }

    this.proceedWithAccount(account);
  }

  private requiresNonAdminAccount(): boolean {
    // Component-specific logic
    return true;
  }

  private showAdminNotAllowedMessage(): void {
    // Show appropriate message
  }

  private proceedWithAccount(account: Account): void {
    // Continue with valid account
  }
}
```

## Custom Helper Text Examples

### Dynamic Helper Text

```typescript
export class DynamicHelperComponent {
  public helperText: string = 'common.selectAccountFirst';

  constructor(private authService: AuthService) {
    if (this.authService.hasSpecialPermission()) {
      this.helperText = 'special.selectAccountForAdvancedFeatures';
    }
  }
}
```

```html
<app-account-selector [helperText]="helperText"
                      (accountSelected)="onAccountSelected($event)">
</app-account-selector>
```

### Context-Specific Helper Text

```typescript
export class ContextualComponent {
  public getHelperText(): string {
    const context = this.getCurrentContext();
    switch (context) {
      case 'email':
        return 'email.selectAccountForTemplates';
      case 'payment':
        return 'payment.selectAccountForGateways';
      case 'domain':
        return 'domain.selectAccountForManagement';
      default:
        return 'common.selectAccountFirst';
    }
  }

  private getCurrentContext(): string {
    // Determine context based on route or component state
    return 'email';
  }
}
```

```html
<app-account-selector [helperText]="getHelperText()"
                      (accountSelected)="onAccountSelected($event)">
</app-account-selector>
``` 