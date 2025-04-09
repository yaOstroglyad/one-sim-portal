import { Routes } from '@angular/router';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from 'src/app/shared';

export const SettingsRouting: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'payment-gateway'
  },
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
    path: 'domains',
    loadComponent: () => import('./domains/domains.component')
      .then(m => m.DomainsComponent),
    data: {
      title: 'nav.domains',
      permissions: [ADMIN_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
  {
    path: 'view-configuration/portal',
    loadComponent: () => import('./view-configuration/portal/portal.component')
      .then(m => m.PortalComponent),
    data: {
      title: 'nav.portalViewConfiguration',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
  {
    path: 'view-configuration/retail',
    loadComponent: () => import('./view-configuration/retail/retail.component')
      .then(m => m.RetailComponent),
    data: {
      title: 'nav.retailViewConfiguration',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  }
]; 