# Generic Table Component - Usage Examples

## ⚠️ **CORRECT API REFERENCE** (Based on Real Implementation)

### Real Working Example from Companies Component
```html
<!-- From src/app/views/companies/companies.component.html -->
<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               (pageChange)="onPageChange($event)"></generic-table>

<ng-template #menuTemplate let-item>
    <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="openSendEmail(item)">{{ 'company.sendInviteEmail' | translate }}</button>
    </mat-menu>
</ng-template>
```

```typescript
// From src/app/views/companies/companies.component.ts
export class CompaniesComponent {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Company[]>;

  public onPageChange({page, size}: { page: number; size: number }): void {
    this.loadData({ page, size, ...this.filterForm.getRawValue() });
  }

  private loadData(params = {page: 0, size: 10}): void {
    this.companiesDataService.paginatedCompanies(params, params.page, params.size)
      .subscribe(data => {
        this.tableService.updateConfigData(data?.totalPages || 20);
        this.tableConfig$ = this.tableService.getTableConfig();
        this.dataList$ = of(data.content);
        this.cdr.detectChanges();
      });
  }
}
```

## Basic Table Setup

### Simple Data Table
```typescript
export class ProductListComponent implements OnInit {
  tableConfig$ = new BehaviorSubject<TableConfig>({
    columns: [
      {
        key: 'productId',
        header: 'ID',
        visible: true,
        sortable: true,
        width: '80px'
      },
      {
        key: 'productName',
        header: 'Product Name',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        minWidth: '150px'
      },
      {
        key: 'price',
        header: 'Price',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        width: '100px'
      },
      {
        key: 'createdAt',
        header: 'Created Date',
        visible: true,
        templateType: TemplateType.Date,
        dateFormat: 'dd/MM/yyyy HH:mm',
        sortable: true,
        minWidth: '140px'
      }
    ],
    translatePrefix: 'products.table.',
    showCheckboxes: false,
    showEditButton: true,
    pagination: {
      enabled: true,
      serverSide: false
    }
  });

  tableData$ = new BehaviorSubject<Product[]>([]);

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.tableData$.next(products);
    });
  }

  onEdit(product: Product) {
    // Handle edit action
    this.router.navigate(['/products/edit', product.id]);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }) {
    // Handle sorting
    console.log('Sorting by:', event.column, event.direction);
  }
}
```

```html
<!-- Correct API based on real implementation -->
<generic-table
  [config$]="tableConfig$"
  [data$]="tableData$"
  (pageChange)="onPageChange($event)">
</generic-table>
```

## Advanced Examples

### Table with Custom Templates and Actions
```typescript
export class OrderManagementComponent implements OnInit {
  tableConfig$ = new BehaviorSubject<TableConfig>({
    columns: [
      {
        key: 'orderId',
        header: 'Order ID',
        visible: true,
        sortable: true,
        width: '120px'
      },
      {
        key: 'customerName',
        header: 'Customer',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        minWidth: '150px'
      },
      {
        key: 'status',
        header: 'Status',
        visible: true,
        templateType: TemplateType.Custom,
        customTemplate: () => this.statusTemplate,
        sortable: false,
        width: '120px'
      },
      {
        key: 'orderTotal',
        header: 'Total Amount',
        visible: true,
        templateType: TemplateType.Custom,
        customTemplate: () => this.currencyTemplate,
        sortable: true,
        width: '120px'
      },
      {
        key: 'orderDate',
        header: 'Order Date',
        visible: true,
        templateType: TemplateType.Date,
        dateFormat: 'dd MMM yyyy',
        sortable: true,
        minWidth: '120px'
      }
    ],
    translatePrefix: 'orders.table.',
    showCheckboxes: true,
    showEditButton: false,
    showMenu: true,
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 10
    }
  });

  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('currencyTemplate', { static: true }) currencyTemplate!: TemplateRef<any>;
  @ViewChild('actionMenu', { static: true }) actionMenu!: TemplateRef<any>;

  tableData$ = new BehaviorSubject<Order[]>([]);
  selectedOrders: Order[] = [];
  currentPage = 0;

  ngOnInit() {
    this.loadOrders(0);
  }

  onPageChange(event: { page: number; size: number; isServerSide?: boolean }) {
    if (event.isServerSide) {
      this.currentPage = event.page;
      this.loadOrders(event.page);
    }
  }

  onSelectionChange(selectedItems: Order[]) {
    this.selectedOrders = selectedItems;
  }

  onBulkAction(action: string) {
    switch (action) {
      case 'export':
        this.exportOrders(this.selectedOrders);
        break;
      case 'cancel':
        this.cancelOrders(this.selectedOrders);
        break;
    }
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'badge bg-warning',
      'completed': 'badge bg-success',
      'cancelled': 'badge bg-danger',
      'processing': 'badge bg-info'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  private loadOrders(page: number) {
    this.orderService.getOrders({ page, size: 10 }).subscribe(response => {
      this.tableData$.next(response.data);
      this.updatePagination(response.totalPages);
    });
  }

  private updatePagination(totalPages: number) {
    const currentConfig = this.tableConfig$.value;
    this.tableConfig$.next({
      ...currentConfig,
      pagination: {
        ...currentConfig.pagination,
        totalPages
      }
    });
  }
}
```

