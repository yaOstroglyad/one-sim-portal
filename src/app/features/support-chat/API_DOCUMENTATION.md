# Chatbot API Documentation

> **Status:** In Development
> **Last Updated:** 2025-10-24
> **Backend API Version:** v1

## Overview

This document describes the Chatbot API for the support chat feature. The system allows operators to monitor bot conversations with customers and take manual control when needed (escalation).

---

## Core Concepts

### Thread
A conversation thread between a customer and the bot/operator.

```typescript
interface Thread {
  id: string;           // Unique thread identifier
  status: string;       // Thread status (TBD: active/manual/closed/expired)
  ticketId: string;     // Associated ticket ID (integration with ticket system)
  expiredAt: string;    // ISO 8601 timestamp when thread expires due to inactivity
  isManual: boolean;    // TRUE = operator control, FALSE = bot control
}
```

### Message
A single message in a thread.

```typescript
interface Message {
  id: string;           // Unique message identifier
  author: string;       // TBD: bot/customer/operator/system
  text: string;         // Message content
  createdAt: string;    // ISO 8601 timestamp
}
```

---

## API Endpoints

### 1. Get Threads by ICCID

**Endpoint:** `GET /api/v1/chatbot/threads`

**Description:** Retrieve list of conversation threads for a specific customer by ICCID.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `iccid` | string | Yes | Integrated Circuit Card Identification Number |
| `status` | string | No | Filter by thread status. Available values: `active`, `expired` |

**Request Example:**
```http
GET /api/v1/chatbot/threads?iccid=89012345678901234567&status=active
```

**Response 200 - Success:**
```json
[
  {
    "id": "thread-123",
    "status": "active",
    "ticketId": "ticket-456",
    "expiredAt": "2025-10-24T10:00:00Z",
    "isManual": false
  },
  {
    "id": "thread-789",
    "status": "manual",
    "ticketId": "ticket-101",
    "expiredAt": "2025-10-25T15:30:00Z",
    "isManual": true
  }
]
```

**Response 400 - Bad Request:**
```json
{
  "code": 400,
  "type": "error",
  "message": "Invalid ICCID format"
}
```

**Response 401 - Unauthorized:**
```json
{
  "code": 401,
  "type": "error",
  "message": "Authentication required"
}
```

---

### 2. Get Messages by Thread

**Endpoint:** `GET /api/v1/chatbot/threads/{threadId}/messages`

**Description:** Retrieve message history for a specific thread.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `threadId` | string | Yes | Thread ID |

**Request Example:**
```http
GET /api/v1/chatbot/threads/thread-123/messages
```

**Response 200 - Success:**
```json
[
  {
    "id": "msg-001",
    "author": "customer",
    "text": "Hello, I need help with my eSIM",
    "createdAt": "2025-10-24T09:00:00Z"
  },
  {
    "id": "msg-002",
    "author": "assistant",
    "text": "Sure, I can help you with that. What's the issue?",
    "createdAt": "2025-10-24T09:00:15Z"
  },
  {
    "id": "msg-003",
    "author": "customer",
    "text": "It's not activating",
    "createdAt": "2025-10-24T09:01:00Z"
  }
]
```

**Response 401 - Unauthorized:**
```json
{
  "code": 401,
  "type": "error",
  "message": "Authentication required"
}
```

---

### 3. Update Thread (Take Control)

**Endpoint:** `PUT /api/v1/chatbot/threads/{threadId}/update`

**Description:** Update thread properties, primarily used to take manual control from the bot.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `threadId` | string | Yes | Thread ID |

**Request Body:**
```json
{
  "isManual": true
}
```

**Request Example:**
```http
PUT /api/v1/chatbot/threads/thread-123/update
Content-Type: application/json

{
  "isManual": true
}
```

**Response 200 - Success:**
```json
{
  "id": "thread-123",
  "status": "manual",
  "ticketId": "ticket-456",
  "expiredAt": "2025-10-24T10:00:00Z",
  "isManual": true
}
```

**Response 400 - Bad Request:**
```json
{
  "code": 400,
  "type": "error",
  "message": "Invalid request body"
}
```

**Response 401 - Unauthorized:**
```json
{
  "code": 401,
  "type": "error",
  "message": "Authentication required"
}
```

---

### 4. Create Message in Thread

**Endpoint:** `POST /api/v1/chatbot/threads/{threadId}/messages/create`

**Description:** Send a message to the thread (as operator when isManual=true).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `threadId` | string | Yes | Thread ID |

**Request Body:**
```json
{
  "text": "Hello! I'm an operator. How can I help you?"
}
```

**Request Example:**
```http
POST /api/v1/chatbot/threads/thread-123/messages/create
Content-Type: application/json

{
  "text": "Hello! I'm an operator. How can I help you?"
}
```

**Response 200 - Success:**
```json
{
  "id": "msg-004",
  "author": "operator",
  "text": "Hello! I'm an operator. How can I help you?",
  "createdAt": "2025-10-24T09:05:00Z"
}
```

**Response 400 - Bad Request:**
```json
{
  "code": 400,
  "type": "error",
  "message": "Text is required"
}
```

**Response 401 - Unauthorized:**
```json
{
  "code": 401,
  "type": "error",
  "message": "Authentication required"
}
```

---

## TypeScript Models

