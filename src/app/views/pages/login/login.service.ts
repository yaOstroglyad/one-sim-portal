import { inject, Injectable, isDevMode, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { first, Subject, EMPTY } from 'rxjs';
import { takeUntil, switchMap, mapTo, tap, catchError } from 'rxjs/operators';
import {
  AuthService,
  LoginRequest,
  LoginResponse,
  transformAuthError
} from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoginService implements OnDestroy {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);
	private readonly notification = inject(NotificationService);

	private unsubscribe$ = new Subject<void>();

	public login(credentials: LoginRequest): void {
		this.authService.authorize(credentials).pipe(
			takeUntil(this.unsubscribe$),

			switchMap((result: LoginResponse | null) => {
				if (!result) {
					this.notification.error('errors.unauthorized');
					return EMPTY;
				}
				return this.authService.loadPermissions().pipe(
					first(),
					mapTo(result)
				);
			}),

			tap((result: LoginResponse) => {
				this.authService.scheduleTokenRefresh(result);
				this.navigateAfterLogin();
			}),

			catchError(err => {
				console.error('Login error:', err);

				if (err instanceof HttpErrorResponse) {
					// OAuth/login errors - show actual server error message
					const authError = transformAuthError(err);
					this.notification.showError(authError.message);
				} else {
					// Other errors - show message or generic unauthorized
					this.notification.showError(err?.message || 'errors.unauthorized');
				}
				return EMPTY;
			})

		).subscribe();
	}

	public logout(): void {
		this.authService.clearAndLogout();
	}

	/**
	 * Navigate to returnUrl (if provided) or default /home after successful login
	 */
	private navigateAfterLogin(): void {
		const urlTree = this.router.parseUrl(this.router.url);
		const returnUrl = urlTree.queryParams['returnUrl'];

		if (isDevMode()) {
			console.log('[LoginService] returnUrl:', returnUrl || '(none, using /home)');
		}

		const isValidReturnUrl = returnUrl && !returnUrl.startsWith('/login');

		if (isValidReturnUrl) {
			this.router.navigateByUrl(returnUrl);
		} else {
			this.router.navigate(['/home']);
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
