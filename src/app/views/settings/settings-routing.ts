import { Routes } from '@angular/router';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from 'src/app/shared';

export const SettingsRouting: Routes = [
  {
    path: 'payment-gateway',
    loadComponent: () => import('./payment-gateway-table/payment-gateway-table.component')
      .then(m => m.PaymentGatewayTableComponent),
    data: {
      title: 'nav.paymentGateway',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
  {
    path: 'view-configuration/portal',
    loadComponent: () => import('./view-configuration/portal/portal.component')
      .then(m => m.PortalComponent),
    data: {
      title: 'nav.portal',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  }
]; 