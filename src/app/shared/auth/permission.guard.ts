import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions: string[] = route.data?.['permissions'] || [];

  return new Observable<boolean>(observer => {
    authService.loadPermissions().pipe(
      first(),
      map(() => {
        const hasAccess = requiredPermissions.some(permission => authService.hasPermission(permission));
        if (hasAccess) {
          observer.next(true);
        } else {
          router.navigate(['/403']);
          observer.next(false);
        }
        observer.complete();
      })
    ).subscribe();
  });
};
