import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(private auth: AuthService, private router: Router) {}

  private isAuthenticated(): Observable<boolean> {
    return this.auth.isAuthenticated().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['login']);
          return false;
        }
        return true;
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
