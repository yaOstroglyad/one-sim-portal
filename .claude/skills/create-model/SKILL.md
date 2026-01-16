---
name: create-model
description: Creates a new TypeScript model/interface following project standards. Use when asked to create a model, new interface, add type, or define entity.
allowed-tools: Write, Read, Glob, Grep, Edit
---

# Create Model/Interface

Create a new TypeScript model or interface following One-Sim-Portal project standards.

> **Rules Reference:** Model rules in `constitution.md` Section IV.
> This skill provides the **procedure** and **template** for creating models.

## Procedure

1. **Ask for model name and purpose** if not provided
2. **Determine location**:
   - Reusable → `src/app/shared/models/{category}/`
   - Feature-specific → `src/app/features/{feature}/models/`
   - View-specific → `src/app/views/{feature}/models/`
3. **Create model file** using template below
4. **Use `as const` for status/type values** (constitution requirement)
5. **Add to barrel exports**

## Model Template

```typescript
/**
 * [Model Description]
 *
 * @example
 * ```typescript
 * const item: MyModel = { id: '1', status: STATUSES.ACTIVE };
 * ```
 */

// 1. Constants with as const (for status/type fields)
export const {NAME}_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;
export type {Name}Status = typeof {NAME}_STATUSES[keyof typeof {NAME}_STATUSES];

// 2. Main interface
export interface {Name} {
  id: string;
  name: string;
  status: {Name}Status;
  createdAt: string;
  updatedAt?: string;
}

// 3. Request/Response types (if needed)
export interface Create{Name}Request {
  name: string;
  status?: {Name}Status;
}

export interface Update{Name}Request {
  name?: string;
  status?: {Name}Status;
}

export interface {Name}Response {
  data: {Name};
  message?: string;
}

export interface {Name}ListResponse {
  data: {Name}[];
  total: number;
  page: number;
  pageSize: number;
}
```

## Model Categories (constitution.md Section IV)

| Category | Path | Purpose |
|----------|------|---------|
| `auth/` | `shared/models/auth/` | Authentication models |
| `business/` | `shared/models/business/` | Accounts, companies, customers |
| `core/` | `shared/models/core/` | Pagination, errors, countries |
| `product/` | `shared/models/product/` | Products, bundles, tariffs |
| `subscriber/` | `shared/models/subscriber/` | Subscribers, subscriptions |
| `ui/` | `shared/models/ui/` | Table configs, form configs |

## Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| File | `kebab-case.model.ts` | `customer-order.model.ts` |
| Interface | `PascalCase` | `CustomerOrder` |
| Constants | `SCREAMING_SNAKE` | `ORDER_STATUSES` |
| Type | `PascalCase` | `OrderStatus` |
| Request | `{Action}{Name}Request` | `CreateOrderRequest` |
| Response | `{Name}Response` | `OrderResponse` |

## Critical Rule: as const (NON-NEGOTIABLE)

From constitution.md Section IV:

```typescript
// ✅ CORRECT - const object with derived type
export const ORDER_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;
export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

// ❌ FORBIDDEN - inline union
interface Order {
  status: 'pending' | 'completed';  // NO!
}

// ❌ FORBIDDEN - enum
enum OrderStatus {  // NO!
  PENDING = 'pending',
}
```

## Quick Checklist

Before finishing, verify against `constitution.md` Section IV:
- [ ] `as const` objects for status/type values
- [ ] Derived types from const objects
- [ ] No inline union types
- [ ] No enums
- [ ] PascalCase without `I` prefix (`User`, not `IUser`)
- [ ] Correct category folder
- [ ] Added to barrel exports
