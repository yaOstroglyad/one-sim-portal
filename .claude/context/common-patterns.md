# Common Patterns & Best Practices

> **Context Tags:** `@learn-patterns` `@extending`
> **Read when:** Looking for established patterns in the project
> **Last Updated:** 2025-11-15

## 🎯 Purpose

This file documents **established patterns** used throughout the project. Use these patterns for consistency.

---

## 🔄 Data Service Pattern

### Standard CRUD Service

**Pattern:** Injectable service with HttpClient + CacheHub + Error handling

**Location Example:** `/src/app/shared/services/data/customers-data.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Entity } from '@models';
import { handleArrayError, handleObjectError } from '@shared/utils';
import { CacheHubService, DataType } from '../cache-hub';

@Injectable({ providedIn: 'root' })
export class EntityDataService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);
  private readonly baseUrl = '/api/v1/entities';

  // List with caching
  list(): Observable<Entity[]> {
    return this.cacheHub.get(
      'entities:list',
      () => this.http.get<Entity[]>(this.baseUrl),
      { dataType: DataType.BUSINESS }
    ).pipe(
      catchError(handleArrayError<Entity>('fetching entities'))
    );
  }

  // Get by ID with caching
  getById(id: string): Observable<Entity | null> {
    return this.cacheHub.get(
      `entities:detail-${id}`,
      () => this.http.get<Entity>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    ).pipe(
      catchError(handleObjectError<Entity>('fetching entity by id'))
    );
  }

  // Create (invalidates cache)
  create(entity: Entity): Observable<Entity | null> {
    return this.http.post<Entity>(`${this.baseUrl}/create`, entity).pipe(
      tap(() => this.cacheHub.invalidatePattern('default:entities:')),
      catchError(handleObjectError<Entity>('creating entity'))
    );
  }

  // Update (invalidates specific cache + list)
  update(id: string, entity: Entity): Observable<Entity | null> {
    return this.http.put<Entity>(`${this.baseUrl}/${id}`, entity).pipe(
      tap(() => {
        this.cacheHub.invalidatePattern(`default:entities:detail-${id}`);
        this.cacheHub.invalidatePattern('default:entities:list');
      }),
      catchError(handleObjectError<Entity>('updating entity'))
    );
  }

  // Delete (invalidates cache)
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.cacheHub.invalidatePattern('default:entities:'))
    );
  }
}
```

**Key Points:**
- Use `inject()` for dependencies
- Cache GET requests with CacheHubService
- Invalidate cache on mutations (POST, PUT, DELETE)
- Use unified error handlers (`handleArrayError`, `handleObjectError`)
- Include namespace in cache invalidation: `'default:resource:*'`

---

## 📋 Component with Data Loading Pattern

### OnPush Component with Service

**Pattern:** Standalone component + OnPush + inject() + immutable updates

```typescript
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Entity } from '@models';
import { EntityDataService } from '@services';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.scss'
})
export class EntityListComponent implements OnInit {
  private readonly entityService = inject(EntityDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  entities: Entity[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadEntities();
  }

  loadEntities() {
    this.loading = true;
    this.cdr.markForCheck();

    this.entityService.list().subscribe({
      next: (data) => {
        this.entities = data; // handleArrayError ensures never null
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load entities';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onEntityUpdate(id: string, updates: Partial<Entity>) {
    // Find entity immutably
    const entity = this.entities.find(e => e.id === id);
    if (!entity) return;

    // Update entity
    this.entityService.update(id, { ...entity, ...updates }).subscribe({
      next: (updated) => {
        if (updated) {
          // Immutable array update
          this.entities = this.entities.map(e =>
            e.id === id ? updated : e
          );
          this.cdr.markForCheck();
        }
      }
    });
  }
}
```

---

## 🎨 Dashboard Tab Pattern

**Pattern:** Tabs with lazy-loaded data + Chart.js + BehaviorSubject for filters

**Location Example:** `/src/app/views/analytics/dashboard/`

```typescript
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

export type DashboardPeriod = 'day' | 'week' | 'month';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly periodSubject = new BehaviorSubject<DashboardPeriod>('week');

  period$: Observable<DashboardPeriod> = this.periodSubject.asObservable();

  // Data streams that react to period changes
  data$ = this.period$.pipe(
    switchMap(period => this.dashboardService.getData(period))
  );

  changePeriod(period: DashboardPeriod) {
    this.periodSubject.next(period);
  }
}
```