```html
<generic-table
  [config$]="tableConfig$"
  [data$]="tableData$"
  [menu]="actionMenu"
  (pageChange)="onPageChange($event)"
  (selectedItemsChange)="onSelectionChange($event)">
  
  <!-- Custom Toolbar -->
  <ng-container custom-toolbar>
    <button class="btn btn-outline-primary me-2" 
            [disabled]="selectedOrders.length === 0"
            (click)="onBulkAction('export')">
      <svg cIcon name="cilCloudDownload" class="me-1"></svg>
      Export Selected
    </button>
    <button class="btn btn-outline-danger"
            [disabled]="selectedOrders.length === 0"
            (click)="onBulkAction('cancel')">
      <svg cIcon name="cilX" class="me-1"></svg>
      Cancel Selected
    </button>
  </ng-container>
</generic-table>

<!-- Status Template -->
<ng-template #statusTemplate let-context="context">
  <span [class]="getStatusClass(context.status)">
    {{ context.status | titlecase }}
  </span>
</ng-template>

<!-- Currency Template -->
<ng-template #currencyTemplate let-context="context">
  <span class="fw-bold text-success">
    {{ context.orderTotal | currency:'USD':'symbol':'1.2-2' }}
  </span>
</ng-template>

<!-- Action Menu Template -->
<ng-template #actionMenu let-order>
  <div class="dropdown">
    <button class="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button" data-coreui-toggle="dropdown">
      Actions
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" (click)="viewOrder(order)">View Details</a></li>
      <li><a class="dropdown-item" (click)="editOrder(order)">Edit Order</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item text-danger" (click)="cancelOrder(order)">Cancel Order</a></li>
    </ul>
  </div>
</ng-template>
```

### Hierarchical Data with Custom Service
```typescript
export class CompanyHierarchyComponent extends TableConfigAbstractService<Company> implements OnInit {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    columns: [
      {
        key: 'companyName',
        header: 'Company Name',
        visible: true,
        templateType: TemplateType.Custom,
        customTemplate: () => this.companyNameTemplate,
        sortable: true,
        minWidth: '200px'
      },
      {
        key: 'level',
        header: 'Hierarchy Level',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        width: '120px'
      },
      {
        key: 'parentCompany',
        header: 'Parent Company',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        minWidth: '150px'
      },
      {
        key: 'clientsCount',
        header: 'Total Clients',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        width: '120px'
      },
      {
        key: 'lastActivity',
        header: 'Last Activity',
        visible: true,
        templateType: TemplateType.Date,
        dateFormat: 'dd MMM yyyy',
        sortable: true,
        minWidth: '130px'
      }
    ],
    translatePrefix: 'companies.table.',
    showCheckboxes: false,
    showEditButton: true,
    pagination: {
      enabled: true,
      serverSide: true
    }
  });

  @ViewChild('companyNameTemplate', { static: true }) companyNameTemplate!: TemplateRef<any>;

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.loadCompanies();
  }

  private loadCompanies() {
    this.companyService.getHierarchicalCompanies().subscribe(companies => {
      this.originalDataSubject.next(companies);
    });
  }

  onCompanyRowClick(company: Company) {
    this.router.navigate(['/companies', company.id, 'dashboard']);
  }

  getIndentationLevel(level: number): string {
    return `${level * 20}px`;
  }

  onFilterChange(searchTerm: string) {
    const filterForm = { value: searchTerm };
    this.applyFilter(filterForm);
  }
}
```

