import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from './jwt-helper.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from '../model/loginRequest';
import { UserViewConfig } from '../model/userViewConfig';

export const defaultConfig = {
	primaryColor: '#f9a743',
	language: 'en',
	logoName: 'logo-esim.png'
};

@Injectable({providedIn: 'root'})
export class AuthService {
	private static AUTH_URL = '/auth/login';
	private static RE_AUTH_URL = '/auth/refresh';
	private rememberMe: boolean = false;

	public $viewConfig: BehaviorSubject<UserViewConfig> = new BehaviorSubject<UserViewConfig>(defaultConfig);

	constructor(private http: HttpClient,
							private jwtHelper: JwtHelperService,
							private $SessionStorageService: SessionStorageService,
							private $LocalStorageService: LocalStorageService) {
	}

	public initViewBasedOnCurrentUser(): void {
		let token = this.$LocalStorageService.retrieve('authenticationToken');
		if (!token) {
			token = this.$SessionStorageService.retrieve('authenticationToken');
		}

		this.updateViewConfig(token);
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
			this.updateViewConfig(result.token);
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

	public updateViewConfig(token: any): void {
		if (this.jwtHelper.isToken(token)) {
			const jwtToken = this.jwtHelper.decodeToken(token);

			this.$viewConfig.next({
				primaryColor: jwtToken?.primaryColor || defaultConfig.primaryColor,
				language: jwtToken?.language || defaultConfig.language,
				logoName: jwtToken?.logoName || defaultConfig.logoName
			});
		}
	}

	public reLogin(token: string): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});
		const body = {refreshToken: token};
		return this.http.post<any>(
			AuthService.RE_AUTH_URL,
			body,
			{
				headers: headers,
				responseType: 'json', // Указываем 'json', так как мы ожидаем JSON-ответ
				observe: 'response'
			}
		).pipe(
			tap(res => {
				const result = res.body;
				if (result && result.token) {
					this.updateViewConfig(result.token);
					this.storeAuthenticationToken(result.token);
				}
			})
		);
	}


}