```typescript
// Thread model
export interface Thread {
  id: string;
  status: ThreadStatus;
  ticketId: string;
  expiredAt: string;
  isManual: boolean;
}

// Message model
export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  createdAt: string;
}

// Thread statuses (confirmed by backend)
export type ThreadStatus =
  | 'active'    // Active conversation
  | 'expired'   // Expired due to inactivity
  | 'manual'    // Operator has taken control (TBD - needs confirmation)
  | 'closed';   // Thread closed (TBD - needs confirmation)

// Message authors (partially confirmed by backend)
export type MessageAuthor =
  | 'assistant' // Bot/AI assistant response (CONFIRMED)
  | 'customer'  // Customer message (TBD - needs confirmation)
  | 'operator'  // Operator message when isManual=true (TBD - needs confirmation)
  | 'system'    // System notification (TBD - needs confirmation)
  | 'user';     // Alternative name for customer? (TBD - needs confirmation)

// Request/Response types
export interface GetThreadsRequest {
  iccid: string;
  status?: ThreadStatus;
}

export interface UpdateThreadRequest {
  isManual: boolean;
}

export interface CreateMessageRequest {
  text: string;
}

export interface TypingIndicatorResponse {
  isTyping: boolean;
  author: MessageAuthor | null;
}

export interface ErrorResponse {
  code: number;
  type: 'error';
  message: string;
}
```

---

## User Flow: Operator Takes Control

### Typical Escalation Scenario

```
1. Customer starts conversation with bot
   └─> Thread created automatically (isManual: false)

2. Bot tries to help customer
   └─> Messages exchanged (author: bot/customer)

3. Customer issue is complex → operator intervention needed

4. Operator searches for customer
   └─> GET /threads?iccid=89012345678...

5. Operator opens thread and reviews history
   └─> GET /threads/{threadId}/messages

6. Operator clicks "Take Control"
   └─> PUT /threads/{threadId}/update { isManual: true }

7. Bot stops responding, operator can send messages
   └─> POST /threads/{threadId}/messages/create { text: "..." }

8. Operator helps customer and resolves issue

9. Thread expires or gets closed
   └─> status changes to 'closed' or 'expired'
```

---

### 5. Get Typing Indicator

**Endpoint:** `GET /api/v1/chatbot/threads/{threadId}/typing`

**Description:** Check if someone is currently typing in the thread. Used to display "User is typing..." indicator in UI.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `threadId` | string | Yes | Thread ID |

**Request Example:**
```http
GET /api/v1/chatbot/threads/thread-123/typing
```

**Response 200 - Success:**
```json
{
  "isTyping": true,
  "author": "customer"
}
```

**Response when nobody is typing:**
```json
{
  "isTyping": false,
  "author": null
}
```

**Response 401 - Unauthorized:**
```json
{
  "code": 401,
  "type": "error",
  "message": "Authentication required"
}
```

**Implementation Notes:**
- Poll this endpoint together with messages (every 3 seconds)
- Display typing indicator in UI when `isTyping: true`
- Show author name if needed: "Customer is typing..." or "Operator is typing..."

---

## Outstanding Questions for Backend Team

1. **Message `author` values:** ⚠️ PARTIALLY CONFIRMED
   - ✅ Confirmed: `assistant` (bot/AI responses)
   - ❓ Need confirmation for: `customer`, `operator`, `user`, `system`
   - Is `user` the same as `customer` or different entity?

2. **Thread `status` values:** ⚠️ PARTIALLY CONFIRMED
   - ✅ Confirmed: `active`, `expired`
   - ❓ Need confirmation for: `manual`, `closed`
   - Does status automatically change to `manual` when `isManual=true`?

3. **Return thread to bot:**
   - How to return control to the bot after manual intervention?
   - Is it `PUT /update { isManual: false }`?

4. **Thread expiration:**
   - What happens when `expiredAt` is reached?
   - Can it be extended?

---

## Technical Implementation

### Real-time Updates Strategy

**Polling every 3 seconds**
```typescript
// Poll messages every 3 seconds for active thread
setInterval(() => {
  this.http.get(`/threads/${threadId}/messages`)
    .subscribe(messages => {
      // Compare with cached messages and show only new ones
    });
}, 3000);
```

### State Management

- Use Angular signals for reactive state
- Cache messages locally and compare with API responses
- Implement optimistic UI updates for sent messages

### Error Handling

- Show user-friendly error messages
- Handle 401 (redirect to login)
- Handle 400 (validation errors)

---

## Components Structure

```
support-chat/
├── components/
│   ├── thread-list/         # List of threads
│   ├── message-list/        # Message history with typing indicator
│   ├── message-input/       # Send message input
│   └── thread-header/       # Thread info + "Take Control" action
├── services/
│   ├── chatbot-api.service.ts     # HTTP API calls (all 5 endpoints)
│   ├── chatbot-polling.service.ts # Polling: messages + typing (3s interval)
│   └── chatbot-state.service.ts   # State management with signals
├── models/
│   └── chatbot.model.ts     # TypeScript interfaces
└── support-chat.shell.component.ts  # Main container
```

---

## Implementation Steps

1. **Services:**
   - `ChatbotApiService` - All 5 HTTP endpoints (threads, messages, update, create, typing)
   - `ChatbotPollingService` - Poll messages + typing indicator every 3 seconds
   - `ChatbotStateService` - Signals-based state management

2. **Components:**
   - `ThreadListComponent` - ICCID search + thread list
   - `MessageListComponent` - Message history + typing indicator display
   - `MessageInputComponent` - Send message input
   - `ThreadHeaderComponent` - Thread info + "Take Control" button

3. **Features:**
   - Typing indicator: Display "Customer is typing..." when `isTyping: true`
   - Auto-scroll to latest message
   - Real-time updates via polling (3s)
   - Optimistic UI for sent messages

4. **Translations:**
   - Add i18n keys for all UI elements (en, ru, ua, he)

---

## References

- **API Base URL:** `/api/v1/chatbot`
- **Authentication:** JWT Bearer token (via HTTP interceptor)
- **Date Format:** ISO 8601 (`2025-10-24T09:00:00Z`)
- **Polling Interval:** 3 seconds
