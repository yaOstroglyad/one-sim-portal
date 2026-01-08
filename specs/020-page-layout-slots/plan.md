# Page Layout Slots - Implementation Plan

> **Feature ID:** 020-page-layout-slots
> **Created:** 2026-01-06
> **Updated:** 2026-01-06 (v2 - after analysis)
> **Spec:** [spec.md](./spec.md)

---

## Architecture Overview

```
Desktop (≥768px):
┌─────────────────────────────────────────────────────────────┐
│ Global Header (unchanged)                                   │
├──────────┬──────────────────────────────────────────────────┤
│          │ ┌──────────────────────────────────────────────┐ │
│          │ │ os-page-header                               │ │
│          │ │ [Breadcrumb]                    [Actions]    │ │
│ Sidebar  │ └──────────────────────────────────────────────┘ │
│          │ ┌──────────────────────────────────────────────┐ │
│          │ │ os-page-sub-header                           │ │
│          │ │ [Filters]                       [Controls]   │ │
│          │ └──────────────────────────────────────────────┘ │
│          │ ┌──────────────────────────────────────────────┐ │
│          │ │ Page Content                                 │ │
│          │ │  ┌────────────────────────────────────────┐  │ │
│          │ │  │ Table (thead sticky, rows scroll)      │  │ │
│          │ │  │ Pagination (sticky bottom)             │  │ │
│          │ │  └────────────────────────────────────────┘  │ │
│          │ └──────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────┐
│ Global Header               │
├─────────────────────────────┤
│ os-page-header              │
│ [Title]          [Actions]  │  ← simplified breadcrumb
├─────────────────────────────┤
│ os-page-sub-header          │
│ [Filters (n)]         [⋮]   │  ← collapsed to button
├─────────────────────────────┤
│                             │
│ Page Content                │
│                             │
└─────────────────────────────┘
        ↓ tap "Filters"
┌─────────────────────────────┐
│ Filters              [✕]    │  ← drawer slides in
├─────────────────────────────┤
│ [Same filter components     │
│  from subheader.start]      │
├─────────────────────────────┤
│ [Clear]        [Apply]      │
└─────────────────────────────┘
```

---

## Key Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Table scroll | Table gets max-height, only rows scroll |
| 2 | Existing `app-header` | Keep as-is, separate migration later |
| 3 | Breadcrumbs | Move to os-page-header, simple mobile version |
| 4 | Filter drawer content | Renders same components from `subheader.start` |
| 5 | Filter events | Layout emits events, pages subscribe |
| 6 | Mobile adaptation | Containers are responsive, not separate components |
| 7 | Component naming | `os-page-header`, `os-page-sub-header` |

---

## File Structure

```
src/app/shared/
├── services/ui/
│   ├── page-layout.service.ts       # NEW - Core service with events
│   └── index.ts                     # UPDATE
├── models/ui/
│   └── page-layout.model.ts         # NEW - Types
├── components/
│   ├── page-header/                 # NEW - Adaptive header slot
│   │   ├── page-header.component.ts
│   │   ├── page-header.component.scss
│   │   └── index.ts
│   ├── page-sub-header/             # NEW - Adaptive subheader slot
│   │   ├── page-sub-header.component.ts
│   │   ├── page-sub-header.component.scss
│   │   └── index.ts
│   ├── page-title/                  # NEW - Simple title component
│   │   └── page-title.component.ts
│   ├── filter-drawer/               # NEW - Mobile drawer
│   │   ├── filter-drawer.component.ts
│   │   ├── filter-drawer.component.scss
│   │   └── index.ts
│   └── breadcrumb/                  # UPDATE - Add mobile mode
│       └── breadcrumb.component.ts

src/app/containers/default-layout/
├── default-layout.component.ts      # UPDATE
├── default-layout.component.html    # UPDATE
└── default-layout.component.scss    # UPDATE

src/app/shared/components/generic-table/
├── generic-table.component.html     # UPDATE - scroll structure
└── generic-table.component.scss     # UPDATE - sticky styles
```

---

## Implementation Details

### Phase 1: Core Infrastructure

#### 1.1 Models (page-layout.model.ts)

