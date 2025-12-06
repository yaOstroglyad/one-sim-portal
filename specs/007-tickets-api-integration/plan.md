# Implementation Plan: Tickets API Integration (Comments & Attachments)

**Input**: spec.md from `/specs/007-tickets-api-integration/`
**Approach**: Incremental migration from mock data to real API

---

## Current State Analysis

### Files to Modify

| File | Current State | Target State |
|------|---------------|--------------|
| `src/app/views/tickets/models/ticket.model.ts` | Has Ticket, CreateTicketRequest, UpdateTicketRequest | Add TicketComment, TicketAttachment, CreateTicketCommentRequest |
| `src/app/views/tickets/services/ticket.service.ts` | 5 methods (getTickets, getTicket, createTicket, updateTicket, updateTicketStatus) | Add 5 new methods for comments/attachments |
| `src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts` | Hardcoded mock data with setTimeout | Real API calls via TicketService |

### API Endpoints

```
Base URL: /api-tickets/api/v1

Comments:
  GET  /tickets/{ticketId}/comments     -> TicketComment[]
  POST /tickets/{ticketId}/comments     -> TicketComment

Attachments:
  GET  /tickets/{ticketId}/attachments  -> TicketAttachment[]
  POST /tickets/{ticketId}/attachments  -> TicketAttachment (multipart/form-data)
  GET  /attachments/{attachmentId}      -> { url: string } (pre-signed URL)
```

---

## Phase 1: Models & Interfaces

**Goal**: Define TypeScript interfaces for API request/response

### Changes to `ticket.model.ts`

```typescript
// Add after UpdateTicketRequest interface:

// Comment from API
export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Attachment from API
export interface TicketAttachment {
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
export interface CreateTicketCommentRequest {
  content: string;
  isInternal?: boolean;
}

// Download URL Response
export interface DownloadUrlResponse {
  url: string;
}
```

**Dependencies**: None

---

## Phase 2: Service Methods

**Goal**: Add API methods to TicketService

### Changes to `ticket.service.ts`

```typescript
// Add imports
import { TicketComment, TicketAttachment, CreateTicketCommentRequest, DownloadUrlResponse } from '../models';

// Add after updateTicketStatus method:

// Comments
getComments(ticketId: string): Observable<TicketComment[]> {
  return this.http.get<TicketComment[]>(`${this.baseUrl}/${ticketId}/comments`);
}

addComment(ticketId: string, request: CreateTicketCommentRequest): Observable<TicketComment> {
  return this.http.post<TicketComment>(`${this.baseUrl}/${ticketId}/comments`, request);
}

// Attachments
getAttachments(ticketId: string): Observable<TicketAttachment[]> {
  return this.http.get<TicketAttachment[]>(`${this.baseUrl}/${ticketId}/attachments`);
}

uploadAttachment(ticketId: string, file: File): Observable<TicketAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<TicketAttachment>(`${this.baseUrl}/${ticketId}/attachments`, formData);
}

getAttachmentDownloadUrl(attachmentId: string): Observable<DownloadUrlResponse> {
  return this.http.get<DownloadUrlResponse>(`/api-tickets/api/v1/attachments/${attachmentId}`);
}
```

**Dependencies**: Phase 1 (models)

---

## Phase 3: Component Migration

**Goal**: Replace mock data with real API calls

### Changes to `ticket-details-wrapper.component.ts`

#### 3.1 Add imports and inject service

```typescript
// Add to imports
import { TicketService } from '../../../services/ticket.service';
import { TicketComment, TicketAttachment } from '../../../models';

// Change constructor
constructor(
  private cdr: ChangeDetectorRef,
  private ticketService: TicketService
) {}
```

#### 3.2 Add mapping functions

