# One-Sim-Portal Constitution

> **Version:** 1.0.0 | **Ratified:** 2025-12-03 | **Last Amended:** 2025-12-03

## Project Identity

- **Name:** One-Sim-Portal
- **Purpose:** B2B eSIM management platform for telecom operators
- **Domain:** eSIM provisioning, subscriber management, billing, analytics
- **Stack:** Angular 21.0.5 (Zoneless), TypeScript 5.9, CoreUI, Angular Material, RxJS, Chart.js
- **Root Directory:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

---

## I. Absolute Paths Only (NON-NEGOTIABLE)

**All file operations MUST use absolute paths. Relative paths will cause failures.**

```
❌ FORBIDDEN: ../../../../path/to/file
✅ REQUIRED:  /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/path/to/file
```

---

## II. Component Architecture (NON-NEGOTIABLE)

### Standalone Components Only
- **ALL components MUST be standalone** (`standalone: true`)
- **NO NgModules** for new features
- **NO HttpClientModule imports** — HttpClient is provided globally

> **Note:** Angular 21 makes `standalone: true` the default only for NEW components created via `ng generate`. Existing components still require explicit `standalone: true`.

### OnPush Change Detection
- **ALL components MUST use OnPush** (`changeDetection: ChangeDetectionStrategy.OnPush`)
- Use `markForCheck()` instead of `detectChanges()`
- **NEVER mutate objects/arrays directly** — use immutable patterns

### Dependency Injection with inject()
- **ALL dependencies MUST use `inject()` function**
- **NEVER use constructor injection**
- Refactor existing constructor injection when encountered

```typescript
// ✅ CORRECT
private readonly http = inject(HttpClient);
private readonly cdr = inject(ChangeDetectorRef);

// ❌ FORBIDDEN
constructor(private http: HttpClient) {}
```

### HTTP Interceptors: Circular Dependency Prevention (NON-NEGOTIABLE)

> **⚠️ CRITICAL:** HTTP Interceptors have special DI constraints due to circular dependencies.

**Problem:** Interceptors are created during HttpClient initialization. If an interceptor depends on a service that uses HttpClient, a circular dependency occurs:
```
HttpErrorInterceptor → AuthService → HttpClient → HTTP_INTERCEPTORS → HttpErrorInterceptor
```

**Solution:** In HTTP Interceptors, use `Injector` for lazy loading of ALL services:

```typescript
// ✅ CORRECT - Lazy injection in HTTP Interceptor
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private _authService: AuthService | null = null;
  private _notification: NotificationService | null = null;

  constructor(private readonly injector: Injector) {}

  private get authService(): AuthService {
    if (!this._authService) {
      this._authService = this.injector.get(AuthService);
    }
    return this._authService;
  }

  private get notification(): NotificationService {
    if (!this._notification) {
      this._notification = this.injector.get(NotificationService);
    }
    return this._notification;
  }
}

// ❌ FORBIDDEN - Direct injection in HTTP Interceptor
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService,      // CIRCULAR!
    private readonly notification: NotificationService // CIRCULAR!
  ) {}
}
```

**Rule:** ANY service that might use HttpClient (directly or transitively) MUST be lazy-loaded via Injector in HTTP Interceptors.

### Signal APIs (Angular 21)

#### Component Inputs/Outputs
- **Use `input()` instead of `@Input()`**
- **Use `output()` instead of `@Output()`**
- **Use `effect()` for input synchronization**

```typescript
// ✅ CORRECT
public readonly value = input<string>();
public readonly valueChange = output<string>();

// ❌ FORBIDDEN
@Input() value?: string;
@Output() valueChange = new EventEmitter<string>();
```

#### State Management with Signals (NON-NEGOTIABLE)
- **Use `signal()` for component local state** (not BehaviorSubject/Observable)
- **Use `computed()` for derived state**
- **Use `effect()` for side effects on signal changes**
- **Services exposing reactive data MUST use `Signal<T>`**

