import { ErrorHandler, inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '@shared';

/**
 * GlobalErrorHandlerService
 *
 * Layer 4 of the 4-layer error handling architecture.
 * Last line of defense for unhandled errors.
 *
 * Responsibilities:
 * - Catch all unhandled JavaScript exceptions
 * - Detect and handle chunk loading errors (lazy modules)
 * - Log errors with structured context
 *
 * Note: HTTP errors are already handled by HttpErrorInterceptor (Layer 1),
 * so this handler only logs them without showing notifications.
 *
 * @see docs/architecture/error-handling.md
 */
@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly notification = inject(NotificationService);

  handleError(error: unknown): void {
    // Always log errors
    this.logError(error);

    // HTTP errors — already handled by HttpErrorInterceptor, just log
    if (error instanceof HttpErrorResponse) {
      return;
    }

    // Chunk load error — user needs to reload the page
    if (this.isChunkLoadError(error)) {
      this.notification.error('errors.appUpdateRequired');
      return;
    }

    // JS errors — show generic notification
    this.notification.error('errors.somethingWentWrong');
  }

  /**
   * Log error with structured context for debugging
   */
  private logError(error: unknown): void {
    const errorContext = {
      timestamp: new Date().toISOString(),
      type: this.getErrorType(error),
      message: this.getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    console.error('[GlobalErrorHandler] Unhandled error:', errorContext);

    // Log original error for full details
    console.error('[GlobalErrorHandler] Original error:', error);
  }

  /**
   * Check if error is a chunk loading error
   * This happens when lazy-loaded modules fail to load (often after app update)
   */
  private isChunkLoadError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message?.toLowerCase() || '';
      return (
        message.includes('loading chunk') ||
        message.includes('chunkloaderror') ||
        message.includes('failed to fetch dynamically imported module')
      );
    }
    return false;
  }

  /**
   * Get error type for logging
   */
  private getErrorType(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return `HttpErrorResponse:${error.status}`;
    }
    if (error instanceof Error) {
      return error.name || 'Error';
    }
    return typeof error;
  }

  /**
   * Get error message for logging
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.message || `HTTP ${error.status}`;
    }
    if (error instanceof Error) {
      return error.message || 'Unknown error';
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  }
}