```typescript
private mapToComment(apiComment: TicketComment): Comment {
  return {
    id: apiComment.id,
    entityId: apiComment.ticketId,
    entityType: 'ticket',
    content: apiComment.content,
    authorName: apiComment.authorName,
    authorAvatar: null,
    createdAt: new Date(apiComment.createdAt),
    updatedAt: new Date(apiComment.updatedAt)
  };
}

private mapToAttachment(apiAttachment: TicketAttachment): Attachment {
  return {
    id: apiAttachment.id,
    entityId: apiAttachment.ticketId,
    entityType: 'ticket',
    fileName: apiAttachment.filename,
    originalFileName: apiAttachment.filename,
    fileSize: apiAttachment.size,
    mimeType: apiAttachment.contentType,
    downloadUrl: '', // Will be fetched on demand
    uploadedByName: apiAttachment.uploadedByName,
    createdAt: new Date(apiAttachment.uploadedAt)
  };
}
```

#### 3.3 Replace loadCommentsData()

```typescript
private loadCommentsData(): void {
  this.commentsLoading = true;

  this.ticketService.getComments(this.ticket.id).subscribe({
    next: (comments) => {
      this.commentsData = comments.map(c => this.mapToComment(c));
      this.commentsLoading = false;
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error('Failed to load comments:', error);
      this.commentsData = [];
      this.commentsLoading = false;
      this.cdr.markForCheck();
    }
  });
}
```

#### 3.4 Replace loadAttachmentsData()

```typescript
private loadAttachmentsData(): void {
  this.attachmentsLoading = true;

  this.ticketService.getAttachments(this.ticket.id).subscribe({
    next: (attachments) => {
      this.attachmentsData = attachments.map(a => this.mapToAttachment(a));
      this.attachmentsLoading = false;
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error('Failed to load attachments:', error);
      this.attachmentsData = [];
      this.attachmentsLoading = false;
      this.cdr.markForCheck();
    }
  });
}
```

#### 3.5 Replace onCommentAdded()

```typescript
onCommentAdded(request: CreateCommentRequest): void {
  this.ticketService.addComment(this.ticket.id, {
    content: request.content,
    isInternal: false
  }).subscribe({
    next: () => {
      this.loadCommentsData(); // Refresh list
    },
    error: (error) => {
      console.error('Failed to add comment:', error);
    }
  });
}
```

#### 3.6 Replace onFileUploaded()

```typescript
onFileUploaded(request: UploadAttachmentRequest): void {
  this.ticketService.uploadAttachment(this.ticket.id, request.file).subscribe({
    next: () => {
      this.loadAttachmentsData(); // Refresh list
    },
    error: (error) => {
      console.error('Failed to upload attachment:', error);
    }
  });
}
```

#### 3.7 Replace onFileDownloaded()

```typescript
onFileDownloaded(attachment: Attachment): void {
  this.ticketService.getAttachmentDownloadUrl(attachment.id).subscribe({
    next: (response) => {
      window.open(response.url, '_blank');
    },
    error: (error) => {
      console.error('Failed to get download URL:', error);
    }
  });
}
```

**Dependencies**: Phase 2 (service methods)

---

## Phase 4: Cleanup & Validation

**Goal**: Remove all mock code and verify functionality

### Cleanup Checklist

- [ ] Remove all `setTimeout` simulations
- [ ] Remove hardcoded mock data arrays
- [ ] Remove `console.log` mock messages (keep error logging)
- [ ] Verify no unused imports

### Validation

- [ ] Build succeeds: `npm run build`
- [ ] Comments load from API
- [ ] Add comment works
- [ ] Attachments load from API
- [ ] Upload attachment works
- [ ] Download attachment works

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| API response format differs | Spec includes exact interface from Swagger |
| File upload format incorrect | Use FormData for multipart/form-data |
| Shared models incompatible | Mapping functions handle conversion |
| Pre-signed URL expires | URLs are fetched on-demand per download |

---

## Implementation Order

1. **Phase 1**: Models (~5 min)
2. **Phase 2**: Service methods (~10 min)
3. **Phase 3**: Component migration (~20 min)
4. **Phase 4**: Cleanup and build (~5 min)

**Total estimated effort**: ~40 minutes

---

**Plan Version**: 2.0.0 | **Updated**: 2025-12-06
