# Models & Interfaces Organization Rules

> **Created:** 2025-11-02 | **Last Updated:** 2025-11-15
> **Context Tags:** `@creating-new` `@model` `@learn-project`
> **Read when:** Creating new interfaces/types or organizing models

## Models & Interfaces Organization Rules
> **Created:** 2025-11-02 | **Last Updated:** 2025-11-02 (Added strict kebab-case.model.ts naming standard)

### 🎯 Critical: Check Before Creating New Models/Interfaces

**ALWAYS follow this workflow when creating TypeScript interfaces, types, or models:**

```
1. Need a new interface/type?
   ↓
2. 🔍 SEARCH in /shared/models first!
   ↓
3. Does it exist?
   ├─ YES → ✅ Reuse existing model/interface
   └─ NO  → Continue to step 4
   ↓
4. Is it reusable across domains/features?
   ├─ YES → Create in /shared/models (shared model)
   └─ NO  → Create in domain-specific models folder
```

### 📂 Shared Models Structure

All shared models/interfaces MUST be organized in domain-based folders:

```
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/
├── auth/           # Authentication & authorization models
├── business/       # Business domain models (accounts, companies, customers)
├── communication/  # Communication models (notifications, messages)
├── core/           # Core/foundational models (pagination, errors, countries)
├── feature/        # Feature-specific models (feature toggles, configs)
├── payment/        # Payment & billing models (invoices, payment methods)
├── product/        # Product & service models (products, bundles, tariffs)
├── subscriber/     # Subscriber & subscription models
└── ui/             # UI-specific models (table configs, form configs, brand)
```

### 🚨 Critical Rules

**❌ NEVER:**
- Create interfaces/types inside component files
- Create duplicate models in different locations
- Put models directly in `/shared/models` root (must use category folders)
- Create domain-specific models in `/shared/models`
- Create generic models in domain/feature folders
- Mix business logic with model definitions

**✅ ALWAYS:**
- Search existing models before creating new ones
- Use domain-based organization (auth/, business/, ui/, etc.)
- Create barrel exports (`index.ts`) for each folder
- Add JSDoc comments to all interfaces/types
- Include usage examples in JSDoc for complex models
- Use descriptive, semantic naming (e.g., `LoginRequest`, `UserProfile`, `PaymentMethod`)
- Separate request/response models (e.g., `CreateCustomerRequest`, `CustomerResponse`)

### 📋 Decision Tree: Where to Create Model?

#### Step 1: Check Existing Models

```bash
# Search in shared models
grep -r "InterfaceName\|TypeName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/

# Search across entire codebase
grep -r "interface.*InterfaceName\|type.*TypeName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/
```

#### Step 2: Determine Location

**Use this decision tree:**

```
Is model/interface reusable across multiple features/domains?
├─ YES → Create in /shared/models
│   └─ Which category?
│       ├─ Authentication/user data? → /shared/models/auth/
│       ├─ Business entities (accounts, companies)? → /shared/models/business/
│       ├─ Notifications/messages? → /shared/models/communication/
│       ├─ Generic/foundational (pagination, errors)? → /shared/models/core/
│       ├─ Feature flags/configs? → /shared/models/feature/
│       ├─ Payment/billing? → /shared/models/payment/
│       ├─ Products/bundles/tariffs? → /shared/models/product/
│       ├─ Subscribers/subscriptions? → /shared/models/subscriber/
│       ├─ UI configs/table/form? → /shared/models/ui/
│       └─ New category? → Create new folder in /shared/models/
│
└─ NO → Domain-specific
    └─ Create in feature's models folder
        Example: /views/dashboard/models/
```

### 📝 Model Category Definitions

#### 1. Auth Models (`/shared/models/auth/`)

**Purpose:** Authentication, authorization, and user-related models

**Naming Convention:** `{entity}.model.ts` or `{action}-{entity}.model.ts`

**Examples:**
- `user.model.ts` - User entity
- `login-request.model.ts` - Login credentials
- `login-response.model.ts` - Login result with token
- `refresh-token-request.model.ts` - Token refresh

**Template:**
```typescript
// /shared/models/auth/login-request.model.ts

/**
 * Login request payload
 *
 * @example
 * ```typescript
 * const request: LoginRequest = {
 *   username: 'user@example.com',
 *   password: 'securePassword123'
 * };
 * ```
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}
```