```typescript
// ✅ CORRECT - Component state with signals
@Component({ ... })
export class MyComponent {
  // Local state
  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly items = signal<Item[]>([]);

  // Derived state
  readonly filteredItems = computed(() =>
    this.items().filter(item => item.name.includes(this.query()))
  );

  readonly isEmpty = computed(() => this.filteredItems().length === 0);

  // Side effects
  constructor() {
    effect(() => {
      console.log('Query changed:', this.query());
    });
  }

  // Updating state
  toggle(): void {
    this.isOpen.update(v => !v);
  }
}

// ✅ CORRECT - Service with signals
@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly results = signal<SearchResult[]>([]);
  readonly isLoading = signal(false);

  search(query: string): void {
    this.isLoading.set(true);
    // ...
  }
}

// ❌ FORBIDDEN - Using BehaviorSubject for local state
private readonly isOpen$ = new BehaviorSubject(false);

// ❌ FORBIDDEN - Observable for simple derived state
readonly filteredItems$ = combineLatest([...]).pipe(...);
```

**When to use Observable vs Signal:**
| Use Case | Use |
|----------|-----|
| Component local state | `signal()` |
| Derived/computed values | `computed()` |
| HTTP requests | `Observable` (from HttpClient) |
| Complex async streams (debounce, switchMap) | `Observable` |
| Service exposing current value | `signal()` |
| Cross-component communication | `signal()` in shared service |

### Control Flow Syntax
- **Use `@if/@for/@switch`** instead of `*ngIf/*ngFor/*ngSwitch`
- New components MUST use modern control flow

```html
<!-- ✅ CORRECT -->
@if (isVisible()) {
  <div>Content</div>
}

<!-- ❌ FORBIDDEN in new code -->
<div *ngIf="isVisible">Content</div>
```

### Component Selector Prefix
- **ALL custom components MUST use `os-` prefix**

```typescript
// ✅ CORRECT
selector: 'os-my-component'

// ❌ FORBIDDEN
selector: 'app-my-component'
```

### Template Separation
- **Complex templates (3+ logical blocks) MUST be in separate `.html` files**
- Simple single-block templates may use inline `template`

### Host Display for Block-Level Components
- **Components used as block-level elements MUST declare `:host { display: block; }` in SCSS**
- Angular components render as custom HTML elements which default to `display: inline`
- CSS margins/padding do not work correctly on inline elements
- This makes the component self-documenting and portable

```scss
// ✅ CORRECT - In component SCSS file
:host {
  display: block;
}

.my-component {
  // component styles...
}

// ❌ WRONG - Relying on global styles or parent to set display
```

**When to add `:host { display: block }`:**
- Component is placed directly in layouts (not wrapped in a `<div>`)
- Component needs margins, padding, or other block-level behaviors
- Component is used in flex/grid containers where sizing matters

---

## III. Error Handling Architecture (NON-NEGOTIABLE)

> **Full Documentation:** [docs/architecture/error-handling.md](../../docs/architecture/error-handling.md)

### 4-Layer Architecture

| Layer | Responsibility | Shows Notification? |
|-------|----------------|---------------------|
| **HTTP Interceptor** | 401→login, 403→403 page, retry 503/504, network errors | Only network errors |
| **Service Layer** | Business logic, data transformation, NO UI | Never |
| **Component Layer** | Context-aware messages, user feedback | Yes (via NotificationService) |
| **GlobalErrorHandler** | Catch uncaught errors, logging | Yes (generic fallback) |

### Rules by Layer

**Interceptor (Layer 1):**
- MUST redirect to `/login` on 401 (no notification)
- MUST redirect to `/403` on 403 (no notification)
- MUST retry 2-3 times for 503/504/network errors
- MUST pass through 400/404/409/422/500 to components

**Services (Layer 2):**
```typescript
// ✅ CORRECT - Let errors propagate to component
getCustomer(id: string): Observable<Customer> {
  return this.http.get<Customer>(`/api/customers/${id}`);
}

// ✅ CORRECT - Silent fallback ONLY for non-critical data
getStats(id: string): Observable<Stats | null> {
  return this.http.get<Stats>(`/api/stats/${id}`).pipe(
    catchError(() => of(null)) // Stats are supplementary
  );
}

// ❌ FORBIDDEN - Service shows notification
getCustomer(id: string): Observable<Customer | null> {
  return this.http.get<Customer>(...).pipe(
    catchError(err => {
      this.notification.error('Error!'); // NO! Component's job
      return of(null);
    })
  );
}
```

