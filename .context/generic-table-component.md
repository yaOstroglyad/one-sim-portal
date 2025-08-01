# Generic Table Component Documentation

## Overview
The Generic Table Component is a comprehensive, reusable table solution for the Angular eSIM portal application. It provides standardized table functionality including sorting, pagination, filtering, column visibility management, and permission-based controls.

## Architecture

### Core Components
1. **GenericTableComponent** - The main table component
2. **TableConfigAbstractService** - Abstract service for table configuration management
3. **HeaderComponent** - Table header with filters and controls
4. **PaginationComponent** - Table pagination controls

### Service Pattern
Each table implementation follows a consistent service pattern extending `TableConfigAbstractService<T>`:

```typescript
@Injectable()
export class ExampleTableService extends TableConfigAbstractService<DataType> {
  private authService = inject(AuthService);
  private hasPermission = this.authService.hasPermission(REQUIRED_PERMISSION);

  public originalDataSubject = new BehaviorSubject<DataType[]>([]);
  public dataList$: Observable<DataType[]> = this.originalDataSubject.asObservable();
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    // Configuration here
  });

  constructor() {
    super();
  }

  public updateTableData(data: DataType[]): void {
    this.originalDataSubject.next(data);
  }
}
```

## TableConfig Interface

### Main Configuration Properties

```typescript
interface TableConfig {
  columns: TableColumnConfig[];
  translatePrefix?: string;
  showCheckboxes?: boolean;
  showEditButton?: boolean;
  showAddButton?: boolean;
  showMenu?: boolean;
  pagination?: PaginationConfig;
}
```

#### Required Properties
- **`columns`**: Array of column configurations

#### Optional Properties
- **`translatePrefix`**: Translation key prefix (e.g., 'customer.' for 'customer.name')
- **`showCheckboxes`**: Enable row selection with checkboxes
- **`showEditButton`**: Show edit button in actions column (mutually exclusive with showMenu)
- **`showAddButton`**: Show add button in header toolbar
- **`showMenu`**: Show dropdown menu in actions column (preferred over showEditButton)

### Translation System

The `translatePrefix` property enables automatic translation of column headers:

```typescript
// With translatePrefix: 'customer.'
{
  translatePrefix: 'customer.',
  columns: [
    { key: 'name', header: 'name' }, // Translates to 'customer.name'
    { key: 'type', header: 'type' }  // Translates to 'customer.type'
  ]
}
```

Translation files should contain:
```json
{
  "customer": {
    "name": "Customer Name",
    "type": "Customer Type"
  }
}
```

### Pagination Configuration

```typescript
interface PaginationConfig {
  enabled: boolean;           // Enable/disable pagination
  serverSide: boolean;        // Server-side vs client-side pagination
  page?: number;              // Current page number (0-based)
  totalPages?: number;        // Total number of pages
  totalItems?: number;        // Total number of items
  size?: number;              // Items per page
  showPageSizeSelector?: boolean;  // Show page size dropdown
  pageSizeOptions?: number[];      // Available page sizes [10, 25, 50, 100]
}
```

**Examples:**
```typescript
// Client-side pagination (for small datasets)
pagination: {
  enabled: false,
  serverSide: false
}

// Server-side pagination (for large datasets)
pagination: {
  enabled: true,
  serverSide: true,
  totalPages: 50,
  totalItems: 1250,
  size: 25,
  showPageSizeSelector: true,
  pageSizeOptions: [10, 25, 50, 100]
}
```

## Column Configuration

### TableColumnConfig Interface

```typescript
interface TableColumnConfig {
  key: string;                    // Property key in data object (required)
  header: string;                 // Column header text (required)
  visible: boolean;              // Show/hide column (required)
  templateType?: TemplateType;    // Data rendering type
  dateFormat?: string;            // Date format for date columns
  customTemplate?: () => TemplateRef<any>; // Custom template function
  sortable?: boolean;             // Enable column sorting
  sortDirection?: 'asc' | 'desc' | null; // Current sort direction
  class?: string;                 // CSS classes for column cells
  width?: string;                 // Fixed column width
  minWidth?: string;              // Minimum column width
}
```

### Template Types

```typescript
enum TemplateType {
  Text = 'text',     // Default text display
  Date = 'date',     // Date formatting with optional dateFormat
  Time = 'time',     // Time formatting
  Custom = 'custom'  // Custom template rendering
}
```

### Column Examples

