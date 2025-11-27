# Generic Table Component

> **Status:** Active
> **Last Updated:** 2025-11-26
> **Location:** `src/app/shared/components/generic-table/`

## Overview

Reusable table component with AG-Grid styling, pagination, sorting, selection, and footer aggregations.

## File Structure

```
generic-table/
├── generic-table.component.ts       # Main component (167 lines)
├── generic-table.component.html     # Template
├── generic-table.component.scss     # Footer styles
├── table-config-abstract.service.ts # Abstract service for config
├── helpers/
│   ├── table-footer-aggregation.helper.ts
│   └── table.utils.ts
└── models/
    └── table-row.interface.ts
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `config$` | `Observable<TableConfig>` | required | Table configuration |
| `data$` | `Observable<T[]>` | required | Data stream |
| `menu` | `TemplateRef` | - | Custom menu template |
| `isRowClickable` | `boolean` | `false` | Enable row click events |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `selectedItemsChange` | `T[]` | Selection changed |
| `onRowClickEvent` | `T` | Row clicked |
| `toggleAction` | `T` | Edit button clicked |
| `pageChange` | `PageChangeEvent` | Page/size changed |
| `sortChange` | `SortChangeEvent` | Column sorted |

### Content Projection

```html
<generic-table>
  <ng-container custom-toolbar>
    <!-- Custom toolbar content -->
  </ng-container>
</generic-table>
```

## Usage

### Basic Table

```typescript
@Component({...})
export class MyComponent {
  tableConfig$ = new BehaviorSubject<TableConfig>({
    columns: [
      { key: 'id', header: 'id', visible: false },
      { key: 'name', header: 'name', visible: true, sortable: true },
      { key: 'createdAt', header: 'createdAt', visible: true, templateType: 'date', dateFormat: 'dd/MM/yyyy' }
    ],
    translatePrefix: 'entity.',
    showCheckboxes: false,
    showEditButton: true,
    showMenu: true,
    pagination: { enabled: true, serverSide: true, totalPages: 20 }
  });

  dataList$ = new BehaviorSubject<Entity[]>([]);
}
```

```html
<generic-table
  [config$]="tableConfig$"
  [data$]="dataList$"
  [menu]="menuTemplate"
  (pageChange)="onPageChange($event)">
</generic-table>

<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <button mat-menu-item (click)="onEdit(item)">Edit</button>
  </mat-menu>
</ng-template>
```

### With TableConfigAbstractService

```typescript
@Injectable({ providedIn: 'root' })
export class MyTableService extends TableConfigAbstractService<Entity> {
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'entity.',
    pagination: { enabled: true, serverSide: true, totalPages: 20 },
    columns: [
      { key: 'id', header: 'id', visible: false },
      { key: 'name', header: 'name', visible: true }
    ]
  });
}
```

## Column Types

| templateType | Description | Extra Config |
|--------------|-------------|--------------|
| (default) | Raw value | - |
| `'text'` | Via DisplayValueByKeyPipe | Supports nested: `'owner.name'` |
| `'date'` | Date formatting | `dateFormat: 'dd/MM/yyyy'` |
| `'time'` | Time formatting | - |
| `'custom'` | Custom template | `customTemplate: () => templateRef` |

## Footer Aggregations

```typescript
const config: TableConfig = {
  footer: {
    enabled: true,
    label: 'Total',
    aggregations: [
      { columnKey: 'amount', type: AggregationType.Sum, formatFn: v => `$${v.toFixed(2)}` }
    ],
    // For complex calculations (e.g., currency conversion)
    customValues: { amount: '$1,234.56' },
    customTooltips: { amount: 'USD: $1,000 | EUR: €234.56' }
  }
};
```

## Standard Pattern

All table views follow this pattern:

```typescript
export class EntityComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  tableConfig$: BehaviorSubject<TableConfig>;
  dataList$: Observable<Entity[]>;
  filterForm: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private tableService: EntityTableService,
    private dataService: EntityDataService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => this.applyFilter());
  }

  onPageChange({ page, size }: PageChangeEvent): void {
    this.loadData({ page, size, ...this.filterForm.getRawValue() });
  }

  private loadData(params = { page: 0, size: 10 }): void {
    this.dataService.paginated(params).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(response => {
      this.tableService.updateConfigData(response?.totalPages || 20);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = of(response.content);
      this.cdr.detectChanges();
    });
  }
}
```

## Related

- [Header Component](./header.md) - Table filters
- [Table Menu Architecture](../architecture/table-menu.md) - Action menus
