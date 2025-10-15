import { Routes } from '@angular/router';
import { ProvidersComponent } from './providers.component';
import { ADMIN_PERMISSION, permissionGuard } from '../../shared';

export const PROVIDERS_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'nav.providers',
      permissions: [ADMIN_PERMISSION]
    },
    component: ProvidersComponent,
    canActivate: [permissionGuard]
  }
];