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
				// Use specialized auth error transformation for OAuth/login errors
				let message = 'errors.unauthorized';
				if (err instanceof HttpErrorResponse) {
					const authError = transformAuthError(err);
					// For login errors, show the actual error message (not i18n key)
					// because these are server-specific OAuth error messages
					this.notification.showError(authError.message);
					console.error('Login error:', err);
					return EMPTY;
				} else if (err?.message) {
					message = err.message;
				}
				console.error('Login error:', err);
				this.notification.showError(message);
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

		if (returnUrl) {
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
