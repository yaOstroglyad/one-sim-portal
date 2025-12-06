# Tasks: Tickets API Integration (Comments & Attachments)

**Input**: Design documents from `/specs/007-tickets-api-integration/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Not requested for this feature

**Organization**: Tasks are grouped by phase to enable incremental implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Models & Interfaces

**Purpose**: Define TypeScript interfaces for API request/response

- [x] T001 [P] [US1,US2] Add TicketComment interface in src/app/views/tickets/models/ticket.model.ts
- [x] T002 [P] [US3,US4] Add TicketAttachment interface in src/app/views/tickets/models/ticket.model.ts
- [x] T003 [P] [US2] Add CreateTicketCommentRequest interface in src/app/views/tickets/models/ticket.model.ts
- [x] T004 [P] [US5] Add DownloadUrlResponse interface in src/app/views/tickets/models/ticket.model.ts

**Checkpoint**: All interfaces ready for service implementation

---

## Phase 2: Service Methods

**Goal**: Add API methods to TicketService

**Independent Test**: Import service in component and call methods

### Implementation

- [x] T005 [US1] Add getComments(ticketId) method in src/app/views/tickets/services/ticket.service.ts
- [x] T006 [US2] Add addComment(ticketId, request) method in src/app/views/tickets/services/ticket.service.ts
- [x] T007 [US3] Add getAttachments(ticketId) method in src/app/views/tickets/services/ticket.service.ts
- [x] T008 [US4] Add uploadAttachment(ticketId, file) method with FormData in src/app/views/tickets/services/ticket.service.ts
- [x] T009 [US5] Add getAttachmentDownloadUrl(attachmentId) method in src/app/views/tickets/services/ticket.service.ts
- [x] T010 Update imports to include new model interfaces in src/app/views/tickets/services/ticket.service.ts

**Checkpoint**: All service methods functional

---

## Phase 3: Component Migration - Setup

**Goal**: Prepare component for API integration

### Implementation

- [x] T011 Inject TicketService into constructor in src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts
- [x] T012 Add import for TicketService in src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts
- [x] T013 Add import for TicketComment, TicketAttachment in src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts

**Checkpoint**: Component ready for API calls

---

## Phase 4: Component Migration - Comments (US1, US2)

**Goal**: Replace mock comments with real API calls

**Independent Test**: Open a ticket and verify comments load from API

### Implementation

- [x] T014 [US1] Add mapToComment() mapping function in ticket-details-wrapper.component.ts
- [x] T015 [US1] Replace loadCommentsData() mock with ticketService.getComments() call
- [x] T016 [US2] Replace onCommentAdded() mock with ticketService.addComment() call

**Checkpoint**: Comments load and submit via real API

---

## Phase 5: Component Migration - Attachments (US3, US4, US5)

**Goal**: Replace mock attachments with real API calls

**Independent Test**: Open a ticket and verify attachments load from API

### Implementation

- [x] T017 [US3] Add mapToAttachment() mapping function in ticket-details-wrapper.component.ts
- [x] T018 [US3] Replace loadAttachmentsData() mock with ticketService.getAttachments() call
- [x] T019 [US4] Replace onFileUploaded() mock with ticketService.uploadAttachment() call
- [x] T020 [US5] Replace onFileDownloaded() mock with ticketService.getAttachmentDownloadUrl() call

**Checkpoint**: Attachments load, upload, and download via real API

---

## Phase 6: Cleanup & Validation

**Purpose**: Remove all mock code and verify functionality

- [x] T021 Remove all setTimeout simulations from ticket-details-wrapper.component.ts
- [x] T022 Remove hardcoded mock data arrays from ticket-details-wrapper.component.ts
- [x] T023 Remove console.log mock messages (keep error logging) from ticket-details-wrapper.component.ts
- [x] T024 Verify no unused imports in all modified files
- [x] T025 Build project: `npm run build`
- [x] T026 Update spec.md status to "Implemented"

**Checkpoint**: Clean code, successful build

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Models) ─────────────────────┐
                                      ▼
Phase 2 (Service) ◄───────────────────┘
        │
        ▼
Phase 3 (Component Setup)
        │
        ├───────────────┬───────────────┐
        ▼               ▼               │
Phase 4 (Comments)  Phase 5 (Attach.)  │
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
                Phase 6 (Cleanup)
```

### Parallel Opportunities

```
Phase 1: T001-T004 can run in parallel (same file, independent interfaces)
Phase 2: T005-T009 must be sequential (same file, import dependencies)
Phase 4 & 5: Can run in parallel after Phase 3
```

---

## Summary

| Phase | Description | Tasks | User Stories |
|-------|-------------|-------|--------------|
| 1 | Models & Interfaces | T001-T004 | All |
| 2 | Service Methods | T005-T010 | All |
| 3 | Component Setup | T011-T013 | All |
| 4 | Comments Migration | T014-T016 | US1, US2 |
| 5 | Attachments Migration | T017-T020 | US3, US4, US5 |
| 6 | Cleanup & Validation | T021-T026 | All |

**Total Tasks**: 26

**Files to Modify**: 3
- `src/app/views/tickets/models/ticket.model.ts` (Phase 1)
- `src/app/views/tickets/services/ticket.service.ts` (Phase 2)
- `src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts` (Phases 3-6)

---

**Tasks Version**: 1.0.0 | **Generated**: 2025-12-06
