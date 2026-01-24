# API Migration Plan — Portal API Endpoints

> **Version:** 1.1 | **Created:** 2026-01-24
> **Status:** Planning
> **Effective Date:** January 22, 2026

---

## Clarifications

### Session 2026-01-24

- Q: Should we add the new `customerPhone` field to the create customer form? → A: No, skip phone field (keep existing form as-is)
- Q: Is registration email endpoint confirmed as POST with body? → A: Yes, POST with body `{ subscriberId, email }`
- Q: Which service should own `sendRegistrationEmail`? → A: `SendRegistrationEmailService` (feature-specific). Remove duplicate from `SubscriberDataService`.

---

## Summary

Backend team has migrated 6 endpoints to the new `/api/v1/portal/*` namespace. Frontend needs to be updated to use the new endpoints.

---

## Deprecated Endpoints Map

| # | Old Endpoint | New Endpoint | HTTP Method |
|---|--------------|--------------|-------------|
| 1 | `/api/v1/customers/command/create` | `/api/v1/portal/command/create-customer?productId={id}` | POST |
| 2 | `/api/v1/subscribers/command/create` | `/api/v1/portal/command/create-subscriber` | POST |
| 3 | `/api/v1/subscribers/send-registration-email` | `/api/v1/portal/command/send-registration-email` | POST (was GET) |
| 4 | `/api/v1/product-purchases/command/create` | `/api/v1/portal/command/create-product-purchase` | POST |
| 5 | `/api/v1/product-purchases/command/{id}/activate` | `/api/v1/portal/command/activate-product-purchase/{id}` | POST |
| 6 | `/api/v1/product-purchases/command/{id}/refund` | `/api/v1/portal/command/refund-product-purchase/{id}` | POST |

---

## Affected Files Analysis

### 1. Customer Creation

**Endpoint:** `POST /api/v1/customers/command/create` → `POST /api/v1/portal/command/create-customer`

**Service File:**
- `src/app/shared/services/data/customers-data.service.ts:53`

**Request Body Changes:**
```typescript
// OLD (current frontend sends)
{
  customerCommand: {
    id?: string,
    companyId?: string,    // admin only
    name: string,
    description?: string,
    externalId?: string,
    tags?: string[],
    type: 'PRIVATE' | 'CORPORATE'
  },
  subscriberCommand: null,
  productId?: string,
  userProfileEmail: string
}

// NEW (productId moved to query param)
{
  companyId?: string,      // admin only - required for admin, omit for non-admin
  name: string,
  description?: string,
  externalId?: string,
  tags?: string[],
  type: 'PRIVATE' | 'CORPORATE',
  customerEmail: string,
  customerPhone?: string   // optional, new field - NOT used in UI form (future feature)
}
```

**Consumers (2 files):**
| File | Usage |
|------|-------|
| `src/app/views/customers/customers.utils.ts:160` | `CustomersDialogUtils.openCreateCustomerDialog()` |
| `src/app/views/customers/customers.component.ts` | Via utils |

**Impact:** Medium — requires model changes

---

### 2. Subscriber Creation

**Endpoint:** `POST /api/v1/subscribers/command/create` → `POST /api/v1/portal/command/create-subscriber`

**Service File:**
- `src/app/shared/services/data/subscriber-data.service.ts:22-23`

**Request Body:** No changes (same payload structure)

**Consumers (1 file):**
| File | Usage |
|------|-------|
| `src/app/views/customers/private-customer-details/add-subscriber/add-subscriber.component.ts:74` | `createSubscriber()` call |

**Impact:** Low — URL change only

---

### 3. Send Registration Email

**Endpoint:** `GET /api/v1/subscribers/send-registration-email` → `POST /api/v1/portal/command/send-registration-email`

**Service File:**
- `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.service.ts:26-29`

**Duplicate to Remove:**
- `src/app/shared/services/data/subscriber-data.service.ts:38-41` — unused duplicate, will be deleted

