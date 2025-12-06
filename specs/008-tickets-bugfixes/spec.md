# Feature Specification: Tickets Bugfixes & API Alignment

**Feature Branch**: `008-tickets-bugfixes`
**Created**: 2025-12-06
**Status**: Implemented
**Input**: Align Tickets module with actual API contract and project standards

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Customer Info on Ticket (Priority: P1)

As a support agent, I want to see customer information (ICCID, email, name) on a ticket so that I can identify the customer context.

**Why this priority**: Core information needed for support workflow.

**Independent Test**: Open a ticket and verify customer fields are displayed as read-only.

**Acceptance Scenarios**:

1. **Given** I view a ticket, **When** ticket has customerEmail, **Then** I see it displayed as read-only
2. **Given** I view a ticket, **When** ticket has customerName, **Then** I see it displayed as read-only
3. **Given** I view a ticket, **When** ticket has iccid, **Then** I see it displayed as read-only
4. **Given** I create a ticket, **When** form loads, **Then** I don't see customer fields (auto-filled by backend)

---

### User Story 2 - Fix Update Ticket HTTP Method (Priority: P1)

As a developer, I want the update ticket to use PATCH method so that it matches the API contract.

**Why this priority**: API mismatch causes potential errors.

**Independent Test**: Update a ticket and verify PATCH method is used in network tab.

**Acceptance Scenarios**:

1. **Given** I edit a ticket, **When** I save changes, **Then** PATCH request is sent (not PUT)
2. **Given** API expects PATCH, **When** frontend uses PATCH, **Then** update succeeds

---

### Edge Cases

- What if customer fields are null? -> Don't display the field row
- What if iccid is very long? -> Truncate with tooltip

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ticket model MUST include iccid, customerEmail, customerName fields
- **FR-002**: CreateTicketRequest MUST include optional iccid, customerEmail, customerName fields
- **FR-003**: Ticket details MUST display customer info as read-only when available
- **FR-004**: Update ticket MUST use PATCH method instead of PUT
- **FR-005**: Customer fields MUST NOT be editable in the form

### Key Entities

Updated `Ticket` interface:
```typescript
interface Ticket {
  // ... existing fields
  iccid?: string;
  customerEmail?: string;
  customerName?: string;
}
```

Updated `CreateTicketRequest`:
```typescript
interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  iccid?: string;
  customerEmail?: string;
  customerName?: string;
}
```

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ticket model includes new customer fields
- **SC-002**: CreateTicketRequest includes optional customer fields
- **SC-003**: Ticket details display customer info when available
- **SC-004**: updateTicket uses http.patch instead of http.put
- **SC-005**: Build succeeds with no errors

---

## Technical Implementation

### API Contract (from Swagger)

**POST /api/v1/tickets** (Create):
```json
{
  "subject": "string",
  "description": "string",
  "iccid": "string",
  "customerEmail": "user@example.com",
  "customerName": "string",
  "priority": "LOW",
  "category": "GENERAL_INQUIRY"
}
```

**PATCH /api/v1/tickets/{id}** (Update):
```json
{
  "status": "OPEN",
  "priority": "LOW",
  "category": "GENERAL_INQUIRY",
  "assignedToId": "string",
  "subject": "string",
  "description": "string"
}
```

### File Changes

| File | Changes |
|------|---------|
| `src/app/views/tickets/models/ticket.model.ts` | Add iccid, customerEmail, customerName to Ticket and CreateTicketRequest |
| `src/app/views/tickets/services/ticket.service.ts` | Change http.put to http.patch in updateTicket |
| `src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.ts` | Display customer info fields |
| `src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.html` | Add customer info section |

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-06
