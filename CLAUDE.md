# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
   - `GenericDialogComponent` - Reusable dialog wrapper

### State Management
- Uses `NgxWebstorage` for local/session storage
- No centralized state management (no NgRx/Akita)
- Services maintain component state

### Internationalization
- Supported languages: English (en), Hebrew (he), Russian (ru), Ukrainian (uk)
- Translation files in `src/assets/i18n/`
- Uses `@ngx-translate/core` for translations

## Important Technical Details

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

5. **Usage Pattern**:
   ```scss
   @import "../../../../scss/variables";
   @import "../../../../scss/utilities"; 
   @import "../../../../scss/color-mixins";
   ```

### Routing
- Uses `HashLocationStrategy` - all routes have `#` prefix
- Main layout loaded at `/home` route
- Feature modules lazy-loaded for performance

### HTTP Interceptor
The HTTP interceptor automatically:
- Adds authentication token to requests
- Redirects to login on 401 errors
- Located at `src/app/shared/auth/httpInspector.service.ts`

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

### SCSS Color Map (`$os-colors`)
A centralized color system is available in `src/scss/_variables.scss` for consistent theming across all components:

```scss
// Usage in any component:
@import "../../../../scss/variables";

:host {
  // Generate all color variants automatically
  @include generate-os-colors('my-component');
  
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