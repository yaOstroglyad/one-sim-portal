import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { NOTIFICATION_DURATIONS, NotificationType } from '@models';

/**
 * NotificationService
 *
 * Centralized service for displaying user notifications with i18n support.
 * Part of Layer 3 (Component Layer) in the 4-layer error handling architecture.
 *
 * Usage:
 * - All components MUST use this service for user notifications
 * - All messages MUST use i18n keys (no hardcoded strings)
 * - Services should NOT use this service (component responsibility)
 *
 * @example
 * ```typescript
 * // In a component
 * private readonly notification = inject(NotificationService);
 *
 * // Success notification
 * this.notification.success('customer.saved');
 *
 * // Error with params
 * this.notification.error('customer.notFound', { id: '123' });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  /**
   * Show success notification (green)
   * Duration: 3 seconds
   *
   * @param messageKey - i18n translation key
   * @param params - Optional interpolation parameters
   */
  success(messageKey: string, params?: Record<string, unknown>): void {
    this.show(messageKey, 'success', params);
  }

  /**
   * Show error notification (red)
   * Duration: 5 seconds
   *
   * @param messageKey - i18n translation key
   * @param params - Optional interpolation parameters
   */
  error(messageKey: string, params?: Record<string, unknown>): void {
    this.show(messageKey, 'error', params);
  }

  /**
   * Show warning notification (amber)
   * Duration: 4 seconds
   *
   * @param messageKey - i18n translation key
   * @param params - Optional interpolation parameters
   */
  warning(messageKey: string, params?: Record<string, unknown>): void {
    this.show(messageKey, 'warning', params);
  }

  /**
   * Show info notification (cyan)
   * Duration: 3 seconds
   *
   * @param messageKey - i18n translation key
   * @param params - Optional interpolation parameters
   */
  info(messageKey: string, params?: Record<string, unknown>): void {
    this.show(messageKey, 'info', params);
  }

  /**
   * Show raw error message without translation
   * Use this for server-provided error messages (e.g., OAuth errors)
   * Duration: 5 seconds
   *
   * @param message - Raw error message (not a translation key)
   */
  showError(message: string): void {
    this.showRaw(message, 'error');
  }

  /**
   * Internal method to show notification with i18n translation
   */
  private show(
    messageKey: string,
    type: NotificationType,
    params?: Record<string, unknown>
  ): void {
    const message = this.translate.instant(messageKey, params);
    this.showRaw(message, type);
  }

  /**
   * Internal method to show raw notification without translation
   */
  private showRaw(message: string, type: NotificationType): void {
    const closeLabel = this.translate.instant('errors.close');
    const duration = NOTIFICATION_DURATIONS[type];
    const panelClass = `app-notification-${type}`;

    this.snackBar.open(message, closeLabel, {
      duration,
      panelClass,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}
