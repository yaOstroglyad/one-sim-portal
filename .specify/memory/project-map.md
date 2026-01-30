# Project Map — One Sim Portal

> **Purpose:** Complete project knowledge for instant context
> **Read:** At session start to avoid iterative exploration
> **Last Updated:** 2026-01-16

---

## Project Overview

**One Sim Portal** — B2B SaaS platform for eSIM product management (white-label).

| Property | Value |
|----------|-------|
| Framework | Angular 21.0.5 (standalone, zoneless) |
| TypeScript | 5.9 |
| Root | `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/` |
| Dev Server | `npm start` → http://localhost:4200 |
| API Proxy | `/api/*` → `https://esim-server.dev.global-sim.app` |
| Routing | Hash-based (`#`) |
| i18n | en, he, ru, uk |

---

## Directory Structure

```
src/app/
├── shared/                     # Shared resources (59 components, 65+ services)
│   ├── components/             # Reusable UI components
│   ├── services/
│   │   ├── data/               # API/CRUD services (15+)
│   │   ├── ui/                 # UI state services
│   │   ├── cache-hub/          # CacheHubService (intelligent caching)
│   │   ├── search/             # Global search system
│   │   ├── account-context/    # Global account state
│   │   ├── feature-toggle/     # Feature flags
│   │   └── core/               # Base utilities
│   ├── models/                 # TypeScript interfaces (10 categories)
│   ├── utils/                  # Utility functions (8 categories)
│   ├── pipes/                  # Custom pipes (4)
│   └── directives/             # Custom directives (4)
│
├── features/                   # Self-contained feature modules
│   └── support-chat/           # Support chat (chatbot integration)
│
├── views/                      # Feature modules (15 views)
│   ├── analytics/dashboard/    # Dashboard (4 tabs)
│   ├── customers/              # Customer management
│   ├── orders/                 # Order processing
│   ├── inventory/              # eSIM inventory
│   ├── product-constructor/    # Product management
│   ├── tickets/                # Support tickets
│   ├── docs/                   # Public API documentation
│   ├── companies/              # Company management
│   ├── providers/              # Provider management
│   ├── roles/                  # Role/permission management
│   ├── settings/               # Application settings
│   ├── email-logs/             # Email log viewing
│   ├── storybook/              # Component documentation
│   ├── users/                  # User management
│   └── pages/                  # Login, 404, etc.
│
├── containers/default-layout/  # Main app layout
│   ├── components/header/      # App header
│   ├── components/sidebar/     # Sidebar navigation
│   ├── services/               # LayoutService
│   └── models/                 # Layout models
│
├── icons/icon-subset.ts        # CoreUI icons config (90+ icons)
├── app.routes.ts               # Route config
└── app.config.ts               # Providers

.claude/skills/                 # AI Skills (8 procedures)
docs/                           # Documentation (17 files)
specs/                          # Feature specifications (23 specs)
```

---

## Reusable Components (59 total)

### Data Display
| Component | Location | Use For |
|-----------|----------|---------|
| **GenericTableComponent** | `generic-table/` | Server-side lists with pagination/sorting/footer |
| **CardComponent** | `card/` | Dashboard cards (6 variants) |
| **BadgeComponent** | `badge/` | Status indicators (26 colors) |
| **StatusBadgeComponent** | `status-badge/` | Status badges |
| **TabsComponent** | `tabs/` | Tabbed interfaces |
| **TimelineComponent** | `timeline/` | Event history timeline |
| **DetailRowComponent** | `detail-row/` | Single detail row |
| **DetailSectionComponent** | `detail-section/` | Collapsible sections |
| **InfoStripComponent** | `info-strip/` | Information strip |
| **QrCodeComponent** | `qr-code/` | QR code display |
| **UserAvatarComponent** | `user-avatar/` | User profile avatar |
| **PriceComparisonComponent** | `price-comparison/` | Price comparison display |
| **UsageUnitsGridComponent** | `usage-units-grid/` | Usage metrics grid |

### Charts (Chart.js)
| Component | Location | Use For |
|-----------|----------|---------|
| **BarChartComponent** | `bar-chart/` | Bar charts |
| **LineChartComponent** | `line-chart/` | Line charts |
| **WaterfallChartComponent** | `waterfall-chart/` | Waterfall visualization |
| **ChartComponent** | `chart/` | Generic chart wrapper |
| **ChartLegendComponent** | `chart-legend/` | Chart legend display |