```typescript
import { Type } from '@angular/core';

export interface SlotComponent<T = unknown> {
  component: Type<T>;
  inputs?: Record<string, unknown>;
}

export interface SlotZones {
  start?: SlotComponent[];
  center?: SlotComponent[];
  end?: SlotComponent[];
}
```

#### 1.2 PageLayoutService (page-layout.service.ts)

```typescript
import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntilDestroyed } from 'rxjs/operators';
import { SlotZones } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class PageLayoutService {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // === Slot Signals ===
  readonly header = signal<SlotZones>({});
  readonly subheader = signal<SlotZones>({});

  // === Computed ===
  readonly hasHeader = computed(() => this.hasContent(this.header()));
  readonly hasSubheader = computed(() => this.hasContent(this.subheader()));

  // === Mobile Filter Drawer State ===
  readonly isFilterDrawerOpen = signal(false);
  readonly activeFilterCount = signal(0);

  // === Event Streams (pages subscribe to these) ===
  private readonly _filterApply$ = new Subject<void>();
  private readonly _filterClear$ = new Subject<void>();

  readonly filterApply$ = this._filterApply$.asObservable();
  readonly filterClear$ = this._filterClear$.asObservable();

  constructor() {
    // Auto-cleanup on navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.clearAll());
  }

  // === Public Methods ===

  clearAll(): void {
    this.header.set({});
    this.subheader.set({});
    this.isFilterDrawerOpen.set(false);
    this.activeFilterCount.set(0);
  }

  openFilterDrawer(): void {
    this.isFilterDrawerOpen.set(true);
  }

  closeFilterDrawer(): void {
    this.isFilterDrawerOpen.set(false);
  }

  setActiveFilterCount(count: number): void {
    this.activeFilterCount.set(count);
  }

  // Called by filter drawer
  emitFilterApply(): void {
    this._filterApply$.next();
    this.closeFilterDrawer();
  }

  emitFilterClear(): void {
    this._filterClear$.next();
  }

  // === Private ===

  private hasContent(zones: SlotZones): boolean {
    return (zones.start?.length ?? 0) +
           (zones.center?.length ?? 0) +
           (zones.end?.length ?? 0) > 0;
  }
}
```

---

### Phase 2: Slot Components (Adaptive)

#### 2.1 os-page-header (responsive)

```typescript
@Component({
  selector: 'os-page-header',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <div class="os-page-header">
      <div class="os-page-header__start">
        @for (item of zones().start ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>

      @if (zones().center?.length) {
        <div class="os-page-header__center">
          @for (item of zones().center; track item.component) {
            <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
          }
        </div>
      }

      <div class="os-page-header__end">
        @for (item of zones().end ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>
    </div>
  `,
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly zones = input<SlotZones>({});
}
```

```scss
// page-header.component.scss
@use "sass:map";
@use "../../../../scss/variables" as vars;

:host {
  display: block;
  background: var(--layout-content-bg);
  border-bottom: 1px solid var(--layout-content-border);
}

