# Feature Specification: Tickets System

**Feature Branch**: `001-tickets`
**Created**: 2025-12-03
**Status**: Implemented
**Input**: Support ticketing system for the OneSim Portal

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Support Ticket (Priority: P1)

As a customer, I want to create a support ticket so that I can report issues and get help.

**Why this priority**: Core functionality - without ticket creation, the system has no purpose.

**Independent Test**: Can be fully tested by submitting a ticket form and verifying it appears in the list.

**Acceptance Scenarios**:

1. **Given** I am logged in as a customer, **When** I click "New Ticket" and fill the form, **Then** a new ticket is created with status OPEN
2. **Given** I am creating a ticket, **When** I submit without required fields, **Then** validation errors are shown
3. **Given** I created a ticket, **When** I view my tickets list, **Then** the new ticket appears

---

### User Story 2 - View and Track Tickets (Priority: P1)

As a customer, I want to view my tickets and track their status so that I know when to expect resolution.

**Why this priority**: Essential for customer experience - visibility into request status.

**Independent Test**: Can be tested by viewing ticket list and verifying status updates are reflected.

**Acceptance Scenarios**:

1. **Given** I have submitted tickets, **When** I open the tickets page, **Then** I see a list of my tickets with status
2. **Given** I am viewing tickets, **When** I click a ticket, **Then** I see full details including comments
3. **Given** an agent updates my ticket, **When** I refresh, **Then** I see the new status

---

### User Story 3 - Agent Ticket Management (Priority: P1)

As a support agent, I want to manage assigned tickets so that I can resolve customer issues.

**Why this priority**: Critical for support workflow - agents need to process tickets.

**Independent Test**: Can be tested by changing ticket status and adding comments.

**Acceptance Scenarios**:

1. **Given** I am an agent, **When** I view my queue, **Then** I see all assigned tickets
2. **Given** I am working on a ticket, **When** I change status to IN_PROGRESS, **Then** the status updates
3. **Given** I resolved an issue, **When** I add a comment and set RESOLVED, **Then** customer sees the update

---

### User Story 4 - Comments and Attachments (Priority: P2)

As a user, I want to add comments and attachments to tickets for additional context.

**Why this priority**: Enhances communication but not blocking for MVP.

**Independent Test**: Can be tested by adding a comment/attachment and verifying it appears.

**Acceptance Scenarios**:

1. **Given** I am viewing a ticket, **When** I add a comment, **Then** the comment appears in the thread
2. **Given** I am adding a comment, **When** I attach a file, **Then** the file is uploaded and linked
3. **Given** I am an agent, **When** I add an internal note, **Then** only agents can see it

---

### User Story 5 - Dashboard Statistics (Priority: P2)

As an admin, I want to see ticket statistics so that I can monitor support performance.

**Why this priority**: Important for management but not required for basic operation.

**Independent Test**: Can be tested by viewing dashboard and verifying counts match actual data.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I open the tickets overview, **Then** I see KPI cards with counts
2. **Given** there are tickets in various states, **When** I view statistics, **Then** counts are accurate

---

### User Story 6 - Kanban View (Priority: P3)

As an admin, I want a Kanban board view so that I can visualize ticket flow.

**Why this priority**: Nice-to-have visualization, table view sufficient for MVP.

**Independent Test**: Can be tested by dragging a ticket between columns.

**Acceptance Scenarios**:

1. **Given** I am viewing tickets, **When** I switch to Kanban view, **Then** tickets are grouped by status
2. **Given** I am in Kanban view, **When** I drag a ticket to another column, **Then** status updates

---

### Edge Cases

- What happens when uploading a file larger than the limit? → Show error message
- How does system handle concurrent edits? → Last write wins, show warning
- What if assigned agent is deactivated? → Ticket becomes unassigned

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow customers to create tickets with subject, description, category, priority
- **FR-002**: System MUST display ticket list with filtering by status, priority, date
- **FR-003**: System MUST allow status transitions: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- **FR-004**: System MUST support comments on tickets (internal and external)
- **FR-005**: System MUST support file attachments up to 10MB
- **FR-006**: System MUST show ticket statistics on overview page
- **FR-007**: Agents MUST be able to assign/reassign tickets
- **FR-008**: System MUST integrate with GenericTableComponent for list view
- **FR-009**: System MUST use FormGeneratorComponent for ticket forms
- **FR-010**: System MUST use GenericRightPanelComponent for details/edit panels

### Key Entities

- **Ticket**: Support request with subject, description, status, priority, category, timestamps
- **Comment**: Message on a ticket (internal or external visibility)
- **Attachment**: File uploaded to a ticket

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a ticket in under 1 minute
- **SC-002**: Ticket list loads in under 2 seconds with 100+ tickets
- **SC-003**: 95% of users successfully find their ticket status on first attempt
- **SC-004**: Agents can update ticket status in under 3 clicks

---

## Technical Implementation

### Data Models

```typescript
interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdById: string;
  createdByName: string;
  assignedToId?: string;
  assignedToName?: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  commentsCount: number;
  attachmentsCount: number;
  // Customer information (optional)
  iccid?: string;
  customerEmail?: string;
  customerName?: string;
}

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tickets` | List tickets with pagination and filters |
| GET | `/api/v1/tickets/{id}` | Get ticket details |
| POST | `/api/v1/tickets` | Create new ticket |
| PATCH | `/api/v1/tickets/{id}` | Update ticket (including status) |
| DELETE | `/api/v1/tickets/{id}` | Delete ticket |
| GET | `/api/v1/tickets/{id}/comments` | Get comments |
| POST | `/api/v1/tickets/{id}/comments` | Add comment |
| GET | `/api/v1/tickets/{id}/attachments` | Get attachments |
| POST | `/api/v1/tickets/{id}/attachments` | Upload attachment |
| GET | `/api/v1/attachments/{id}` | Get attachment download URL |
| GET | `/api/v1/tickets/stats` | Get ticket statistics |

**Query Parameters for GET /api/v1/tickets:**
- `page` - Page number (0-indexed)
- `size` - Page size
- `status` - Filter by status (comma-separated for multiple)
- `priority` - Filter by priority (comma-separated for multiple)
- `category` - Filter by category (comma-separated for multiple)
- `search` - Search in subject and ticket number
- `accountId` - Filter by account (required for admin users)

### File Structure

```
src/app/views/tickets/
├── models/
├── services/
├── components/
│   ├── overview/
│   ├── tickets/
│   └── kanban/
└── tickets.routes.ts
```

### UI/UX Guidelines

**Status Colors:**
- OPEN: `var(--os-color-info)`
- IN_PROGRESS: `var(--os-color-warning)`
- RESOLVED: `var(--os-color-success)`
- CLOSED: `var(--os-color-medium)`
- CANCELLED: `var(--os-color-danger)`

---

**Specification Version:** 1.1.0 | **Last Updated:** 2025-12-06