```html
<!-- Search and Filter -->
<div class="row mb-3">
  <div class="col-md-4">
    <input type="text" 
           class="form-control" 
           placeholder="Search companies..."
           (input)="onFilterChange($event.target.value)">
  </div>
</div>

<generic-table
  [config$]="getTableConfig()"
  [data$]="dataList$"
  [isRowClickable]="true"
  (onRowClickEvent)="onCompanyRowClick($event)"
  (toggleAction)="editCompany($event)">
</generic-table>

<!-- Company Name with Hierarchy Indentation -->
<ng-template #companyNameTemplate let-context="context">
  <div [style.padding-left]="getIndentationLevel(context.level)">
    <svg cIcon name="cilBuilding" class="me-2 text-muted"></svg>
    <span class="fw-medium">{{ context.companyName }}</span>
    <span *ngIf="context.isParent" class="badge bg-info ms-2">Parent</span>
  </div>
</ng-template>
```

## Real-world Integration Examples from One Sim Portal

### 1. Companies Management (Standard Pattern)
```typescript
// companies.component.ts - Real implementation
export class CompaniesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Company[]>;
  public filterForm: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private tableService: CompaniesTableService,
    private companiesDataService: CompaniesDataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  // Standard pagination pattern
  onPageChange({page, size}: { page: number; size: number }): void {
    this.loadData({
      page,
      size,
      ...this.filterForm.getRawValue()
    });
  }

  // Filter management pattern
  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  // Data loading with feedback pattern
  private loadData(params = {page: 0, size: 10}): void {
    this.companiesDataService.paginatedCompanies(params, params.page, params.size)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableService.updateConfigData(data?.totalPages || 20);
        this.tableConfig$ = this.tableService.getTableConfig();
        this.dataList$ = of(data.content);
        this.cdr.detectChanges();
        
        if (this.filterForm.dirty) {
          this.snackBar.open(
            `Search results loaded successfully. Total elements: ${data.totalElements}`, 
            null, 
            {
              panelClass: 'app-notification-success',
              duration: 1000
            }
          );
        }
      });
  }
}

// companies-table.service.ts - Service configuration
export class CompaniesTableService extends TableConfigAbstractService<Company> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20
    },
    translatePrefix: 'company.',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: true,
    showMenu: true,
    columns: [
      {visible: false, key: 'id', header: 'id'},
      {visible: true, key: 'name', header: 'name'},
      {visible: true, key: 'status', header: 'status'},
      {visible: true, key: 'type', header: 'type'},
      {visible: true, key: 'tags', header: 'tags'},
      {visible: true, key: 'description', header: 'description'}
    ]
  });
}
```

```html
<!-- companies.component.html - Template with custom header -->
<app-header class="os-header-sticky"
            [formGroup]="filterForm"
            [tableConfig$]="tableConfig$"
            (onAddAction)="createCompany()"
            (columnSelectionChange)="onColumnSelectionChanged($event)">
  <ng-container header-custom-inputs>
    <input cFormControl formControlName="name" type="text" 
           placeholder="{{ 'company.name' | translate }}">
    <input cFormControl formControlName="type" type="text" 
           placeholder="{{ 'company.type' | translate }}">
    <button cButton color="secondary" [disabled]="filterForm.pristine" 
            (click)="resetForm()">
      <svg cIcon name="cilReload"></svg>
    </button>
  </ng-container>
</app-header>

<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               (pageChange)="onPageChange($event)">
</generic-table>

<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <button mat-menu-item (click)="openSendEmail(item)">
      {{ 'company.sendInviteEmail' | translate }}
    </button>
  </mat-menu>
</ng-template>
```

