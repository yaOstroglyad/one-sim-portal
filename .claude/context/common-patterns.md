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

## 📚 Related Documentation

- **Data Services:** [.claude/rules/04-services.md](../rules/04-services.md)
- **HTTP Errors:** [.claude/rules/02-http-errors.md](../rules/02-http-errors.md)
- **Components:** [.claude/rules/01-CRITICAL.md](../rules/01-CRITICAL.md)
- **Similar Features:** [.claude/context/similar-features.md](./similar-features.md)

---

**Last Updated:** 2025-11-15
