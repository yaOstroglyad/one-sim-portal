# Feature Specification: Tickets API Integration (Comments & Attachments)

**Feature Branch**: `007-tickets-api-integration`
**Created**: 2025-12-06
**Status**: Implemented
**Input**: Migrate hardcoded mock data to real API calls for Tickets Comments and Attachments

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Ticket Comments (Priority: P1)

As a user, I want to see real comments on a ticket so that I can follow the ticket conversation.

**Why this priority**: Core functionality - users need to see actual comments, not mock data.

**Independent Test**: Open a ticket with comments and verify real data loads from API.

**Acceptance Scenarios**:

1. **Given** I open a ticket, **When** the page loads, **Then** I see comments fetched from `/api/v1/tickets/{ticketId}/comments`
2. **Given** API returns comments, **When** I view the list, **Then** each comment shows author, content, and timestamp
3. **Given** API returns error, **When** I view comments, **Then** I see an error message
4. **Given** ticket has no comments, **When** I view the section, **Then** I see empty state

---

### User Story 2 - Add Comment to Ticket (Priority: P1)

As a user, I want to add comments to a ticket so that I can communicate with support.

**Why this priority**: Core functionality - users must be able to respond on tickets.

**Independent Test**: Add a comment and verify it appears in the list after API call succeeds.

**Acceptance Scenarios**:

1. **Given** I type a comment, **When** I submit, **Then** POST request is sent to `/api/v1/tickets/{ticketId}/comments`
2. **Given** API succeeds, **When** comment is added, **Then** comments list is refreshed
3. **Given** API fails, **When** I submit comment, **Then** I see error notification
4. **Given** I submit, **When** waiting for response, **Then** I see loading state

---

### User Story 3 - View Ticket Attachments (Priority: P1)

As a user, I want to see real attachments on a ticket so that I can access uploaded files.

**Why this priority**: Core functionality - users need to see and download actual files.

**Independent Test**: Open a ticket with attachments and verify real data loads from API.

**Acceptance Scenarios**:

1. **Given** I open a ticket, **When** the page loads, **Then** I see attachments fetched from `/api/v1/tickets/{ticketId}/attachments`
2. **Given** API returns attachments, **When** I view the list, **Then** each shows filename, size, and uploader
3. **Given** API returns error, **When** I view attachments, **Then** I see an error message
4. **Given** ticket has no attachments, **When** I view the section, **Then** I see empty state

---

### User Story 4 - Upload Attachment to Ticket (Priority: P1)

As a user, I want to upload files to a ticket so that I can provide supporting documents.

**Why this priority**: Core functionality - users must be able to attach files to tickets.

**Independent Test**: Upload a file and verify it appears in the list after API call succeeds.

**Acceptance Scenarios**:

1. **Given** I select a file, **When** I upload, **Then** POST request is sent to `/api/v1/tickets/{ticketId}/attachments`
2. **Given** API succeeds, **When** upload completes, **Then** attachments list is refreshed
3. **Given** API fails, **When** I upload, **Then** I see error notification
4. **Given** file is uploading, **When** I view UI, **Then** I see upload progress

---

### User Story 5 - Download Attachment (Priority: P2)

As a user, I want to download attachments from a ticket so that I can view the files locally.

**Why this priority**: Important but secondary to viewing/uploading.

**Independent Test**: Click download on an attachment and verify file downloads.

**Acceptance Scenarios**:

1. **Given** I click download, **When** the request succeeds, **Then** I get pre-signed URL from `/api/v1/attachments/{attachmentId}`
2. **Given** I have pre-signed URL, **When** I open it, **Then** file downloads to my device
3. **Given** download fails, **When** I click download, **Then** I see error notification

---

### Edge Cases