```typescript
columns: [
  // Hidden ID column
  {
    visible: false,
    key: 'id',
    header: 'id'
  },
  
  // Basic text column with sorting
  {
    visible: true,
    key: 'name',
    header: 'name',
    templateType: TemplateType.Text,
    sortable: true,
    minWidth: '150px'
  },
  
  // Date column with custom format
  {
    visible: true,
    key: 'createdAt',
    header: 'created_at',
    templateType: TemplateType.Date,
    dateFormat: 'dd/MM/yyyy HH:mm',
    sortable: true,
    minWidth: '120px'
  },
  
  // Custom template column
  {
    visible: true,
    key: 'status',
    header: 'status',
    templateType: TemplateType.Custom,
    customTemplate: () => this.statusTemplate,
    sortable: false,
    width: '100px'
  }
]
```

## Permission-Based Controls

### Authentication Integration

Table services integrate with the authentication system for permission-based features:

```typescript
export class ExampleTableService extends TableConfigAbstractService<DataType> {
  private authService = inject(AuthService);
  private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    showAddButton: this.isAdmin || this.isSpecial,
    showEditButton: this.isAdmin,
    showMenu: true,
    // ... other config
  });
}
```

### Available Permissions
- **`ADMIN_PERMISSION`**: Full administrative access
- **`SPECIAL_PERMISSION`**: Special user privileges
- **`CUSTOMER_PERMISSION`**: Customer-level access
- **`SUPPORT_PERMISSION`**: Support team access

## TableConfigAbstractService Methods

### Core Methods

#### `updateColumnVisibility(updatedVisibleColumns: Set<string>): void`
Updates which columns are visible in the table.

```typescript
// Example: Hide 'description' column, show others
const visibleColumns = new Set(['name', 'type', 'status']);
this.tableService.updateColumnVisibility(visibleColumns);
```

#### `getTableConfig(): BehaviorSubject<TableConfig>`
Returns the reactive table configuration.

```typescript
// In component
this.tableConfig$ = this.tableService.getTableConfig();
```

#### `updateConfigData(totalPages: number): void`
Updates pagination information (for server-side pagination).

```typescript
// After receiving paginated data from API
this.tableService.updateConfigData(response.totalPages);
```

#### `updateTableData(data: T[]): void`
Updates the table data (must be implemented by concrete services).

```typescript
public updateTableData(data: Customer[]): void {
  this.originalDataSubject.next(data);
}
```

#### `applyFilter(filterForm: any): void`
Applies client-side filtering using deep search.

```typescript
// Called automatically when filter form changes
this.tableService.applyFilter(this.filterForm);
```

### Data Flow

1. **Data Loading**: Components load data and call `updateTableData()`
2. **Configuration**: Service provides reactive `tableConfig$` 
3. **Filtering**: Filter changes trigger `applyFilter()` with deep search
4. **Column Visibility**: User interactions call `updateColumnVisibility()`
5. **Pagination**: Page changes trigger `updateConfigData()` for server-side

## Component Integration

### Basic Template Pattern

```html
<!-- Header with filters and controls -->
<app-header class="os-header-sticky"
            [formGroup]="filterForm"
            [tableConfig$]="tableConfig$"
            (onAddAction)="createItem()"
            (columnSelectionChange)="onColumnSelectionChanged($event)">
    <ng-container header-custom-inputs>
        <input cFormControl formControlName="name" type="text" placeholder="Search...">
        <button cButton color="secondary" [disabled]="filterForm.pristine" (click)="resetForm()">
            <svg cIcon name="cilReload"></svg>
        </button>
    </ng-container>
</app-header>

<!-- Table with menu actions -->
<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               [isRowClickable]="true"
               (onRowClickEvent)="openDetails($event)"
               (pageChange)="onPageChange($event)">
</generic-table>

<!-- Menu template -->
<ng-template #menuTemplate let-item>
    <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation();">
        <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="viewDetails(item)">
            <mat-icon>visibility</mat-icon>
            <span>View Details</span>
        </button>
        <button mat-menu-item (click)="editItem(item)">
            <mat-icon>edit</mat-icon>
            <span>Edit</span>
        </button>
        <button mat-menu-item (click)="deleteItem(item)">
            <mat-icon>delete</mat-icon>
            <span>Delete</span>
        </button>
    </mat-menu>
</ng-template>
```

### Component Implementation Pattern

