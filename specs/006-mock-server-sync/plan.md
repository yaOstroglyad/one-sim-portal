# Implementation Plan: Mock Server Sync (Users & Tickets)

**Spec**: `specs/006-mock-server-sync/spec.md`
**Created**: 2025-12-06
**Estimated Steps**: 8

---

## Overview

This plan implements synchronization between frontend API calls and mock-server endpoints for Users and Tickets domains.

**Key Changes:**
- Users: Add 6 new endpoints (update, delete, reset-password, roles management, user types)
- Tickets: Add status update endpoint, change PATCH to PUT for update

---

## Implementation Steps

### Step 1: Update User Model with Roles Support
**File**: `mock-server/src/domains/users/user.ts`

Add new interfaces for roles and request types:

```typescript
// Add to existing file:
export interface UserRole {
  id: string;
  name: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface RemoveRolesRequest {
  roleIds: string[];
}

// Update User interface to include roles
// Add: roles?: UserRole[];
```

**FR Mapping**: FR-004, FR-005

---

### Step 2: Implement Users Service Methods
**File**: `mock-server/src/domains/users/users.service.ts`

Add new service methods:

```typescript
// 1. updateUser(id: string, data: UpdateUserRequest): User
// 2. deleteUser(id: string): void
// 3. resetPassword(id: string): void
// 4. assignRoles(userId: string, roleIds: string[]): User
// 5. removeRoles(userId: string, roleIds: string[]): User
// 6. getUserTypes(): string[]
```

Implementation notes:
- `updateUser`: Find user by ID, merge data, return updated user
- `deleteUser`: Find user by ID, log deletion (mock doesn't persist)
- `resetPassword`: Find user by ID, return success (no actual password reset)
- `assignRoles`: Add roles to user.roles array
- `removeRoles`: Filter out roles from user.roles array
- `getUserTypes`: Return `['CORPORATE', 'PRIVATE']`

**FR Mapping**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-010

---

### Step 3: Register Users Controller Routes
**File**: `mock-server/src/domains/users/users.controller.ts`

Add 6 new route handlers and register them:

```typescript
// New handlers:
private updateUser = (req, res) => { ... }
private deleteUser = (req, res) => { ... }
private resetPassword = (req, res) => { ... }
private assignRoles = (req, res) => { ... }
private removeRoles = (req, res) => { ... }
private getUserTypes = (req, res) => { ... }

// Register in registerRoutes():
app.put('/api/v1/users/:id/update', this.updateUser);
app.delete('/api/v1/users/:id/delete', this.deleteUser);
app.post('/api/v1/users/:id/reset-password', this.resetPassword);
app.post('/api/v1/users/:userId/roles/assign', this.assignRoles);
app.delete('/api/v1/users/:userId/roles/remove', this.removeRoles);
app.get('/api/v1/users/query/types', this.getUserTypes);
```

**FR Mapping**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-009

---

### Step 4: Add Ticket Status Update Interface
**File**: `mock-server/src/domains/tickets/ticket.ts`

Add new interface:

```typescript
export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}
```

**FR Mapping**: FR-007

---

### Step 5: Implement Ticket Status Update Service
**File**: `mock-server/src/domains/tickets/tickets.service.ts`

Add new method:

```typescript
// PUT /api/v1/tickets/{id}/status - Update ticket status only
public updateTicketStatus(id: string, status: TicketStatus): Ticket {
  const ticket = this.getTicketById(id);

  const updatedTicket: Ticket = {
    ...ticket,
    status,
    updatedAt: new Date().toISOString(),
    resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : ticket.resolvedAt,
    closedAt: status === 'CLOSED' ? new Date().toISOString() : ticket.closedAt
  };

  console.log('[MOCK] Updated ticket status:', { id, status });
  return updatedTicket;
}
```

**FR Mapping**: FR-007, FR-010

---

### Step 6: Update Tickets Controller
**File**: `mock-server/src/domains/tickets/tickets.controller.ts`

Changes:
1. Add `updateTicketStatus` handler
2. Change `app.patch` to `app.put` for update route
3. Add new status route

```typescript
// New handler:
private updateTicketStatus = (req, res) => {
  const { status } = req.body;
  const updatedTicket = this.ticketsService.updateTicketStatus(req.params.id, status);
  this.successResponse(res, updatedTicket);
}

// In registerRoutes():
app.put('/api/v1/tickets/:id', this.updateTicket);  // Changed from PATCH
app.put('/api/v1/tickets/:id/status', this.updateTicketStatus);  // New
```

**FR Mapping**: FR-007, FR-008, FR-009

---

### Step 7: Verify Mock Data Files
**Files**:
- `mock-server/data/users/list.json` - Verify structure supports roles
- Ensure data files exist and have valid structure

No code changes expected, just verification.

**FR Mapping**: FR-010

---

### Step 8: Test and Validate
**Actions**:
1. Build mock-server: `cd mock-server && npm run build`
2. Start mock-server: `npm start`
3. Test each new endpoint with curl or frontend

**Test Commands**:
```bash
# Users endpoints
curl -X PUT http://localhost:3000/api/v1/users/user-1/update -H "Content-Type: application/json" -d '{"firstName":"Test"}'
curl -X DELETE http://localhost:3000/api/v1/users/user-1/delete
curl -X POST http://localhost:3000/api/v1/users/user-1/reset-password
curl -X POST http://localhost:3000/api/v1/users/user-1/roles/assign -H "Content-Type: application/json" -d '{"roleIds":["role-1"]}'
curl -X DELETE http://localhost:3000/api/v1/users/user-1/roles/remove -H "Content-Type: application/json" -d '{"roleIds":["role-1"]}'
curl http://localhost:3000/api/v1/users/query/types

# Tickets endpoints
curl -X PUT http://localhost:3000/api/v1/tickets/ticket-1 -H "Content-Type: application/json" -d '{"subject":"Updated"}'
curl -X PUT http://localhost:3000/api/v1/tickets/ticket-1/status -H "Content-Type: application/json" -d '{"status":"RESOLVED"}'
```

**SC Mapping**: SC-001, SC-002, SC-003, SC-004

---

## Dependency Graph

```
Step 1 (User Model)
    ↓
Step 2 (Users Service) ──→ Step 3 (Users Controller)

Step 4 (Ticket Model)
    ↓
Step 5 (Tickets Service) ──→ Step 6 (Tickets Controller)

Step 7 (Verify Data) ──→ Step 8 (Test)
```

Steps 1-3 and 4-6 can be done in parallel.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| User ID not found in mock data | Return 404 with clear error message |
| Roles array undefined | Initialize as empty array if undefined |
| Breaking existing endpoints | Careful testing of existing functionality |

---

## Files to Modify

| File | Action | Lines Est. |
|------|--------|-----------|
| `mock-server/src/domains/users/user.ts` | Add interfaces | +20 |
| `mock-server/src/domains/users/users.service.ts` | Add 6 methods | +80 |
| `mock-server/src/domains/users/users.controller.ts` | Add 6 handlers + routes | +90 |
| `mock-server/src/domains/tickets/ticket.ts` | Add interface | +4 |
| `mock-server/src/domains/tickets/tickets.service.ts` | Add 1 method | +15 |
| `mock-server/src/domains/tickets/tickets.controller.ts` | Add handler, change route | +25 |

**Total estimated new code**: ~235 lines

---

**Plan Version**: 1.0.0 | **Created**: 2025-12-06
