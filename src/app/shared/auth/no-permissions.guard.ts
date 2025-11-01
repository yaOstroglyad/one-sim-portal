import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRoleService } from '../services/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

/**
 * Guard to check if user has at least one valid role/permission configured
 *
 * Redirects to /no-permissions page if user has no valid roles
 * This is different from permissionGuard which checks specific permissions for routes
 *
 * Use this guard on main layout/container routes to ensure user has basic access
 */
export const noPermissionsGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const userRoleService = inject(UserRoleService);
  const router = inject(Router);

  return new Observable<boolean>(observer => {
    authService.loadPermissions().pipe(
      first(),
      map(() => {
        const hasValidRole = userRoleService.hasAnyValidRole();

        if (hasValidRole) {
          observer.next(true);
        } else {
          // User is authenticated but has no valid permissions
          router.navigate(['/no-permissions']);
          observer.next(false);
        }

        observer.complete();
      })
    ).subscribe();
  });
};