---

## 🔐 Cache Invalidation Pattern

**Pattern:** Namespace-based cache keys with wildcard invalidation

```typescript
// Cache keys include namespace prefix
// Format: "{namespace}:{resource}:{operation}-{params}"

// Examples:
// "default:users:list"
// "default:users:page-0-15-active"
// "default:users:detail-123"

// Invalidation MUST include namespace
this.cacheHub.invalidatePattern('default:users:page-*');  // ✅ Correct
this.cacheHub.invalidatePattern('users:page-*');          // ❌ Wrong - no namespace!

// Invalidate all user-related caches
this.cacheHub.invalidatePattern('default:users:');

// Invalidate specific resource
this.cacheHub.invalidatePattern(`default:users:detail-${id}`);
```

---

## 📝 Form with Validation Pattern

**Pattern:** Reactive forms + FormGenerator for complex forms

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormGeneratorComponent } from '@shared/components';

@Component({
  standalone: true,
  imports: [FormGeneratorComponent]
})
export class EntityFormComponent {
  private readonly fb = inject(FormBuilder);

  // Simple form
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    active: [true]
  });

  // For complex forms with dynamic fields, use FormGenerator
  // See: /src/app/shared/components/form-generator/README.md
}
```

---

## 🔄 State Management Pattern

**Pattern:** BehaviorSubject in services for shared state

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly stateSubject = new BehaviorSubject<AppState>(initialState);

  readonly state$: Observable<AppState> = this.stateSubject.asObservable();

  updateState(updates: Partial<AppState>) {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...updates
    });
  }

  getState(): AppState {
    return this.stateSubject.value;
  }
}
```

---

## 🌐 Translation Pattern

**Pattern:** @ngx-translate with lowercase keys

```typescript
// Translation keys MUST be lowercase
// ✅ Correct
this.translate.get('nav.dashboard').subscribe(text => ...);
this.translate.get('errors.notfound').subscribe(text => ...);

// ❌ Wrong - camelCase or PascalCase
this.translate.get('nav.Dashboard');
this.translate.get('errors.NotFound');
```

---

## 🎯 Routing Pattern

**Pattern:** Hash-based routing + lazy loading

```typescript
// app.routes.ts
const routes: Routes = [
  {
    path: 'customers',
    loadComponent: () => import('./views/customers/customers.component')
      .then(m => m.CustomersComponent)
  }
];

// Uses HashLocationStrategy
// URLs: http://localhost:4200/#/customers
```

---

## 📋 Generic Table Pattern

**Pattern:** Standard table implementation using `GenericTableComponent` + `TableConfigAbstractService`

**Use for:** Any list view with server-side pagination, sorting, filtering

### Required Component Structure

```typescript
export class EntityListComponent implements OnInit, OnDestroy {
  // REQUIRED: Memory cleanup
  private unsubscribe$ = new Subject<void>();

  // REQUIRED: Table configuration
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Entity[]>;
  public filterForm: FormGroup;

  // REQUIRED: Injections
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly tableService = inject(EntityTableService);
  private readonly dataService = inject(EntityDataService);

  ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // REQUIRED: Filter setup with debounce
  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),                    // STANDARD: 700ms debounce
      takeUntil(this.unsubscribe$)          // REQUIRED: Memory cleanup
    ).subscribe(() => this.applyFilter());
  }

  // REQUIRED: Pagination handler
  onPageChange({ page, size }: { page: number; size: number }): void {
    this.loadData({ page, size, ...this.filterForm.getRawValue() });
  }

  // REQUIRED: Data loading with fallbacks
  private loadData(params = { page: 0, size: 10 }): void {
    this.dataService.paginated(params, params.page, params.size)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableService.updateConfigData(data?.totalPages || 20);  // Fallback!
        this.tableConfig$ = this.tableService.getTableConfig();
        this.dataList$ = of(data.content);
        this.cdr.detectChanges();            // REQUIRED: Manual change detection
      });
  }
}
```

### Required Service Structure

