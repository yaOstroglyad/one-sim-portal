# Right Panel Z-Index Architecture

> **Status:** Technical Debt
> **Created:** 2026-01-08
> **Priority:** Medium

## Current Problem

The `GenericRightPanelComponent` renders inside page content (via components like `smart-filter-header`), which causes z-index stacking issues:

1. **Panel appears behind page elements** (os-page-header, generic-table headers)
2. **Backdrop doesn't cover header/sidebar** properly
3. **Inconsistent behavior** across different pages

### Root Cause

When a `position: fixed` element is inside a container that creates a stacking context (via `overflow`, `transform`, `position: sticky` + `z-index`, etc.), its z-index is effectively "capped" by the parent's stacking context.

```
DOM Structure (problematic):
├── app-header (z-index: 1001, fixed)
├── app-sidebar (z-index: 1000, fixed)
└── layout__main
    └── layout__content
        └── os-page-header (z-index: 10, sticky) ← Creates stacking context
        └── router-outlet
            └── page-component
                └── smart-filter-header
                    └── app-generic-right-panel (z-index: 999) ← Trapped!
```

## Current Z-Index Map

| Component | z-index | Position | Location |
|-----------|---------|----------|----------|
| app-header | 1001 | fixed | root |
| app-sidebar | 1000 | fixed | root |
| mobile-overlay | 999 | fixed | root |
| panel-backdrop | 1100 | fixed | inside content (QUICK FIX) |
| right-panel | 1101 | fixed | inside content (QUICK FIX) |
| app-global-fab | 1040 | fixed | root |
| flyout-backdrop | 1050 | fixed | root |
| flyout | 1055 | fixed | root |

## Quick Fix (Current Implementation)

### Fix 1: Increased z-index
- `.panel-backdrop`: 998 → **1100**
- `.right-panel`: 999 → **1101**

This alone is NOT sufficient when the panel is rendered inside a stacking context.

### Fix 2: External Panel Pattern for SmartFilterHeader

