import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService, CookieHelperService, JwtHelperService } from '../../../shared';


@Injectable({providedIn: 'root'})
export class LoginService {
	reLoginInterval: any;
	reLoginTimeout: any;
	startInterval: boolean;

	constructor(private authService: AuthService,
							private jwtHelper: JwtHelperService,
							private $sessionStorage: SessionStorageService,
							private cookieHelperService: CookieHelperService,
							private router: Router) {
	}

	public login(credentials: any): void {
		this.authService.authorize(credentials).subscribe(result => {
			const token = this.$sessionStorage.retrieve('authenticationToken');
			if (token) {
				this.cookieHelperService.setTokenToCookie(token);
				// this.scheduleTokenRefresh(token);
				this.router.navigate(['/home']);
			} else {
				console.error('Token not found after authorization.');
			}
		});
	}

	private scheduleTokenRefresh(token: string): void {
		clearTimeout(this.reLoginTimeout);

		if (this.jwtHelper.isToken(token)) {
			const expiresIn = this.jwtHelper.getTokenExpiresIn(token);
			const refreshTime = expiresIn - 5 * 60 * 1000;

			this.reLoginTimeout = setTimeout(() => {
				this.updateToken();
			}, refreshTime);

		} else {
			console.error('Invalid token specified');
		}
	}

	public logout(): void {
		this.startInterval = false;
		clearInterval(this.reLoginInterval);
		this.authService.deleteAuthenticationToken();
		this.cookieHelperService.deleteTokenFromCookie();
		this.router.navigate(['/login']);
	}

	private updateToken(): void {
		const token = this.$sessionStorage.retrieve('authenticationToken');
		if (token && this.jwtHelper.isToken(token)) {
			this.authService.reLogin(token).pipe(
				take(1),
				tap({
					next: (response) => {
						const newToken = response.body.token;
						this.authService.storeAuthenticationToken(newToken);
						this.cookieHelperService.deleteTokenFromCookie();
						this.cookieHelperService.setTokenToCookie(newToken);
						this.scheduleTokenRefresh(newToken);
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
			console.error('Invalid or missing token during update');
			this.logout();
		}
	}
}
