import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({providedIn: 'root'})
export class JwtHelperService {

	constructor() {
	}

	public getTokenExpirationDate(token: any): Date | null {
		const decoded = this.decodeToken(token);

		if (typeof decoded.exp === 'undefined') {
			return null;
		}

		const date = new Date(0);
		date.setUTCSeconds(decoded.exp);

		return date;
	}

	public isToken(token: any): boolean {
		return token !== null && token !== undefined;
	}

	public isAdmin(token: any): boolean {
		const decodedToken = this.decodeToken(token);
		return decodedToken && decodedToken.preferred_username === 'admin';
	}

	public decodeToken(token: any): any {
		try {
			return jwt_decode(token);
		} catch (error) {
			console.error('Invalid token specified', error);
			return null;
		}
	}

	public isTokenExpired(token: any, offsetSeconds: number = 0): boolean {
		const date = this.getTokenExpirationDate(token);
		if (date === null) {
			return false;
		}
		return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
	}

	public getTokenExpiresIn(token: any): number {
		const decodedToken = this.decodeToken(token);
		if (!decodedToken || !decodedToken.exp) {
			return 0;
		}
		return decodedToken.exp * 1000 - Date.now();
	}
}
