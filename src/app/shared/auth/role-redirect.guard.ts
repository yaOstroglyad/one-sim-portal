import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserRoleService, UserRole } from '../services/core';

/**
 * Guard that redirects to the appropriate default route based on user role
 *
 * Route mapping:
 * - ADMIN, CUSTOMER, SPECIAL → customers
 * - SUPPORT → customers (has access to customers and tickets)
 * - ANALYTICS → analytics (only has access to analytics)
 */
export const roleRedirectGuard: CanActivateFn = () => {
  const userRoleService = inject(UserRoleService);
  const router = inject(Router);

  const role = userRoleService.getCurrentUserRole();

  let redirectTo: string;

  switch (role) {
    case UserRole.ANALYTICS:
      redirectTo = '/home/analytics';
      break;
    case UserRole.ADMIN:
    case UserRole.CUSTOMER:
    case UserRole.SUPPORT:
    case UserRole.SPECIAL:
    default:
      redirectTo = '/home/customers';
      break;
  }

  router.navigate([redirectTo]);
  return false;
};