```typescript
@Injectable({ providedIn: 'root' })
export class EntityTableService extends TableConfigAbstractService<Entity> {
  private authService = inject(AuthService);
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20              // REQUIRED: Default fallback
    },
    translatePrefix: 'entity.',   // REQUIRED: Match translation keys
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: this.isAdmin,  // Permission-based
    showMenu: true,
    columns: [
      { visible: false, key: 'id', header: 'id' },  // REQUIRED: Hidden ID
      { visible: true, key: 'name', header: 'name' },
      { visible: true, key: 'createdDate', header: 'createdDate',
        templateType: TemplateType.Date, dateFormat: 'dd/MM/YYYY' }
    ]
  });
}
```

### Standard Template

```html
<!-- Header with filters -->
<app-header class="os-header-sticky"
            [formGroup]="filterForm"
            [tableConfig$]="tableConfig$"
            (onAddAction)="createEntity()"
            (columnSelectionChange)="onColumnSelectionChanged($event)">
  <ng-container header-custom-inputs>
    <input cFormControl formControlName="name" type="text"
           placeholder="{{ 'entity.name' | translate }}">
  </ng-container>
</app-header>

<!-- Generic table -->
<generic-table [config$]="tableConfig$"
               [menu]="menuTemplate"
               [data$]="dataList$"
               (pageChange)="onPageChange($event)">
</generic-table>

<!-- Menu template -->
<ng-template #menuTemplate let-item>
  <button mat-icon-button [matMenuTriggerFor]="menu"
          (click)="$event.stopPropagation();">
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu="matMenu">
    <button mat-menu-item (click)="editEntity(item)">Edit</button>
  </mat-menu>
</ng-template>
```

### Translation Prefixes (Must Match)

| Entity | Prefix |
|--------|--------|
| Companies | `'company.'` |
| Customers | `'customer.'` |
| Orders | `'order.'` |
| Products | `'package.'` |
| Users | `'user.'` |
| Inventory | `'inventory.'` |

### Common Mistakes to Avoid

- ❌ Forgetting `takeUntil()` in subscriptions → memory leak
- ❌ Not calling `cdr.detectChanges()` after data updates → UI not updating
- ❌ Missing `$event.stopPropagation()` in menu buttons → row click triggers
- ❌ Incorrect translation prefix → missing translations
- ❌ Not providing fallback values (`data?.totalPages || 20`)
- ❌ Missing `unsubscribe$` cleanup in `ngOnDestroy`

---

## 🎚️ Feature Toggles Pattern

**Pattern:** Dynamic feature flags without app restart

**Location:** `/src/app/shared/services/feature-toggle/`

### Quick Usage

```typescript
import { isToggleActive } from '@shared/services/feature-toggle';

// In component
export class MyComponent {
  isToggleActive = isToggleActive;  // Make available in template

  doSomething() {
    if (isToggleActive('new-feature')) {
      // New feature code
    }
  }
}
```

```html
<!-- In template -->
<button *ngIf="isToggleActive('bulk-operations')">
  Bulk Delete
</button>
```

### Available Toggles

Defined in `feature-toggle.config.ts`:
- `new-ui` — New UI design (default: false)
- `advanced-search` — Advanced search (default: false)
- `bulk-operations` — Bulk operations (default: false)
- `addSubscriberButtonToggle` — Add subscriber button (default: true)

### Best Practices

1. **Naming:** Use kebab-case (`new-payment-flow`)
2. **Defaults:** Always use safe defaults (usually `false`)
3. **Cleanup:** Remove unused toggles from code and config
4. **Combine with permissions:**
   ```html
   <button *ngIf="isAdmin && isToggleActive('admin-feature')">
   ```

---

## 📚 Related Documentation

- **Data Services:** [.claude/rules/04-services.md](../rules/04-services.md)
- **HTTP Errors:** [.claude/rules/02-http-errors.md](../rules/02-http-errors.md)
- **Components:** [.claude/rules/01-CRITICAL.md](../rules/01-CRITICAL.md)
- **Similar Features:** [.claude/context/similar-features.md](./similar-features.md)
- **Business Domain:** [.claude/context/business-domain.md](./business-domain.md)

---

**Last Updated:** 2025-11-26
