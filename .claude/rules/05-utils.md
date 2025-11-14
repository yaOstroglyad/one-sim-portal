# Utility Functions Organization Rules

> **Created:** 2025-11-01 | **Last Updated:** 2025-11-15
> **Context Tags:** `@creating-new` `@utils` `@learn-project`
> **Read when:** Creating utility functions or searching for existing ones

## Utility Functions Organization Rules
> **Created:** 2025-11-01 | **Last Updated:** 2025-11-04 (Added DOM utilities category)

### 🎯 Critical: Check Before Creating New Utilities

**ALWAYS follow this workflow when creating utility functions:**

```
1. Need a utility function?
   ↓
2. 🔍 SEARCH in /shared/utils first!
   ↓
3. Does it exist?
   ├─ YES → ✅ Reuse existing utility
   └─ NO  → Continue to step 4
   ↓
4. Is it reusable across domains?
   ├─ YES → Create in /shared/utils (shared utility)
   └─ NO  → Create in domain-specific utils
```

### 📂 Shared Utils Structure

All shared utilities MUST be organized in domain-based folders:

```
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/
├── color/          # Color manipulation (hex, rgb, shading, constants)
├── data/           # Data manipulation (search, format, transform)
├── date/           # Date manipulation (parsing, formatting, comparison, periods)
├── currency/       # Currency conversion, price calculations
├── dom/            # DOM manipulation, printing, window operations
├── http/           # HTTP error handling, requests, responses
└── testing/        # Mock utilities, test helpers
```

### 🚨 Critical Rules

**❌ NEVER:**
- Create utility without checking if it already exists in `/shared/utils`
- Create duplicate utilities in different locations
- Put utilities directly in `/shared/utils` root (must use folders)
- Create domain-specific utility in `/shared/utils`
- Create generic utility in domain folder

**✅ ALWAYS:**
- Search existing utilities before creating new ones
- Use domain-based organization (color/, data/, http/, etc.)
- Create barrel exports (`index.ts`) for each folder
- Add JSDoc comments to all utility functions
- Include usage examples in JSDoc

### 📋 Decision Tree: Where to Create Utility?

#### Step 1: Check Existing Utilities

```bash
# Search in shared utils
grep -r "functionName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/

# Search across entire codebase
grep -r "functionName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/
```

#### Step 2: Determine Location

**Use this decision tree:**

```
Is utility reusable across multiple domains/features?
├─ YES → Create in /shared/utils
│   └─ Which category?
│       ├─ Color manipulation? → /shared/utils/color/
│       ├─ Data formatting/search? → /shared/utils/data/
│       ├─ Date parsing/formatting/comparison/periods? → /shared/utils/date/
│       ├─ Currency/pricing? → /shared/utils/currency/
│       ├─ DOM/printing/window ops? → /shared/utils/dom/
│       ├─ HTTP operations? → /shared/utils/http/
│       ├─ Testing/mocking? → /shared/utils/testing/
│       └─ New category? → Create new folder in /shared/utils/
│
└─ NO → Domain-specific
    └─ Create in domain utils folder
        Example: /views/dashboard/utils/
```

### 📝 Examples

#### ✅ Correct: Reusable Utility in Shared

**Scenario:** Need to format currency values

```typescript
// ❌ WRONG - Creating in domain folder
// /views/orders/utils/currency-formatter.ts

// ✅ CORRECT - Search first, found in shared utils
import { formatCurrency } from '../../shared/utils/data';

// Usage
const formatted = formatCurrency(1234.56, 'USD'); // "$1,234.56"
```

#### ✅ Correct: Domain-Specific Utility

**Scenario:** Calculate dashboard-specific metrics

```typescript
// ✅ CORRECT - Domain-specific, stays in domain
// /views/dashboard/utils/metric-calculator.ts

/**
 * Calculate dashboard-specific KPIs
 * This logic is only used in dashboard and not reusable
 */
export function calculateDashboardKPIs(data: DashboardData): DashboardMetrics {
  // Dashboard-specific calculation logic
}
```

#### ❌ Wrong: Creating Duplicate Utility

**Scenario:** Need to search nested objects

```typescript
// ❌ WRONG - Not checking existing utilities
// /views/customers/utils/object-search.ts
export function searchInObject(obj: any, term: string): boolean {
  // Duplicate implementation
}

// ✅ CORRECT - Reuse existing utility
import { deepSearch } from '../../shared/utils/data';

const found = deepSearch(customerData, 'search term');
```

### 🔨 Creating New Shared Utility

When creating a new utility in `/shared/utils`:

1. **Choose correct folder** based on domain
2. **Create `.utils.ts` file** with descriptive name
3. **Add JSDoc comments** with examples
4. **Export from `index.ts`** in that folder
5. **Update main barrel export** if needed

**Example: Adding new data utility**

```typescript
// /shared/utils/data/validation.utils.ts

/**
 * Validate email format
 *
 * @param email - Email string to validate
 * @returns true if valid email format
 *
 * @example
 * ```typescript
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid-email');    // false
 * ```
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Update barrel export:**

```typescript
// /shared/utils/data/index.ts
export * from './search.utils';
export * from './format.utils';
export * from './validation.utils';  // Add new export
```

### 📦 Import Patterns

**Prefer specific imports for tree-shaking:**

```typescript
// ✅ BEST - Import from specific category
import { CHART_COLORS, shadeColor } from '@shared/utils/color';
import { deepSearch } from '@shared/utils/data';

// ✅ GOOD - Import from main barrel (convenience)
import { CHART_COLORS, deepSearch } from '@shared/utils';

// ❌ AVOID - Direct file import (bypasses barrel exports)
import { CHART_COLORS } from '@shared/utils/color/color.constants';
```

### 🔍 Search Checklist Before Creating

Before creating ANY utility, search these locations:

- [ ] `/shared/utils/color/` - Color manipulation
- [ ] `/shared/utils/data/` - Data formatting, searching, transformation
- [ ] `/shared/utils/currency/` - Currency conversion, price calculations
- [ ] `/shared/utils/dom/` - DOM manipulation, printing, window operations
- [ ] `/shared/utils/http/` - HTTP error handling, transformations
- [ ] `/shared/utils/testing/` - Mock utilities, test helpers
- [ ] Domain-specific utils (e.g., `/views/dashboard/utils/`)

**Search commands:**

```bash
# Search by function name
grep -r "functionName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/

# Search by keyword (e.g., "currency", "format", "search")
grep -r "currency" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/

# List all utility files
find /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/ -name "*.ts"
```

### 🏗️ Creating New Category

If your utility doesn't fit existing categories:

1. **Verify it's truly a new category** (not a variant of existing)
2. **Create new folder** in `/shared/utils/` with descriptive name
3. **Create barrel export** (`index.ts`)
4. **Add JSDoc** at folder level explaining category
5. **Update main barrel export** `/shared/utils/index.ts`
6. **Document in CLAUDE.md** (this file)

**Example: New "validation" category**

```typescript
// /shared/utils/validation/index.ts
/**
 * Validation utilities barrel export
 *
 * Provides validation functions for:
 * - Email validation
 * - Phone number validation
 * - Form field validation
 */

export * from './email.utils';
export * from './phone.utils';
export * from './form.utils';
```

### 📚 Related Files

- **Main barrel:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/index.ts`
- **Color utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/color/`
- **Data utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/data/`
- **Currency utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/currency/`
- **DOM utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/dom/`
- **HTTP utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/http/`
- **Testing utils:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/utils/testing/`

