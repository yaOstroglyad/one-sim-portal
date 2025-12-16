# Project Map — One Sim Portal

> **Purpose:** Complete project knowledge for instant context
> **Read:** At session start to avoid iterative exploration
> **Last Updated:** 2025-12-03

---

## Project Overview

**One Sim Portal** — B2B SaaS platform for eSIM product management (white-label).

| Property | Value |
|----------|-------|
| Framework | Angular 21.0.5 (standalone components) |
| Root | `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/` |
| Dev Server | `npm start` → http://localhost:4200 |
| API Proxy | `/api/*` → `https://esim-server.dev.global-sim.app` |
| Routing | Hash-based (`#`) |
| i18n | en, he, ru, uk |

---

## Directory Structure

```
src/app/
├── shared/                     # Shared resources
│   ├── components/             # Reusable UI components
│   ├── services/
│   │   ├── data/               # API/CRUD services
│   │   ├── ui/                 # UI state services
│   │   ├── cache-hub/          # CacheHubService
│   │   └── feature-toggle/     # Feature flags
│   ├── models/                 # TypeScript interfaces
│   └── utils/                  # Utility functions
│
├── views/                      # Feature modules (lazy-loaded)
│   ├── customers/              # Customer management
│   ├── orders/                 # Order processing
│   ├── inventory/              # eSIM inventory
│   ├── analytics/dashboard/    # Dashboard (4 tabs)
│   ├── product-constructor/    # Product management
│   ├── tickets/                # Support tickets
│   └── pages/                  # Login, 404, etc.
│
├── layout/default-layout/      # Main layout
├── app.routes.ts               # Route config
└── app.config.ts               # Providers

src/assets/
├── i18n/                       # Translation files
├── icons/                      # Custom SVG icons
└── img/                        # Images

src/scss/
├── _variables.scss             # Colors, CSS variables
├── _mixins.scss                # SCSS mixins
└── styles.scss                 # Global styles
```

---

## Reusable Components

### Data Display
| Component | Location | Use For |
|-----------|----------|---------|
| **GenericTableComponent** | `/shared/components/generic-table/` | Server-side lists with pagination/sorting |
| **CardComponent** | `/shared/components/card/` | Dashboard cards (6 variants) |
| **BadgeComponent** | `/shared/components/badge/` | Status indicators (26 colors) |
| **TabsComponent** | `/shared/components/tabs/` | Tabbed interfaces |

### Forms & Input
| Component | Location | Use For |
|-----------|----------|---------|
| **FormGeneratorComponent** | `/shared/components/form-generator/` | Dynamic JSON-schema forms |
| **GenericDialogComponent** | `/shared/components/generic-dialog/` | Modal dialogs |

### Layout & Navigation
| Component | Location | Use For |
|-----------|----------|---------|
| **GenericRightPanelComponent** | `/shared/components/generic-right-panel/` | Side panel overlays |
| **HeaderModule** | `/shared/components/header/` | Page headers with filters |
| **AccountSelectorComponent** | `/shared/components/account-selector/` | Account switching |

### UI Elements
| Component | Location | Use For |
|-----------|----------|---------|
| **OsDropdownComponent** | `/shared/components/ui/os-dropdown/` | Dropdown container |
| **OsMenuComponent** | `/shared/components/ui/os-menu/` | Context menus (keyboard nav) |
| **IconComponent** | `/shared/components/icon/` | SVG icons via `<app-icon>` |
| **ContextualTextComponent** | `/shared/components/contextual-text/` | Text with action menu |

### Charts
| Component | Location | Use For |
|-----------|----------|---------|
| **BarChartComponent** | `/shared/components/bar-chart/` | Bar charts (Chart.js) |

---

## Key Services

### Data Services (`/shared/services/data/`)
- **CustomersDataService** — Customer CRUD
- **OrdersDataService** — Order operations
- **ProductsDataService** — Product catalog
- **InventoryDataService** — eSIM inventory

### Core Services
| Service | Purpose |
|---------|---------|
| **CacheHubService** | Smart caching with TTL (see spec) |
| **AuthService** | JWT tokens, permissions |
| **FeatureToggleService** | Feature flags |
| **LanguageService** | i18n state |
| **ThemeService** | Theme switching |

### Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class EntityDataService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);

  list(): Observable<Entity[]> {
    return this.cacheHub.get(
      'entities:list',
      () => this.http.get<Entity[]>('/api/v1/entities'),
      { dataType: DataType.BUSINESS }
    ).pipe(catchError(handleArrayError<Entity>('fetching')));
  }
}
```

---

## Business Domain

### Entity Hierarchy
```
Countries → Regions → Provider Products → Products → Company Products
                ↑              ↑             ↑
            Bundles ----→ Tariff Offers ----┘
