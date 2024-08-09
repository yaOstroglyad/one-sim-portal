import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from './jwt-helper.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from '../model/loginRequest';
import { WhiteLabelService } from '../services/white-label.service';

@Injectable({providedIn: 'root'})
export class AuthService {
	private static AUTH_URL = '/auth/login';
	private static RE_AUTH_URL = '/auth/refresh';
	private rememberMe: boolean = false;

	constructor(private http: HttpClient,
							private jwtHelper: JwtHelperService,
							private whiteLabelService: WhiteLabelService,
							private $SessionStorageService: SessionStorageService,
							private $LocalStorageService: LocalStorageService) {
	}

	public authorize(credentials: LoginRequest): Observable<any> {
		this.rememberMe = credentials.rememberMe;

		const bodyString = JSON.stringify(credentials);

		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.http.post(AuthService.AUTH_URL, bodyString, {
			headers: headers,
			responseType: 'text',
			observe: 'response'
		}).pipe(tap(res => {
			const result = JSON.parse(<any>res.body);
			this.whiteLabelService.updateViewConfig(result.token);
			this.storeAuthenticationToken(result.token);
			this.storeUserRole(result.token);
		}));
	}

	private storeUserRole(token: any): void {
		const isAdmin = this.jwtHelper.isAdmin(token);
		this.$SessionStorageService.store('isAdmin', isAdmin);
	}

	public storeAuthenticationToken(token: any): void {
		this.$LocalStorageService.store('authenticationToken', token);
		this.$SessionStorageService.store('authenticationToken', token);
	}

	public deleteAuthenticationToken(): void {
		this.$SessionStorageService.clear('authenticationToken');
		this.$LocalStorageService.clear('authenticationToken');
	}

	public isAuthenticated(): boolean {
		let token = this.$LocalStorageService.retrieve('authenticationToken');
		if (!token) {
			token = this.$SessionStorageService.retrieve('authenticationToken');
		}

		if (this.jwtHelper.isToken(token)) {
			return !this.jwtHelper.isTokenExpired(token, 100);
		}
		return false;
	}

	public reLogin(token: string): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});
		const jwtToken = this.jwtHelper.decodeToken(token);
		const body = {refreshToken: jwtToken.refreshToken};
		return this.http.post<any>(
			AuthService.RE_AUTH_URL,
			body,
			{
				headers: headers,
				responseType: 'json',
				observe: 'response'
			}
		).pipe(
			tap(res => {
				const result = res.body;
				if (result && result.token) {
					this.whiteLabelService.updateViewConfig(result.token);
					this.storeAuthenticationToken(result.token);
				}
			})
		);
	}


}
