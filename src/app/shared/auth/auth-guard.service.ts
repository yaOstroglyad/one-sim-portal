import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  private isAuthenticated(): Observable<boolean> {
    return of(true);
    return this.auth.checkAndRefreshToken().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['login']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['login']);
        return [false];
      })
    );
  }

  public canActivate(): Observable<boolean> {
    return this.isAuthenticated();
  }

  public canActivateChild(): Observable<boolean> {
    return this.isAuthenticated();
  }
}