#### 2. Business Models (`/shared/models/business/`)

**Purpose:** Core business entities (accounts, companies, customers, orders)

**Naming Convention:** `{entity}.model.ts`

**Examples:**
- `account.model.ts` - Account entity
- `company.model.ts` - Company entity
- `customer.model.ts` - Customer entity
- `order.model.ts` - Order entity

#### 3. Communication Models (`/shared/models/communication/`)

**Purpose:** Communication, notifications, messages

**Naming Convention:** `{entity}.model.ts`

**Examples:**
- `notification.model.ts` - Notification structure
- `message.model.ts` - Message entity
- `email-log.model.ts` - Email log records
- `email-template.model.ts` - Email templates

#### 4. Core Models (`/shared/models/core/`)

**Purpose:** Foundational, generic models used across the application

**Naming Convention:** `{concept}.model.ts`

**Examples:**
- `page-response.model.ts` - Generic pagination wrapper
- `error-response.model.ts` - Standard error format
- `country.model.ts` - Country reference data
- `domain.model.ts` - Domain entity

**Template:**
```typescript
// /shared/models/core/page-response.model.ts

/**
 * Generic pagination response wrapper
 *
 * @template T - Type of items in the page
 *
 * @example
 * ```typescript
 * const customerPage: Pagination<Customer> = {
 *   content: [...],
 *   totalElements: 100,
 *   totalPages: 10
 * };
 * ```
 */
export interface Pagination<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
}
```

#### 5. Feature Models (`/shared/models/feature/`)

**Purpose:** Feature flags, configurations, and feature-specific models

**Naming Convention:** `{feature}.ts` or `{feature}.interface.ts`

**Examples:**
- `feature-toggle.interface.ts` - Feature toggle contract

#### 6. Payment Models (`/shared/models/payment/`)

**Purpose:** Payment methods, invoices, transactions

**Naming Convention:** `{entity}.model.ts`

**Examples:**
- `payment-strategies.model.ts` - Payment strategy types
- `invoicing-method.model.ts` - Invoice methods
- `transaction.model.ts` - Transaction entity

#### 7. Product Models (`/shared/models/product/`)

**Purpose:** Products, bundles, tariffs, subscriptions

**Naming Convention:** `{entity}.model.ts`

**Examples:**
- `product.model.ts` - Product entity
- `bundle.model.ts` - Bundle configuration
- `tariff.model.ts` - Tariff plan
- `package.model.ts` - Package configuration

#### 8. Subscriber Models (`/shared/models/subscriber/`)

**Purpose:** Subscriber information and subscriptions

**Naming Convention:** `{entity}.model.ts`

**Examples:**
- `subscriber.model.ts` - Subscriber entity
- `subscriber-info.model.ts` - Subscriber details
- `subscriber-usage.model.ts` - Usage statistics
- `subscriber-status-event.model.ts` - Status events
- `purchase-history.model.ts` - Purchase records
- `usage-info.model.ts` - Usage information
- `sim.model.ts` - SIM card entity

#### 9. UI Models (`/shared/models/ui/`)

**Purpose:** UI configurations, table configs, form configs

**Naming Convention:** `{component}-config.interface.ts` or `{component}.model.ts`

**Examples:**
- `table-column-config.interface.ts` - Table column configuration
- `field-config.model.ts` - Form field configuration
- `grid-configs.model.ts` - Grid layout configs
- `header-config.interface.ts` - Header configuration
- `brand-full.model.ts` - Full branding model
- `brand-narrow.model.ts` - Narrow branding model
- `user-view-config.model.ts` - User view preferences

**Template:**
```typescript
// /shared/models/ui/table-column-config.interface.ts

/**
 * Table column configuration interface
 * Used for configuring GenericTable columns
 *
 * @example
 * ```typescript
 * const columns: TableColumnConfig[] = [
 *   { key: 'name', label: 'Customer Name', sortable: true },
 *   { key: 'email', label: 'Email', filterable: true }
 * ];
 * ```
 */
export interface TableColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'boolean';
}
```

### 📦 Barrel Exports

**Each model category MUST have an `index.ts` barrel export:**

