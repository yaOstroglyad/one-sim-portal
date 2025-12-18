/**
 * Unified HTTP error handling utilities
 * All HTTP error handling, response wrapping, and configuration in one place
 */

import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Generic error object
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  status: 'success' | 'error' | 'loading';
  message?: string;
  error?: any;
  timestamp: Date;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * HTTP retry configuration
 * Default retry strategy for failed requests
 */
export const HTTP_RETRY_CONFIG = {
  retries: 2,
  shareReplay: 1
} as const;

/**
 * HTTP status code to user-friendly message mapping
 */
const ERROR_MESSAGES: Record<number, string> = {
  401: 'You are not authorized to view this data.',
  403: 'You do not have permission to access this data.',
  404: 'The requested data was not found.',
  500: 'Unexpected error occurred. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.'
};

// ============================================================================
// ERROR TRANSFORMATION
// ============================================================================

/**
 * Create ApiError object with consistent timestamp
 *
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional error details
 * @returns ApiError object
 */
function createApiError(code: string, message: string, details?: any): ApiError {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
}

/**
 * Get user-friendly error message for HTTP status code
 *
 * @param status - HTTP status code
 * @returns User-friendly error message
 */
export function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status] || 'Unexpected error occurred.';
}

/**
 * Transform HttpErrorResponse to ApiError
 * Standard transformation for most HTTP errors
 *
 * @param error - HTTP error response
 * @returns Structured error object
 *
 * @example
 * ```typescript
 * catchError(err => {
 *   const apiError = transformHttpError(err);
 *   console.error('Error:', apiError);
 *   return throwError(() => apiError);
 * })
 * ```
 */
export function transformHttpError(error: HttpErrorResponse): ApiError {
  // Client-side error
  if (error.error instanceof ErrorEvent) {
    return createApiError('CLIENT_ERROR', 'An error occurred. Please try again.', error.error.message);
  }

  // Extract backend error and status
  const backendError = error?.error;
  const statusCode = error?.status ?? 0;
  const hasBackendCode = backendError && typeof backendError === 'object' && 'code' in backendError;

  // Determine code
  const code = hasBackendCode
    ? String(backendError.code)
    : (statusCode !== 0 ? String(statusCode) : 'UNKNOWN_ERROR');

  // Determine message (priority: backend message > status message > default)
  const message = (hasBackendCode && typeof backendError.message === 'string' && backendError.message)
    ? backendError.message
    : (statusCode !== 0 ? getErrorMessage(statusCode) : 'Unexpected error occurred.');

  return createApiError(code, message, error.error);
}

/**
 * Transform authentication/OAuth error with special handling
 * Attempts to parse JSON error messages with error_description field
 * Used specifically for login/authorization endpoints
 *
 * @param error - HTTP error response from auth endpoint
 * @returns Structured error object with parsed OAuth message
 *
 * @example
 * ```typescript
 * catchError(err => {
 *   const authError = transformAuthError(err);
 *   this.notify(authError.message);
 *   return EMPTY;
 * })
 * ```
 */
export function transformAuthError(error: HttpErrorResponse): ApiError {
  const status = error?.status ?? 0;
  const defaultMessage = `Authorization error (${status || '??'})`;

  // Attempt to extract OAuth-specific error message
  let message = defaultMessage;
  try {
    if (typeof error?.error?.message === 'string') {
      const parsed = JSON.parse(error.error.message);
      message = parsed.error_description || parsed.error || defaultMessage;
    }
  } catch {
    // If parsing fails, fallback to error message or default
    message = (error.error?.message && typeof error.error.message === 'string')
      ? error.error.message
      : error.message || defaultMessage;
  }

  const code = status !== 0 ? String(status) : 'AUTH_ERROR';
  return createApiError(code, message, error.error);
}

// ============================================================================
// RESPONSE WRAPPING
// ============================================================================

/**
 * Wrap data in standard ApiResponse format
 *
 * @param data - Data to wrap
 * @returns Standardized response object
 *
 * @example
 * ```typescript
 * map(data => wrapResponse(data))
 * ```
 */
export function wrapResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    status: 'success',
    timestamp: new Date()
  };
}

/**
 * Create error response in ApiResponse format
 *
 * @param error - HTTP error response or already transformed ApiError
 * @returns Observable of ApiResponse with error status
 *
 * @example
 * ```typescript
 * catchError(error => createErrorResponse(error))
 * ```
 */
