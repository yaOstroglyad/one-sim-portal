import { Routes } from '@angular/router';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from 'src/app/shared';

export const SettingsRouting: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'general'
  },
  {
    path: 'general',
    loadComponent: () => import('./general/general-settings.component')
      .then(m => m.GeneralSettingsComponent),
    data: {
      title: 'nav.general',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
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
    path: 'invoices',
    loadComponent: () => import('./invoicing-gateway/invoicing-gateway.component')
      .then(m => m.InvoicingGatewayComponent),
    data: {
      title: 'nav.invoicingGateway',
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
  },
  {
    path: 'email-configurations',
    loadComponent: () => import('./email-configurations/email-configurations.component')
      .then(m => m.EmailConfigurationsComponent),
    data: {
      title: 'nav.emailConfigurations',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
  {
    path: 'users',
    data: {
      title: 'nav.users',
      permissions: [ADMIN_PERMISSION],
    },
    canActivate: [permissionGuard],
    loadComponent: () =>
      import('../users/components/user-list/user-list.component').then((m) => m.UserListComponent)
  },
  {
    path: 'roles',
    data: {
      title: 'nav.roles',
      permissions: [ADMIN_PERMISSION],
    },
    canActivate: [permissionGuard],
    loadComponent: () =>
      import('../roles/components/role-list/role-list.component').then((m) => m.RoleListComponent)
  }
];
