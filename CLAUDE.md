# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Rules Version History & Navigation
> **Document Created:** 2025-10-16 | **Last Major Update:** 2025-10-16

| Priority | Rule Section | Created | Status | Location |
|----------|--------------|---------|--------|----------|
| 🔴 Critical | [Rule Addition Protocol](#-rule-addition-protocol) | 2025-10-16 | ✅ Active | Line 26 |
| 🔴 Critical | [File Path Rules](#️-critical-file-path-rules-️) | 2025-10-16 | ✅ Active | Line 75 |
| 🟡 High | [Documentation Language](#documentation-and-comments-language-rule) | 2025-10-16 | ✅ Active | Line 92 |
| 🔵 Low | [Mock Server Rules](#mock-server-rules) | 2025-10-16 | ✅ Active | Line 100 |
| 🟡 High | [Component Architecture](#component-architecture-rules) | 2025-10-16 | ✅ Active | Line 183 |
| 🔵 Low | [Cache Service Rules](#cachehubservice-usage) | 2025-10-16 | ✅ Active | Line 291 |
| 🟢 Medium | [SCSS Architecture](#scss-architecture-rules) | 2025-10-16 | ✅ Active | Line 363 |
| 🟢 Medium | [Icon Strategy](#-icon-strategy-prefer-custom-icons) | 2025-10-16 | ✅ Active | Line 470 |
| 🟡 High | [TypeScript Interfaces](#typescript-interface--model-organization-rules) | 2025-10-16 | ✅ Active | Line 614 |

> **Maintenance Note:** Review rules quarterly for Angular version updates and best practices evolution.
> **Priority Guide:** 🔴 Critical = Project-breaking | 🟡 High = Code quality | 🟢 Medium = Best practices | 🔵 Low = Specific cases

> 🚨 **REMINDER**: Always use ABSOLUTE paths: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/...` 
> Never use relative paths like `../../../../` - they will fail!

## 🚫 RULE ADDITION PROTOCOL
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16 (Added update tracking requirement)

### CRITICAL: Prevent Rule Duplication

**Before adding ANY new rule to CLAUDE.md:**

1. **🔍 Search for existing rules** using keywords related to your topic:
   ```bash
   # Search examples:
   - SCSS/CSS rules: search "scss", "style", "mixin", "@use", "@import"
   - Component rules: search "component", "standalone", "architecture"
   - Path rules: search "path", "absolute", "relative", "file"
   - Icon rules: search "icon", "svg", "coreui"
   ```

2. **📋 Check the navigation table above** - scan rule sections for related topics

3. **⚠️ If similar rule exists:**
   - **Option A:** Update existing rule instead of creating new one
   - **Option B:** Merge content into existing section
   - **Option C:** Add cross-reference to existing rule
   - **❌ Never:** Create duplicate rule in different section

4. **✅ If adding new rule:**
   - Add to navigation table with priority and date
   - Use proper heading hierarchy
   - Include creation date: `> **Created:** YYYY-MM-DD`
   - Follow existing formatting patterns

5. **📝 If updating existing rule:**
   - Update the "Last Updated" date: `> **Created:** YYYY-MM-DD | **Last Updated:** YYYY-MM-DD`
   - Document what changed (add comment if major modification)
   - Update navigation table "Last Updated" date if significant change

6. **🔄 After adding/updating rule:**
   - Update "Last Major Update" date in navigation table
   - Verify no conflicts with existing rules
   - Test that navigation links work

**Examples:**

**❌ What NOT to do:**
```markdown
❌ Adding SCSS @use rule in "Component Architecture" 
   when "SCSS Architecture" section already exists
❌ Adding icon usage in multiple sections
❌ Repeating file path rules in different places
❌ Updating rule without changing date
```

**✅ What TO do:**
```markdown
✅ Update existing SCSS section instead of creating new one
✅ Add cross-reference: "See SCSS Architecture section"
✅ Update date when modifying rule:
   > **Created:** 2025-10-16 | **Last Updated:** 2025-10-16 (Added @use requirement)
```

**This protocol prevents:**
- 🚫 Rule duplication
- 🚫 Conflicting guidelines  
- 🚫 Scattered information
- 🚫 Maintenance overhead

## ⚠️ CRITICAL FILE PATH RULES ⚠️
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

### 🚨 ABSOLUTE PATHS ONLY 🚨

**❌ NEVER USE RELATIVE PATHS**: `../../../../andreyостrogляд/IdeaProjects/...`
**✅ ALWAYS USE ABSOLUTE PATHS**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/...`

### Examples:
```
❌ WRONG: ../../../../andreyостrogляд/IdeaProjects/quantum-soft/one-sim-portal/src/app/...
✅ CORRECT: /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/...

❌ WRONG: ../../../scss/styles.scss  
✅ CORRECT: /Users/andreyостrogляد/IdeaProjects/quantum-soft/one-sim-portal/src/scss/styles.scss
```

### Root Directory: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

**IF YOU USE RELATIVE PATHS, THE OPERATION WILL FAIL WITH "File does not exist" ERROR!**

## Documentation and Comments Language Rule
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**ALL documentation, README files, code comments, and commit messages MUST be written in English.**
- This includes inline comments, JSDoc/TSDoc comments, README files, and any other documentation
- Variable names, function names, and code identifiers should also use English
- Exception: User-facing text and translations remain in their respective languages

## Mock Server Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**Mock server has its own architecture rules** - see `/mock-server/CLAUDE-MOCK.md` for detailed guidelines when working with mock server code.

## Project Overview

This is an Angular 16 eSIM portal management application that provides a white-label solution for managing eSIM products, customers, orders, and inventory. The application uses CoreUI and Angular Material for UI components and implements JWT-based authentication with role-based access control.

## Development Commands

### Essential Commands
- `npm start` - Start development server with proxy configuration (runs on http://localhost:4200)
- `npm run build-prod` - Build for production
- `npm test` - Run unit tests with Karma/Jasmine
- `ng serve --proxy-config proxy.conf.json` - Manual dev server start with API proxy

### Testing
- Test files follow Angular convention: `*.spec.ts`
- Run specific test file: `ng test --include='**/path-to-file.spec.ts'`
- Tests use Karma with Chrome browser

### Build & Deployment
- Production build outputs to `dist/one-sim-portal`
- Docker multi-stage build with Node 16 Alpine and Nginx
- Uses hash-based routing (#) for URLs

## Architecture & Code Structure

### Core Architecture
The application follows Angular's modular architecture with lazy-loaded feature modules:

1. **Authentication Flow**:
   - JWT tokens stored in LocalStorage/SessionStorage
   - HTTP interceptor (`src/app/shared/auth/httpInspector.service.ts`) adds Bearer token to all requests
   - AuthGuard protects routes requiring authentication
   - Automatic token refresh mechanism implemented

2. **API Communication**:
   - All API calls proxy to `https://esim-server.dev.global-sim.app` in development
   - API endpoints follow pattern: `/api/v1/{resource}`
   - No centralized API configuration - endpoints hardcoded in services

3. **User Roles & Permissions**:
   - Four main roles: Admin, Customer, Support, Special
   - Permissions are currently hardcoded in `AuthService`
   - UI elements conditionally rendered based on permissions

### Key Modules & Their Services

1. **Customers Module** (`src/app/views/customers/`):
   - `CustomersDataService` - Handles customer CRUD operations
   - Supports both private and corporate customers
   - Complex filtering and search capabilities

2. **Orders Module** (`src/app/views/orders/`):
   - `OrdersDataService` - Order management and processing
   - Integrates with inventory for eSIM allocation

3. **Inventory Module** (`src/app/views/inventory/`):
   - `InventoryDataService` - eSIM inventory tracking
   - Bulk operations support

4. **Generic Components** (`src/app/shared/components/`):
   - `GenericTableComponent` - Reusable data table with sorting, pagination, filtering
   - `FormGeneratorComponent` - Dynamic form generation from JSON schema
     - **Documentation**: See `src/app/shared/components/form-generator/README.md`
     - **HTTP Dependencies**: Supports dynamic field dependencies with API calls
     - **FormArray Support**: Nested form arrays with field dependencies
   - `GenericDialogComponent` - Reusable dialog wrapper

### State Management
- Uses `NgxWebstorage` for local/session storage
- No centralized state management (no NgRx/Akita)
- Services maintain component state

### Internationalization
- Supported languages: English (en), Hebrew (he), Russian (ru), Ukrainian (uk)
- Translation files in `src/assets/i18n/`
- Uses `@ngx-translate/core` for translations
- **Translation Keys Rule**: All translation keys MUST be lowercase (e.g., `nav.productconstructor` not `nav.productConstructor`)

## Important Technical Details

### Component Architecture Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

1. **Standalone Components ONLY**: All new components MUST be standalone (Angular 14+ pattern)
   - Use `standalone: true` in component decorator
   - Import dependencies explicitly in `imports` array
   - NO module-based components
   - NO NgModules for new features - use standalone components with lazy loading directly
   - **NO HttpClientModule**: Never import HttpClientModule in standalone components - HttpClient is provided globally via provideHttpClient() in app configuration
   - **NO Deprecated APIs**: Never use deprecated Angular APIs:
     - ❌ `APP_INITIALIZER` - use `provideAppInitializer(() => inject(Service).init())`
     - ❌ `ENVIRONMENT_INITIALIZER` - use `makeEnvironmentProviders` with custom tokens
     - ❌ `HttpClientModule` - use `provideHttpClient()`
     - Always check Angular documentation for current best practices
   - **Modern App Initialization**: Use `provideAppInitializer` for app startup logic:
     - ✅ `provideAppInitializer(() => inject(AuthService).loadPermissions())`
     - ✅ Runs in injection context, supports async operations
     - ✅ Blocks app bootstrap until completion
   - **Provider Functions**: Correct usage of provider functions:
     - ✅ `provideFabLayout()` - use directly in providers array (returns EnvironmentProviders)
     - ❌ `...provideFabLayout()` - do NOT spread EnvironmentProviders
     - ✅ `...providerArray` - only spread actual arrays of providers

2. **OnPush Change Detection MANDATORY**: All new components MUST use OnPush strategy
   - Use `changeDetection: ChangeDetectionStrategy.OnPush` in component decorator
   - Inject `ChangeDetectorRef` and use `markForCheck()` when updating component state
   - Use `markForCheck()` instead of `detectChanges()` for better performance
   - NEVER mutate objects/arrays directly - use immutable patterns

3. **Dependency Injection with inject() MANDATORY**: All new components and services MUST use the `inject()` function
   - Use `inject()` function instead of constructor injection
   - Declare injected dependencies as `private readonly` fields
   - Example:
   ```typescript
   @Component({
     standalone: true,
     changeDetection: ChangeDetectionStrategy.OnPush,
     // ...
   })
   export class MyComponent {
     private readonly cdr = inject(ChangeDetectorRef);
     private readonly authService = inject(AuthService);
     
     updateData(newData: any): void {
       this.data = { ...this.data, ...newData }; // Immutable update
       this.cdr.markForCheck(); // Trigger change detection
     }
   }
   ```

4. **Template Separation**: If HTML template contains more than one logical block, MUST extract to separate `.html` file
   - Simple components with single logical block can use inline templates
   - Complex components with multiple sections MUST use `templateUrl`
   - Example: Dashboard tabs, forms with multiple sections, lists with headers/footers
   
   > **Note:** For SCSS styling rules, see [SCSS Architecture section](#scss-architecture-rules)

### TypeScript Configuration
- Target: ES2022
- Strict null checks are DISABLED (`strictNullChecks: false`)
- Be cautious with null/undefined handling

### Global Design System (Tailwind-inspired)
The project uses a Tailwind-inspired design system with reusable utilities:

1. **Color System** (`src/scss/_variables.scss`):
   - Global `$os-colors` map with 26 colors (semantic + Tailwind colors)
   - Each color includes: bg, text, subtle-bg, and rgb values
   - Universal mixins: `generate-os-colors()` for component variants

2. **Utilities** (`src/scss/_utilities.scss`):
   - Border radius scale: none, small, medium, large, xl, 2xl, 3xl, full
   - Shadow utilities: sm, default, md, lg, xl, 2xl, inner
   - Spacing scale: 0 to 24 (Tailwind-inspired)
   - Typography scale: xs to 5xl
   - Mixins: glassmorphism, elevation, interactive-states, disabled-state, loading-state, truncate

3. **Color Mixins** (`src/scss/_color-mixins.scss`):
   - `generate-border-colors()` - Creates border color classes
   - `generate-shadow-colors()` - Creates colored shadow classes

4. **Component Architecture**:
   - Badge component: Supports all 26 colors with smart text contrast
   - Card component: 6 variants (default, elevated, outlined, ghost, gradient, glassmorphism)
   - Both use the global color system and utilities

> **SCSS Usage:** For import patterns and styling guidelines, see [SCSS Architecture section](#scss-architecture-rules)

### Routing
- Uses `HashLocationStrategy` - all routes have `#` prefix
- Main layout loaded at `/home` route
- Feature modules lazy-loaded for performance

### HTTP Interceptor
The HTTP interceptor automatically:
- Adds authentication token to requests
- Redirects to login on 401 errors
- Located at `src/app/shared/auth/httpInspector.service.ts`

### CacheHubService Usage
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**CRITICAL: Cache Invalidation Pattern Rules**

When using CacheHubService, cache keys include namespace prefixes. Always match invalidation patterns with full keys:

#### ❌ WRONG - Missing namespace:
```typescript
// Cache key: "default:users:page-0-15-active"
this.cacheHub.invalidatePattern('users:page-*'); // WON'T WORK!
```

#### ✅ CORRECT - Include namespace:
```typescript
// Cache key: "default:users:page-0-15-active"  
this.cacheHub.invalidatePattern('default:users:page-*'); // WORKS!
```

#### Best Practices:
1. **Always log cache keys during development** to see the actual format
2. **Include namespace in invalidation patterns**: `default:resource:*` not `resource:*`
3. **Use consistent naming**: `resource:page-{page}-{size}-{filters}`
4. **Test cache invalidation** after CRUD operations to ensure data refresh

#### Example Service Pattern:
```typescript
createUser(user: CreateUserRequest): Observable<User> {
  return this.http.post<User>('/api/users', user).pipe(
    tap(() => {
      // Include namespace in pattern!
      this.cacheHub.invalidatePattern('default:users:page-*');
    })
  );
}
```

### Generic Table Usage
Most list views use `GenericTableComponent`:
- Configured via `tableConfig` object
- Supports server-side pagination and filtering
- Column definitions include type, sorting, filtering options

## Common Development Patterns

### Adding a New Feature Module
1. Create module in `src/app/views/{feature-name}/`
2. Add routing configuration with lazy loading
3. Create corresponding data service in module
4. Use generic components where applicable

### Working with Forms
- Use `FormGeneratorComponent` for dynamic forms
- Form schemas defined as JSON objects
- Validation rules included in schema
- **HTTP Dependencies**: Fields can depend on API responses (see README.md for examples)
- **FormArray Support**: Dynamic form arrays with nested field dependencies

### API Service Pattern
Services typically follow this pattern:
```typescript
getItems(params?: any): Observable<any> {
  return this.http.get('/api/v1/resource', { params });
}
```

### Permission Checks
Use `AuthService` for permission checks:
```typescript
if (this.authService.hasPermission('PERMISSION_NAME')) {
  // Show/enable feature
}
```

## SCSS Architecture Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

### CRITICAL: Never Duplicate SCSS Styles
**ALWAYS reuse existing mixins and utilities instead of duplicating code.**
**See complete architecture rules in `.context/SCSS_ARCHITECTURE.md`**

#### Quick Reference - Dashboard Components
Use mixins from `src/scss/_mixins.scss`:
- `@include dashboard-card-header()` - Consistent card headers (1.25rem title, proper spacing)
- `@include dashboard-chart-container($height)` - Chart containers with proper sizing
- `@include dashboard-kpi-grid($columns)` - Responsive KPI card grids
- `@include dashboard-chart-legend()` - Chart legends with colored dots
- `@include dashboard-demographics-row()` - Two-column responsive layout
- `@include dashboard-metric-summary()` - Metric displays (retention, churn rates)
- `@include dashboard-reason-bars()` - Horizontal bar charts for analysis
- `@include dashboard-dark-theme()` - Consistent dark theme support

#### Chart Components
- `@include chart-complete($component-name, $icon)` - Full chart styling
- Never duplicate canvas overflow fixes - use existing mixins

#### SCSS Import Rules
**CRITICAL: Always use @use instead of @import**

```scss
// ✅ CORRECT - Modern @use syntax
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;
@use "../../../../scss/utilities" as utils;

// Usage with namespace
.my-component {
  @include mixins.interactive-states();
  color: var(--os-color-primary);
}
```

```scss
// ❌ WRONG - Legacy @import syntax (deprecated)
@import "../../../../scss/variables";
@import "../../../../scss/mixins";
@import "../../../../scss/utilities";
```

#### Import Order in Components
```scss
@use "../../../../scss/variables" as vars;  // Always first
@use "../../../../scss/mixins" as mixins;   // Always second
@use "../../../../scss/utilities" as utils; // Only if using utility maps
```

#### SCSS Color System (`$os-colors`)
A centralized color system is available in `src/scss/_variables.scss` for consistent theming across all components:

```scss
// Usage in any component:
@use "../../../../scss/variables" as vars;

:host {
  // Generate all color variants automatically
  @include vars.generate-os-colors('my-component');
  
  // This creates:
  // .my-component--primary, .my-component--blue, etc. (solid)
  // .my-component--outline.my-component--primary (outline)
  // .my-component--subtle.my-component--primary (subtle)
}
```

**Available for**: badges, buttons, alerts, notifications, cards, and any component that needs color variants.

**Benefits**: 
- Single source of truth for colors
- Automatic generation of solid, outline, and subtle variants
- Full CSS variable support for theming
- Easy to add new colors globally

#### Component Styling Best Practices
- **Reusability First**: Always check for existing mixins and utilities before creating new classes
- **Namespace Usage**: Use `vars.`, `mixins.`, `utils.` prefixes with @use imports
- **No Duplication**: Reference existing dashboard and component mixins

**Before writing new styles, check if existing mixins can be used or extended.**

## CoreUI Icons Integration

### 🎨 ICON STRATEGY: Prefer Custom Icons
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

**ALWAYS prefer custom SVG icons over CoreUI icons when possible:**

1. **Custom Icons First** - Create or use existing icons from `src/assets/icons/`
2. **Gradual Migration** - When adding new icons, use custom SVGs instead of CoreUI
3. **Benefits**: Better performance, consistent design, no external dependency

#### Custom Icon Usage:
```typescript
// FAB Configuration with custom icon
{
  id: 'home',
  label: 'Главная',
  icon: '/assets/icons/home.svg',  // ✅ Custom SVG
  action: 'route',
  target: '/home'
}

// Icon Service with custom URL
iconService.getIcon('/assets/icons/home.svg')
```

#### Available Custom Icons:
- `home.svg` - Home/dashboard navigation
- `chat.svg` - Chat/messaging features  
- `plus.svg` - Add/create actions
- `settings.svg` - Configuration/settings
- `history.svg` - Historical data/logs
- `default.svg` - Fallback icon

**Create new custom icons**: Add SVG files to `src/assets/icons/` with descriptive names.

### CRITICAL: How to Properly Use CoreUI Icons (Legacy)

**NEVER use CSS classes like `<i class="icon cil-name">` - this will NOT work!**

#### Correct Icon Implementation:

1. **Use SVG with CoreUI directive**:
   ```html
   <svg cIcon [name]="iconName" width="24" height="24"></svg>
   ```

2. **Required imports in component**:
   ```typescript
   import { IconDirective, IconModule } from '@coreui/icons-angular';
   
   @Component({
     imports: [IconDirective, IconModule, ...]
   })
   ```

3. **CSS styling for SVG icons**:
   ```scss
   svg {
     width: 1.5rem;
     height: 1.5rem;
     fill: white; // Use 'fill' not 'color' for SVG
   }
   ```

4. **Icon availability**:
   - All icons must be added to `src/app/icons/icon-subset.ts`
   - Import icon from `@coreui/icons`
   - Add to both import list and iconSubset object
   - Icons are loaded globally via IconSetService in app.component.ts

#### Available Icons Pattern:
- Use `cil-` prefix: `cil-location-pin`, `cil-data-transfer-down`
- Check `icon-subset.ts` for available icons before using
- Add new icons to subset if needed

#### Example Usage:
```html
<!-- Correct -->
<svg cIcon name="cil-location-pin" width="20" height="20"></svg>

<!-- Incorrect - will not display -->
<i class="icon cil-location-pin"></i>
```

## Known Issues & Limitations

1. No environment configuration files - API URLs hardcoded
2. Permissions hardcoded in AuthService instead of backend-driven
3. No linting configuration - relies on Angular CLI defaults
4. Limited test coverage - most spec files only check component creation
5. No centralized error handling beyond HTTP interceptor

## Docker & Deployment

The application includes a multi-stage Dockerfile:
- Build stage: Node 16 Alpine with Angular CLI
- Runtime stage: Nginx Alpine
- Nginx configuration in `default.conf`

Production build command: `npm run build-prod`

## UI/UX Design Guidelines

### Visual Design Approach
When creating new UI components, follow **Tailwind CSS design principles**:

1. **Typography & Sizing**:
   - Use Tailwind's font sizes: `text-xs` (0.75rem), `text-sm` (0.875rem), `text-base` (1rem)
   - Consistent spacing with padding: `2px 8px`, `4px 12px`, `6px 16px`
   - Heights: 20px, 24px, 32px for small, medium, large variants

2. **Colors**:
   - **Always use project CSS variables**: `var(--os-color-primary)`, `var(--os-color-success)`, etc.
   - Follow Tailwind color palette principles but use existing project variables
   
   **Semantic colors:**
   - Primary: `var(--os-color-primary)` (matches project branding)
   - Secondary: `var(--os-color-secondary)` (blue accent)
   - Success: `var(--os-color-success)` 
   - Danger: `var(--os-color-danger)`
   - Warning: `var(--os-color-warning)`
   - Info: `var(--os-color-info)` (cyan-500: #06b6d4)
   - Medium: `var(--os-color-medium)` (gray tones)
   - Light: `var(--os-color-light)` with `var(--os-color-dark)` text
   - Dark: `var(--os-color-dark)`
   
   **Tailwind context colors** (available for badges and other components):
   - Each color includes: base (`--os-color-{name}`), shade (`--os-color-{name}-shade`), and RGB (`--os-color-{name}-rgb`)
   - `var(--os-color-red)` (#ef4444), `var(--os-color-orange)` (#f97316), `var(--os-color-amber)` (#f59e0b)
   - `var(--os-color-yellow)` (#eab308), `var(--os-color-lime)` (#84cc16), `var(--os-color-green)` (#22c55e)
   - `var(--os-color-emerald)` (#10b981), `var(--os-color-teal)` (#14b8a6), `var(--os-color-cyan)` (#06b6d4)
   - `var(--os-color-sky)` (#0ea5e9), `var(--os-color-blue)` (#3b82f6), `var(--os-color-indigo)` (#6366f1)
   - `var(--os-color-violet)` (#8b5cf6), `var(--os-color-purple)` (#a855f7), `var(--os-color-fuchsia)` (#d946ef)
   - `var(--os-color-pink)` (#ec4899), `var(--os-color-rose)` (#f43f5e), `var(--os-color-zinc)` (#71717a)
   - **No hardcoded colors**: All values use CSS variables for consistency and theming support

3. **Border Radius**:
   - Small: `2px` (rounded-sm)
   - Medium: `6px` (rounded-md)
   - Full: `9999px` (rounded-full)

4. **Text Contrast & Accessibility**:
   - **Smart text color selection**: Automatically chooses light or dark text based on background brightness
   - Light backgrounds (yellow, amber, lime, light) use dark text with color-specific optimizations
   - Dark/saturated backgrounds use white text with subtle shadows for readability
   - Text shadows: `0 1px 2px rgba(0,0,0,0.1)` for light text, `0 1px 2px rgba(255,255,255,0.1)` for dark text

5. **Animations**:
   - Quick transitions: `0.15s ease-in-out`
   - Subtle hover effects: opacity changes, minimal transforms
   - Focus states with subtle shadows: `0 0 0 3px rgba(59, 130, 246, 0.1)`

6. **Variant Options**:
   - **Default**: Solid background with smart text contrast
   - **Outline**: Transparent background with colored border and text
   - **Subtle**: Tailwind-style with 10% opacity background and darker color text (e.g., `bg-blue-500/10 text-blue-600`)

7. **Component Structure**:
   - Clean, minimal design without unnecessary borders
   - Consistent spacing and typography
   - Proper focus and accessibility states
   - Responsive design considerations

**Important**: All new components should follow this Tailwind-inspired design system for visual consistency across the application.

## Global Color System

> **SCSS Color Implementation:** See [SCSS Architecture section](#scss-architecture-rules) for complete color system usage and patterns.

## TypeScript Interface & Model Organization Rules
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-16

### MANDATORY: Interface Location Rules
**ALL TypeScript interfaces and types MUST be defined in dedicated model files, NEVER in components.**

#### Component Interface Rules
1. **NEVER create interfaces inside component files** (`.component.ts`)
2. **ALWAYS create interfaces in corresponding model files** in `models/` directory
3. **Component-specific interfaces** → Create `{component-name}.model.ts` 
4. **Shared interfaces** → Place in existing model files or `common.model.ts`

#### Model File Structure
```typescript
// Example: src/app/views/feature/models/overview.model.ts
export interface OverviewStats {
  // interface definition
}

export interface QuickAction {
  // interface definition  
}
```

#### Import Pattern
```typescript
// Component file - CORRECT
import { OverviewStats, QuickAction } from '../../models';

// Component file - WRONG (interfaces defined here)
interface OverviewStats { ... } // ❌ NEVER DO THIS
```

#### Benefits of This Pattern
- **Reusability**: Models can be imported by multiple components/services
- **Type Safety**: Centralized type definitions prevent inconsistencies  
- **Maintainability**: Single source of truth for data structures
- **Testing**: Models can be tested independently
- **API Contracts**: Clear separation between data models and view logic

#### Model Export Pattern
Always export new models through `models/index.ts`:
```typescript
export * from './overview.model';
```

**This rule applies to ALL components across the entire application.**

---

## 🚨 FINAL REMINDER: ABSOLUTE PATHS ONLY! 🚨

**Refer to the File Path Rules section above for complete guidelines.**

**ROOT**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`