```typescript
// /shared/models/auth/index.ts
/**
 * Authentication & Authorization Models
 *
 * Contains models for:
 * - User authentication (login, refresh tokens)
 * - User profiles and roles
 */

export * from './login-request.model';
export * from './login-response.model';
export * from './refresh-token-request.model';
export * from './user.model';
```

**Main barrel export (`/shared/models/index.ts`):**

```typescript
// Models - organized by category
export * from './auth';         // Authentication models
export * from './business';     // Business entity models
export * from './communication';// Communication models
export * from './core';         // Core/foundational models
export * from './feature';      // Feature-specific models
export * from './payment';      // Payment models
export * from './product';      // Product models
export * from './subscriber';   // Subscriber models
export * from './ui';           // UI configuration models
```

### 🔍 Import Patterns

**Prefer specific category imports for clarity:**

```typescript
// ✅ BEST - Import from main models barrel (most common)
import { User, LoginRequest } from '@models';
import { Customer, Order } from '@models';

// ✅ GOOD - Import from category barrel (when clarity needed)
import { User, LoginRequest } from '@models/auth';
import { Customer } from '@models/business';

// ✅ ACCEPTABLE - Import from main shared barrel
import { User, LoginRequest, Customer } from '@shared/models';

// ❌ AVOID - Direct file import (bypasses barrel exports)
import { User } from '@shared/models/auth/user';
```

### 🏗️ Creating New Model Category

If your model doesn't fit existing categories:

1. **Verify it's truly a new category** (not a variant of existing)
2. **Create new folder** in `/shared/models/` with descriptive name
3. **Create barrel export** (`index.ts`)
4. **Add JSDoc** at folder level explaining category
5. **Update main barrel export** `/shared/models/index.ts`
6. **Update navigation table** in CLAUDE.md
7. **Document category** in this section

**Example: New "analytics" category**

```typescript
// /shared/models/analytics/index.ts
/**
 * Analytics Models
 *
 * Provides analytics and reporting models for:
 * - Dashboard metrics
 * - Report configurations
 * - Chart data structures
 */

export * from './dashboard-metrics';
export * from './report-config';
export * from './chart-data';
```

### 🔄 Domain-Specific Models

**When to create domain-specific models:**
- Model is only used in one feature/view
- Tightly coupled to specific component tree
- Not reusable across application
- Represents feature-specific state or configuration

**Location:** Create `models/` folder within feature

```
/views/dashboard/
├── components/
├── services/
├── models/              # Domain-specific models
│   ├── dashboard-state.ts
│   ├── kpi-config.ts
│   └── index.ts        # Barrel export
└── dashboard.component.ts
```

**Example:**
```typescript
// /views/dashboard/models/dashboard-state.ts
/**
 * Dashboard-specific state model
 * Only used within dashboard feature
 */
export interface DashboardState {
  selectedPeriod: 'day' | 'week' | 'month';
  activeTab: string;
  filters: DashboardFilters;
}
```

### 📝 Naming Conventions

**Interfaces/Types (Inside Files):**
- Use PascalCase: `UserProfile`, `LoginRequest`, `CustomerData`
- Avoid `I` prefix: ❌ `IUser` → ✅ `User`
- Use descriptive names: ❌ `Data` → ✅ `CustomerData`

**Request/Response Models:**
- Request: `{Action}{Entity}Request` (e.g., `CreateCustomerRequest`, `LoginRequest`)
- Response: `{Entity}Response` or `{Action}{Entity}Response` (e.g., `LoginResponse`)

**Configuration Models:**
- Use `{Component}Config` pattern (e.g., `TableConfig`, `FormConfig`, `FieldConfig`)

**File Names (CRITICAL - Angular/TypeScript Standard):**

🚨 **MANDATORY: ALL model files MUST follow kebab-case with proper suffixes!**

**Standard Pattern:** `kebab-case.model.ts` or `kebab-case.interface.ts`

**When to use `.model.ts`:**
- For data models/entities: `user.model.ts`, `customer.model.ts`
- For request/response DTOs: `login-request.model.ts`, `login-response.model.ts`
- For domain objects: `company.model.ts`, `order.model.ts`

