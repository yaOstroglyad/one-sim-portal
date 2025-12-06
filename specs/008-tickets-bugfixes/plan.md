# Implementation Plan: Tickets Bugfixes & API Alignment

**Input**: spec.md from `/specs/008-tickets-bugfixes/`
**Approach**: Fix API contract mismatches and add customer info display

---

## Current State Analysis

### Files to Modify

| File | Current State | Target State |
|------|---------------|--------------|
| `ticket.model.ts` | Missing customer fields | Add iccid, customerEmail, customerName |
| `ticket.service.ts` | Uses http.put for update | Change to http.patch |
| `ticket-details.component.html` | No customer info section | Add customer info display |

---

## Phase 1: Model Updates

**Goal**: Add missing fields to Ticket and CreateTicketRequest

### Changes to `ticket.model.ts`

```typescript
// Add to Ticket interface after commentsCount/attachmentsCount:
iccid?: string;
customerEmail?: string;
customerName?: string;

// Add to CreateTicketRequest (optional fields):
iccid?: string;
customerEmail?: string;
customerName?: string;
```

---

## Phase 2: Service Fix

**Goal**: Change HTTP method from PUT to PATCH for updateTicket

### Changes to `ticket.service.ts`

```typescript
// Line 102: Change from:
return this.http.put(`${this.baseUrl}/${id}`, request).pipe(

// To:
return this.http.patch(`${this.baseUrl}/${id}`, request).pipe(
```

---

## Phase 3: UI - Display Customer Info

**Goal**: Show customer information in ticket details as read-only

### Changes to `ticket-details.component.html`

Add new section after existing meta-grid items:

```html
<!-- Customer Information (if available) -->
<div class="meta-item" *ngIf="ticket.customerName">
  <label>{{ 'tickets.customerName' | translate }}</label>
  <span>{{ ticket.customerName }}</span>
</div>

<div class="meta-item" *ngIf="ticket.customerEmail">
  <label>{{ 'tickets.customerEmail' | translate }}</label>
  <span>{{ ticket.customerEmail }}</span>
</div>

<div class="meta-item" *ngIf="ticket.iccid">
  <label>{{ 'tickets.iccid' | translate }}</label>
  <span>{{ ticket.iccid }}</span>
</div>
```

---

## Phase 4: Translations

**Goal**: Add translation keys for new fields

### Translation keys to add (en.json, he.json, ru.json, uk.json):

```json
{
  "tickets": {
    "customerName": "Customer Name",
    "customerEmail": "Customer Email",
    "iccid": "ICCID"
  }
}
```

---

## Phase 5: Validation

**Goal**: Build and verify all changes work correctly

- Build project: `npm run build`
- Verify no TypeScript errors
- Update spec status to "Implemented"

---

## Implementation Order

1. **Phase 1**: Model updates (~2 min)
2. **Phase 2**: Service fix (~1 min)
3. **Phase 3**: UI display (~5 min)
4. **Phase 4**: Translations (~3 min)
5. **Phase 5**: Build & verify (~2 min)

**Total estimated effort**: ~13 minutes

---

**Plan Version**: 1.0.0 | **Created**: 2025-12-06
