# Task: Migrate CustomersComponent to Signals

## Overview

Migrate `CustomersComponent` to use Angular Signals pattern, following the `UserListComponent` as a reference implementation.

## Reference Files

- **Target:** `src/app/views/customers/customers.component.ts`
- **Reference:** `src/app/views/users/components/user-list/user-list.component.ts`

## Current State Analysis

### CustomersComponent (Legacy Patterns)
```typescript
// Uses Subject for unsubscribe
private unsubscribe$ = new Subject<void>();

// Uses ChangeDetectorRef
private readonly cdr = inject(ChangeDetectorRef);

// Uses BehaviorSubject/Observable for data
public tableConfig$: BehaviorSubject<TableConfig>;
public dataList$: Observable<Customer[]>;

// Manual debounce in setupFilters()
this.filterForm.valueChanges.pipe(
  debounceTime(CustomersUtils.CONFIG.FILTER_DEBOUNCE_TIME),
  takeUntil(this.unsubscribe$)
).subscribe(() => {
  this.applyFilter();
});

// OnDestroy for cleanup
ngOnDestroy(): void {
  this.unsubscribe$.next();
  this.unsubscribe$.complete();
}
```

### UserListComponent (Signal Patterns)
```typescript
// Uses DestroyRef
private readonly destroyRef = inject(DestroyRef);

// No ChangeDetectorRef needed

// Uses signals for data
readonly dataList = signal<User[]>([]);
readonly dataList$ = toObservable(this.dataList); // For table compatibility

// Uses SmartFilter's filtersChanged event
(filtersChanged)="onFiltersChanged($event)"

// No OnDestroy - uses takeUntilDestroyed
this.userService.paginatedUsers(...).pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe(...)
```

## Migration Steps

### Step 1: Update Imports

```typescript
// Remove
import { ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

// Add
import { DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
```

### Step 2: Replace Dependency Injection

```typescript
// Remove
private readonly cdr = inject(ChangeDetectorRef);

// Add
private readonly destroyRef = inject(DestroyRef);
```

### Step 3: Convert Data Properties to Signals

```typescript
// Before
public tableConfig$: BehaviorSubject<TableConfig>;
public dataList$: Observable<Customer[]>;
public companyOptions$: Observable<SearchableSelectOption[]>;

// After
readonly dataList = signal<Customer[]>([]);
readonly dataList$ = toObservable(this.dataList); // For generic-table compatibility

// tableConfig$ stays as BehaviorSubject (from service)
tableConfig$: BehaviorSubject<TableConfig>;

// companyOptions$ stays as Observable (async data source)
companyOptions$: Observable<SearchableSelectOption[]>;
```

### Step 4: Remove OnDestroy

```typescript
// Before
export class CustomersComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

// After
export class CustomersComponent implements OnInit {
  // No ngOnDestroy needed
}
```

### Step 5: Remove unsubscribe$ Subject

```typescript
// Remove this line
private unsubscribe$ = new Subject<void>();
```

### Step 6: Update loadData Method

```typescript
// Before
private loadData(params: CustomersFilterParams = CustomersUtils.Form.createFilterParams({})): void {
  this.customersDataService.paginatedCustomers(params, params.page, params.size)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      const processedData = CustomersUtils.Data.processCustomersData(data);
      this.tableService.updateConfigData(processedData.totalPages);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = of(processedData.content);
      this.cdr.detectChanges();
    });
}

// After
private loadData(params: CustomersFilterParams = CustomersUtils.Form.createFilterParams({})): void {
  this.customersDataService.paginatedCustomers(params, params.page, params.size)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => {
      const processedData = CustomersUtils.Data.processCustomersData(data);
      this.tableService.updateConfigData(processedData.totalPages);
      this.dataList.set(processedData.content);
    });
}
```

### Step 7: Remove Manual Debounce (Use SmartFilter Event)

```typescript
// Remove setupFilters() method entirely

// Before in ngOnInit
this.setupFilters();

// After in ngOnInit - remove this call
// SmartFilter handles debounce internally via filtersChanged event
```

### Step 8: Add filtersChanged Handler

```typescript
// Add new method
onFiltersChanged(formValues: unknown): void {
  const params = CustomersUtils.Form.createFilterParams(formValues);
  this.loadData(params);
}
```

### Step 9: Update Template

```html
<!-- Before -->
<app-smart-filter-header #smartFilter
  [formGroup]="filterForm"
  [config]="smartFilterConfig"
  [useExternalPanel]="true"
  (panelOpenChange)="onPanelOpenChange($event)"
  (resetFilters)="resetForm()">

<!-- After -->
<app-smart-filter-header #smartFilter
  [formGroup]="filterForm"
  [config]="smartFilterConfig"
  [useExternalPanel]="true"
  (panelOpenChange)="onPanelOpenChange($event)"
  (resetFilters)="resetForm()"
  (filtersChanged)="onFiltersChanged($event)">
```

### Step 10: Initialize tableConfig$ in ngOnInit

```typescript
// Add to ngOnInit
private initTableConfig(): void {
  this.tableConfig$ = this.tableService.getTableConfig();
}
```

## Final Component Structure

```typescript
@Component({...})
export class CustomersComponent implements OnInit {
  // Dependency injection
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableService = inject(CustomersTableService);
  private readonly customersDataService = inject(CustomersDataService);
  private readonly companiesDataService = inject(CompaniesDataService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly layout = inject(PageLayoutService);

  // View children (signal-based)
  protected readonly smartFilterRef = viewChild<SmartFilterHeaderComponent>('smartFilter');

  // Panel states (signals)
  protected readonly showFilterPanel = signal(false);

  // Data signals
  readonly dataList = signal<Customer[]>([]);
  readonly dataList$ = toObservable(this.dataList);

  // Auth state
  readonly isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  // Table configuration (from service)
  tableConfig$: BehaviorSubject<TableConfig>;

  // Form and filter configuration
  filterForm: FormGroup;
  companyOptions$: Observable<SearchableSelectOption[]>;
  smartFilterConfig: SmartFilterConfig;

  // ... rest of implementation
}
```

## Checklist

- [ ] Update imports
- [ ] Replace ChangeDetectorRef with DestroyRef
- [ ] Convert dataList to signal
- [ ] Add toObservable for table compatibility
- [ ] Remove OnDestroy interface
- [ ] Remove unsubscribe$ Subject
- [ ] Update loadData to use takeUntilDestroyed and signal.set()
- [ ] Remove setupFilters() method
- [ ] Add onFiltersChanged() method
- [ ] Update template with filtersChanged event
- [ ] Add initTableConfig() method
- [ ] Update ngOnInit sequence
- [ ] Test all functionality works

## Notes

- `companyOptions$` stays as Observable because it's used with async pipe
- `tableConfig$` stays as BehaviorSubject because it comes from service
- `filterFieldsConfig` can stay as regular property (static config)
- External panel pattern (`showFilterPanel` signal) is already correct
