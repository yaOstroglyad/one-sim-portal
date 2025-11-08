# Generic Table Component - Usage Standards

## Quick Reference for Development Team

### Standard File Structure for Table Features
```
src/app/views/[entity]/
├── [entity].component.ts          # Main component with standard patterns
├── [entity].component.html        # Template with app-header + generic-table
├── [entity]-table.service.ts      # Service extending TableConfigAbstractService
├── edit-[entity]/                 # Optional: Edit dialog component
└── [entity]-routing.module.ts     # Optional: Routing configuration
```

### Mandatory Component Pattern
```typescript
export class [Entity]Component implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();           // REQUIRED: Memory cleanup
  public tableConfig$: BehaviorSubject<TableConfig>;    // REQUIRED: Table config
  public dataList$: Observable<Entity[]>;               // REQUIRED: Data stream
  public filterForm: FormGroup;                         // REQUIRED: Filter form

  constructor(
    private cdr: ChangeDetectorRef,                      // REQUIRED: Change detection
    private tableService: [Entity]TableService,         // REQUIRED: Table service
    private [entity]DataService: [Entity]DataService,   // REQUIRED: Data service
    // Optional: MatDialog, Router, MatSnackBar
  ) {}

  // REQUIRED lifecycle methods
  ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // REQUIRED pagination handler
  onPageChange({page, size}: { page: number; size: number }): void {
    this.loadData({ page, size, ...this.filterForm.getRawValue() });
  }
}
```

### Mandatory Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]TableService extends TableConfigAbstractService<Entity> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20              // REQUIRED: Default fallback
    },
    translatePrefix: '[entity].',  // REQUIRED: Match translation keys
    showCheckboxes: false,         // STANDARD: Usually false
    showEditButton: true,          // STANDARD: Usually true
    showAddButton: true,           // STANDARD: Check permissions if needed
    showMenu: true,                // STANDARD: Usually true
    columns: [
      {visible: false, key: 'id', header: 'id'},  // REQUIRED: Hidden ID
      // Add entity-specific columns
    ]
  });
}
```

### Standard Column Types
```typescript
// Required ID column (always first)
{visible: false, key: 'id', header: 'id'}

// Standard text column
{visible: true, key: 'name', header: 'name'}

// Date column with formatting
{
  visible: true,
  templateType: TemplateType.Date,
  dateFormat: 'dd/MM/YYYY',
  key: 'createdDate',
  header: 'createdDate'
}

// Nested property column
{
  visible: true,
  templateType: TemplateType.Text,
  key: 'owner.name',
  header: 'owner'
}

// Custom template column
{
  visible: true,
  templateType: TemplateType.Custom,
  customTemplate: () => this.statusTemplate,
  key: 'status',
  header: 'status'
}
```

### Standard Template Pattern
```html
<!-- REQUIRED: Header with filters -->
<app-header class="os-header-sticky"
            [formGroup]="filterForm"
            [tableConfig$]="tableConfig$"
            (onAddAction)="create[Entity]()"
            (columnSelectionChange)="onColumnSelectionChanged($event)">
  <ng-container header-custom-inputs>
    <!-- Entity-specific filters -->
    <input cFormControl formControlName="name" type="text" 
           placeholder="{{ '[entity].name' | translate }}">
    <button cButton color="secondary" [disabled]="filterForm.pristine" 
            (click)="resetForm()">
      <svg cIcon name="cilReload"></svg>
    </button>
  </ng-container>
</app-header>

<!-- REQUIRED: Generic table -->
<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               [isRowClickable]="hasDetailView"
               (onRowClickEvent)="open[Entity]Details($event)"
               (pageChange)="onPageChange($event)">
</generic-table>

<!-- STANDARD: Menu template -->
<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu" 
          (click)="$event.stopPropagation();">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <button mat-menu-item (click)="doAction(item)">
      {{ '[entity].action' | translate }}
    </button>
  </mat-menu>