### 2. Customers Management (With Row Clicking)
```typescript
// customers.component.ts - With navigation on row click
export class CustomersComponent implements OnInit, OnDestroy {
  // Same base pattern as companies...

  // Row click navigation pattern
  public openCustomerDetails(customer: Customer): void {
    if (customer.type.toUpperCase() === CustomerType.Private.toUpperCase()) {
      this.router.navigate([`home/customers/customer-details/${customer.type}/${customer.id}`]);
    }
  }
}

// customers-table.service.ts - With permission-based configuration
export class CustomersTableService extends TableConfigAbstractService<Customer> {
  private authService = inject(AuthService);
  private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20
    },
    translatePrefix: 'customer.',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: this.isAdmin || this.isSpecial, // Permission-based visibility
    showMenu: true,
    columns: [
      {visible: false, key: 'id', header: 'id'},
      {visible: true, key: 'name', header: 'name'},
      {visible: true, key: 'type', header: 'type'},
      {visible: true, key: 'tags', header: 'tags'},
      {visible: true, key: 'description', header: 'description'}
    ]
  });
}
```

```html
<!-- customers.component.html - With clickable rows -->
<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               [isRowClickable]="true"
               (onRowClickEvent)="openCustomerDetails($event)"
               (pageChange)="onPageChange($event)">
</generic-table>

<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu" 
          (click)="$event.stopPropagation();">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <button *ngIf="item.type.toUpperCase() === CustomerType.Private.toUpperCase()"
            mat-menu-item (click)="openCustomerDetails(item)">
      {{ 'customer.details' | translate }}
    </button>
  </mat-menu>
</ng-template>
```

### 3. Orders Management (Date Templates and Nested Properties)
```typescript
// orders-table.service.ts - With template types and nested properties
export class OrdersTableService extends TableConfigAbstractService<Order> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'order.',
    showCheckboxes: false,
    showEditButton: true,
    showMenu: true,
    columns: [
      {visible: false, key: 'id', header: 'id'},
      {visible: true, key: 'serialNumber', header: 'serialNumber'},
      {visible: true, key: 'description', header: 'description'},
      {
        visible: true,
        templateType: TemplateType.Date,
        dateFormat: 'dd/MM/YYYY',
        key: 'createdDate',
        header: 'createdDate'
      },
      {visible: true, key: 'type', header: 'type'},
      {
        visible: true,
        templateType: TemplateType.Text,
        key: 'fromOwner.name', // Nested property access
        header: 'fromOwner'
      },
      {
        visible: true,
        templateType: TemplateType.Text,
        key: 'toOwner.name', // Nested property access
        header: 'toOwner'
      }
    ]
  });
}
```

### 4. Products Management (Dynamic Custom Columns)
```typescript
// products-table.service.ts - With dynamic column addition
export class ProductsTableService extends TableConfigAbstractService<Package> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'package.',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: true,
    showMenu: true,
    columns: [
      {visible: true, key: 'name', header: 'name'},
      {visible: true, key: 'description', header: 'description'},
      {visible: true, key: 'price', header: 'price'},
      {visible: true, key: 'currency', header: 'currency'}
    ]
  });

  // Dynamic column addition pattern
  public addCustomColumns(parent: any): void {
    const currentConfig = this.tableConfigSubject.value;
    const newConfig = { ...currentConfig, columns: [...currentConfig.columns] };

    if (!newConfig.columns.find(c => c.key === 'status')) {
      newConfig.columns.push({
        visible: true,
        key: 'status',
        header: 'status',
        templateType: TemplateType.Custom,
        customTemplate: () => parent.statusTemplate
      });
    }

    if (!newConfig.columns.find(c => c.key === 'companies')) {
      newConfig.columns.push({
        visible: true,
        key: 'companies',
        header: 'companies',
        templateType: TemplateType.Custom,
        customTemplate: () => parent.companiesTemplate
      });
    }

    this.tableConfigSubject.next(newConfig);
  }
}
```