**When to use `.interface.ts`:**
- For pure contracts/interfaces (no data, just shape): `feature-toggle.interface.ts`
- For configuration interfaces: `table-column-config.interface.ts`, `header-config.interface.ts`
- When interface defines a service contract or API

**Examples:**

✅ **CORRECT:**
```
auth/login-request.model.ts          # LoginRequest interface
auth/login-response.model.ts         # LoginResponse interface
auth/user.model.ts                   # User interface
business/customer.model.ts           # Customer interface
core/error-response.model.ts         # ErrorResponse interface
core/page-response.model.ts          # Pagination<T> interface
ui/table-column-config.interface.ts  # TableColumnConfig interface
ui/field-config.model.ts             # FieldConfig interface
feature/feature-toggle.interface.ts  # FeatureToggleContract interface
```

❌ **WRONG:**
```
auth/loginRequest.ts                 # camelCase without suffix
auth/LoginRequest.ts                 # PascalCase
business/Customer.model.ts           # PascalCase with suffix
core/errorResponse.ts                # camelCase without kebab-case
ui/brandFull.ts                      # No suffix, no kebab-case
```

**Multi-word file names:**
- ALWAYS use kebab-case: `subscriber-info.model.ts`, `email-template.model.ts`
- NEVER use camelCase: ❌ `subscriberInfo.ts`, ❌ `emailTemplate.ts`
- NEVER use PascalCase: ❌ `SubscriberInfo.ts`

**Consistency Rule:**
- Same category → same suffix pattern
- All models in `/shared/models/` follow this standard
- Component-specific models can be less strict but kebab-case preferred

### 🔍 Search Checklist Before Creating

Before creating ANY model/interface, search these locations:

- [ ] `/shared/models/auth/` - Authentication models
- [ ] `/shared/models/business/` - Business entities
- [ ] `/shared/models/communication/` - Communication models
- [ ] `/shared/models/core/` - Core/generic models
- [ ] `/shared/models/feature/` - Feature configs
- [ ] `/shared/models/payment/` - Payment models
- [ ] `/shared/models/product/` - Product models
- [ ] `/shared/models/subscriber/` - Subscriber models
- [ ] `/shared/models/ui/` - UI configurations
- [ ] Domain-specific models (e.g., `/views/dashboard/models/`)

**Search commands:**

```bash
# Search by interface/type name
grep -r "interface InterfaceName\|type TypeName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/

# Search by keyword (e.g., "user", "customer", "payment")
grep -r "interface.*User\|type.*User" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/

# List all model files in category
ls /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/auth/
```

### ⚠️ Common Mistakes to Avoid

**1. Creating models in component files:**
```typescript
// ❌ WRONG - Interface in component file
// customer-list.component.ts
interface Customer { ... }  // Should be in /shared/models/business/

// ✅ CORRECT - Import from models
import { Customer } from '@models/business';
```

**2. Duplicating similar models:**
```typescript
// ❌ WRONG - Creating duplicate
// /views/orders/models/customer.model.ts
interface Customer { ... }  // Already exists in /shared/models/business/

// ✅ CORRECT - Reuse existing
import { Customer } from '@models/business';
```

**3. Wrong category placement:**
```typescript
// ❌ WRONG - Payment model in business folder
// /shared/models/business/invoice.model.ts

// ✅ CORRECT - Payment model in payment folder
// /shared/models/payment/invoice.model.ts
```

**4. Missing barrel exports:**
```typescript
// ❌ WRONG - No index.ts, hard to import
import { User } from '@shared/models/auth/user.model';

// ✅ CORRECT - Barrel export exists
import { User } from '@models/auth';
```

**5. Wrong file naming:**
```typescript
// ❌ WRONG - camelCase or PascalCase without suffix
// /shared/models/auth/loginRequest.ts
// /shared/models/business/CustomerData.ts
// /shared/models/ui/brandFull.ts

// ✅ CORRECT - kebab-case with proper suffix
// /shared/models/auth/login-request.model.ts
// /shared/models/business/customer-data.model.ts
// /shared/models/ui/brand-full.model.ts
```

### 📚 Related Files

- **Main barrel:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/index.ts`
- **Auth models:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/auth/`
- **Business models:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/business/`
- **Core models:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/core/`
- **UI models:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/ui/`
- **Product models:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/product/`

