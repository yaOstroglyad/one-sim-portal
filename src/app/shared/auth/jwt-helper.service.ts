import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";

@Injectable({providedIn: 'root'})
export class JwtHelperService {

  private getTokenExpirationDate(token: any) {
    const decoded = this.decodeToken(token);

    if (typeof decoded.exp === "undefined") {
      return null;
    }

    const d = new Date(0); // The 0 here is the key, which sets the date to the epoch
    d.setUTCSeconds(decoded.exp);

    return d;
  };

  constructor() {}

  public isToken(token: any): boolean {
    return token !== null && token !== undefined;
  }

  public decodeToken(token: any): any {
    return jwt_decode(token);
  }

  public isTokenExpired (token: any, offsetSeconds: number): boolean {
    const d = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;
    if (d === null) {
      return false;
    }
    return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
  };
}
