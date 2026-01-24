# Implementation Plan: API Migration to Portal Endpoints

**Branch**: `025-api-migration-portal` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-api-migration-portal/spec.md`

## Summary

Migrate 6 deprecated API endpoints from their original namespaces (`/api/v1/customers/*`, `/api/v1/subscribers/*`, `/api/v1/product-purchases/*`) to the new Portal API namespace (`/api/v1/portal/command/*`). Changes include URL updates, HTTP method changes (GET→POST for registration email), and request body restructuring (customer creation).

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.5 (Zoneless, standalone)
**Primary Dependencies**: HttpClient, RxJS
**Storage**: N/A (API calls only)
**Testing**: Manual testing (no unit tests for services currently)
**Target Platform**: Web (SPA)
**Project Type**: Frontend Angular application
**Performance Goals**: N/A (simple API migrations)
**Constraints**: Must maintain backwards compatibility with existing components
**Scale/Scope**: 5 service files, 5 components affected indirectly

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| Absolute paths only | ✅ PASS | All file references use absolute paths |
| Standalone components | ✅ N/A | No component changes required |
| OnPush change detection | ✅ N/A | No component changes required |
| `inject()` for DI | ⚠️ CHECK | `customers-data.service.ts` uses constructor injection - needs refactor |
| Signal APIs | ✅ N/A | No new inputs/outputs |
| Error handling 4-layer | ✅ PASS | Services let errors propagate, no notifications |
| SCSS architecture | ✅ N/A | No style changes |
| Models location | ✅ PASS | New interface in `/shared/models/business/` |
| English documentation | ✅ PASS | All comments in English |

**Pre-Design Issues:**
1. `customers-data.service.ts` uses constructor injection (`constructor(public http: HttpClient)`) - **MUST refactor to `inject()`**

## Project Structure

### Documentation (this feature)

```text
specs/025-api-migration-portal/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output (N/A - no research needed)
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output (new API contracts)
└── tasks.md             # Phase 2 output
```

### Source Code (affected files)

```text
src/app/
├── shared/
│   ├── models/
│   │   └── business/
│   │       └── customer.model.ts          # Add CreateCustomerCommand interface
│   └── services/
│       └── data/
│           ├── customers-data.service.ts  # URL + body + refactor DI
│           └── subscriber-data.service.ts # URL change + remove dead code
│
├── shared/
│   └── components/
│       └── refund-product/
│           └── refund-product.service.ts  # URL only
│
└── views/
    └── customers/
        ├── edit-customer/
        │   └── edit-customer.utils.ts     # Update getCustomerCreateRequest()
        └── private-customer-details/
            ├── send-registration-email/
            │   └── send-registration-email.service.ts  # URL + GET→POST (single owner)
            └── add-subscriber-product/
                └── add-subscriber-product.service.ts   # URL only
```

**Structure Decision**: No new files needed except potentially a DTO interface. Changes are limited to existing service files.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

---

## Phase 0: Research

**Status**: SKIPPED - No research needed

This is a straightforward API migration with clear endpoint mappings provided by backend team. No technology decisions or architecture research required.

---

## Phase 1: Design & Contracts

### 1.1 Data Model Changes

**New Interface: `CreateCustomerCommand`**

Location: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/business/customer.model.ts`

```typescript
export interface CreateCustomerCommand {
  companyId?: string;      // Required for admin only
  name: string;
  description?: string;
  externalId?: string;
  tags?: string[];
  type: CustomerType;
  customerEmail: string;
  customerPhone?: string;
}
```

### 1.2 API Contracts

#### Contract 1: Create Customer
```
OLD: POST /api/v1/customers/command/create
NEW: POST /api/v1/portal/command/create-customer?productId={id}

Request Body:
{
  "companyId": "string (optional, admin only)",
  "name": "string (required)",
  "description": "string (optional)",
  "externalId": "string (optional)",
  "tags": ["string"] (optional),
  "type": "PRIVATE | CORPORATE (required)",
  "customerEmail": "string (required)",
  "customerPhone": "string (optional)"
}
```

#### Contract 2: Create Subscriber
```
OLD: POST /api/v1/subscribers/command/create
NEW: POST /api/v1/portal/command/create-subscriber

Request Body: UNCHANGED
{
  "customerId": "string",
  "productId": "string",
  "subscriberName": "string",
  "email": "string"
}
```

#### Contract 3: Send Registration Email
```
OLD: GET /api/v1/subscribers/send-registration-email?subscriberId={id}&email={email}
NEW: POST /api/v1/portal/command/send-registration-email

Request Body:
{
  "subscriberId": "string",
  "email": "string"
}
```

#### Contract 4: Create Product Purchase
```
OLD: POST /api/v1/product-purchases/command/create
NEW: POST /api/v1/portal/command/create-product-purchase

Request Body: UNCHANGED
{
  "subscriberId": "string",
  "productId": "string"
}
```

#### Contract 5: Activate Product Purchase
```
OLD: POST /api/v1/product-purchases/command/{id}/activate
NEW: POST /api/v1/portal/command/activate-product-purchase/{id}

NOT USED IN FRONTEND - No changes required
```

#### Contract 6: Refund Product Purchase
```
OLD: POST /api/v1/product-purchases/command/{id}/refund
NEW: POST /api/v1/portal/command/refund-product-purchase/{id}

Request Body: UNCHANGED (empty)
```

### 1.3 Implementation Order

Based on dependency analysis:

| Phase | File | Changes | Depends On |
|-------|------|---------|------------|
| 1.1 | `customer.model.ts` | Add `CreateCustomerCommand` | - |
| 1.2 | `customers-data.service.ts` | Refactor DI + URL + method signature | 1.1 |
| 1.3 | `edit-customer.utils.ts` | Update `getCustomerCreateRequest()` | 1.2 |
| 2.1 | `subscriber-data.service.ts` | URL change + remove unused `sendRegistrationEmail` | - |
| 2.2 | `send-registration-email.service.ts` | URL + GET→POST (single owner of this method) | - |
| 3.1 | `add-subscriber-product.service.ts` | URL only | - |
| 3.2 | `refund-product.service.ts` | URL only | - |

Phases 2.x and 3.x can run in parallel as they have no dependencies.

**Note:** `sendRegistrationEmail` was duplicated in both `subscriber-data.service.ts` and `send-registration-email.service.ts`. The shared service version is unused dead code and will be removed. `SendRegistrationEmailService` is the correct owner (feature-specific, used by component).

---

## Constitution Check (Post-Design)

| Rule | Status | Notes |
|------|--------|-------|
| `inject()` for DI | ✅ WILL FIX | Refactoring `customers-data.service.ts` as part of migration |
| Models in `/shared/models/` | ✅ PASS | `CreateCustomerCommand` goes to `business/customer.model.ts` |
| English documentation | ✅ PASS | All code comments will be in English |
| Error handling | ✅ PASS | Services continue to let errors propagate |

**All gates passed.**

---

## Quickstart

After implementation, test the following flows:

1. **Customer Creation** (Admin)
   - Navigate to Customers → Create Customer
   - Fill form with company selected
   - Verify request goes to `/api/v1/portal/command/create-customer?productId=xxx`

2. **Customer Creation** (Non-Admin)
   - Same flow, verify `companyId` is not in request body

3. **Subscriber Creation**
   - Customer Details → Add Subscriber
   - Verify request goes to `/api/v1/portal/command/create-subscriber`

4. **Registration Email**
   - Customer Details → Send Registration Email
   - Verify POST request (not GET) to `/api/v1/portal/command/send-registration-email`

5. **Product Purchase**
   - Customer Details → Add Product
   - Verify request goes to `/api/v1/portal/command/create-product-purchase`

6. **Refund**
   - Subscriber Details → Refund Product
   - Verify request goes to `/api/v1/portal/command/refund-product-purchase/{id}`
