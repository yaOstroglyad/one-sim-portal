import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from './jwt-helper.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest } from '../model/loginRequest';
import { WhiteLabelService } from '../services/white-label.service';
import { LoginResponse } from '../model/loginResponse';

@Injectable({providedIn: 'root'})
export class AuthService {
	private static AUTH_URL = '/auth/login';
	private static RE_AUTH_URL = '/auth/refresh';
	private rememberMe: boolean = false;

	public token$ = new Subject();

	constructor(private http: HttpClient,
							private jwtHelper: JwtHelperService,
							private whiteLabelService: WhiteLabelService,
							private $SessionStorageService: SessionStorageService,
							private $LocalStorageService: LocalStorageService) {
	}

	public authorize(credentials: LoginRequest): Observable<LoginResponse> {
		this.rememberMe = credentials.rememberMe;

		const bodyString = JSON.stringify(credentials);

		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.http.post(AuthService.AUTH_URL, bodyString, {
			headers: headers,
			responseType: 'text',
			observe: 'response'
		}).pipe(
			map(res => {
				const result = JSON.parse(res.body || '{}');
				this.token$.next(result);
				this.whiteLabelService.updateViewConfig(result.token);
				this.storeLoginResponse(result);
				this.storeUserRole(result.token);
				return result;
			})
		);
	}

	public reLogin(refreshToken: string): Observable<LoginResponse> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});
		const body = {refreshToken};
		return this.http.post<any>(AuthService.RE_AUTH_URL, body, {
			headers: headers,
			responseType: 'json',
			observe: 'response'
		}).pipe(
			map(res => {
				const result = res.body || '{}';
				this.token$.next(result);
				this.whiteLabelService.updateViewConfig(result.token);
				this.storeLoginResponse(result);
				this.storeUserRole(result.token);
				return result;
			})
		);
	}

	private storeUserRole(token: any): void {
		const isAdmin = this.jwtHelper.isAdmin(token);
		this.$SessionStorageService.store('isAdmin', isAdmin);
	}

	public storeLoginResponse(loginResponse: LoginResponse): void {
		this.$LocalStorageService.store('loginResponse', loginResponse);
		this.$SessionStorageService.store('loginResponse', loginResponse);
	}

	public deleteLoginResponse(): void {
		this.$SessionStorageService.clear('loginResponse');
		this.$LocalStorageService.clear('loginResponse');
	}

	public deleteUserRole(): void {
		this.$SessionStorageService.clear('isAdmin');
		this.$LocalStorageService.clear('isAdmin');
	}

	public isAuthenticated(): Observable<boolean> {
		return this.token$.pipe(
			map((result: LoginResponse) => {
				if (this.jwtHelper.isToken(result.token)) {
					return !this.jwtHelper.isTokenExpired(result.token, 100);
				}
				return false;
			})
		);
	}
}