### Forms & Input
| Component | Location | Use For |
|-----------|----------|---------|
| **FormGeneratorComponent** | `form-generator/` | Dynamic JSON-schema forms |
| **SearchableSelectComponent** | `searchable-select/` | CDK overlay searchable select (signals) |
| **DatepickerComponent** | `datepicker/` | Date picker |
| **SmartFilterHeaderComponent** | `smart-filter-header/` | Advanced filter header |
| **PeriodSelectorComponent** | `period-selector/` | Date period selector |
| **ContextualTextComponent** | `contextual-text/` | Text with action menu |
| **ChipsInputComponent** | `form-inputs/chips-input/` | Tag/chip input field |
| **ColorPickerComponent** | `form-inputs/color-picker/` | Color selection |
| **FileUploadComponent** | `form-inputs/file-upload/` | File upload handler |
| **FormArrayItemComponent** | `form-inputs/form-array-item/` | Dynamic form array items |
| **MultiselectGridComponent** | `form-inputs/multiselect-grid/` | Grid-based multi-select |
| **RichTextInputComponent** | `form-inputs/rich-text-input/` | Rich text editor

### Dialogs & Overlays
| Component | Location | Use For |
|-----------|----------|---------|
| **GenericDialogComponent** | `generic-dialog/` | Modal dialogs |
| **GenericRightPanelComponent** | `generic-right-panel/` | Side panel overlays |
| **ConfirmationDialogComponent** | `confirmation-dialog/` | Confirmation modal |
| **DeleteConfirmationComponent** | `delete-confirmation/` | Delete action confirmation |
| **HtmlDialogComponent** | `html-dialog/` | HTML content dialog |
| **FilterDrawerComponent** | `filter-drawer/` | Mobile filter drawer |

### Navigation & Layout
| Component | Location | Use For |
|-----------|----------|---------|
| **CommandPaletteComponent** | `command-palette/` | Global search (Cmd+K) |
| **PageHeaderComponent** | `page-header/` | Dynamic header with slots |
| **PageSubHeaderComponent** | `page-sub-header/` | Responsive subheader |
| **PageTitleComponent** | `page-title/` | Simple page title |
| **HeaderModule** | `header-component/` | Legacy page headers |
| **BreadcrumbComponent** | `breadcrumb/` | Breadcrumb navigation |
| **BackButtonComponent** | `back-button/` | Back navigation |
| **AccountSelectorChipComponent** | `account-selector-chip/` | Header account dropdown |
| **PublicHeaderComponent** | `public-header/` | Public docs header |
| **MobileFilterButtonComponent** | `mobile-filter-button/` | Mobile filter trigger |

### UI Elements
| Component | Location | Use For |
|-----------|----------|---------|
| **OsDropdownComponent** | `ui/os-dropdown/` | CDK dropdown container |
| **OsMenuComponent** | `ui/os-menu/` | Context menus (keyboard nav) |
| **IconComponent** | `icon/` | SVG icons via `<app-icon>` |
| **TooltipComponent** | `tooltip/` | Tooltip display |
| **LoaderComponent** | `loader/` | Loading spinner |
| **EmptyStateComponent** | `empty-state/` | Empty state placeholder |
| **FabLayoutComponent** | `fab-layout/` | Floating action button |
| **ColumnControlComponent** | `column-control/` | Table column toggle |
| **PaginationComponent** | `pagination/` | Table pagination |

### Feature Components
| Component | Location | Use For |
|-----------|----------|---------|
| **AttachmentsComponent** | `attachments/` | File attachment handler |
| **CommentsComponent** | `comments/` | Comments display |
| **RefundProductComponent** | `refund-product/` | Refund interface |
| **DebugDisplayComponent** | `debug-display/` | Debug information |

---

## Key Services

### Global Search (`/shared/services/search/`)
| Service | Purpose |
|---------|---------|
| **SearchIndexService** | Central search orchestration (signals: query, isOpen, results) |
| **ClientSearchProvider** | Local data search |
| **BackendSearchProvider** | API-based search |
| **DeepLinksRegistry** | URL management for search results |

**Keyboard:** `Cmd+K` / `Ctrl+K` opens CommandPalette

### Account Context (`/shared/services/account-context/`)
| Service | Purpose |
|---------|---------|
| **AccountContextService** | Global account selection state (signals-based) |

### UI Services (`/shared/services/ui/`)
| Service | Purpose |
|---------|---------|
| **PageLayoutService** | Dynamic header/subheader slots |
| **NotificationService** | Toast/notification display |
| **ThemeService** | Theme switching |
| **ActiveThemeService** | Current theme state |
| **LanguageService** | i18n state |