</ng-template>
```

### Required Methods
```typescript
// REQUIRED: Form initialization
private initFormControls(): void {
  this.filterForm = new FormGroup({
    // Entity-specific controls
  });
}

// REQUIRED: Filter setup with standard debounce
private setupFilters(): void {
  this.filterForm.valueChanges.pipe(
    debounceTime(700),              // STANDARD: 700ms debounce
    takeUntil(this.unsubscribe$)    // REQUIRED: Memory cleanup
  ).subscribe(() => {
    this.applyFilter();
  });
}

// REQUIRED: Data loading pattern
private loadData(params = {page: 0, size: 10}): void {
  this.[entity]DataService.paginated[Entities](params, params.page, params.size)
    .pipe(takeUntil(this.unsubscribe$))  // REQUIRED: Memory cleanup
    .subscribe(data => {
      this.tableService.updateConfigData(data?.totalPages || 20);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = of(data.content);
      this.cdr.detectChanges();        // REQUIRED: Manual change detection
      
      // STANDARD: User feedback for searches
      if (this.filterForm.dirty) {
        this.snackBar.open(
          `Search results loaded successfully. Total elements: ${data.totalElements}`,
          null,
          { panelClass: 'app-notification-success', duration: 1000 }
        );
      }
    });
}
```

### Standard Configuration Values

#### Translation Prefixes (Must Match)
- Companies: `'company.'`
- Customers: `'customer.'`
- Orders: `'order.'`
- Products: `'package.'`
- Users: `'user.'`
- Inventory: `'inventory.'`

#### Standard Feature Flags
```typescript
showCheckboxes: false,     // Usually false unless bulk operations needed
showEditButton: true,      // Usually true for CRUD operations
showAddButton: true,       // Check permissions if needed
showMenu: true,           // Usually true for additional actions
```

#### Standard Pagination
```typescript
pagination: {
  enabled: true,           // Always enabled
  serverSide: true,        // Always server-side
  totalPages: 20          // Default fallback value
}
```

### Permission Integration Pattern
```typescript
export class [Entity]TableService extends TableConfigAbstractService<Entity> {
  private authService = inject(AuthService);
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  private hasSpecialAccess = this.authService.hasPermission(SPECIAL_PERMISSION);

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    showAddButton: this.isAdmin || this.hasSpecialAccess,
    showEditButton: this.hasSpecialAccess,
    // Other configuration...
  });
}
```

### Memory Management (CRITICAL)
```typescript
export class [Entity]Component implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  ngOnDestroy(): void {
    this.unsubscribe$.next();      // Signal completion
    this.unsubscribe$.complete();  // Complete subject
  }

  // Use in ALL subscriptions
  someObservable$.pipe(
    takeUntil(this.unsubscribe$)   // REQUIRED: Prevent memory leaks
  ).subscribe(...);
}
```

### Error Handling Standards
```typescript
// REQUIRED: Fallback values
data?.totalPages || 20
data?.content || []

// STANDARD: Error notifications
.subscribe({
  next: (data) => {
    // Success handling
  },
  error: (error) => {
    this.snackBar.open(
      'Error loading data',
      null,
      { panelClass: 'app-notification-error', duration: 3000 }
    );
  }
});
```

### Performance Requirements
- ✅ Use `ChangeDetectionStrategy.OnPush`
- ✅ Call `this.cdr.detectChanges()` after data updates
- ✅ Use `takeUntil()` for all subscriptions
- ✅ Implement `trackBy` for large datasets
- ✅ Use 700ms debounce for filters

### Common Mistakes to Avoid
❌ Forgetting `takeUntil()` in subscriptions
❌ Not calling `cdr.detectChanges()` after data updates
❌ Missing `$event.stopPropagation()` in menu buttons
❌ Incorrect translation prefix naming
❌ Not providing fallback values for pagination
❌ Missing `unsubscribe$` cleanup in `ngOnDestroy` 