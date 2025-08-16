import { Injectable } from '@angular/core';
import { AuthService, ADMIN_PERMISSION, SPECIAL_PERMISSION } from '../auth/auth.service';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer', 
  SUPPORT = 'support',
  SPECIAL = 'special'
}

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  
  constructor(private authService: AuthService) {}

  getCurrentUserRole(): UserRole {
    // Check permissions in order of precedence
    if (this.authService.hasPermission(ADMIN_PERMISSION)) {
      return UserRole.ADMIN;
    }
    
    if (this.authService.hasPermission(SPECIAL_PERMISSION)) {
      return UserRole.SPECIAL;
    }
    
    // Add support permission check if it exists
    // if (this.authService.hasPermission('SUPPORT_PERMISSION')) {
    //   return UserRole.SUPPORT;
    // }
    
    // Default to customer for regular users
    return UserRole.CUSTOMER;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === UserRole.ADMIN;
  }

  isCustomer(): boolean {
    return this.getCurrentUserRole() === UserRole.CUSTOMER;
  }

  isSupport(): boolean {
    return this.getCurrentUserRole() === UserRole.SUPPORT;
  }

  isSpecial(): boolean {
    return this.getCurrentUserRole() === UserRole.SPECIAL;
  }

  getLoggedUser(): any {
    return this.authService.loggedUser;
  }
}