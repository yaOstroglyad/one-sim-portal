# Tasks: API Migration to Portal Endpoints

**Input**: Design documents from `/specs/025-api-migration-portal/`
**Prerequisites**: plan.md (complete), spec.md (complete)

**Tests**: Not requested - manual testing only

**Organization**: Tasks grouped by endpoint migration (treated as user stories) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which migration this task belongs to (US1=Customer, US2=Subscriber, US3=Email, US4=Purchase, US5=Refund)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

---

## Phase 1: Foundational (Model + DI Refactor)

**Purpose**: Create new interface and fix constitution violations before service migrations

**⚠️ CRITICAL**: These tasks MUST be complete before service migrations can begin

- [x] T001 Add `CreateCustomerCommand` interface to `src/app/shared/models/business/customer.model.ts`
- [x] T002 Export `CreateCustomerCommand` from `src/app/shared/models/index.ts` barrel
- [x] T003 Refactor `CustomersDataService` to use `inject()` instead of constructor injection in `src/app/shared/services/data/customers-data.service.ts`

**Checkpoint**: Foundation ready - service migrations can now begin in parallel

---

## Phase 2: User Story 1 - Customer Creation Migration (Priority: P1) 🎯 MVP

**Goal**: Migrate customer creation endpoint to new Portal API with restructured request body

**Independent Test**: Create new customer via UI → verify request goes to `/api/v1/portal/command/create-customer?productId=xxx` with flat body structure

### Implementation for User Story 1

- [x] T004 [US1] Update `create()` method signature in `src/app/shared/services/data/customers-data.service.ts` to accept `CreateCustomerCommand` and optional `productId`
- [x] T005 [US1] Update `create()` method URL to `/api/v1/portal/command/create-customer` with `productId` as query param in `src/app/shared/services/data/customers-data.service.ts`
- [x] T006 [US1] Update `getCustomerCreateRequest()` function to return flat `CreateCustomerCommand` structure in `src/app/views/customers/edit-customer/edit-customer.utils.ts`
- [x] T007 [US1] Update `CustomersDialogUtils.openCreateCustomerDialog()` to pass `productId` separately in `src/app/views/customers/customers.utils.ts`

**Checkpoint**: Customer creation fully migrated - test admin and non-admin flows

---

## Phase 3: User Story 2 - Subscriber Creation Migration (Priority: P2)

**Goal**: Migrate subscriber creation endpoint to new Portal API (URL change only) + cleanup dead code

**Independent Test**: Add subscriber via Customer Details → verify request goes to `/api/v1/portal/command/create-subscriber`

### Implementation for User Story 2

- [x] T008 [P] [US2] Update `createSubscriber()` URL to `/api/v1/portal/command/create-subscriber` in `src/app/shared/services/data/subscriber-data.service.ts`
- [x] T009 [P] [US2] Remove unused `sendRegistrationEmail()` method from `src/app/shared/services/data/subscriber-data.service.ts` (dead code, use SendRegistrationEmailService instead)

**Checkpoint**: Subscriber creation migrated, dead code removed

---

## Phase 4: User Story 3 - Registration Email Migration (Priority: P3)

**Goal**: Migrate registration email endpoint to new Portal API with GET→POST method change

**Independent Test**: Send registration email via Customer Details → verify POST request to `/api/v1/portal/command/send-registration-email` with body (not query params)

### Implementation for User Story 3

- [x] T010 [P] [US3] Update `sendEmail()` to POST with body in `src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.service.ts`

**Checkpoint**: Registration email migrated

---

## Phase 5: User Story 4 - Product Purchase Migration (Priority: P4)

**Goal**: Migrate product purchase creation endpoint to new Portal API (URL change only)

**Independent Test**: Add product via Customer Details → verify request goes to `/api/v1/portal/command/create-product-purchase`

### Implementation for User Story 4

- [x] T011 [P] [US4] Update `addProduct()` URL to `/api/v1/portal/command/create-product-purchase` in `src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.service.ts`