**Method Change:** GET → POST (params move to body)

**Consumers (1 file):**
| File | Usage |
|------|-------|
| `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.component.ts` | Via SendRegistrationEmailService |

**Impact:** Medium — HTTP method change, params → body, plus cleanup of dead code

---

### 4. Product Purchase Creation

**Endpoint:** `POST /api/v1/product-purchases/command/create` → `POST /api/v1/portal/command/create-product-purchase`

**Service File:**
- `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.service.ts:58`

**Request Body:** No changes (same payload structure)

**Consumers (1 file):**
| File | Usage |
|------|-------|
| `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.ts` | Via service |

**Impact:** Low — URL change only

---

### 5. Product Purchase Activation

**Endpoint:** `POST /api/v1/product-purchases/command/{id}/activate` → `POST /api/v1/portal/command/activate-product-purchase/{id}`

**Service File:** Not found in codebase

**Impact:** None — endpoint not currently used

---

### 6. Product Purchase Refund

**Endpoint:** `POST /api/v1/product-purchases/command/{id}/refund` → `POST /api/v1/portal/command/refund-product-purchase/{id}`

**Service File:**
- `src/app/shared/components/refund-product/refund-product.service.ts:40-44`

**Request Body:** No changes

**Consumers (1 file):**
| File | Usage |
|------|-------|
| `src/app/shared/components/refund-product/refund-product.component.ts` | Via service |

**Impact:** Low — URL change only

---

## Complete Affected Files List

### Services (5 files)
| File | Changes Required |
|------|------------------|
| `src/app/shared/services/data/customers-data.service.ts` | URL + request body restructure |
| `src/app/shared/services/data/subscriber-data.service.ts` | URL change + remove unused `sendRegistrationEmail` method |
| `src/app/shared/components/refund-product/refund-product.service.ts` | URL only |
| `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.service.ts` | URL + method change (GET→POST) |
| `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.service.ts` | URL only |

### Components (indirectly affected via services) (5 files)
| File | Notes |
|------|-------|
| `src/app/views/customers/customers.component.ts` | Uses CustomersDataService |
| `src/app/views/customers/private-customer-details/add-subscriber/add-subscriber.component.ts` | Uses SubscriberDataService |
| `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.component.ts` | Uses SendRegistrationEmailService |
| `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.ts` | Uses AddSubscriberProductService |
| `src/app/shared/components/refund-product/refund-product.component.ts` | Uses RefundProductService |

### Models (potential changes)
| File | Notes |
|------|-------|
| `src/app/shared/models/business/customer.model.ts` | Add new CreateCustomerCommand interface |

### Utils
| File | Notes |
|------|-------|
| `src/app/views/customers/customers.utils.ts` | Uses CustomersDataService.create() |

---

## Migration Plan

### Phase 1: Preparation
1. **Create new DTO interfaces** for changed request bodies
2. **Review existing Customer model** for compatibility

### Phase 2: Service Updates (in order of dependency)

| Order | Service | Task | Complexity |
|-------|---------|------|------------|
| 1 | `customers-data.service.ts` | Update URL + restructure request body | High |
| 2 | `subscriber-data.service.ts` | Update URL + remove unused sendRegistrationEmail | Low |
| 3 | `send-registration-email.service.ts` | Update URL, change GET→POST | Medium |
| 4 | `add-subscriber-product.service.ts` | Update URL only | Low |
| 5 | `refund-product.service.ts` | Update URL only | Low |

### Phase 3: Component Updates
1. Update components if service method signatures changed
2. Update form data structures if needed

### Phase 4: Testing
1. Test each endpoint manually
2. Verify error handling works correctly

---

## Detailed Changes by Service

### 1. customers-data.service.ts

**Current:**
```typescript
create(customer: Customer): Observable<any> {
  return this.http.post<any>(`/api/v1/customers/command/create`, customer);
}
```