### 5. Inventory Management (Read-only Table)
```typescript
// inventory-table.service.ts - Read-only configuration
export class InventoryTableService extends TableConfigAbstractService<Resource> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20
    },
    translatePrefix: 'inventory.',
    showCheckboxes: false,
    showEditButton: false, // Read-only table
    showMenu: false,       // No actions
    columns: [
      {visible: true, key: 'iccid', header: 'iccid'},
      {visible: false, key: 'imei', header: 'imei'},
      {visible: false, key: 'imsi', header: 'imsi'},
      {visible: false, key: 'msisdn', header: 'msisdn'},
      {
        visible: true,
        templateType: TemplateType.Text,
        key: 'customer.name', // Nested property
        header: 'customer'
      },
      {
        visible: true,
        templateType: TemplateType.Text,
        key: 'serviceProvider.name', // Nested property
        header: 'provider'
      },
      {visible: true, key: 'status', header: 'status'}
    ]
  });
}
```

### 6. Users Management (Complex Nested Data)
```typescript
// users-table.service.ts - Handling complex nested objects
export class UsersTableService extends TableConfigAbstractService<User> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20
    },
    translatePrefix: 'user.',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: true,
    showMenu: true,
    columns: [
      {visible: true, key: 'loginName', header: 'username'},
      {
        visible: true,
        templateType: TemplateType.Text,
        key: 'accountInfo.externalId', // Deep nested property
        header: 'externalId'
      },
      {
        visible: true,
        templateType: TemplateType.Text,
        key: 'accountInfo.type', // Deep nested property
        header: 'accountType'
      },
      {visible: true, key: 'name', header: 'name'},
      {visible: true, key: 'email', header: 'email'}
    ]
  });

  // Example of actual data structure this handles:
  // {
  //   "id": "9b3e9dcd-e55f-4861-b85e-1603a836baa1",
  //   "name": "ILYA KOROLKOV",
  //   "loginName": "29935961",
  //   "email": "mplaneta-tour@yandex.ru",
  //   "phone": "+79109495261",
  //   "createdAt": "2024-12-28T05:30:52.236639Z",
  //   "createdBy": "anexit",
  //   "accountInfo": {
  //     "id": "035a1d27-0dcf-41cb-96e8-80d512353888",
  //     "name": "KOROLKOV ILYA",
  //     "type": "CUSTOMER",
  //     "externalId": "29935961"
  //   }
  // }
}
```

## Standard Patterns Identified

### Common Architecture Pattern
All table implementations in One Sim Portal follow this consistent structure:

```typescript
// 1. Component Structure
export class [Entity]Component implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Entity[]>;
  public filterForm: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private tableService: [Entity]TableService,
    private [entity]DataService: [Entity]DataService,
    // Optional dependencies for dialogs, routing, etc.
  ) {}

  ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

// 2. Service Structure  
export class [Entity]TableService extends TableConfigAbstractService<Entity> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: { enabled: true, serverSide: true, totalPages: 20 },
    translatePrefix: '[entity].',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: true,
    showMenu: true,
    columns: [/* column definitions */]
  });
}
```

### Standard Column Configuration Patterns

#### 1. Basic Column Types
```typescript
// Hidden ID column (always included)
{visible: false, key: 'id', header: 'id'}

// Simple text columns
{visible: true, key: 'name', header: 'name'}
{visible: true, key: 'description', header: 'description'}

// Date columns with formatting
{
  visible: true,
  templateType: TemplateType.Date,
  dateFormat: 'dd/MM/YYYY',
  key: 'createdDate',
  header: 'createdDate'
}

// Nested property access
{
  visible: true,
  templateType: TemplateType.Text,
  key: 'owner.name', // Dot notation for nested properties
  header: 'owner'
}
```