See detailed section below: [SmartFilterHeader Problem](#smartfilterheader-problem)

---

## SmartFilterHeader Problem

### The Issue

`SmartFilterHeaderComponent` internally renders `GenericRightPanelComponent`. When `smart-filter-header` is placed inside `app-header.os-header-sticky`, the panel becomes trapped in the sticky element's stacking context.

```
DOM Structure (problematic):
<app-header class="os-header-sticky">        ← position: sticky + z-index: 2
  <app-smart-filter-header>
    <app-generic-right-panel>               ← position: fixed, z-index: 1101
      ...                                      BUT trapped inside parent context!
    </app-generic-right-panel>
  </app-smart-filter-header>
</app-header>
<generic-table>
  <ag-header class="ag-header">             ← position: sticky, z-index: 5
    ...                                        Appears ABOVE the panel!
  </ag-header>
</generic-table>
```

**Result:** The panel appears behind ag-grid headers and other sticky elements.

### Attempted Solutions

#### Option A: Remove z-index from `.os-header-sticky` (REJECTED)

```scss
.os-header-sticky {
  position: sticky;
  top: 64px;
  // z-index: 2; // Removed to avoid stacking context
}
```

**Problem:** This breaks other behaviors - sticky headers no longer stack correctly over scrolled content.

#### Option B: External Panel Pattern (CURRENT WORKAROUND)

Added `useExternalPanel` input to `SmartFilterHeaderComponent`:

```typescript
// smart-filter-header.component.ts
useExternalPanel = input<boolean>(false);
panelOpenChange = output<boolean>();
```

When `useExternalPanel=true`:
- SmartFilterHeader does NOT render the panel internally
- Emits `panelOpenChange` events when user clicks filter button
- Parent component renders panel OUTSIDE the sticky header

### Implementation Example

```html
<!-- customers.component.html -->

<!-- Header with smart-filter (panel NOT rendered here) -->
<app-header class="os-header-sticky">
  <app-smart-filter-header
    [formGroup]="filterForm"
    [config]="smartFilterConfig"
    [useExternalPanel]="true"
    (panelOpenChange)="onPanelOpenChange($event)">

    <ng-template #advancedFilters>
      <ng-container *ngTemplateOutlet="filterFields"></ng-container>
    </ng-template>
  </app-smart-filter-header>
</app-header>

<generic-table ...></generic-table>

<!-- Panel rendered OUTSIDE sticky header -->
<app-generic-right-panel
  [isOpen]="showFilterPanel()"
  [title]="'smartFilter.advancedFilters' | translate"
  (close)="closeFilterPanel()">

  <div panel-content>
    <ng-container *ngTemplateOutlet="filterFields"></ng-container>
  </div>

  <ng-container panel-actions>
    <button class="btn btn-primary" (click)="closeFilterPanel()">
      Apply
    </button>
  </ng-container>
</app-generic-right-panel>
```

```typescript
// customers.component.ts
protected readonly showFilterPanel = signal(false);

onPanelOpenChange(isOpen: boolean): void {
  this.showFilterPanel.set(isOpen);
}

closeFilterPanel(): void {
  this.showFilterPanel.set(false);
}
```

### When to Use External Panel

Use `[useExternalPanel]="true"` when `smart-filter-header` is inside:
- `app-header.os-header-sticky`
- Any element with `position: sticky` + `z-index`
- Any element with `transform`, `filter`, `perspective`
- Any element with `overflow: hidden/auto/scroll`

### Drawbacks of This Workaround

1. **Code duplication** - Panel markup repeated in each component
2. **Tight coupling** - Parent must know about panel internals
3. **Template complexity** - Need to share filter templates between locations
4. **Maintenance burden** - Changes to panel structure require updates everywhere

### Why Proper Solution is Needed

This workaround is acceptable for 1-2 pages, but doesn't scale. The proper solution (PanelService + PanelOutlet) would:
- Render ALL panels at root level automatically
- No changes needed in page components
- Single source of truth for panel rendering

## Proper Solution (Future)

### Approach: Root-Level Panel Service

Similar to how `FlyoutLayoutComponent` works, create a centralized panel rendering system:

```
DOM Structure (proper):
├── app-header (z-index: 1001)
├── app-sidebar (z-index: 1000)
├── layout__main
│   └── layout__content
│       └── [page content - no panel here]
├── app-global-fab (z-index: 1040)
├── app-flyout-layout (z-index: 1055)
└── app-panel-outlet (z-index: 1060) ← NEW: Panels render here
```

### Implementation Steps

1. **Create `PanelService`**
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class PanelService {
     private panelState = signal<PanelConfig | null>(null);

     readonly isOpen = computed(() => this.panelState() !== null);
     readonly config = this.panelState.asReadonly();

     open(config: PanelConfig): void { ... }
     close(): void { ... }
   }
   ```

2. **Create `PanelOutletComponent`**
   - Renders at root level in `default-layout.component.html`
   - Subscribes to `PanelService` state
   - Uses `ng-template` + `ngTemplateOutlet` for content projection

3. **Update `GenericRightPanelComponent`**
   - Option A: Refactor to use `PanelService` internally
   - Option B: Create new `os-panel` component, deprecate old one

4. **Migration**
   - Update all usages to new pattern
   - Remove inline panel rendering from page components

### Benefits

- **Consistent stacking** - panels always above content
- **Proper backdrop** - covers only content area (not header/sidebar)
- **Centralized control** - one place for panel logic
- **Better animations** - smoother transitions without stacking issues

### Example Usage (Future API)

```typescript
// In component
constructor(private panelService: PanelService) {}

openFilters(): void {
  this.panelService.open({
    title: 'Filters',
    content: this.filterTemplate,
    actions: this.filterActions,
    onClose: () => this.applyFilters()
  });
}
```

```html
<!-- In template -->
<ng-template #filterTemplate>
  <app-filter-form [filters]="filters" />
</ng-template>
```

## Related Files

### Core Components
- `src/app/shared/components/generic-right-panel/`
- `src/app/shared/components/smart-filter-header/`
- `src/app/containers/default-layout/`
- `src/scss/_fab-layout.scss` (reference for flyout z-index)

### Pages Using External Panel Workaround
- `src/app/views/customers/customers.component.ts` - uses `[useExternalPanel]="true"`

### Pages Without Issue (panel outside sticky header)
- `src/app/views/product-constructor/components/company-products/company-product-list/` - panel rendered at component root level

## References

- [Angular CDK Portal](https://material.angular.io/cdk/portal/overview)
- [CSS Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
