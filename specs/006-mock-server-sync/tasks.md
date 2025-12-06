# Tasks: Mock Server Sync (Users & Tickets)

**Input**: Design documents from `/specs/006-mock-server-sync/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Not requested for this feature (mock-server is test infrastructure itself)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Models & Interfaces)

**Purpose**: Add required interfaces before implementing service methods

- [X] T001 [P] Add UserRole, UpdateUserRequest, AssignRolesRequest, RemoveRolesRequest interfaces in mock-server/src/domains/users/user.ts
- [X] T002 [P] Add roles property to User interface in mock-server/src/domains/users/user.ts
- [X] T003 [P] Add UpdateTicketStatusRequest interface in mock-server/src/domains/tickets/ticket.ts

**Checkpoint**: All interfaces ready for service implementation

---

## Phase 2: User Story 1 - Update User (Priority: P1)

**Goal**: Enable updating user data via PUT /api/v1/users/{id}/update

**Independent Test**: `curl -X PUT http://localhost:3000/api/v1/users/user-1/update -H "Content-Type: application/json" -d '{"firstName":"Test"}'`

### Implementation

- [X] T004 [US1] Implement updateUser method in mock-server/src/domains/users/users.service.ts
- [X] T005 [US1] Add updateUser handler in mock-server/src/domains/users/users.controller.ts
- [X] T006 [US1] Register PUT /api/v1/users/:id/update route in mock-server/src/domains/users/users.controller.ts

**Checkpoint**: User update endpoint functional

---

## Phase 3: User Story 2 - Delete User (Priority: P1)

**Goal**: Enable deleting users via DELETE /api/v1/users/{id}/delete

**Independent Test**: `curl -X DELETE http://localhost:3000/api/v1/users/user-1/delete`

### Implementation

- [X] T007 [US2] Implement deleteUser method in mock-server/src/domains/users/users.service.ts
- [X] T008 [US2] Add deleteUser handler in mock-server/src/domains/users/users.controller.ts
- [X] T009 [US2] Register DELETE /api/v1/users/:id/delete route in mock-server/src/domains/users/users.controller.ts

**Checkpoint**: User delete endpoint functional

---

## Phase 4: User Story 3 - Reset Password (Priority: P2)

**Goal**: Enable password reset via POST /api/v1/users/{id}/reset-password

**Independent Test**: `curl -X POST http://localhost:3000/api/v1/users/user-1/reset-password`

### Implementation

- [X] T010 [US3] Implement resetPassword method in mock-server/src/domains/users/users.service.ts
- [X] T011 [US3] Add resetPassword handler in mock-server/src/domains/users/users.controller.ts
- [X] T012 [US3] Register POST /api/v1/users/:id/reset-password route in mock-server/src/domains/users/users.controller.ts

**Checkpoint**: Password reset endpoint functional

---

## Phase 5: User Story 4 - Manage Roles (Priority: P2)