#### 2. Permission-Based Configuration
```typescript
export class TableService extends TableConfigAbstractService<T> {
  private authService = inject(AuthService);
  private hasSpecialAccess = this.authService.hasPermission(SPECIAL_PERMISSION);
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    showAddButton: this.isAdmin || this.hasSpecialAccess,
    showEditButton: this.hasSpecialAccess,
    // Other configuration...
  });
}
```

### Standard Component Patterns

#### 1. Data Loading Pattern
```typescript
private loadData(params = {page: 0, size: 10}): void {
  this.[entity]DataService.paginated[Entities](params, params.page, params.size)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tableService.updateConfigData(data?.totalPages || 20);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = of(data.content);
      this.cdr.detectChanges();
      
      // Optional: User feedback for filtered results
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

#### 2. Filter Setup Pattern
```typescript
private setupFilters(): void {
  this.filterForm.valueChanges.pipe(
    debounceTime(700), // Standard debounce time
    takeUntil(this.unsubscribe$)
  ).subscribe(() => {
    this.applyFilter();
  });
}

private initFormControls(): void {
  this.filterForm = new FormGroup({
    // Entity-specific filter fields
    name: new FormControl(null),
    // Add other relevant fields...
  });
}
```

#### 3. Action Patterns
```typescript
// Row click navigation (for detail views)
public open[Entity]Details(item: Entity): void {
  this.router.navigate([`path/to/${item.type}/${item.id}`]);
}

// Dialog-based creation/editing
public create[Entity](): void {
  const dialogRef = this.dialog.open(Edit[Entity]Component, {
    width: '650px',
    data: {}
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.[entity]DataService.create(result).subscribe(() => {
        this.loadData();
      });
    }
  });
}
```

### Template Patterns

#### Standard Header Pattern
```html
<app-header class="os-header-sticky"
            [formGroup]="filterForm"
            [tableConfig$]="tableConfig$"
            (onAddAction)="create[Entity]()"
            (columnSelectionChange)="onColumnSelectionChanged($event)">
  <ng-container header-custom-inputs>
    <!-- Entity-specific filter inputs -->
    <input cFormControl formControlName="name" type="text" 
           placeholder="{{ '[entity].name' | translate }}">
    <button cButton color="secondary" [disabled]="filterForm.pristine" 
            (click)="resetForm()">
      <svg cIcon name="cilReload"></svg>
    </button>
  </ng-container>
</app-header>
```

#### Standard Table Pattern
```html
<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               [isRowClickable]="hasDetailView"
               (onRowClickEvent)="open[Entity]Details($event)"
               (pageChange)="onPageChange($event)">
</generic-table>

<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu" 
          (click)="$event.stopPropagation();">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <!-- Entity-specific menu items -->
    <button mat-menu-item (click)="doAction(item)">
      {{ '[entity].action' | translate }}
    </button>
  </mat-menu>
</ng-template>
```

### Configuration Standards

#### Translation Prefixes
- Companies: `'company.'`
- Customers: `'customer.'`
- Orders: `'order.'`
- Products: `'package.'`
- Users: `'user.'`
- Inventory: `'inventory.'`

#### Default Pagination
```typescript
pagination: {
  enabled: true,
  serverSide: true,
  totalPages: 20 // Default fallback
}
```

#### Standard Column Visibility
- ID column: Always `visible: false`
- Name/Title: Always `visible: true`
- Status: Usually `visible: true`
- Timestamps: Often `visible: true` with date formatting
- Secondary info: Often `visible: false` by default

### Best Practices Identified

1. **Memory Management**: Always use `takeUntil(this.unsubscribe$)` pattern
2. **Change Detection**: Manual `this.cdr.detectChanges()` after data updates
3. **User Feedback**: Show snackbar notifications for search results
4. **Filter Debouncing**: Standard 700ms debounce for filter inputs
5. **Error Handling**: Fallback values (e.g., `totalPages || 20`)
6. **Event Propagation**: `$event.stopPropagation()` in menu buttons
7. **Permission Integration**: Check permissions in service constructors 