```

### Core Entities
| Entity | Description |
|--------|-------------|
| **Company** | B2B client (reseller) |
| **Customer** | End user (Private/Corporate) |
| **Product** | eSIM product definition |
| **Order** | Purchase transaction |
| **Subscriber** | Activated eSIM (ICCID) |
| **Ticket** | Support request |

### User Roles
| Role | Access |
|------|--------|
| Admin | Full system |
| Customer | Self-service, own data |
| Support | Customer management, tickets |
| Special | Extended permissions |

---

## API Structure

**Pattern:** `/api/v1/{resource}/{command|query}/{action}`

```
GET  /api/v1/customers/query/all           # List
POST /api/v1/customers/command/create      # Create
GET  /api/v1/customers/query/{id}/details  # Detail
PUT  /api/v1/customers/command/{id}/update # Update
```

---

## SCSS & Styling

### Color System (26 colors)
- Semantic: `primary`, `secondary`, `success`, `danger`, `warning`, `info`
- Tailwind: `blue`, `indigo`, `purple`, `pink`, `red`, `orange`, `yellow`, `green`, `teal`, `cyan`, `gray`

### CSS Variables
```scss
--os-color-primary: #007bff;
--os-color-text-primary: #2c2c2c;
--os-color-border: #e0e0e0;
--os-color-bg-hover: #f5f5f5;
--os-color-gray-{50-900}: /* grayscale */
```

### Available Mixins (`/src/scss/_mixins.scss`)
```scss
@include mixins.dashboard-card-header();
@include mixins.dashboard-chart-container($height);
@include mixins.dashboard-kpi-grid($columns);
@include mixins.interactive-states();
@include mixins.glassmorphism();
@include mixins.elevation($level);
```

---

## Common Patterns

### Component Structure
```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ...]
})
export class MyComponent {
  private readonly service = inject(MyService);
  private readonly cdr = inject(ChangeDetectorRef);
}
```

### Generic Table Usage
```typescript
// Component
tableConfig$ = this.tableService.getTableConfig();
dataList$: Observable<Entity[]>;

// Template
<generic-table [config$]="tableConfig$"
               [data$]="dataList$"
               (pageChange)="onPageChange($event)">
</generic-table>
```

### Cache Invalidation
```typescript
// After mutation (POST/PUT/DELETE)
this.cacheHub.invalidatePattern('default:entities:');
```

### Feature Toggles
```typescript
import { isToggleActive } from '@shared/services/feature-toggle';

if (isToggleActive('new-feature')) { ... }
```

---

## Icons

**Location:** `/src/assets/icons/`

**Available:** home, chat, chat-search, chat-empty, chat-placeholder, plus, settings, history, default

**Usage:** `<app-icon icon="home" size="lg"></app-icon>`

**Sizes:** xs, sm, md (default), lg, xl, 2xl, 3xl, 4xl, or custom (e.g., "80px")

---

## Translation Prefixes

| Entity | Prefix |
|--------|--------|
| Companies | `company.` |
| Customers | `customer.` |
| Orders | `order.` |
| Products | `package.` |
| Users | `user.` |
| Inventory | `inventory.` |
| Tickets | `ticket.` |

---

## Feature Locations

| Feature | Location | Spec |
|---------|----------|------|
| Dashboard | `/views/analytics/dashboard/` | `dashboard.spec.md` |
| Product Constructor | `/views/product-constructor/` | `product-constructor.spec.md` |
| Tickets | `/views/tickets/` | `tickets.spec.md` |
| FAB Layout | `/shared/components/fab-layout/` | `fab-layout.spec.md` |
| CacheHub | `/shared/services/cache-hub/` | `data-cache.spec.md` |

---

## Quick Reference

### Before Creating
1. **Component** → Check this file's "Reusable Components" section
2. **Service** → Check `/shared/services/` directory
3. **Model** → Check `/shared/models/` directory
4. **Feature** → Check `.specify/specs/` for existing specs

### Key Rules (see constitution.md for full list)
- Absolute paths only
- Standalone components with OnPush
- Use `inject()` not constructor injection
- Error handlers: `handleArrayError<T>()`, `handleObjectError<T>()`
- SCSS: `@use` not `@import`, CSS variables not hex colors
- Icons: `<app-icon>` not inline SVG

---

**Version:** 1.0.0 | **Last Updated:** 2025-12-03