### Core Services (`/shared/services/core/`)
| Service | Purpose |
|---------|---------|
| **DataService** | Base data service utilities |
| **CountryService** | Country/region data |
| **UserRoleService** | User role and permissions |

### Cache Hub (`/shared/services/cache-hub/`)
| Service | Purpose |
|---------|---------|
| **CacheHubService** | Intelligent caching (TTL, LRU, compression) |
| **CompressionManager** | Data compression |
| **MemoryManager** | Memory pressure monitoring |
| **MetricsCollector** | Performance metrics |

### Data Services (`/shared/services/data/`)
- **AccountsDataService** — Account operations
- **CompaniesDataService** — Company management
- **CustomersDataService** — Customer CRUD
- **DomainsDataService** — Domain management
- **OrdersDataService** — Order operations
- **ProductsDataService** — Product catalog
- **ProviderBundlesDataService** — Provider bundle data
- **ProvidersDataService** — Provider management
- **PurchasedProductsDataService** — Purchase history
- **SubscriberDataService** — Subscriber/SIM management
- **TariffOfferService** — Tariff management
- **TransactionDataService** — Transaction history
- **WhitelabelConfigService** — White-label configuration
- **WhitelabelSettingsService** — White-label custom settings
- **WhitelabelTemplatesService** — Email templates

### Utility Services
- **ExcelExportService** — Excel file generation and export

### Feature Toggle (`/shared/services/feature-toggle/`)
| Service | Purpose |
|---------|---------|
| **FeatureToggleService** | Feature flag management |

---

## Feature Modules (`/features/`)

Self-contained feature modules with their own components, services, and models.

### Support Chat (`/features/support-chat/`)

Chatbot integration for customer support via ICCID-based thread lookup.

**Structure:**
```
support-chat/
├── support-chat.shell.component.ts   # Main container (signals-based)
├── support-chat.shell.component.html
├── support-chat.shell.component.scss
├── models/
│   ├── chatbot.model.ts              # Thread, Message, API types
│   └── index.ts
└── services/
    ├── chatbot-api.service.ts        # API calls
    ├── chatbot-polling.service.ts    # Message polling
    ├── chatbot-state.service.ts      # Signal-based state management
    └── index.ts
```

**Services:**
| Service | Purpose |
|---------|---------|
| **ChatbotApiService** | API calls: getThreads, getMessages, createMessage, updateThread |
| **ChatbotPollingService** | Polling for new messages and typing indicators |
| **ChatbotStateService** | Signal-based state (threads, messages, loading, errors) |

**Models:**
| Model | Description |
|-------|-------------|
| `Thread` | Conversation thread (id, status, ticketId, isManual) |
| `Message` | Chat message (id, author, text, createdAt) |
| `ThreadStatus` | 'active' \| 'expired' \| 'manual' \| 'closed' |
| `MessageAuthor` | 'assistant' \| 'customer' \| 'operator' \| 'system' |

**Integration:** Used via `GlobalFlyoutService` from fab-layout.

---

## Layout (`/containers/default-layout/`)

Main application shell with navigation and header.

**Structure:**
```
default-layout/
├── default-layout.component.ts   # Main layout container
├── default-layout.routes.ts      # Child routes
├── _nav.ts                       # Navigation items config
├── components/
│   ├── header/                   # App header (account selector, search, user menu)
│   └── sidebar/                  # Collapsible sidebar navigation
├── models/
│   └── layout.model.ts           # Layout state interfaces
└── services/
    └── layout.service.ts         # Layout state management
```

**Navigation Config (`_nav.ts`):** Defines sidebar menu items with permissions.

---

## Models (10 categories)

