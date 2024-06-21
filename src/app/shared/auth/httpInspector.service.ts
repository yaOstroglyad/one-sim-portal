import { Observable, switchMap, throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse
} from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';


@Injectable({providedIn: 'root'})
export class CustomHttpInterceptor implements HttpInterceptor {
	constructor(
		private $localStorage: LocalStorageService,
		private $sessionStorage: SessionStorageService,
		private authService: AuthService,
		private router: Router
	) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = this.$sessionStorage.retrieve('authenticationToken') || this.$localStorage.retrieve('authenticationToken');

		if (token) {
			req = req.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`
				}
			});
		}

		return next.handle(req).pipe(
			catchError((errorResponse: HttpErrorResponse) => {
				if (errorResponse.status === 401) {
					return this.handle401Error(req, next, token);
				}
				return throwError(errorResponse);
			})
		);
	}

	private handle401Error(req: HttpRequest<any>, next: HttpHandler, token: string): Observable<HttpEvent<any>> {
		if (!this.authService.isAuthenticated()) {
			this.router.navigate(['/login']);
			return throwError('Session expired');
		}

		return this.authService.reLogin(token).pipe(
			switchMap((newToken: any) => {
				const newReq = req.clone({
					setHeaders: {
						Authorization: `Bearer ${newToken}`
					}
				});
				return next.handle(newReq);
			}),
			catchError((err) => {
				this.router.navigate(['/login']);
				return throwError(err);
			})
		);
	}
}