**Components (Layer 3):**
```typescript
// ✅ CORRECT - Handle errors with context-aware messages
loadCustomer(id: string): void {
  this.customerService.getCustomer(id).subscribe({
    next: (customer) => this.customer.set(customer),
    error: (error: ApiError) => {
      if (error.code === '404') {
        this.notification.error('customer.notFound');
        this.router.navigate(['/customers']);
        return;
      }
      this.notification.error('customer.loadError');
    }
  });
}

// ❌ FORBIDDEN - Direct MatSnackBar usage
this.snackBar.open('Error!', ...); // Use NotificationService

// ❌ FORBIDDEN - Hardcoded messages
this.notification.error('Ошибка загрузки'); // Use i18n keys
```

### NotificationService (MANDATORY)

```typescript
// ✅ CORRECT - Always use NotificationService with i18n keys
this.notification.success('customer.saved');
this.notification.error('customer.loadError');
this.notification.warning('customer.unsavedChanges');

// ❌ FORBIDDEN
this.snackBar.open('Success!', ...);
this.matSnackBar.open('Error', ...);
```

### Legacy Error Handlers (DEPRECATED)

> **Warning:** `handleArrayError()`, `handleObjectError()` are being refactored.
> See [016-error-handling spec](../../specs/016-error-handling/spec.md) for migration plan.

Until refactoring is complete:
- New code MUST follow 4-layer architecture
- Existing code will be migrated as part of error handling refactoring

---

## IV. Models & Interfaces Organization

### Location Rules
- **Reusable models → `/shared/models/{category}/`**
- **Domain-specific models → `/views/{feature}/models/`**
- **NEVER create interfaces inside component files**

### Category Structure
```
/shared/models/
├── auth/           # Authentication models
├── business/       # Business entities (accounts, companies, customers)
├── communication/  # Notifications, messages
├── core/           # Pagination, errors, countries
├── feature/        # Feature toggles
├── payment/        # Payment, billing
├── product/        # Products, bundles, tariffs
├── subscriber/     # Subscribers, subscriptions
└── ui/             # Table configs, form configs
```

### Naming Convention
- **Files:** `kebab-case.model.ts` or `kebab-case.interface.ts`
- **Interfaces:** PascalCase without `I` prefix (`User`, not `IUser`)
- **Request/Response:** `CreateCustomerRequest`, `CustomerResponse`

### Const Type Definitions (NON-NEGOTIABLE)

**ALWAYS use `as const` objects with derived types instead of inline union types.**

```typescript
// ✅ CORRECT - Const object with derived type
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

// Usage in interface
interface Order {
  id: string;
  status: OrderStatus;  // Type-safe, uses const
}

// Usage in code
if (order.status === ORDER_STATUSES.COMPLETED) { ... }

// ❌ FORBIDDEN - Inline union types
interface Order {
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

// ❌ FORBIDDEN - Enum (less flexible, worse tree-shaking)
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
}
```

**Benefits of const types:**
- **Single source of truth** — values defined once
- **Refactoring safe** — rename in one place
- **Runtime access** — can iterate over values, use in dropdowns
- **Better tree-shaking** than enums

**Pattern for related types:**
```typescript
// search.types.ts
export const SEARCH_ITEM_TYPES = {
  NAVIGATION: 'navigation',
  ACTION: 'action',
} as const;
export type SearchItemType = typeof SEARCH_ITEM_TYPES[keyof typeof SEARCH_ITEM_TYPES];

export const MATCH_SOURCES = {
  LABEL: 'label',
  KEYWORD: 'keyword',
  URL: 'url',
} as const;
export type MatchSource = typeof MATCH_SOURCES[keyof typeof MATCH_SOURCES];

// All type values accessible at runtime
const allTypes = Object.values(SEARCH_ITEM_TYPES); // ['navigation', 'action']
```

---

## V. Services Organization

### Location Rules
- **Reusable services → `/shared/services/{category}/`**
- **Domain-specific services → `/views/{feature}/services/`**

### Category Structure
```
/shared/services/
├── data/           # API/CRUD services
├── ui/             # UI/UX services (theme, language, notifications)
├── core/           # Base classes, utilities
├── cache-hub/      # CacheHubService
└── feature-toggle/ # Feature flags
```

