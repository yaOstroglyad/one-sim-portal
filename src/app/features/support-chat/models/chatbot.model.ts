/**
 * Chatbot API Models
 *
 * These models correspond to the backend API endpoints.
 * See API_DOCUMENTATION.md for full details.
 */

// ============================================
// Core Entities
// ============================================

/**
 * Thread - A conversation between customer and bot/operator
 */
export interface Thread {
  id: string;
  status: ThreadStatus;
  ticketId: string;
  expiredAt: string; // ISO 8601 timestamp
  isManual: boolean;
}

/**
 * Message - A single message in a thread
 */
export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  createdAt: string; // ISO 8601 timestamp
}

// ============================================
// Enums & Types
// ============================================

/**
 * Thread status values
 *
 * ✅ PARTIALLY CONFIRMED by backend:
 * - 'active', 'expired' are confirmed
 * - 'manual', 'closed' need confirmation
 */
export type ThreadStatus =
  | 'active'    // Active conversation (CONFIRMED)
  | 'expired'   // Expired due to inactivity (CONFIRMED)
  | 'manual'    // Operator has taken control (TBD - needs confirmation)
  | 'closed';   // Thread closed (TBD - needs confirmation)

/**
 * Message author types
 *
 * ✅ PARTIALLY CONFIRMED by backend:
 * - 'assistant' is confirmed (bot/AI responses)
 * - Other values need confirmation
 */
export type MessageAuthor =
  | 'assistant' // Bot/AI assistant response (CONFIRMED)
  | 'customer'  // Customer message (TBD - needs confirmation)
  | 'operator'  // Operator message when isManual=true (TBD - needs confirmation)
  | 'system'    // System notification (TBD - needs confirmation)
  | 'user';     // Alternative name for customer? (TBD - needs confirmation)

// ============================================
// Request/Response Types
// ============================================

/**
 * Request params for GET /threads
 */
export interface GetThreadsParams {
  iccid: string;
  status?: ThreadStatus;
}

/**
 * Request body for PUT /threads/{threadId}/update
 */
export interface UpdateThreadRequest {
  isManual: boolean;
}

/**
 * Request body for POST /threads/{threadId}/messages/create
 */
export interface CreateMessageRequest {
  text: string;
}

/**
 * Typing indicator response
 *
 * Endpoint: GET /api/v1/chatbot/threads/{threadId}/typing
 * Used to display "User is typing..." indicator in UI
 */
export interface TypingIndicatorResponse {
  isTyping: boolean;
  author: MessageAuthor | null;
}

/**
 * API Error Response
 */
export interface ErrorResponse {
  code: number;
  type: 'error';
  message: string;
}

// ============================================
// UI State Models
// ============================================

/**
 * Extended Thread model with UI-specific properties
 */
export interface ThreadWithMetadata extends Thread {
  unreadCount?: number;
  lastMessage?: Message;
  isTyping?: boolean; // TRUE when customer is typing
  typingAuthor?: MessageAuthor; // Who is typing (customer/operator)
}

/**
 * Chat state for component
 */
export interface ChatState {
  selectedThreadId: string | null;
  threads: ThreadWithMetadata[];
  messages: Record<string, Message[]>; // threadId -> messages
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Configuration
// ============================================

/**
 * Chat feature configuration
 */
export interface ChatConfig {
  pollingInterval?: number; // ms, if using polling
  messagePageSize?: number;
  autoScrollEnabled?: boolean;
}
