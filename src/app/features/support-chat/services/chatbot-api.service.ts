import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Thread,
  Message,
  GetThreadsParams,
  UpdateThreadRequest,
  CreateMessageRequest,
  TypingIndicatorResponse
} from '../models';

/**
 * Chatbot API Service
 *
 * Handles all HTTP requests to chatbot backend endpoints.
 * See API_DOCUMENTATION.md for complete API reference.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatbotApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/chatbot';

  /**
   * Get threads by ICCID
   * Endpoint: GET /api/v1/chatbot/threads
   *
   * @param params - Query parameters (iccid, status)
   * @returns Observable<Thread[]>
   */
  getThreads(params: GetThreadsParams): Observable<Thread[]> {
    let httpParams = new HttpParams().set('iccid', params.iccid);

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<Thread[]>(`${this.baseUrl}/threads`, { params: httpParams });
  }

  /**
   * Get messages by thread ID
   * Endpoint: GET /api/v1/chatbot/threads/{threadId}/messages
   *
   * @param threadId - Thread ID
   * @returns Observable<Message[]>
   */
  getMessages(threadId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/threads/${threadId}/messages`);
  }

  /**
   * Update thread (take manual control)
   * Endpoint: PUT /api/v1/chatbot/threads/{threadId}/update
   *
   * @param threadId - Thread ID
   * @param request - Update request (isManual flag)
   * @returns Observable<Thread>
   */
  updateThread(threadId: string, request: UpdateThreadRequest): Observable<Thread> {
    return this.http.put<Thread>(`${this.baseUrl}/threads/${threadId}/update`, request);
  }

  /**
   * Create message in thread
   * Endpoint: POST /api/v1/chatbot/threads/{threadId}/messages/create
   *
   * @param threadId - Thread ID
   * @param request - Create message request
   * @returns Observable<Message>
   */
  createMessage(threadId: string, request: CreateMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/threads/${threadId}/messages/create`, request);
  }

  /**
   * Get typing indicator for thread
   * NOTE: This is a stub implementation since the API endpoint doesn't exist yet
   * Returns a mock response indicating no one is typing
   *
   * @returns Observable<TypingIndicatorResponse>
   */
  getTypingIndicator(): Observable<TypingIndicatorResponse> {
    // Stub implementation - API endpoint doesn't exist yet
    return of({
      isTyping: false,
      author: null
    });
  }
}