.os-page-header {
  display: flex;
  align-items: center;
  gap: map.get(vars.$os-spacing, '3');
  padding: map.get(vars.$os-spacing, '3') map.get(vars.$os-spacing, '4');
  min-height: 56px;

  &__start {
    display: flex;
    align-items: center;
    gap: map.get(vars.$os-spacing, '2');
    flex: 1;
    min-width: 0; // Allow text truncation
  }

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__end {
    display: flex;
    align-items: center;
    gap: map.get(vars.$os-spacing, '2');
    flex-shrink: 0;
  }

  // === Mobile ===
  @media (max-width: 767px) {
    padding: map.get(vars.$os-spacing, '2') map.get(vars.$os-spacing, '3');
    min-height: 48px;
    gap: map.get(vars.$os-spacing, '2');

    &__end {
      gap: map.get(vars.$os-spacing, '1');
    }
  }
}
```

#### 2.2 os-page-sub-header (responsive with mobile collapse)

```typescript
@Component({
  selector: 'os-page-sub-header',
  standalone: true,
  imports: [NgComponentOutlet, MobileFilterButtonComponent],
  template: `
    <!-- Desktop: full filters -->
    <div class="os-page-sub-header os-page-sub-header--desktop">
      <div class="os-page-sub-header__start">
        @for (item of zones().start ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>
      <div class="os-page-sub-header__end">
        @for (item of zones().end ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>
    </div>

    <!-- Mobile: collapsed to button -->
    <div class="os-page-sub-header os-page-sub-header--mobile">
      <os-mobile-filter-button />
      <div class="os-page-sub-header__end">
        @for (item of zones().end ?? []; track item.component) {
          <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
        }
      </div>
    </div>
  `,
  styleUrl: './page-sub-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSubHeaderComponent {
  readonly zones = input<SlotZones>({});
}
```

```scss
// page-sub-header.component.scss
:host {
  display: block;
  background: var(--layout-content-bg);
  border-bottom: 1px solid var(--layout-content-border);
}

.os-page-sub-header {
  display: flex;
  align-items: center;
  gap: map.get(vars.$os-spacing, '2');
  padding: map.get(vars.$os-spacing, '2') map.get(vars.$os-spacing, '4');
  min-height: 52px;

  &--desktop {
    @media (max-width: 767px) {
      display: none;
    }
  }

  &--mobile {
    display: none;
    @media (max-width: 767px) {
      display: flex;
    }
  }

  &__start {
    display: flex;
    align-items: center;
    gap: map.get(vars.$os-spacing, '2');
    flex: 1;
  }

  &__end {
    display: flex;
    align-items: center;
    gap: map.get(vars.$os-spacing, '2');
    flex-shrink: 0;
  }
}
```

---

### Phase 3: Mobile Components

#### 3.1 Mobile Filter Button

```typescript
@Component({
  selector: 'os-mobile-filter-button',
  standalone: true,
  imports: [IconDirective, TranslatePipe],
  template: `
    <button class="os-mobile-filter-btn" (click)="openDrawer()">
      <svg cIcon name="cilFilter"></svg>
      <span>{{ 'common.filters' | translate }}</span>
      @if (filterCount() > 0) {
        <span class="os-mobile-filter-btn__badge">{{ filterCount() }}</span>
      }
    </button>
  `,
  styleUrl: './mobile-filter-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterButtonComponent {
  private layout = inject(PageLayoutService);

  readonly filterCount = computed(() => this.layout.activeFilterCount());

  openDrawer(): void {
    this.layout.openFilterDrawer();
  }
}
```

#### 3.2 Filter Drawer

```typescript
@Component({
  selector: 'os-filter-drawer',
  standalone: true,
  imports: [NgComponentOutlet, IconDirective, TranslatePipe, ButtonDirective],
  template: `
    @if (isOpen()) {
      <div class="os-filter-drawer">
        <div class="os-filter-drawer__backdrop" (click)="close()"></div>
        <div class="os-filter-drawer__panel">
          <header class="os-filter-drawer__header">
            <h3>{{ 'common.filters' | translate }}</h3>
            <button type="button" (click)="close()">
              <svg cIcon name="cilX"></svg>
            </button>
          </header>

          <div class="os-filter-drawer__content">
            @for (item of filterComponents(); track item.component) {
              <ng-container *ngComponentOutlet="item.component; inputs: item.inputs" />
            }
          </div>

          <footer class="os-filter-drawer__footer">
            <button cButton color="secondary" (click)="clearFilters()">
              {{ 'common.clearAll' | translate }}
            </button>
            <button cButton color="primary" (click)="applyFilters()">
              {{ 'common.apply' | translate }}
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styleUrl: './filter-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDrawerComponent {
  private layout = inject(PageLayoutService);

  // Get filter components from subheader.start
  readonly filterComponents = computed(() => this.layout.subheader().start ?? []);
  readonly isOpen = computed(() => this.layout.isFilterDrawerOpen());

  close(): void {
    this.layout.closeFilterDrawer();
  }

  applyFilters(): void {
    this.layout.emitFilterApply();
  }

  clearFilters(): void {
    this.layout.emitFilterClear();
  }
}
```

---

### Phase 4: Layout Integration

#### 4.1 DefaultLayoutComponent Template

```html
<div class="layout" ...>
  <app-header></app-header>
  <app-sidebar ...></app-sidebar>

  <div class="layout__main">
    <main class="layout__content" ...>

      <!-- Page Header -->
      @if (layoutService.hasHeader()) {
        <os-page-header [zones]="layoutService.header()" />
      } @else {
        <!-- Default: breadcrumb -->
        <div class="layout__breadcrumb">
          <app-breadcrumb></app-breadcrumb>
        </div>
      }

      <!-- Page Subheader (handles desktop/mobile internally) -->
      @if (layoutService.hasSubheader()) {
        <os-page-sub-header [zones]="layoutService.subheader()" />
      }

      <!-- Scrollable Content -->
      <div class="layout__container">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>

  <!-- Mobile Filter Drawer (global) -->
  <os-filter-drawer />

  <!-- Other global components -->
  <app-global-fab></app-global-fab>
  <app-flyout-layout></app-flyout-layout>
  <os-command-palette></os-command-palette>
</div>
```

---

### Phase 5: Breadcrumb Mobile Support

#### 5.1 Simple Mobile Mode

```typescript
// Update existing breadcrumb component
@Component({
  selector: 'app-breadcrumb',
  template: `
    <!-- Desktop: full path -->
    <nav class="breadcrumb breadcrumb--desktop">
      @for (item of items(); track item.url; let last = $last) {
        @if (!last) {
          <a [routerLink]="item.url">{{ item.label | translate }}</a>
          <span class="breadcrumb__separator">/</span>
        } @else {
          <span class="breadcrumb__current">{{ item.label | translate }}</span>
        }
      }
    </nav>

    <!-- Mobile: current page only -->
    <h1 class="breadcrumb breadcrumb--mobile">
      {{ currentPageTitle() | translate }}
    </h1>
  `,
})
export class BreadcrumbComponent {
  readonly currentPageTitle = computed(() => {
    const items = this.items();
    return items.length > 0 ? items[items.length - 1].label : '';
  });
}
```

```scss
.breadcrumb {
  &--desktop {
    @media (max-width: 767px) {
      display: none;
    }
  }

  &--mobile {
    display: none;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;

    @media (max-width: 767px) {
      display: block;
    }
  }
}
```

---

### Phase 6: Generic Table Updates

```scss
// generic-table.component.scss
.generic-table {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--table-offset, 280px));

  &__scroll-container {
    flex: 1;
    overflow-y: auto;
  }

  table {
    width: 100%;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--layout-content-bg);
  }

  &__pagination {
    flex-shrink: 0;
    border-top: 1px solid var(--layout-content-border);
    background: var(--layout-content-bg);
  }
}
```

---

## Usage Example

```typescript
@Component({...})
export class CustomersComponent {
  private layout = inject(PageLayoutService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Set header
    this.layout.header.set({
      start: [{ component: BreadcrumbComponent }],
      end: [
        { component: RefreshButtonComponent, inputs: { onClick: () => this.refresh() } },
        { component: AddButtonComponent, inputs: { onClick: () => this.add() } },
      ],
    });

    // Set subheader (renders on desktop, collapses to button on mobile)
    this.layout.subheader.set({
      start: [
        { component: SmartFilterHeaderComponent, inputs: { config: this.filterConfig } },
      ],
      end: [
        { component: ColumnControlComponent },
      ],
    });

    // Listen to filter events from mobile drawer
    this.layout.filterApply$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyFilters());

    this.layout.filterClear$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.resetFilters());

    // Update active filter count when filters change
    effect(() => {
      const count = this.getActiveFilterCount();
      this.layout.setActiveFilterCount(count);
    });
  }
}
```

---

## Event Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Filter Drawer   │────►│ PageLayoutService │────►│ Page Component  │
│ (Apply clicked) │     │ emitFilterApply() │     │ filterApply$    │
└─────────────────┘     └──────────────────┘     │ .subscribe()    │
                                                  └─────────────────┘
```

---

## CSS Variables

```scss
:root {
  --page-header-height: 56px;
  --page-subheader-height: 52px;
  --table-offset: 280px;
}

@media (max-width: 767px) {
  :root {
    --page-header-height: 48px;
    --page-subheader-height: 48px;
    --table-offset: 200px;
  }
}
```
