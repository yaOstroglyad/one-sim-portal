import { Injectable, Injector, isDevMode } from '@angular/core';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, timer, EMPTY } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {
	AuthService,
  NotificationService,
  transformHttpError
} from '@shared';
import { DEFAULT_RETRY_CONFIG } from '@models';

/**
 * HttpErrorInterceptor
 *
 * Layer 1 of the 4-layer error handling architecture.
 * Handles infrastructure-level errors that require automatic system response.
 *
 * Responsibilities:
 * - 401: Clear auth state, redirect to /login with returnUrl
 * - 403: Redirect to /403 page
 * - 503/504: Retry GET requests with exponential backoff
 * - Network errors (status 0): Show notification, retry
 * - Pass through: 400, 404, 409, 422, 500 → component layer handles
 *
 * Note: All services are injected lazily via Injector to avoid circular dependency
 * (HttpErrorInterceptor → Service → HttpClient → HTTP_INTERCEPTORS)
 *
 * @see docs/architecture/error-handling.md
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
	/**
	 * Track consecutive 401s for same returnUrl to prevent infinite loops
	 * Key: returnUrl, Value: count of consecutive 401s
	 */
	private consecutive401Count = new Map<string, number>();

	/**
	 * Lazy-loaded services to avoid circular dependency
	 */
	private _authService: AuthService | null = null;
	private _notification: NotificationService | null = null;
	private _router: Router | null = null;

	constructor(private readonly injector: Injector) {
	}

	/**
	 * Get Router lazily
	 */
	private get router(): Router {
		if (!this._router) {
			this._router = this.injector.get(Router);
		}
		return this._router;
	}

	/**
	 * Get AuthService lazily to avoid circular dependency
	 */
	private get authService(): AuthService {
		if (!this._authService) {
			this._authService = this.injector.get(AuthService);
		}
		return this._authService;
	}

	/**
	 * Get NotificationService lazily to avoid circular dependency
	 */
	private get notification(): NotificationService {
		if (!this._notification) {
			this._notification = this.injector.get(NotificationService);
		}
		return this._notification;
	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			// Retry logic for GET requests on transient errors
			retry({
				count: this.shouldRetry(req) ? DEFAULT_RETRY_CONFIG.count : 0,
				delay: (error: HttpErrorResponse, retryCount: number) => {
					if (this.isRetryableError(error) && this.shouldRetry(req)) {
						const delay = DEFAULT_RETRY_CONFIG.baseDelay * Math.pow(2, retryCount - 1);
						if (isDevMode()) {
							console.log(`[HttpErrorInterceptor] Retrying request (attempt ${retryCount}), delay: ${delay}ms`);
						}
						return timer(delay);
					}
					return throwError(() => error);
				}
			}),

			catchError((error: HttpErrorResponse) => {
				return this.handleError(error);
			})
		);
	}

	/**
	 * Main error handling logic
	 */
	private handleError(error: HttpErrorResponse): Observable<never> {
		if (isDevMode()) {
			console.log(`[HttpErrorInterceptor] Error: ${error.status} for ${error.url}`);
		}

		// 401 Unauthorized - Session expired or not authenticated
		if (error.status === 401) {
			return this.handle401();
		}

		// 403 Forbidden - No permission
		if (error.status === 403) {
			return this.handle403();
		}

		// Network error (status 0) - No connection
		if (error.status === 0) {
			return this.handleNetworkError(error);
		}

		// All other errors - transform and pass through to service/component layer
		const apiError = transformHttpError(error);
		return throwError(() => apiError);
	}

	/**
	 * Handle 401 Unauthorized
	 * - First occurrence: redirect to /login?returnUrl=...
	 * - Second consecutive for same URL: redirect to /login without returnUrl, show info
	 */
	private handle401(): Observable<never> {
		// Use window.location to get the actual browser URL
		// (router.url may be "/" during APP_INITIALIZER when routing hasn't completed yet)
		const currentUrl = this.getCurrentUrl();

		// Clear auth state (without navigation - we handle it here)
		this.authService.clearAuth();

		// Don't set returnUrl if already on login page (prevents redirect loop)
		const isLoginPage = currentUrl.startsWith('/login');
		if (isLoginPage) {
			if (isDevMode()) {
				console.log('[HttpErrorInterceptor] Already on login page, skipping redirect');
			}
			return EMPTY;
		}

		// Check for consecutive 401s (infinite loop prevention)
		const count = this.consecutive401Count.get(currentUrl) || 0;

		if (count >= 1) {
			// Second consecutive 401 for same URL - graceful degradation
			if (isDevMode()) {
				console.log(`[HttpErrorInterceptor] Consecutive 401 detected for ${currentUrl}, redirecting without returnUrl`);
			}
			this.consecutive401Count.delete(currentUrl);
			this.notification.info('errors.pageTemporarilyUnavailable');
			this.router.navigate(['/login']);
			return EMPTY;
		}

		// First 401 - normal flow with returnUrl
		this.consecutive401Count.set(currentUrl, count + 1);
		if (isDevMode()) {
			console.log(`[HttpErrorInterceptor] 401 detected, redirecting to login with returnUrl: ${currentUrl}`);
		}
		this.router.navigate(['/login'], {queryParams: {returnUrl: currentUrl}});

		return EMPTY;
	}

	/**
	 * Get current URL from browser location
	 * Handles hash-based routing (#) used in this application
	 */
	private getCurrentUrl(): string {
		// For hash-based routing: /#/home/email-logs → /home/email-logs
		const hash = window.location.hash;
		if (hash && hash.startsWith('#')) {
			return hash.substring(1) || '/';
		}
		// Fallback to pathname for non-hash routing
		return window.location.pathname + window.location.search;
	}

	/**
	 * Handle 403 Forbidden
	 */
	private handle403(): Observable<never> {
		if (isDevMode()) {
			console.log('[HttpErrorInterceptor] 403 Forbidden, redirecting to /403');
		}
		this.router.navigate(['/403']);
		return EMPTY;
	}

	/**
	 * Handle network errors (status 0)
	 */
	private handleNetworkError(error: HttpErrorResponse): Observable<never> {
		if (isDevMode()) {
			console.log('[HttpErrorInterceptor] Network error detected');
		}
		this.notification.error('errors.network');
		const apiError = transformHttpError(error);
		return throwError(() => apiError);
	}

	/**
	 * Check if request should be retried
	 * Only GET requests should be retried to avoid duplicate mutations
	 */
	private shouldRetry(req: HttpRequest<any>): boolean {
		return DEFAULT_RETRY_CONFIG.methods?.includes(req.method) ?? false;
	}

	/**
	 * Check if error is retryable
	 */
	private isRetryableError(error: HttpErrorResponse): boolean {
		return DEFAULT_RETRY_CONFIG.statusCodes?.includes(error.status) ?? false;
	}
}
