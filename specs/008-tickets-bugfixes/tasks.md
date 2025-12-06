# Tasks: Tickets Bugfixes & API Alignment

**Input**: Design documents from `/specs/008-tickets-bugfixes/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Not requested

---

## Phase 1: Model Updates

**Purpose**: Add missing customer fields to models

- [ ] T001 [US1] Add iccid, customerEmail, customerName to Ticket interface in src/app/views/tickets/models/ticket.model.ts
- [ ] T002 [US1] Add iccid, customerEmail, customerName to CreateTicketRequest interface in src/app/views/tickets/models/ticket.model.ts

**Checkpoint**: Models match API contract

---

## Phase 2: Service Fix

**Purpose**: Fix HTTP method for update

- [ ] T003 [US2] Change http.put to http.patch in updateTicket method in src/app/views/tickets/services/ticket.service.ts

**Checkpoint**: Update uses PATCH method

---

## Phase 3: UI Display

**Purpose**: Display customer info in ticket details

- [ ] T004 [US1] Add customerName display in src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.html
- [ ] T005 [US1] Add customerEmail display in src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.html
- [ ] T006 [US1] Add iccid display in src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.html

**Checkpoint**: Customer info visible in ticket details

---

## Phase 4: Translations

**Purpose**: Add translation keys for new fields

- [ ] T007 Add tickets.customerName, tickets.customerEmail, tickets.iccid to src/assets/i18n/en.json
- [ ] T008 Add tickets.customerName, tickets.customerEmail, tickets.iccid to src/assets/i18n/he.json
- [ ] T009 Add tickets.customerName, tickets.customerEmail, tickets.iccid to src/assets/i18n/ru.json
- [ ] T010 Add tickets.customerName, tickets.customerEmail, tickets.iccid to src/assets/i18n/uk.json

**Checkpoint**: All translations added

---

## Phase 5: Validation

**Purpose**: Build and verify

- [ ] T011 Build project: `npm run build`
- [ ] T012 Update spec.md status to "Implemented"

**Checkpoint**: Build succeeds, spec updated

---

## Summary

| Phase | Description | Tasks |
|-------|-------------|-------|
| 1 | Model Updates | T001-T002 |
| 2 | Service Fix | T003 |
| 3 | UI Display | T004-T006 |
| 4 | Translations | T007-T010 |
| 5 | Validation | T011-T012 |

**Total Tasks**: 12

**Files to Modify**: 7
- `src/app/views/tickets/models/ticket.model.ts`
- `src/app/views/tickets/services/ticket.service.ts`
- `src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.html`
- `src/assets/i18n/en.json`
- `src/assets/i18n/he.json`
- `src/assets/i18n/ru.json`
- `src/assets/i18n/uk.json`

---

**Tasks Version**: 1.0.0 | **Generated**: 2025-12-06
