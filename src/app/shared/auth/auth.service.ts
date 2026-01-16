import { Injectable, inject, signal, Signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from './jwt-helper.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap, shareReplay } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '@shared/models';
import { Router } from '@angular/router';

// Re-export permissions from constants for backwards compatibility
export {
  ADMIN_PERMISSION,
  SPECIAL_PERMISSION,
  CUSTOMER_PERMISSION,
  SUPPORT_PERMISSION,
  ANALYTICS_PERMISSION,
} from '../constants';

@Injectable({providedIn: 'root'})
export class AuthService {
	private http = inject(HttpClient);
	private router = inject(Router);
	private jwtHelper = inject(JwtHelperService);
	private $SessionStorageService = inject(SessionStorageService);
	private $LocalStorageService = inject(LocalStorageService);

	/**
	 * @deprecated Use permissionsSignal() instead for reactive access
	 */
	public permissions: string[] = [];
	private permissionsObservable$: Observable<string[]> | null = null;
	private unsubscribe$ = new Subject<void>();
	private static AUTH_URL = '/auth/login';
	private static RE_AUTH_URL = '/auth/refresh';
	private rememberMe: boolean = false;
	reLoginTimeout: any;

	// === Signal-based permissions (reactive) ===
	private readonly permissionsSignal = signal<string[]>([]);

	/**
	 * Reactive Signal<string[]> containing current user permissions.
	 * Use this in effects and computed signals for automatic reactivity.
	 * Note: This is a Signal, not an Observable.
	 */
	readonly currentPermissions = this.permissionsSignal.asReadonly();

	// Cache for hasPermission$ computed signals
	private readonly permissionCache = new Map<string, Signal<boolean>>();

	get loggedUser() {
		const loginResponse = this.$SessionStorageService.retrieve('loginResponse')
			|| this.$LocalStorageService.retrieve('loginResponse');

		if (loginResponse?.token) {
			return this.jwtHelper.decodeToken(loginResponse.token);
		}

		return null;
	}

	get currentUsername(): string | null {
		const user = this.loggedUser;
		return user?.preferred_username || user?.sub || null;
	}

	get currentUserId(): string | null {
		const user = this.loggedUser;
		return user?.sid || null;
	}

	loadPermissions(): Observable<string[]> {
		// Skip API call if user is not authenticated (e.g., on public pages like /docs)
		if (!this.loggedUser) {
			return of([]);
		}

		if (this.permissionsObservable$) {
			return this.permissionsObservable$;
		}

		this.permissionsObservable$ = this.http.get<{ id: string; name: string; displayName: string }[]>('/api/v1/users/roles')
			.pipe(
				map(res => res.map(role => role.name)),
				tap(roles => {
					this.permissions = roles;
					this.permissionsSignal.set(roles);
				}),
				shareReplay(1)
			);

		return this.permissionsObservable$;
	}

	/**
	 * @deprecated Use hasPermission$() for reactive permission checking in effects/computed
	 */
	hasPermission(permission: string): boolean {
		return this.permissions?.includes(permission) || false;
	}

	/**
	 * Reactive permission check - returns a Signal<boolean>.
	 * Use this in effects and computed signals for automatic reactivity.
	 * @example
	 * effect(() => {
	 *   const isAdmin = this.authService.hasPermission$(ADMIN_PERMISSION)();
	 *   // This will re-run when permissions change
	 * });
	 */
	hasPermission$(permission: string): Signal<boolean> {
		let cached = this.permissionCache.get(permission);
		if (!cached) {
			cached = computed(() => this.permissionsSignal().includes(permission));
			this.permissionCache.set(permission, cached);
		}
		return cached;
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

	/**
	 * Clear authentication state without navigation.
	 * Use this when you need to handle navigation separately (e.g., in interceptors).
	 */
	public clearAuth(): void {
		clearInterval(this.reLoginTimeout);
		this.deleteLoginResponse();
		this.permissions = [];
		this.permissionsSignal.set([]);
		this.permissionsObservable$ = null;
	}

	/**
	 * Clear authentication state and navigate to login page.
	 * Use this for explicit logout actions.
	 */
	public clearAndLogout(): void {
		this.clearAuth();
		this.router.navigate(['/login']);
	}
}
