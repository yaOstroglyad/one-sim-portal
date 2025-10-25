import { Injectable, signal, computed } from '@angular/core';
import { Thread, Message } from '../models';

/**
 * Chatbot State Service
 *
 * Manages application state using Angular signals.
 * Provides reactive state for threads, messages, and UI state.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatbotStateService {
  // Current ICCID
  private readonly _iccid = signal<string | null>(null);

  // Threads list
  private readonly _threads = signal<Thread[]>([]);
  readonly threads = this._threads.asReadonly();

  // Selected thread ID
  private readonly _selectedThreadId = signal<string | null>(null);
  readonly selectedThreadId = this._selectedThreadId.asReadonly();

  // Messages by thread ID
  private readonly _messagesByThread = signal<Record<string, Message[]>>({});

  // Typing indicators by thread ID
  private readonly _typingByThread = signal<Record<string, { isTyping: boolean; author: string | null }>>({});

  // Loading states
  private readonly _isLoadingThreads = signal<boolean>(false);
  readonly isLoadingThreads = this._isLoadingThreads.asReadonly();

  private readonly _isLoadingMessages = signal<boolean>(false);
  readonly isLoadingMessages = this._isLoadingMessages.asReadonly();

  private readonly _isSendingMessage = signal<boolean>(false);
  readonly isSendingMessage = this._isSendingMessage.asReadonly();

  private readonly _isResetting = signal<boolean>(false);
  readonly isResetting = this._isResetting.asReadonly();

  // Error state
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  // Computed: Selected thread
  readonly selectedThread = computed(() => {
    const threadId = this._selectedThreadId();
    const threads = this._threads();
    return threads.find(t => t.id === threadId) || null;
  });

  // Computed: Messages for selected thread
  readonly selectedThreadMessages = computed(() => {
    const threadId = this._selectedThreadId();
    if (!threadId) return [];
    return this._messagesByThread()[threadId] || [];
  });

  // Computed: Typing indicator for selected thread
  readonly selectedThreadTyping = computed(() => {
    const threadId = this._selectedThreadId();
    if (!threadId) return { isTyping: false, author: null };
    return this._typingByThread()[threadId] || { isTyping: false, author: null };
  });

  // Computed: Has threads
  readonly hasThreads = computed(() => this._threads().length > 0);

  // Computed: Has searched (ICCID entered)
  readonly hasSearched = computed(() => this._iccid() !== null);

  /**
   * Set ICCID for search
   */
  setIccid(iccid: string): void {
    this._iccid.set(iccid);
  }

  /**
   * Set threads list
   */
  setThreads(threads: Thread[]): void {
    this._threads.set(threads);
  }

  /**
   * Set selected thread ID
   */
  setSelectedThreadId(threadId: string | null): void {
    this._selectedThreadId.set(threadId);
  }

  /**
   * Set messages for specific thread
   */
  setMessages(threadId: string, messages: Message[]): void {
    const current = this._messagesByThread();
    this._messagesByThread.set({
      ...current,
      [threadId]: messages
    });
  }

  /**
   * Set typing indicator for thread
   */
  setTypingIndicator(threadId: string, isTyping: boolean, author: string | null): void {
    const current = this._typingByThread();
    this._typingByThread.set({
      ...current,
      [threadId]: { isTyping, author }
    });
  }

  /**
   * Set loading state for threads
   */
  setLoadingThreads(loading: boolean): void {
    this._isLoadingThreads.set(loading);
  }

  /**
   * Set loading state for messages
   */
  setLoadingMessages(loading: boolean): void {
    this._isLoadingMessages.set(loading);
  }

  /**
   * Set sending message state
   */
  setSendingMessage(sending: boolean): void {
    this._isSendingMessage.set(sending);
  }

  /**
   * Set error message
   */
  setError(error: string | null): void {
    this._error.set(error);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Reset entire state with loading transition
   */
  reset(): void {
    this._isResetting.set(true);

    // Small delay for smooth transition
    setTimeout(() => {
      this._iccid.set(null);
      this._threads.set([]);
      this._selectedThreadId.set(null);
      this._messagesByThread.set({});
      this._typingByThread.set({});
      this._isLoadingThreads.set(false);
      this._isLoadingMessages.set(false);
      this._isSendingMessage.set(false);
      this._error.set(null);
      this._isResetting.set(false);
    }, 300);
  }
}
