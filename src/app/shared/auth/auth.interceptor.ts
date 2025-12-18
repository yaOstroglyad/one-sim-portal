import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';

/**
 * AuthInterceptor
 *
 * Responsible ONLY for adding Authorization header to HTTP requests.
 * Error handling is delegated to HttpErrorInterceptor.
 *
 * Single Responsibility: Authentication of outgoing requests
 *
 * Note: LocalStorageService/SessionStorageService don't use HttpClient,
 * so direct inject() is safe here (no circular dependency).
 */
@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private readonly localStorage = inject(LocalStorageService);
  private readonly sessionStorage = inject(SessionStorageService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const loginResponse = this.sessionStorage.retrieve('loginResponse')
                       || this.localStorage.retrieve('loginResponse');

    if (loginResponse?.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${loginResponse.token}`
        }
      });
    }

    return next.handle(req);
  }
}