| Category | Location | Contains |
|----------|----------|----------|
| **auth/** | `/models/auth/` | User, Role, LoginRequest/Response |
| **business/** | `/models/business/` | Account, Company, Customer, Provider |
| **communication/** | `/models/communication/` | Attachments, Comments, EmailLog, EmailTemplate |
| **core/** | `/models/core/` | Country, Domain, Error, PageResponse |
| **feature/** | `/models/feature/` | FeatureToggle interface |
| **payment/** | `/models/payment/` | Order, PaymentStrategies, InvoicingMethod |
| **product/** | `/models/product/` | Package, Resource |
| **search/** | `/models/search/` | SearchTypes, SearchConstants |
| **subscriber/** | `/models/subscriber/` | Sim, SubscriberInfo, SubscriberUsage |
| **ui/** | `/models/ui/` | AccountContext, PageLayout, TableColumnConfig |

---

## Utilities

| Category | Location | Contains |
|----------|----------|----------|
| **color/** | `/utils/color/` | 26 color definitions, manipulation |
| **currency/** | `/utils/currency/` | Price calculations |
| **data/** | `/utils/data/` | Excel export, formatting, search |
| **date/** | `/utils/date/` | Date/period manipulation |
| **dom/** | `/utils/dom/` | Print functionality |
| **http/** | `/utils/http/` | Error handlers |
| **pricing/** | `/utils/pricing/` | Price comparison logic |
| **testing/** | `/utils/testing/` | Mock utilities, `configureTestBed` helper |

---

## Pipes & Directives

### Pipes (`/shared/pipes/`)
- `CoverageIconPipe` — Coverage icon selector
- `DisplayValueByKeyPipe` — Object property accessor
- `FormatTimePipe` — Time formatting
- `ItemNamesPipe` — Item list formatting

### Directives (`/shared/directives/`)
- `CopyToClipboardDirective` — Copy-to-clipboard
- `GlobalSearchDirective` — Global search trigger
- `FeatureToggleDirective` — Feature flag conditional
- `HasPermissionDirective` — Permission-based rendering

---

## Documentation (`docs/`)

### Architecture (5 files)
| File | Content |
|------|---------|
| `error-handling.md` | HTTP error handling patterns |
| `mock-server.md` | Mock server setup |
| `permissions.md` | Role-based permissions |
| `right-panel-z-index.md` | Z-index strategy |
| `table-menu.md` | Table menu decisions |

### Components (10 files)
| File | Content |
|------|---------|
| `generic-table.md` | Table component guide |
| `bar-chart.md` | Bar chart guide |
| `waterfall-chart.md` | Waterfall chart guide |
| `chart-legend.md` | Chart legend guide |
| `account-selector.md` | Account selector guide |
| `generic-right-panel.md` | Right panel guide |
| `header.md` | Header component docs |
| `info-strip.md` | Info strip guide |
| `navigation-system.md` | Navigation overview |
| `email-logs.md` | Email logs view docs |

### Optimizations (1 file)
- `form-generator-hint.md` — Form generator hints

---

## Feature Specifications (`specs/`)

### Implemented (23 specs)
| Spec | Feature | Status |
|------|---------|--------|
| 001-tickets | Support ticket system | Done |
| 002-product-constructor | Product creation | Done |
| 003-dashboard | Dashboard KPIs | Done |
| 004-fab-layout | Floating action button | Done |
| 005-data-cache | CacheHub caching | Done |
| 006-mock-server-sync | Mock server | Done |
| 007-tickets-api-integration | Tickets API | Done |
| 008-tickets-bugfixes | Bug fixes | Done |
| 009-tickets-signals-migration | Signals migration | Done |
| 010-subscribers-api | Subscriber API | Done |
| 011-finance-api | Finance/billing | Done |
| 012-waterfall-chart | Waterfall visualization | Done |
| 013-angular-21-upgrade | Angular 19→21 | Done |
| 014-zoneless | Zoneless CD | Done |
| 015-traffic-dashboard | Traffic analytics | Done |
| 016-error-handling | Error handling | Done |
| 017-gmail-layout | Gmail-style layout | Done |
| 018-scss-refactor | SCSS refactoring | Done |
| 019-global-search | Global search | Done |
| 020-page-layout-slots | Page layout slots | Done |
| 021-global-account-context | Account context | Done |
| 022-searchable-select-cdk | CDK select | Done |
| 023-public-api-docs | Public API docs | Done |

---

## AI Skills (`.claude/skills/`)

| Skill | Trigger | Purpose |
|-------|---------|---------|
| **create-component** | "create component" | Angular component with templates |
| **create-service** | "create service" | Angular service with templates |
| **create-model** | "create model" | TypeScript model/interface |
| **document-component** | "document this" | Component documentation |
| **add-translations** | "add translation" | i18n keys (4 languages) |
| **review-code** | "review code" | Code review vs constitution |
| **fix-errors** | "fix errors" | Build/lint error fixes |
| **refactor-legacy** | "refactor" | Legacy code modernization |

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

### Files
| File | Purpose |
|------|---------|
| `_variables.scss` | Colors, CSS variables, spacing |
| `_mixins.scss` | SCSS mixins (30+) |
| `styles.scss` | Global styles |

### Color System (26 colors)
- **Semantic:** primary, secondary, success, danger, warning, info
- **Tailwind:** blue, indigo, purple, pink, red, orange, yellow, green, teal, cyan, gray

### CSS Variables
```scss
--os-color-primary: #007bff;
--os-color-text-primary: #2c2c2c;
--os-color-border: #e0e0e0;
--os-color-bg-hover: #f5f5f5;
--os-color-gray-{50-900}: /* grayscale */
```

### Key Mixins
```scss
@use "variables" as vars;
@use "mixins" as mixins;