### Naming Convention
- **Data services:** `{resource}-data.service.ts`
- **UI services:** `{feature}.service.ts`

---

## VI. Utility Functions Organization

### Location Rules
- **Reusable utilities → `/shared/utils/{category}/`**
- **Domain-specific utilities → `/views/{feature}/utils/`**

### Category Structure
```
/shared/utils/
├── color/      # Color manipulation
├── data/       # Data formatting, search
├── date/       # Date manipulation
├── currency/   # Currency conversion
├── dom/        # DOM operations, printing
├── http/       # HTTP error handling
└── testing/    # Mock utilities
```

---

## VII. SCSS Architecture (NON-NEGOTIABLE)

### Modern @use Syntax
```scss
// ✅ CORRECT - Mandatory import order
@use "sass:map";           // FIRST
@use "variables" as vars;  // SECOND
@use "mixins" as mixins;   // THIRD

// ❌ FORBIDDEN
@import "../../../../scss/variables";  // Legacy @import
```

### Design System Values
```scss
// ✅ CORRECT - Use design system
padding: map.get(vars.$os-spacing, '4');
color: var(--os-color-text-primary);

// ❌ FORBIDDEN - Hardcoded values
padding: 16px;
color: #2c2c2c;
```

### CSS Variables for Colors
- **ALWAYS use CSS variables** (`var(--os-color-*)`)
- **NEVER hardcode hex values**
- Available: `--os-color-gray-50` through `--os-color-gray-900`
- Semantic: `--os-color-text-primary`, `--os-color-border`, etc.

### BEM Naming
```scss
.os-component-name { }
.os-component-name__element { }
.os-component-name--modifier { }
```

### No Automatic Dark Mode
- **NEVER use `@media (prefers-color-scheme: dark)`**
- Wait for official dark mode implementation

### Mixin Hierarchy Architecture (NON-NEGOTIABLE)

The SCSS architecture uses a 3-level hierarchical mixin system to eliminate code duplication:

```
Level 1: Abstract Bases (foundation)
    ↓
Level 2: Specialized Mixins (inherit from Level 1)
    ↓
Level 3: Sub-component Mixins (for complex components like tables)
```

**Level 1 - Abstract Bases:**
| Mixin | Purpose | Parameters |
|-------|---------|------------|
| `os-surface-base($bg, $border, $radius)` | Any themed container | CSS var names, radius |
| `os-interactive-base($transition)` | Clickable elements | Transition duration |
| `os-feedback-base($color-var)` | Status indicators | CSS var name |

**Level 2 - Specialized Mixins (prefer these for standard patterns):**
| Mixin | Inherits | Use For |
|-------|----------|---------|
| `os-input-base($height, $padding)` | surface | Input fields, search boxes |
| `os-dropdown-base($min-width, $padding)` | surface | Dropdowns, popups, menus |
| `os-card-base($padding, $radius)` | surface | Cards, sections, panels |
| `os-panel-base($padding)` | surface | Panels with header/content |
| `os-overlay-base($opacity)` | - | Modal backdrops, overlays |
| `os-table-base()` | surface | Table containers |
| `os-button-base($height, $padding)` | surface + interactive | All buttons |
| `os-list-item-base($padding)` | interactive | List items, menu items |
| `os-icon-button-base($size)` | interactive | Icon-only buttons |
| `os-table-sortable-base()` | interactive | Sortable table headers |
| `os-spinner-base($size, $border-width)` | feedback | Loading spinners |
| `os-alert-base($variant)` | feedback | Alert messages |
| `os-badge-base($variant)` | feedback | Status badges |

**Level 3 - Table Sub-components:**
| Mixin | Inherits | Use For |
|-------|----------|---------|
| `os-table-header-base()` | table | Table header row |
| `os-table-row-base()` | table | Body rows with hover/selected |
| `os-table-cell-base($padding)` | table | Cell padding/alignment |
| `os-table-actions-base()` | table | Action buttons column |

### DRY Principle for Component Styles (NON-NEGOTIABLE)

**Before writing ANY component styles, check `_mixins.scss` for existing patterns!**