**Checkpoint**: Product purchase creation migrated

---

## Phase 6: User Story 5 - Refund Migration (Priority: P5)

**Goal**: Migrate refund endpoint to new Portal API (URL change only)

**Independent Test**: Refund product via Subscriber Details → verify request goes to `/api/v1/portal/command/refund-product-purchase/{id}`

### Implementation for User Story 5

- [x] T012 [P] [US5] Update `refund()` URL to `/api/v1/portal/command/refund-product-purchase/${productId}` in `src/app/shared/components/refund-product/refund-product.service.ts`

**Checkpoint**: Refund migrated - all endpoints now using Portal API

---

## Phase 7: Polish & Verification

**Purpose**: Final verification across all migrated endpoints

- [ ] T013 Manual test: Customer creation (admin flow) - verify `companyId` in body
- [ ] T014 Manual test: Customer creation (non-admin flow) - verify `companyId` NOT in body
- [ ] T015 Manual test: Subscriber creation flow
- [ ] T016 Manual test: Registration email flow - verify POST not GET
- [ ] T017 Manual test: Product purchase flow
- [ ] T018 Manual test: Refund flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies - MUST complete first
- **Phase 2 (US1 - Customer)**: Depends on T001, T002, T003 completion
- **Phases 3-6 (US2-US5)**: Depend only on Phase 1 - can run in parallel with each other
- **Phase 7 (Polish)**: Depends on all previous phases

### User Story Dependencies

| Story | Depends On | Can Run Parallel With |
|-------|------------|----------------------|
| US1 (Customer) | T001, T002, T003 | - |
| US2 (Subscriber) | None | US3, US4, US5 |
| US3 (Email) | None | US2, US4, US5 |
| US4 (Purchase) | None | US2, US3, US5 |
| US5 (Refund) | None | US2, US3, US4 |

### Within Each User Story

- Service changes before util/consumer changes
- URL changes before method signature changes

### Parallel Opportunities

After Phase 1 completion:
- T008, T009 (US2), T010 (US3), T011 (US4), T012 (US5) can ALL run in parallel
- These are independent files with no cross-dependencies

---

## Parallel Example: After Foundational Phase

```bash
# All these can run simultaneously after T001-T003 complete:
Task: "T008 [P] [US2] Update createSubscriber() URL in subscriber-data.service.ts"
Task: "T009 [P] [US2] Remove unused sendRegistrationEmail() from subscriber-data.service.ts"
Task: "T010 [P] [US3] Update sendEmail() to POST in send-registration-email.service.ts"
Task: "T011 [P] [US4] Update addProduct() URL in add-subscriber-product.service.ts"
Task: "T012 [P] [US5] Update refund() URL in refund-product.service.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Foundational (T001-T003)
2. Complete Phase 2: US1 Customer Creation (T004-T007)
3. **STOP and VALIDATE**: Test customer creation admin + non-admin
4. Deploy if critical path

### Full Migration (Recommended)

1. Complete Phase 1: Foundational
2. Complete Phase 2: US1 Customer (most complex)
3. Run T008-T012 in parallel (simple URL/method changes + cleanup)
4. Run Phase 7: Manual testing
5. Deploy all changes together

### Estimated Complexity

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Foundational | 3 | Medium (DI refactor) |
| US1 Customer | 4 | High (body restructure) |
| US2 Subscriber | 2 | Low (URL + remove dead code) |
| US3 Email | 1 | Medium (GET→POST) |
| US4 Purchase | 1 | Low (URL only) |
| US5 Refund | 1 | Low (URL only) |
| Polish | 6 | Manual testing |
| **Total** | **18** | |

---

## Notes

- [P] tasks = different files, no dependencies - can run simultaneously
- [Story] label maps task to specific endpoint migration
- US1 is the most complex (body restructure + DI refactor)
- US2-US5 are simple URL or method changes
- T009 removes dead code (unused duplicate method)
- No automated tests - manual verification per quickstart.md
- Commit after each phase completion recommended
