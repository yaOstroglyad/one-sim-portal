# One-Sim-Portal Constitution

> **Version:** 1.0.0 | **Ratified:** 2025-12-03 | **Last Amended:** 2025-12-03

## Project Identity

- **Name:** One-Sim-Portal
- **Purpose:** B2B eSIM management platform for telecom operators
- **Domain:** eSIM provisioning, subscriber management, billing, analytics
- **Stack:** Angular 21.0.5, TypeScript 5.9, CoreUI, Angular Material, RxJS, Chart.js
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

### Signal APIs (Angular 21)
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

---

## III. HTTP Error Handling (NON-NEGOTIABLE)

### Unified Error Handlers
**ALL HTTP calls MUST use error handlers from `@shared/utils`:**

| Handler | Use For | Returns |
|---------|---------|---------|
| `handleArrayError<T>()` | Array endpoints | `[]` on error |
| `handleObjectError<T>()` | Object endpoints | `null` on error |
| `handleWithDefault<T>()` | Custom fallbacks | Default value |

```typescript
// ✅ CORRECT
list(): Observable<Customer[]> {
  return this.http.get<Customer[]>('/api/v1/customers').pipe(
    catchError(handleArrayError<Customer>('fetching customers'))
  );
}

// ❌ FORBIDDEN
catchError(() => of([]))  // Inline error handling
```

### forkJoin Pattern
- **Add `catchError` ONLY after `forkJoin`**, never inside individual observables
- Individual observables inside forkJoin must be clean (no catchError)

### Auth Errors
- Use `transformAuthError()` for OAuth/login errors only
- Use `transformHttpError()` for regular API errors

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
- [ ] `@if/@for/@switch` in new templates
- [ ] `os-` selector prefix
- [ ] Error handlers for HTTP calls
- [ ] CSS variables for colors
- [ ] `map.get()` for SCSS values
- [ ] English documentation
- [ ] Searched for existing code before creating

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

**Version:** 1.2.0 | **Ratified:** 2025-12-03 | **Last Amended:** 2025-12-06