```scss
// ✅ CORRECT - Use Level 2 mixins directly
.my-dropdown { @include mixins.os-dropdown-base(); }
.my-input { @include mixins.os-input-base(40px); }
.my-card { @include mixins.os-card-base(1.5rem); }

// ✅ CORRECT - Compose from Level 1 for custom surfaces
.my-custom-surface {
  @include mixins.os-surface-base(--layout-frame-bg, --layout-frame-border, 0.5rem);
  padding: map.get(vars.$os-spacing, '4');
}

// ✅ CORRECT - Multiple inheritance for complex components
.my-interactive-card {
  @include mixins.os-surface-base(--layout-menu-bg, --layout-content-border);
  @include mixins.os-interactive-base();
}

// ✅ CORRECT - Table composition
.my-table {
  @include mixins.os-table-base();
  &__header { @include mixins.os-table-header-base(); }
  &__row { @include mixins.os-table-row-base(); }
  &__cell { @include mixins.os-table-cell-base(); }
}

// ❌ FORBIDDEN - Duplicating existing patterns
.my-dropdown {
  background: var(--layout-menu-bg);
  border: 1px solid var(--layout-content-border);
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  // This pattern already exists in mixins!
}
```

**Additional Utility Mixins:**
| Mixin | Use For |
|-------|---------|
| `os-dropdown-animation()` | Dropdown open animation |
| `os-detail-row($label-width)` | Label + value pairs |
| `os-nav-button($size)` | Navigation arrows, controls |
| `os-scrollbar($width)` | Custom scrollbars |
| `os-calendar-day($size)` | Calendar day cells |

**When to create a NEW mixin:**
1. Pattern is used in 3+ components
2. Pattern has consistent structure with only size/color variations
3. Determine the correct level (base if abstract, specialized if inherits)
4. Add to `_mixins.scss` under appropriate section

---

## VIII. Icons & SVG

### Custom Icons First
- **Prefer custom SVG icons** from `src/assets/icons/`
- Use `<app-icon>` component, **NEVER inline SVG**

```html
<!-- ✅ CORRECT -->
<app-icon [icon]="'my-icon'"></app-icon>

<!-- ❌ FORBIDDEN -->
<svg viewBox="0 0 200 200">...</svg>
```

### CoreUI Icons (Legacy)
- Use `<svg cIcon [name]="iconName">` directive
- Icons must be registered in `icon-subset.ts`

---

## IX. Documentation Language

**ALL documentation, comments, and commit messages MUST be in English.**

- ✅ Code comments
- ✅ JSDoc/TSDoc
- ✅ README files
- ✅ Commit messages
- ✅ Variable/function names

**Exception:** User-facing translations (en, he, ru, uk)

---

## X. Search Before Creating (NON-NEGOTIABLE)

**Before creating ANY new component, service, model, or utility:**

1. **Search existing code** in `/shared/` directories
2. **Check barrel exports** (`index.ts` files)
3. **Reuse if exists**, create only if truly new
4. **If reusable, add to shared** — not to domain folder

---

## XI. TypeScript Configuration

- **Target:** ES2022
- **Strict null checks:** DISABLED (`strictNullChecks: false`)
- **Be cautious** with null/undefined handling

---

## XII. Quality Gates

### Before Every Commit
- [ ] Absolute paths used
- [ ] Standalone component with OnPush
- [ ] `inject()` for dependencies
- [ ] Signal inputs/outputs in new code
- [ ] **`signal()`/`computed()` for local state** (not BehaviorSubject)
- [ ] **`as const` types** (not inline unions or enums)
- [ ] `@if/@for/@switch` in new templates
- [ ] `os-` selector prefix
- [ ] `:host { display: block }` for block-level components
- [ ] Error handling follows 4-layer architecture (see Section III)
- [ ] NotificationService used for all user notifications (no direct MatSnackBar)
- [ ] All notification messages use i18n keys (no hardcoded strings)
- [ ] Services do NOT show notifications (component responsibility)
- [ ] CSS variables for colors
- [ ] `map.get()` for SCSS values
- [ ] **SCSS uses mixins for repeated patterns** (see Section VII DRY Principle)
- [ ] English documentation
- [ ] Searched for existing code before creating

### Build Execution Policy
- **NEVER run `npm run build` automatically** after code changes
- **Run build ONLY when user explicitly requests it**
- User may ask: "запусти билд", "run build", "проверь билд", etc.

