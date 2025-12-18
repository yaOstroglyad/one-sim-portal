/**
 * Error Handling Models
 *
 * Defines standardized error types and notification interfaces
 * for the 4-layer error handling architecture.
 */

/**
 * Standardized API error object
 * Used across all layers for consistent error representation
 */
export interface ApiError {
  /** HTTP status code or custom error code */
  code: string;
  /** User-friendly error message */
  message: string;
  /** Additional error details from backend */
  details?: unknown;
  /** Timestamp when error occurred */
  timestamp: Date;
}

/**
 * Notification type enum for visual styling
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification configuration
 */
export interface NotificationConfig {
  /** i18n key for the message */
  messageKey: string;
  /** Interpolation parameters for the message */
  params?: Record<string, unknown>;
  /** Notification type for styling */
  type: NotificationType;
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Action button label (optional) */
  action?: string;
}

/**
 * Retry configuration for HTTP requests
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  count: number;
  /** Base delay in milliseconds for exponential backoff */
  baseDelay: number;
  /** HTTP methods to retry (default: GET only) */
  methods?: string[];
  /** HTTP status codes to retry on */
  statusCodes?: number[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  count: 3,
  baseDelay: 1000,
  methods: ['GET'],
  statusCodes: [503, 504, 0] // 0 = network error
};

/**
 * Notification durations by type (in milliseconds)
 * Per spec: success=3s, error=5s, warning=4s, info=3s
 */
export const NOTIFICATION_DURATIONS: Record<NotificationType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000
};
