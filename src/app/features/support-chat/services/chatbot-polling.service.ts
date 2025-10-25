import { Injectable, inject } from '@angular/core';
import { interval, Subscription, combineLatest } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChatbotApiService } from './chatbot-api.service';
import { ChatbotStateService } from './chatbot-state.service';

/**
 * Chatbot Polling Service
 *
 * Handles automatic polling of messages and typing indicators every 3 seconds.
 * Manages polling lifecycle (start/stop).
 */
@Injectable({
  providedIn: 'root'
})
export class ChatbotPollingService {
  private readonly apiService = inject(ChatbotApiService);
  private readonly stateService = inject(ChatbotStateService);

  private pollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 10000; // 10 seconds

  /**
   * Start polling for specific thread
   * Polls both messages and typing indicator
   */
  startPolling(threadId: string): void {
    // Stop existing polling if any
    this.stopPolling();

    // Create polling stream
    this.pollingSubscription = interval(this.POLLING_INTERVAL).pipe(
      switchMap(() =>
        combineLatest([
          this.apiService.getMessages(threadId),
          this.apiService.getTypingIndicator()
        ]).pipe(
          tap(([messages, typingIndicator]) => {
            // Update messages
            this.stateService.setMessages(threadId, messages);

            // Update typing indicator
            this.stateService.setTypingIndicator(
              threadId,
              typingIndicator.isTyping,
              typingIndicator.author
            );
          }),
          catchError(error => {
            console.error('[ChatbotPollingService] Polling error:', error);
            // Don't stop polling on error, just log it
            return of(null);
          })
        )
      )
    ).subscribe();

    // Initial load (don't wait for first interval)
    this.loadInitialData(threadId);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Load initial data immediately (before first polling tick)
   */
  private loadInitialData(threadId: string): void {
    this.stateService.setLoadingMessages(true);

    combineLatest([
      this.apiService.getMessages(threadId),
      this.apiService.getTypingIndicator()
    ]).pipe(
      tap(([messages, typingIndicator]) => {
        this.stateService.setMessages(threadId, messages);
        this.stateService.setTypingIndicator(
          threadId,
          typingIndicator.isTyping,
          typingIndicator.author
        );
        this.stateService.setLoadingMessages(false);
      }),
      catchError(error => {
        console.error('[ChatbotPollingService] Initial load error:', error);
        this.stateService.setError('Failed to load messages');
        this.stateService.setLoadingMessages(false);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Check if polling is active
   */
  isPolling(): boolean {
    return this.pollingSubscription !== null;
  }
}
