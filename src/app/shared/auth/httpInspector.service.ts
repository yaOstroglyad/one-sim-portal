import { Observable, throwError } from 'rxjs';

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


@Injectable({providedIn: 'root'})
export class CustomHttpInterceptor implements HttpInterceptor {
	constructor(private $localStorage: LocalStorageService,
							private $sessionStorage: SessionStorageService) {
	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		const token = this.$sessionStorage.retrieve('authenticationToken') || this.$localStorage.retrieve('authenticationToken');

		if (token) {
			req = req.clone({
				setHeaders: {
					Authorization: `Bearer ` + token
				}
			});
		}

		return next.handle(req).pipe(
			catchError((errorResponse: HttpErrorResponse) => {
				if (errorResponse.status === 401) {
					this.$localStorage.clear('authenticationToken');
					this.$sessionStorage.clear('authenticationToken');
				}

				return throwError(errorResponse);
			})
		) as any;
	}
}

