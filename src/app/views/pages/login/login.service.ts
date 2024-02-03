import { Injectable } from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, AuthService, CookieHelperService } from '../../../shared';


@Injectable({providedIn: 'root'})
export class LoginService {
  reLoginInterval: any;
  startInterval: boolean;

  constructor(private authService: AuthService,
              private $sessionStorage: SessionStorageService,
              private $localStorage: LocalStorageService,
              private cookieHelperService: CookieHelperService,
              private router: Router) {
  }

  public login(credentials: LoginRequest): void {
    this.authService.authorize(credentials).subscribe(result => {
      const token = this.$sessionStorage.retrieve('authenticationToken');
      this.cookieHelperService.setTokenToCookie(token);
      this.startReLoginInterval(token);
      this.router.navigate(['/home']);
    });
  }

  public logout(): void {
    this.startInterval = false;
    clearInterval(this.reLoginInterval);
    this.authService.deleteAuthenticationToken();
    this.cookieHelperService.deleteTokenFromCookie();
    this.router.navigate(['/login']);
  }

  private startReLoginInterval(token: string): void {
    clearInterval(this.reLoginInterval);
    if (this.startInterval) {
      this.reLoginInterval = setInterval(() => {
        this.updateToken(token);
      }, 150000);
    }
  }

  private updateToken(token: string): void {
    this.authService.reLogin(token).pipe(
      take(1),
      tap(() => {
        let $token = this.$localStorage.retrieve('authenticationToken');
        if(!$token) {
          $token = this.$sessionStorage.retrieve('authenticationToken');
        }
        this.cookieHelperService.deleteTokenFromCookie();
        this.cookieHelperService.setTokenToCookie($token);
      })
    )
  }
}
