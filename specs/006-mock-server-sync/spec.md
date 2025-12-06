# Feature Specification: Mock Server Sync (Users & Tickets)

**Feature Branch**: `006-mock-server-sync`
**Created**: 2025-12-06
**Status**: Implemented
**Input**: Synchronize mock-server endpoints with current frontend API usage

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update User in Mock Mode (Priority: P1)

As a developer, I want to update users in mock mode so that I can test the update flow locally.

**Why this priority**: Core CRUD operation - blocking for local development testing.

**Independent Test**: Can be tested by calling PUT /api/v1/users/{id}/update and verifying user data changes.

**Acceptance Scenarios**:

1. **Given** a user exists, **When** I call PUT /api/v1/users/{id}/update, **Then** user data is updated
2. **Given** I update a user, **When** I list users, **Then** I see updated data
3. **Given** invalid user ID, **When** I call update, **Then** I get 404 error

---

### User Story 2 - Delete User in Mock Mode (Priority: P1)

As a developer, I want to delete users in mock mode so that I can test the delete flow locally.

**Why this priority**: Core CRUD operation - required for testing user management.

**Independent Test**: Can be tested by calling DELETE /api/v1/users/{id}/delete and verifying user is removed.

**Acceptance Scenarios**:

1. **Given** a user exists, **When** I call DELETE /api/v1/users/{id}/delete, **Then** user is removed
2. **Given** I delete a user, **When** I list users, **Then** deleted user is not present
3. **Given** invalid user ID, **When** I call delete, **Then** I get 404 error

---

### User Story 3 - Reset User Password in Mock Mode (Priority: P2)

As a developer, I want to reset user password in mock mode so that I can test the password reset flow.

**Why this priority**: Important for testing but less frequently used than CRUD.

**Independent Test**: Can be tested by calling POST /api/v1/users/{id}/reset-password.

**Acceptance Scenarios**:

1. **Given** a user exists, **When** I call reset-password, **Then** I get success response
2. **Given** invalid user ID, **When** I call reset-password, **Then** I get 404 error

---

### User Story 4 - Manage User Roles in Mock Mode (Priority: P2)

As a developer, I want to assign/remove roles in mock mode so that I can test role management.

**Why this priority**: Important for RBAC testing but not blocking for basic flows.

**Independent Test**: Can be tested by assigning roles and verifying user.roles updates.

**Acceptance Scenarios**:

1. **Given** a user exists, **When** I assign roles, **Then** user.roles is updated
2. **Given** a user has roles, **When** I remove roles, **Then** user.roles is updated
3. **Given** I assign roles, **When** I get user details, **Then** roles are reflected

---

### User Story 5 - Get User Types in Mock Mode (Priority: P3)

As a developer, I want to get user types in mock mode so that dropdowns work locally.

**Why this priority**: Static reference data - has fallback in frontend.

**Independent Test**: Can be tested by calling GET /api/v1/users/query/types.

**Acceptance Scenarios**:

1. **Given** I call user types, **When** request succeeds, **Then** I get array of types
2. **Given** response returns, **When** I check data, **Then** includes CORPORATE and PRIVATE

---

### User Story 6 - Update Ticket Status in Mock Mode (Priority: P1)

As a developer, I want to update ticket status in mock mode so that I can test status workflow.

**Why this priority**: Core ticket workflow - required for testing status transitions.

**Independent Test**: Can be tested by calling PUT /api/v1/tickets/{id}/status.

**Acceptance Scenarios**:

1. **Given** a ticket exists, **When** I update status, **Then** ticket.status changes
2. **Given** I update to RESOLVED, **When** I get ticket, **Then** status is RESOLVED
3. **Given** invalid ticket ID, **When** I update status, **Then** I get 404 error

---

### User Story 7 - Fix Ticket Update Method (Priority: P1)

As a developer, I want ticket update to use PUT method so that frontend and mock match.

**Why this priority**: Method mismatch causes 404 errors in mock mode.

**Independent Test**: Can be tested by calling PUT /api/v1/tickets/{id} instead of PATCH.

**Acceptance Scenarios**:

1. **Given** a ticket exists, **When** I call PUT /api/v1/tickets/{id}, **Then** ticket is updated
2. **Given** I use PUT method, **When** mock receives request, **Then** it responds correctly

---

### Edge Cases

- What if user has dependencies (tickets assigned)? -> Allow delete, cascade handled by business logic
- How to handle concurrent updates? -> Last write wins (mock is simple)
- What if roles array is empty? -> Accept empty array, user has no roles

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mock MUST support PUT /api/v1/users/{id}/update endpoint
- **FR-002**: Mock MUST support DELETE /api/v1/users/{id}/delete endpoint
- **FR-003**: Mock MUST support POST /api/v1/users/{id}/reset-password endpoint
- **FR-004**: Mock MUST support POST /api/v1/users/{userId}/roles/assign endpoint
- **FR-005**: Mock MUST support DELETE /api/v1/users/{userId}/roles/remove endpoint
- **FR-006**: Mock MUST support GET /api/v1/users/query/types endpoint
- **FR-007**: Mock MUST support PUT /api/v1/tickets/{id}/status endpoint
- **FR-008**: Mock MUST change ticket update from PATCH to PUT method
- **FR-009**: All endpoints MUST return appropriate HTTP status codes
- **FR-010**: All mutations MUST persist in mock memory during session

### Key Entities

- **User**: Existing entity with added roles management
- **Ticket**: Existing entity with status update capability
- **UserRole**: Role assigned to user (id, name)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 new Users endpoints respond correctly
- **SC-002**: Ticket status update works via PUT method
- **SC-003**: Frontend tests pass in mock mode
- **SC-004**: No console errors when using mock-server

---

## Technical Implementation

### New Users Endpoints

```typescript
// users.controller.ts additions
app.put('/api/v1/users/:id/update', this.updateUser);
app.delete('/api/v1/users/:id/delete', this.deleteUser);
app.post('/api/v1/users/:id/reset-password', this.resetPassword);
app.post('/api/v1/users/:userId/roles/assign', this.assignRoles);
app.delete('/api/v1/users/:userId/roles/remove', this.removeRoles);
app.get('/api/v1/users/query/types', this.getUserTypes);
```

### New Tickets Endpoints

```typescript
// tickets.controller.ts modifications
app.put('/api/v1/tickets/:id', this.updateTicket);  // Change from PATCH
app.put('/api/v1/tickets/:id/status', this.updateTicketStatus);  // New
```

### Request/Response Models

```typescript
// Update User Request
interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Assign Roles Request
interface AssignRolesRequest {
  roleIds: string[];
}

// Update Ticket Status Request
interface UpdateTicketStatusRequest {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
}

// User Types Response
type UserTypesResponse = string[]; // ['CORPORATE', 'PRIVATE']
```

### File Changes

| File | Changes |
|------|---------|
| `mock-server/src/domains/users/users.controller.ts` | Add 6 new route handlers |
| `mock-server/src/domains/users/users.service.ts` | Add service methods for new operations |
| `mock-server/src/domains/users/user.ts` | Add interfaces if needed |
| `mock-server/src/domains/tickets/tickets.controller.ts` | Change PATCH to PUT, add status endpoint |
| `mock-server/src/domains/tickets/tickets.service.ts` | Add updateTicketStatus method |

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-06