- What if API returns 401? -> Redirect to login (handled by interceptor)
- What if attachment is too large? -> Show error before upload (client-side validation)
- What if network is slow? -> Show loading indicators
- What if comments/attachments API is unavailable? -> Show error state with retry option

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Comments MUST be fetched from GET `/api-tickets/api/v1/tickets/{ticketId}/comments`
- **FR-002**: New comments MUST be sent via POST `/api-tickets/api/v1/tickets/{ticketId}/comments`
- **FR-003**: Attachments MUST be fetched from GET `/api-tickets/api/v1/tickets/{ticketId}/attachments`
- **FR-004**: File uploads MUST be sent via POST `/api-tickets/api/v1/tickets/{ticketId}/attachments`
- **FR-005**: Loading states MUST be shown during API calls
- **FR-006**: Error states MUST be shown when API calls fail
- **FR-007**: Lists MUST refresh after successful create operations
- **FR-008**: All existing mock data and setTimeout simulations MUST be removed

### Non-Functional Requirements

- **NFR-001**: Comments/Attachments should load within 2 seconds
- **NFR-002**: Upload progress should be visible to user
- **NFR-003**: Error messages should be user-friendly

### Key Entities

- **Comment**: id, ticketId, content, authorId, authorName, authorAvatar, createdAt, updatedAt, isInternal
- **Attachment**: id, ticketId, filename, size, contentType, uploadedById, uploadedByName, uploadedAt, s3Key

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All mock data removed from ticket-details-wrapper.component.ts
- **SC-002**: Comments load from real API
- **SC-003**: New comments are persisted via API
- **SC-004**: Attachments load from real API
- **SC-005**: File uploads are sent to real API
- **SC-006**: No console.log mock simulations remain
- **SC-007**: Error handling works correctly

---

## Technical Implementation

### API Endpoints to Integrate

```typescript
// Comments
GET  /api-tickets/api/v1/tickets/{ticketId}/comments     -> Comment[]
POST /api-tickets/api/v1/tickets/{ticketId}/comments     -> Comment

// Attachments
GET  /api-tickets/api/v1/tickets/{ticketId}/attachments  -> Attachment[]
POST /api-tickets/api/v1/tickets/{ticketId}/attachments  -> Attachment (multipart/form-data)
GET  /api-tickets/api/v1/attachments/{attachmentId}      -> { url: string } (pre-signed download URL)
```

### Clarifications (Resolved)

| Question | Resolution |
|----------|------------|
| Download URL | Use `GET /api/v1/attachments/{attachmentId}` to get pre-signed URL |
| isInternal flag | Show all comments, set `false` when creating new comments |
| File upload format | Use `multipart/form-data` with FormData |
| Error handling | Use existing error handling pattern (catchError + console.error) |

### Models (from API)

```typescript
// Comment from API
interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;  // URL to author's avatar image
  createdAt: string;
  updatedAt: string;
}

// Attachment from API
interface TicketAttachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  ticketId: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  s3Key: string;
}

// Create Comment Request
interface CreateTicketCommentRequest {
  content: string;
  isInternal?: boolean;
}

// Upload Attachment Request (multipart/form-data)
interface UploadTicketAttachmentRequest {
  file: File;
}
```

### File Changes

| File | Changes |
|------|---------|
| `src/app/views/tickets/services/ticket.service.ts` | Add getComments, addComment, getAttachments, uploadAttachment methods |
| `src/app/views/tickets/models/index.ts` | Add TicketComment, TicketAttachment, request interfaces |
| `src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts` | Remove mock data, inject service, call real API |

### Mapping from API to Shared Models

The shared `Comment` and `Attachment` interfaces may differ from API response. Mapping may be needed:

```typescript
// API response -> Shared Comment model
mapToComment(apiComment: TicketComment): Comment {
  return {
    id: apiComment.id,
    entityId: apiComment.ticketId,
    entityType: 'ticket',
    content: apiComment.content,
    authorName: apiComment.authorName,
    authorAvatar: apiComment.authorAvatar || null,  // Use avatar from API if available
    createdAt: new Date(apiComment.createdAt),
    updatedAt: new Date(apiComment.updatedAt)
  };
}
```

---

**Specification Version:** 1.1.0 | **Last Updated:** 2025-12-06