export function createErrorResponse<T = any>(error: any): Observable<ApiResponse<T>> {
  // If error is already an ApiError (has code, message, timestamp), use it directly
  if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'timestamp' in error) {
    return of({
      data: null,
      status: 'error' as const,
      message: error.message,
      error: error,
      timestamp: new Date()
    });
  }

  // Otherwise transform HttpErrorResponse
  const transformedError = transformHttpError(error);

  return of({
    data: null,
    status: 'error' as const,
    message: transformedError.message,
    error: transformedError,
    timestamp: new Date()
  });
}

// ============================================================================
// STANDARD ERROR HANDLERS (for data services)
// ============================================================================

/**
 * Generic error handler factory
 * Creates a pipeable operator that catches errors, logs them, and returns default value
 *
 * @param errorContext - Context description for logging
 * @param defaultValue - Default value to return on error
 * @returns Pipeable operator that can be used directly in .pipe()
 */
function createErrorHandler<T, R>(errorContext: string, defaultValue: R): OperatorFunction<T, T | R> {
  return (source: Observable<T>) => source.pipe(
    catchError((error: any) => {
      logError(errorContext, error);
      return of(defaultValue);
    })
  );
}

/**
 * Standard error handler that returns empty array on error
 * Used for list/array-based API calls
 * Returns a pipeable operator - use directly in .pipe() without catchError
 *
 * @param errorContext - Context description for logging (e.g., 'fetching customers')
 * @returns Pipeable operator that catches errors and returns empty array
 *
 * @example
 * ```typescript
 * return this.http.get<Customer[]>('/api/customers').pipe(
 *   handleArrayError('fetching customers')
 * );
 * ```
 */
export function handleArrayError<T = any>(errorContext: string): OperatorFunction<T[], T[]> {
  return createErrorHandler<T[], T[]>(errorContext, []);
}

/**
 * Standard error handler that returns null on error
 * Used for single-object API calls
 * Returns a pipeable operator - use directly in .pipe() without catchError
 *
 * @param errorContext - Context description for logging (e.g., 'fetching customer details')
 * @returns Pipeable operator that catches errors and returns null
 *
 * @example
 * ```typescript
 * return this.http.get<Customer>(`/api/customers/${id}`).pipe(
 *   handleObjectError('fetching customer details')
 * );
 * ```
 */
export function handleObjectError<T>(errorContext: string): OperatorFunction<T, T | null> {
  return createErrorHandler<T, null>(errorContext, null);
}

/**
 * Standard error handler that returns empty object on error
 * Used for object-based API calls that expect an object response
 * Returns a pipeable operator - use directly in .pipe() without catchError
 *
 * @param errorContext - Context description for logging (e.g., 'fetching configuration')
 * @returns Pipeable operator that catches errors and returns empty object
 *
 * @example
 * ```typescript
 * return this.http.get<Config>('/api/config').pipe(
 *   handleEmptyObjectError('fetching configuration')
 * );
 * ```
 */
export function handleEmptyObjectError<T extends object>(errorContext: string): OperatorFunction<T, T | {}> {
  return createErrorHandler<T, {}>(errorContext, {});
}

/**
 * Standard error handler that returns a default value on error
 * Returns a pipeable operator - use directly in .pipe() without catchError
 *
 * @param errorContext - Context description for logging
 * @param defaultValue - Default value to return on error
 * @returns Pipeable operator that catches errors and returns default value
 *
 * @example
 * ```typescript
 * return this.http.get<number>('/api/count').pipe(
 *   handleWithDefault('fetching count', 0)
 * );
 * ```
 */
export function handleWithDefault<T, R>(errorContext: string, defaultValue: R): OperatorFunction<T, T | R> {
  return createErrorHandler<T, R>(errorContext, defaultValue);
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Log error with context
 * Transforms HTTP errors to ApiError format for consistent logging
 *
 * @param context - Context description
 * @param error - Error object
 */
function logError(context: string, error: any): void {
  if (error instanceof HttpErrorResponse) {
    const apiError: ApiError = transformHttpError(error);
    console.error(`Error ${context}:`, {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      timestamp: apiError.timestamp
    });
  } else {
    console.error(`Error ${context}:`, error);
  }
}
