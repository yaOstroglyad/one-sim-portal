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