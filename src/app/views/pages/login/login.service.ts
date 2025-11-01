import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { first, Subject, EMPTY } from 'rxjs';
import { takeUntil, switchMap, mapTo, tap, catchError } from 'rxjs/operators';
import { AuthService, LoginRequest, LoginResponse } from '../../../shared';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { transformAuthError } from '../../../shared';

@Injectable({ providedIn: 'root' })
export class LoginService implements OnDestroy {
	private unsubscribe$ = new Subject<void>();

	constructor(
		private authService: AuthService,
		private router: Router,
		private snackBar: MatSnackBar
	) {}

	public login(credentials: LoginRequest): void {
		this.authService.authorize(credentials).pipe(
			takeUntil(this.unsubscribe$),

			switchMap((result: LoginResponse | null) => {
				if (!result) {
					this.notify('Authentication failed: token not received');
					return EMPTY;
				}
				return this.authService.loadPermissions().pipe(
					first(),
					mapTo(result)
				);
			}),

			tap((result: LoginResponse) => {
				this.authService.scheduleTokenRefresh(result);
				this.router.navigate(['/home']);
			}),

			catchError(err => {
				// Use specialized auth error transformation for OAuth/login errors
				let message = 'Authorization error';
				if (err instanceof HttpErrorResponse) {
					const authError = transformAuthError(err);
					message = authError.message;
				} else if (err?.message) {
					message = err.message;
				}
				console.error('Login error:', err);
				this.notify(message);
				return EMPTY;
			})

		).subscribe();
	}

	private notify(message: string, panelClass = 'app-notification-error'): void {
		this.snackBar.open(message, '', { panelClass, duration: 2000 });
	}

	public logout(): void {
		this.authService.clearAndLogout();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
