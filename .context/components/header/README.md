# Header Component

## Overview
The Header Component (`app-header`) is a reusable filter and action toolbar designed for table views. It provides a standardized interface for filtering data, column selection, and entity management actions across the application.

## Architecture

### Key Features
- **Dynamic Filtering**: Supports text, select, and number input types
- **Column Control**: Integrated column visibility management
- **Content Projection**: Allows custom inputs and actions via slots
- **Form Integration**: Built on Angular Reactive Forms with FormGroup binding
- **Debounced Filtering**: 400ms debounce for performance optimization
- **Reset Functionality**: Form and column selection reset capabilities

### Component Structure
```typescript
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  @Input() config: HeaderConfig;              // Filter configuration
  @Input() tableConfig$: Observable<TableConfig>;  // Table configuration
  @Output() filteredData = new EventEmitter<any>();     // Filter values
  @Output() onAddAction = new EventEmitter<any>();      // Add button click
  @Output() columnSelectionChange = new EventEmitter<Set<string>>(); // Column visibility
}
```

## Configuration Interfaces

### HeaderConfig Interface
```typescript
export interface HeaderConfig {
  [key: string]: {
    type: TableFilterFieldType;        // 'text' | 'select' | 'number'
    placeholder?: string;              // Input placeholder text
    defaultValue?: any;               // Default filter value
    options?: Array<{ label: string; value: any }>; // For select type
  };
}

export enum TableFilterFieldType {
  Text = 'text',
  Select = 'select', 
  Number = 'number'
}
```

## Usage Examples

### Basic Usage (Companies Pattern)
```html
<app-header class="os-header-sticky"
            [formGroup]="filterForm"
            [tableConfig$]="tableConfig$"
            (onAddAction)="createCompany()"
            (columnSelectionChange)="onColumnSelectionChanged($event)">
    <ng-container header-custom-inputs>
        <input cFormControl 
               formControlName="name" 
               [type]="'text'" 
               placeholder="{{ 'company.name' | translate }}">
        <input cFormControl 
               formControlName="type" 
               [type]="'text'" 
               placeholder="{{ 'company.type' | translate }}">
        <button cButton
                color="secondary"
                [disabled]="filterForm.pristine"
                (click)="resetForm()">
            <svg cIcon name="cilReload"></svg>
        </button>
    </ng-container>
</app-header>
```

### Component Implementation
```typescript
export class CompaniesComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public filterForm: FormGroup;

  ngOnInit(): void {
    this.initFormControls();
    this.setupFilters();
  }

  private initFormControls(): void {
    this.filterForm = new FormGroup({
      name: new FormControl(null),
      type: new FormControl(null),
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  public applyFilter(): void {
    const params = {
      page: 0,
      size: 10,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  public resetForm(): void {
    this.filterForm.reset();
  }
}
```

## Content Projection Slots

### Available Slots
1. **`[header-custom-inputs]`** - Custom filter inputs
2. **`[header-actions]`** - Additional action buttons

### Slot Usage Example
```html
<app-header [tableConfig$]="tableConfig$">
    <!-- Custom filter inputs -->
    <ng-container header-custom-inputs>
        <input cFormControl formControlName="search" placeholder="Search...">
        <select cSelect formControlName="status">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
    </ng-container>
    
    <!-- Custom actions -->
    <ng-container header-actions>
        <button cButton color="info" (click)="exportData()">
            <svg cIcon name="cilCloudDownload"></svg>
            Export
        </button>
    </ng-container>
</app-header>
```

## Integration with Table Components

### Required Imports
```typescript
import { HeaderModule } from '../../shared';
```

### Module Integration
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    HeaderModule,
    GenericTableModule,
    ReactiveFormsModule,
    // ... other imports
  ]
})
```

## Best Practices

### 1. **Form Management**
- Always use ReactiveFormsModule with FormGroup
- Initialize form controls in `ngOnInit()`
- Use debounced valueChanges for filtering

### 2. **Filter Integration**
- Reset page to 0 when applying filters
- Combine filter values with pagination parameters
- Handle empty/null filter values appropriately

### 3. **Performance**
- Use OnPush change detection
- Implement proper unsubscription pattern
- Leverage built-in 400ms debounce for form changes

### 4. **Accessibility**
- Provide meaningful placeholder text
- Use translation keys for internationalization
- Ensure keyboard navigation support

## Technical Details

### Dependencies
- `@angular/forms` - ReactiveFormsModule
- `@coreui/angular` - UI components
- `@coreui/icons-angular` - Icon system
- Custom `ColumnControlModule` - Column visibility management

### Performance Considerations
- OnPush change detection strategy
- Debounced form value changes (400ms)
- Efficient column selection tracking
- Minimal DOM updates through reactive patterns

### Memory Management
- Component handles internal subscriptions
- Parent components should manage their own unsubscription
- Form state is properly reset on component destruction

## Styling

### CSS Classes
- `.os-header-sticky` - Makes header sticky during scroll
- `.pb-2 .d-flex .px-3 .pt-3 .bg-light` - Default layout styling

### Customization
The component supports full CSS customization through standard class overrides and component styling patterns. 