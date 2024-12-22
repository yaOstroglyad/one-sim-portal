import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions: string[] = route.data?.['permissions'] || [];

  const hasAccess = requiredPermissions.some(permission => authService.hasPermission(permission));

  if (hasAccess) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
