import { Injectable } from '@angular/core';
import { AuthService, ADMIN_PERMISSION, SPECIAL_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION } from '../../auth';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  SUPPORT = 'support',
  SPECIAL = 'special'
}

// List of all valid/known permissions in the system
const VALID_PERMISSIONS = [
  ADMIN_PERMISSION,
  SPECIAL_PERMISSION,
  CUSTOMER_PERMISSION,
  SUPPORT_PERMISSION
];

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor(private authService: AuthService) {}

  /**
   * Check if user has at least one valid role/permission configured
   *
   * Returns false if:
   * - permissions array is empty
   * - permissions array contains only unknown/invalid roles
   *
   * @returns true if user has any valid role, false otherwise
   */
  hasAnyValidRole(): boolean {
    const userPermissions = this.authService.permissions;

    // No permissions at all
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // Check if at least one permission is in our valid list
    return userPermissions.some(permission =>
      VALID_PERMISSIONS.includes(permission)
    );
  }

  getCurrentUserRole(): UserRole {
    // Check permissions in order of precedence
    if (this.authService.hasPermission(ADMIN_PERMISSION)) {
      return UserRole.ADMIN;
    }

    if (this.authService.hasPermission(SPECIAL_PERMISSION)) {
      return UserRole.SPECIAL;
    }

    // Add support permission check if it exists
    if (this.authService.hasPermission(SUPPORT_PERMISSION)) {
      return UserRole.SUPPORT;
    }

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