---

## XIII. Documentation Maintenance

### File Size Guidelines
| File | Max Lines | Action if Exceeded |
|------|-----------|-------------------|
| CLAUDE.md | 200 | Move details to constitution/project-map |
| constitution.md | 400 | Split into focused sections |
| project-map.md | 400 | Archive old entries |
| Spec files | 300 | Split into sub-specs |

### Maintenance Schedule
- **Weekly:** Update project-map.md with new components/services
- **Monthly:** Review constitution for outdated information
- **After Feature:** Update relevant spec, add to project-map if reusable

### Critical Maintenance Rules

**NEVER:**
- ❌ Delete specs without documenting why
- ❌ Add rules without checking for duplicates
- ❌ Change structure without updating CLAUDE.md

**ALWAYS:**
- ✅ Update dates when making significant changes
- ✅ Search for duplicates before adding new rules
- ✅ Test that file paths in examples are correct

---

## XIV. Spec-Kit Workflow

**Spec-Kit** is a spec-driven development system for creating features through structured artifacts.

### Complete Command Flow

```
/speckit.specify  →  spec.md      (required)
        ↓
/speckit.clarify  →  spec.md      (optional, clarifies ambiguities)
        ↓
/speckit.plan     →  plan.md      (required)
        ↓
/speckit.tasks    →  tasks.md     (required)
        ↓
/speckit.analyze  →  report       (optional, consistency check)
        ↓
/speckit.checklist → checklists/  (optional, requirements validation)
        ↓
/speckit.implement → code         (required)
```

### Command Reference

| Command | Artifact | Description |
|---------|----------|-------------|
| `/speckit.specify` | `spec.md` | Creates specification: User Stories (P1/P2/P3), Given/When/Then scenarios, FR-xxx requirements, SC-xxx success criteria |
| `/speckit.clarify` | updates `spec.md` | Asks up to 5 clarifying questions about ambiguities, records answers |
| `/speckit.plan` | `plan.md` | Creates technical plan: architecture, file structure, implementation steps |
| `/speckit.tasks` | `tasks.md` | Generates task list with IDs (T001...), phases, parallelism markers [P] |
| `/speckit.analyze` | report (stdout) | Read-only consistency analysis between spec/plan/tasks, finds gaps and conflicts |
| `/speckit.checklist` | `checklists/*.md` | Creates requirements quality checklists (validates spec completeness, not code tests) |
| `/speckit.implement` | code | Executes tasks.md: creates files, marks completed tasks [X] |

### Auxiliary Commands

| Command | Description |
|---------|-------------|
| `/speckit.constitution` | Shows/edits constitution.md |
| `/speckit.taskstoissues` | Converts tasks.md to GitHub Issues |

### Artifact Structure

```
specs/{feature-name}/
├── spec.md           # Specification (User Stories, Requirements)
├── plan.md           # Technical plan (Architecture, Steps)
├── tasks.md          # Task list (T001, T002...)
└── checklists/       # Validation checklists
    ├── ux.md
    ├── api.md
    └── security.md
```

### Usage Rules

1. **Branch = Spec:** Spec-Kit determines spec by current git branch
2. **Sequence:** Cannot run `tasks` without `plan`, cannot `implement` without `tasks`
3. **Idempotency:** Re-running a command updates the artifact, does not duplicate
4. **Constitution Authority:** Conflicts with constitution are always CRITICAL

### Minimal Flow (Quick Start)

```
/speckit.specify   # Define the feature
/speckit.plan      # Plan implementation
/speckit.tasks     # Generate tasks
/speckit.implement # Execute
```

### Full Flow (Complex Features)

```
/speckit.specify   # Define the feature
/speckit.clarify   # Clarify ambiguities
/speckit.plan      # Plan implementation
/speckit.tasks     # Generate tasks
/speckit.analyze   # Check consistency
/speckit.checklist # Validate requirements
/speckit.implement # Execute
```

---

## Governance

- **Constitution supersedes** all other practices
- **Amendments require:** Documentation, review, migration plan
- **All PRs must verify** compliance with these rules
- **Complexity must be justified** — prefer simple solutions

---

**Version:** 1.8.0 | **Ratified:** 2025-12-03 | **Last Amended:** 2026-01-04
