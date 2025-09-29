import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from './jwt-helper.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../model';
import { Router } from '@angular/router';

export const ADMIN_PERMISSION = 'ADMIN';
export const SPECIAL_PERMISSION = 'SPECIAL';
export const CUSTOMER_PERMISSION = 'CUSTOMER';
export const SUPPORT_PERMISSION = 'SUPPORT';

@Injectable({providedIn: 'root'})
export class AuthService {
	private http = inject(HttpClient);
	private router = inject(Router);
	private jwtHelper = inject(JwtHelperService);
	private $SessionStorageService = inject(SessionStorageService);
	private $LocalStorageService = inject(LocalStorageService);

	public permissions: string[] = [];
	private unsubscribe$ = new Subject<void>();
	private static AUTH_URL = '/auth/login';
	private static RE_AUTH_URL = '/auth/refresh';
	private rememberMe: boolean = false;
	reLoginTimeout: any;

	get loggedUser() {
		const loginResponse = this.$SessionStorageService.retrieve('loginResponse')
			|| this.$LocalStorageService.retrieve('loginResponse');

		if (loginResponse?.token) {
			return this.jwtHelper.decodeToken(loginResponse.token);
		}

		return null;
	}

	loadPermissions(): Observable<string[]> {
		return this.http.get<{ id: string; name: string; displayName: string }[]>('/api/v1/users/roles')
			.pipe(
				map(res => res.map(role => role.name)),
				tap(roles => this.permissions = roles)
			);
	}

	hasPermission(permission: string): boolean {
		return this.permissions.includes(permission);
	}

	public authorize(credentials: LoginRequest): Observable<LoginResponse> {
		this.rememberMe = credentials.rememberMe;
		return this.sendAuthRequest(AuthService.AUTH_URL, credentials);
	}

	public reLogin(refreshToken: string): Observable<LoginResponse> {
		return this.sendAuthRequest(AuthService.RE_AUTH_URL, {refreshToken});
	}

	private sendAuthRequest(url: string, body: any): Observable<LoginResponse> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.http.post<any>(url, JSON.stringify(body), {
			headers: headers,
			responseType: 'json',
			observe: 'response'
		}).pipe(
			map(res => {
				const result = res.body || '{}';
				this.handleAuthResponse(result);
				return result;
			})
		);
	}

	public checkAndRefreshToken(): Observable<boolean> {
		const loginResponse = this.$LocalStorageService.retrieve('loginResponse') || this.$SessionStorageService.retrieve('loginResponse');
		if (loginResponse && this.jwtHelper.isTokenExpired(loginResponse.token)) {
			return this.reLogin(loginResponse.refreshToken).pipe(
				map(newLoginResponse => {
					this.storeLoginResponse(newLoginResponse);
					this.scheduleTokenRefresh(newLoginResponse);
					return true;
				}),
				catchError(() => of(false))
			);
		} else {
			return of(true);
		}
	}

	private handleAuthResponse(response: LoginResponse): void {
		this.storeLoginResponse(response);
	}

	public storeLoginResponse(loginResponse: LoginResponse): void {
		this.$LocalStorageService.store('loginResponse', loginResponse);
		this.$SessionStorageService.store('loginResponse', loginResponse);
	}

	public deleteLoginResponse(): void {
		this.$SessionStorageService.clear('loginResponse');
		this.$LocalStorageService.clear('loginResponse');
	}

	public scheduleTokenRefresh(loginResponse: LoginResponse): void {
		clearTimeout(this.reLoginTimeout);

		if (this.jwtHelper.isToken(loginResponse?.refreshToken)) {
			const tokenExpirationDate = this.jwtHelper.getTokenExpirationDate(loginResponse.token);
			const currentTime = new Date().getTime();
			const tokenExpiresIn = tokenExpirationDate ? tokenExpirationDate.getTime() - currentTime : loginResponse.tokenExpiresIn * 1000;

			const refreshTime = tokenExpiresIn * 0.9;

			if (refreshTime > 0) {
				this.reLoginTimeout = setTimeout(() => {
					this.updateToken(loginResponse);
				}, refreshTime);
			}
		} else {
			console.error('Invalid token specified');
		}
	}

	public updateToken(loginResponse: LoginResponse): void {
		if (loginResponse && loginResponse?.refreshToken) {
			this.reLogin(loginResponse?.refreshToken).pipe(
				takeUntil(this.unsubscribe$),
				tap({
					next: (result: LoginResponse) => {
						this.scheduleTokenRefresh(result);
					},
					error: (error) => {
						if (error.status === 401) {
							this.clearAndLogout();
						}
					}
				})
			).subscribe();
		} else {
			this.clearAndLogout();
		}
	}

	public clearAndLogout(): void {
		clearInterval(this.reLoginTimeout);
		this.deleteLoginResponse();
		this.router.navigate(['/login']);
	}
}