**Goal**: Enable assigning/removing roles via POST/DELETE /api/v1/users/{userId}/roles/*

**Independent Test**:
- `curl -X POST http://localhost:3000/api/v1/users/user-1/roles/assign -H "Content-Type: application/json" -d '{"roleIds":["role-1"]}'`
- `curl -X DELETE http://localhost:3000/api/v1/users/user-1/roles/remove -H "Content-Type: application/json" -d '{"roleIds":["role-1"]}'`

### Implementation

- [X] T013 [P] [US4] Implement assignRoles method in mock-server/src/domains/users/users.service.ts
- [X] T014 [P] [US4] Implement removeRoles method in mock-server/src/domains/users/users.service.ts
- [X] T015 [US4] Add assignRoles handler in mock-server/src/domains/users/users.controller.ts
- [X] T016 [US4] Add removeRoles handler in mock-server/src/domains/users/users.controller.ts
- [X] T017 [US4] Register POST /api/v1/users/:userId/roles/assign route in mock-server/src/domains/users/users.controller.ts
- [X] T018 [US4] Register DELETE /api/v1/users/:userId/roles/remove route in mock-server/src/domains/users/users.controller.ts

**Checkpoint**: Roles management endpoints functional

---

## Phase 6: User Story 5 - Get User Types (Priority: P3)

**Goal**: Enable getting user types via GET /api/v1/users/query/types

**Independent Test**: `curl http://localhost:3000/api/v1/users/query/types`

### Implementation

- [X] T019 [US5] Implement getUserTypes method in mock-server/src/domains/users/users.service.ts
- [X] T020 [US5] Add getUserTypes handler in mock-server/src/domains/users/users.controller.ts
- [X] T021 [US5] Register GET /api/v1/users/query/types route in mock-server/src/domains/users/users.controller.ts

**Checkpoint**: User types endpoint functional

---

## Phase 7: User Story 6 - Update Ticket Status (Priority: P1)

**Goal**: Enable updating ticket status via PUT /api/v1/tickets/{id}/status

**Independent Test**: `curl -X PUT http://localhost:3000/api/v1/tickets/ticket-1/status -H "Content-Type: application/json" -d '{"status":"RESOLVED"}'`

### Implementation

- [X] T022 [US6] Implement updateTicketStatus method in mock-server/src/domains/tickets/tickets.service.ts
- [X] T023 [US6] Add updateTicketStatus handler in mock-server/src/domains/tickets/tickets.controller.ts
- [X] T024 [US6] Register PUT /api/v1/tickets/:id/status route in mock-server/src/domains/tickets/tickets.controller.ts

**Checkpoint**: Ticket status update endpoint functional

---

## Phase 8: User Story 7 - Fix Ticket Update Method (Priority: P1)

**Goal**: Change ticket update from PATCH to PUT method

**Independent Test**: `curl -X PUT http://localhost:3000/api/v1/tickets/ticket-1 -H "Content-Type: application/json" -d '{"subject":"Updated"}'`

### Implementation

- [X] T025 [US7] Change app.patch to app.put for /api/v1/tickets/:id route in mock-server/src/domains/tickets/tickets.controller.ts
- [X] T026 [US7] Update updateTicket handler comment from PATCH to PUT in mock-server/src/domains/tickets/tickets.controller.ts

**Checkpoint**: Ticket update responds to PUT method

---

## Phase 9: Validation & Testing

**Purpose**: Build and test all endpoints

- [X] T027 Build mock-server: `cd mock-server && npm run build`
- [X] T028 Start mock-server and verify all endpoints respond correctly
- [X] T029 Update spec.md status to "Implemented"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - interfaces needed first
- **Phases 2-6 (Users)**: Depend on T001, T002 completion
- **Phases 7-8 (Tickets)**: Depend on T003 completion
- **Phase 9 (Validation)**: Depends on all previous phases

### Parallel Opportunities

```
Phase 1: T001, T002, T003 can run in parallel (different files)

After Phase 1:
  Users (Phases 2-6) and Tickets (Phases 7-8) can run in parallel

Within Phase 5 (Roles):
  T013, T014 can run in parallel (different methods, same file)
```

---

## Implementation Strategy

### Recommended Order (Single Developer)

1. **Phase 1**: All interface changes (T001-T003)
2. **Phase 2-3**: Update & Delete User (P1 stories)
3. **Phase 7-8**: Ticket changes (P1 stories)
4. **Phase 4-6**: Remaining User stories (P2, P3)
5. **Phase 9**: Validation

### MVP Scope

P1 stories only: Phases 1, 2, 3, 7, 8, 9 (17 tasks)

---

## Summary

| Phase | User Story | Priority | Tasks |
|-------|------------|----------|-------|
| 1 | Setup | - | T001-T003 |
| 2 | Update User | P1 | T004-T006 |
| 3 | Delete User | P1 | T007-T009 |
| 4 | Reset Password | P2 | T010-T012 |
| 5 | Manage Roles | P2 | T013-T018 |
| 6 | User Types | P3 | T019-T021 |
| 7 | Ticket Status | P1 | T022-T024 |
| 8 | Fix PUT Method | P1 | T025-T026 |
| 9 | Validation | - | T027-T029 |

**Total Tasks**: 29
**P1 Tasks**: 17 (MVP)
**P2 Tasks**: 9
**P3 Tasks**: 3

---

**Tasks Version**: 1.0.0 | **Generated**: 2025-12-06