@include mixins.os-dropdown-base();
@include mixins.os-input-base($height);
@include mixins.os-card-base($padding);
@include mixins.os-table-base();
@include mixins.os-button-base($height, $padding);
```

### Responsive Breakpoints
```scss
// Content breakpoints (component adaptation)
@include mixins.breakpoint-down('md') { }  // <= 768px
@include mixins.breakpoint-down('sm') { }  // <= 480px
@include mixins.breakpoint-up('lg') { }    // > 1024px

// Layout breakpoints (sidebar behavior)
@include mixins.layout-mobile { }    // <= 900px (sidebar hidden)
@include mixins.layout-desktop { }   // > 900px (sidebar visible)
```

**Breakpoint Variables:** xs(360), sm(480), sm-plus(576), md(768), lg(1024), xl(1280), xxl(1440)

---

## Icons

### Custom SVG Icons
**Location:** `/src/assets/icons/`

**Available (25+):**
- **Avatars:** avatar-assistant, avatar-operator, avatar-user
- **Charts:** bars-chart-empty, chart-line, chart-line-empty
- **Chat:** chat, chat-empty, chat-placeholder, chat-search
- **Actions:** cart, check-circle, content_copy, download, edit, plus
- **Navigation:** chevron-down, home, history, sidebar-toggle-arrows
- **Status:** default, globe-countries, info, no-activities, settings

**Usage:** `<app-icon icon="home" size="lg"></app-icon>`

**Sizes:** xs, sm, md (default), lg, xl, 2xl, 3xl, 4xl, or custom (e.g., "80px")

### CoreUI Icons
**Location:** `/src/app/icons/icon-subset.ts`

**Available (90+):** Preconfigured subset of CoreUI icons for use in components.
- **Navigation:** cilHome, cilMenu, cilArrowLeft, cilArrowRight, cilChevronLeft
- **Actions:** cilPlus, cilTrash, cilPencil, cilSave, cilReload, cilSearch
- **User:** cilUser, cilPeople, cilGroup, cilUserFollow, cilUserUnfollow
- **Status:** cilCheck, cilCheckCircle, cilWarning, cilBan, cilX
- **Data:** cilFile, cilFolder, cilCloudDownload, cilCloudUpload, cilFilter
- **UI:** cilSettings, cilBell, cilStar, cilCalendar, cilChart

**Usage:** Via CoreUI components (`<c-icon name="cilHome"></c-icon>`)

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
| Search | `search.` |
| Docs | `docs.` |
| Roles | `roles.` |

---

## Quick Reference

### Before Creating
1. **Component** → Check "Reusable Components" section
2. **Service** → Check `/shared/services/`
3. **Model** → Check `/shared/models/`
4. **Feature Module** → Check `/features/` for self-contained features
5. **Feature** → Check `specs/` for existing specs
6. **Skill** → Check `.claude/skills/`

### Key Patterns
- **Standalone components** with OnPush
- **`inject()`** not constructor injection
- **Signal APIs:** `input()`, `output()`, `signal()`, `computed()`
- **`@use "variables"`** not `@import` with paths
- **CSS variables** not hex colors
- **`<app-icon>`** not inline SVG
- **Error handlers:** `handleArrayError<T>()`, `handleObjectError<T>()`

---

## Statistics

| Category | Count |
|----------|-------|
| Components | 59 (incl. form-inputs, ui subcomponents) |
| Feature Modules | 1 (support-chat) |
| Services | 50+ files (8 categories) |
| Models | 50+ files (10 categories) |
| Documentation | 17 files |
| Feature Specs | 23 |
| AI Skills | 8 |
| Views | 15 |
| Utilities | 8 categories |
| Pipes | 4 |
| Directives | 4 |
| Icons | 115+ (25 custom SVG + 90 CoreUI) |

---

**Version:** 2.0.0 | **Last Updated:** 2026-01-16
