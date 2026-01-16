---
name: create-service
description: Creates a new Angular service following project standards. Use when asked to create a service, new service, add service, or generate service.
allowed-tools: Write, Read, Glob, Grep, Edit
---

# Create Angular Service

Create a new Angular service following One-Sim-Portal project standards.

> **Rules Reference:** Service rules in `constitution.md` Section V and Section II.
> This skill provides the **procedure** and **template** for creating services.

## Procedure

1. **Ask for service name and purpose** if not provided
2. **Determine location**:
   - Reusable → `src/app/shared/services/{category}/`
   - Feature-specific → `src/app/features/{feature}/services/`
   - View-specific → `src/app/views/{feature}/services/`
3. **Create service file** using template below
4. **Follow constitution.md Section II** for member ordering
5. **Add to barrel exports** if in shared

## Service Template

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * [Service Description]
 *
 * @example
 * ```typescript
 * const service = inject(MyService);
 * service.loadData().subscribe();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class {PascalName}Service {
  // Follow constitution.md Section II "Code Organization Order":
  // 1. Injected dependencies
  // 2. State signals
  // 3. Computed/derived state
  // 4. Private variables
  // 5. Public methods (CRUD order: load, create, update, delete)
  // 6. Private methods

  private readonly http = inject(HttpClient);

  readonly isLoading = signal(false);
  readonly data = signal<DataType[]>([]);

  readonly isEmpty = computed(() => this.data().length === 0);

  private readonly baseUrl = '/api/v1/resource';

  // Public API
  loadAll(): Observable<DataType[]> {
    return this.http.get<DataType[]>(this.baseUrl);
  }

  getById(id: string): Observable<DataType> {
    return this.http.get<DataType>(`${this.baseUrl}/${id}`);
  }

  create(item: CreateRequest): Observable<DataType> {
    return this.http.post<DataType>(this.baseUrl, item);
  }

  update(id: string, item: UpdateRequest): Observable<DataType> {
    return this.http.put<DataType>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Private helpers
  private transformResponse(data: RawData[]): DataType[] {
    return data.map(item => ({ ...item }));
  }
}
```

## Service Categories (constitution.md Section V)

| Category | Path | Purpose |
|----------|------|---------|
| `data/` | `shared/services/data/` | API/CRUD services |
| `ui/` | `shared/services/ui/` | Theme, language, notifications |
| `core/` | `shared/services/core/` | Base classes, utilities |
| `cache-hub/` | `shared/services/cache-hub/` | CacheHubService |

## Naming Convention

- **Data services:** `{resource}-data.service.ts`
- **UI services:** `{feature}.service.ts`
- **Class name:** `{PascalName}Service`

## Quick Checklist

Before finishing, verify against `constitution.md`:
- [ ] `@Injectable({ providedIn: 'root' })` or specific module
- [ ] `inject()` for dependencies (Section II)
- [ ] `signal()` for reactive state (Section II)
- [ ] Member ordering follows Section II
- [ ] No notifications in service (Section III) — component's job
- [ ] Error handling: let errors propagate to component (Section III)
