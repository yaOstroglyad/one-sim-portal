import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AuthService, CookieHelperService, JwtHelperService, LoginRequest, LoginResponse } from '../../../shared';


@Injectable({providedIn: 'root'})
export class LoginService implements OnDestroy {
	private unsubscribe$ = new Subject<void>();
	reLoginInterval: any;
	reLoginTimeout: any;
	startInterval: boolean;

	constructor(private authService: AuthService,
							private jwtHelper: JwtHelperService,
							private cookieHelperService: CookieHelperService,
							private router: Router) {
	}

	public login(credentials: LoginRequest): void {
		this.authService.authorize(credentials)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((result: LoginResponse) => {
			if (result) {
				this.scheduleTokenRefresh(result);
				this.router.navigate(['/home']);
			} else {
				console.error('Token not found after authorization.');
			}
		});
	}

	private updateToken(loginResponse: LoginResponse): void {
		if (loginResponse && loginResponse?.refreshToken) {
			this.authService.reLogin(loginResponse?.refreshToken).pipe(
				takeUntil(this.unsubscribe$),
				tap({
					next: (result: LoginResponse) => {
						this.scheduleTokenRefresh(result);
					},
					error: (error) => {
						console.error('Error during token update', error);
						if (error.status === 401) {
							this.logout();
						}
					}
				})
			).subscribe();
		} else {
			console.error('Invalid or missing refreshToken during update');
			this.logout();
		}
	}

	private scheduleTokenRefresh(loginResponse: LoginResponse): void {
		clearTimeout(this.reLoginTimeout);

		if (this.jwtHelper.isToken(loginResponse?.refreshToken)) {
			const refreshTime = loginResponse.tokenExpiresIn * 1000;
			if (refreshTime > 0) {
				this.reLoginTimeout = setTimeout(() => {
					this.updateToken(loginResponse);
				}, refreshTime);
			}
		} else {
			console.error('Invalid token specified');
		}
	}

	public logout(): void {
		this.startInterval = false;
		clearInterval(this.reLoginInterval);
		this.authService.token$.next(null);
		this.authService.deleteLoginResponse();
		this.authService.deleteUserRole();
		this.cookieHelperService.deleteTokenFromCookie();
		this.router.navigate(['/login']);
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
