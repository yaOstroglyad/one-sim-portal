import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(public auth: AuthService,
              public router: Router) {}

  private get isAuthenticated(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  public canActivate(): boolean {
    return this.isAuthenticated;
  }

  public canActivateChild(): boolean {
    return this.isAuthenticated;
  }
}