**New:**
```typescript
// Renamed to createCustomer() to avoid conflict with base DataService.create()
createCustomer(command: CreateCustomerCommand, productId?: string): Observable<any> {
  const params = productId
    ? new HttpParams().set('productId', productId)
    : undefined;
  return this.http.post<any>('/api/v1/portal/command/create-customer', command, { params });
}
```

**New Interface:**
```typescript
interface CreateCustomerCommand {
  companyId?: string;      // Required for admin only
  name: string;
  description?: string;
  externalId?: string;
  tags?: string[];
  type: 'PRIVATE' | 'CORPORATE';
  customerEmail: string;
  customerPhone?: string;  // NOT used in UI form (future feature)
}
```

---

### 2. subscriber-data.service.ts

**Current:**
```typescript
createSubscriber(payload: CreateSubscriberDto): Observable<any> {
  return this.http.post('/api/v1/subscribers/command/create', payload);
}

// REMOVE - unused duplicate
sendRegistrationEmail(subscriberId: string, email: string): Observable<any> {
  return this.http.get(`/api/v1/subscribers/send-registration-email`, {
    params: { subscriberId, email }
  });
}
```

**New:**
```typescript
createSubscriber(payload: CreateSubscriberDto): Observable<any> {
  return this.http.post('/api/v1/portal/command/create-subscriber', payload);
}

// sendRegistrationEmail method REMOVED - use SendRegistrationEmailService instead
```

---

### 3. send-registration-email.service.ts

**Current:**
```typescript
sendEmail(params: SendRegistrationEmailParams): Observable<unknown> {
  return this.http.get('/api/v1/subscribers/send-registration-email', {
    params: { subscriberId: params.subscriberId, email: params.email }
  });
}
```

**New:**
```typescript
sendEmail(params: SendRegistrationEmailParams): Observable<unknown> {
  return this.http.post('/api/v1/portal/command/send-registration-email', params);
}
```

---

### 4. add-subscriber-product.service.ts

**Current:**
```typescript
addProduct(product: AddSubscriberProduct): Observable<any> {
  return this.http.post<any>(`/api/v1/product-purchases/command/create`, product);
}
```

**New:**
```typescript
addProduct(product: AddSubscriberProduct): Observable<any> {
  return this.http.post<any>(`/api/v1/portal/command/create-product-purchase`, product);
}
```

---

### 5. refund-product.service.ts

**Current:**
```typescript
refund(productId: string): Observable<RefundResponse> {
  return this.http.post<RefundResponse>(
    `/api/v1/product-purchases/command/${productId}/refund`,
    {}
  );
}
```

**New:**
```typescript
refund(productId: string): Observable<RefundResponse> {
  return this.http.post<RefundResponse>(
    `/api/v1/portal/command/refund-product-purchase/${productId}`,
    {}
  );
}
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Customer creation breaks | Test thoroughly, request body structure changed significantly |
| Email sending fails | Method changed from GET to POST |
| Breaking changes in UI | Services encapsulate API calls, components should not need changes |

---

## Questions for Backend

1. ~~**Customer Creation:** What fields are required in the new request body?~~ ✅ Clarified: `companyId` is optional (admin only)
2. ~~**Registration Email:** Confirm this is now POST with body, not GET with params?~~ ✅ Confirmed: POST with body `{ subscriberId, email }`
3. **Product Activation:** This endpoint is not used in frontend — is it needed?
4. ~~**Customer Phone:** Should we add a phone field to the create customer form?~~ ✅ Decided: skip, form stays unchanged

---

## Checklist

- [ ] Create `CreateCustomerCommand` interface
- [ ] Update `customers-data.service.ts`
- [ ] Update `subscriber-data.service.ts` (URL + remove unused method)
- [ ] Update `send-registration-email.service.ts`
- [ ] Update `add-subscriber-product.service.ts`
- [ ] Update `refund-product.service.ts`
- [ ] Test customer creation flow
- [ ] Test subscriber creation flow
- [ ] Test registration email flow
- [ ] Test product purchase flow
- [ ] Test refund flow