```typescript
@Component({
  selector: 'app-example-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GenericTableModule,
    HeaderModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    // ... other imports
  ],
  providers: [ExampleTableService],
  templateUrl: './example-list.component.html'
})
export class ExampleListComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<DataType[]>;
  public filterForm: FormGroup;

  constructor(
    private dataService: DataService,
    private tableService: ExampleTableService
  ) {
    this.filterForm = new FormGroup({
      name: new FormControl(''),
      // ... other filter controls
    });
    
    this.tableConfig$ = this.tableService.getTableConfig();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  private loadData(params = { page: 0, size: 10 }): void {
    this.dataService.getData(params).subscribe(response => {
      this.tableService.updateConfigData(response.totalPages);
      this.dataList$ = of(response.content);
      this.tableService.updateTableData(response.content);
    });
  }

  public onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  public onPageChange({page, size}: { page: number; size: number }): void {
    this.loadData({ page, size, ...this.filterForm.getRawValue() });
  }

  public resetForm(): void {
    this.filterForm.reset();
    this.loadData();
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }
}
```

## Event Handling

### Available Events

- **`selectedItemsChange`**: Emits selected items array (when showCheckboxes: true)
- **`onRowClickEvent`**: Emits clicked row item (when isRowClickable: true)
- **`toggleAction`**: Emits item for edit action (when showEditButton: true)
- **`pageChange`**: Emits `{page: number, size: number, isServerSide?: boolean}`
- **`sortChange`**: Emits `{column: string, direction: 'asc' | 'desc'}`

### Header Events

- **`onAddAction`**: Triggered when add button is clicked
- **`columnSelectionChange`**: Emits Set of visible column keys

## Styling and Theming

### CSS Classes

The generic table supports custom styling through CSS classes:

```typescript
// Column-specific styling
{
  key: 'status',
  header: 'status',
  class: 'text-center status-column',
  width: '100px'
}
```

### Responsive Design

Tables automatically adapt to different screen sizes:
- Horizontal scrolling on small screens
- Sticky header support with `os-header-sticky` class
- Mobile-optimized pagination controls

## Deep Search Functionality

The `applyFilter()` method uses a sophisticated deep search algorithm that:

1. **Searches string properties** (case-insensitive)
2. **Iterates through arrays** and searches each element
3. **Recursively searches nested objects**
4. **Handles null/undefined values** gracefully

Example searchable data structure:
```typescript
{
  name: "John Doe",
  contact: {
    email: "john@example.com",
    phones: ["123-456-7890", "098-765-4321"]
  },
  tags: ["VIP", "Premium"]
}
// Searching "123" will find this record through the nested phone number
```

## Best Practices

### 1. Service Configuration
- Always extend `TableConfigAbstractService<T>` with proper typing
- Use permission-based controls for security
- Implement `updateTableData()` method consistently

### 2. Column Design
- Use `translatePrefix` for internationalization
- Set appropriate `minWidth` for readability
- Hide ID columns by default (`visible: false`)
- Use `TemplateType.Text` for most columns

### 3. Performance
- Use server-side pagination for large datasets (>1000 items)
- Implement debounced filtering for real-time search
- Consider virtual scrolling for very large tables

### 4. User Experience
- Provide clear column headers and sorting indicators
- Use consistent menu actions across tables
- Implement proper loading states
- Add empty state messages for no data

### 5. Accessibility
- Ensure proper ARIA labels for screen readers
- Support keyboard navigation
- Maintain focus management for dropdowns and menus

## Common Patterns

### Server-Side Pagination
```typescript
private loadData(params: {page: number, size: number} = {page: 0, size: 10}): void {
  this.dataService.getPaginatedData(params).subscribe(response => {
    this.tableService.updateConfigData(response.totalPages);
    this.tableConfig$ = this.tableService.getTableConfig();
    this.dataList$ = of(response.content);
  });
}
```

### Client-Side Filtering
```typescript
private setupFilters(): void {
  this.filterForm.valueChanges.pipe(
    debounceTime(700),
    takeUntil(this.unsubscribe$)
  ).subscribe(() => {
    this.tableService.applyFilter(this.filterForm);
    this.dataList$ = this.tableService.dataList$;
  });
}
```

### Permission-Based Features
```typescript
public tableConfigSubject = new BehaviorSubject<TableConfig>({
  showAddButton: this.isAdmin || this.isSpecial,
  showEditButton: this.isAdmin,
  showMenu: true,
  columns: this.getColumnsBasedOnPermissions()
});

private getColumnsBasedOnPermissions(): TableColumnConfig[] {
  const baseColumns = [
    {visible: true, key: 'name', header: 'name'},
    {visible: true, key: 'type', header: 'type'}
  ];
  
  if (this.isAdmin) {
    baseColumns.push({visible: true, key: 'internalId', header: 'internal_id'});
  }
  
  return baseColumns;
}
```

This documentation provides a complete reference for implementing and using the Generic Table Component throughout the eSIM portal application.