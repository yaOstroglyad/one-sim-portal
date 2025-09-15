import { Routes } from '@angular/router';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION, permissionGuard } from 'src/app/shared';

export const TICKETS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview'
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./components/overview/overview.component').then(
        (m) => m.OverviewComponent
      ),
    data: {
      title: 'nav.ticketsOverview',
      permissions: [ADMIN_PERMISSION, SUPPORT_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/tickets/ticket-list/ticket-list.component').then(
        (m) => m.TicketListComponent
      ),
    data: {
      title: 'nav.ticketsList',
      permissions: [ADMIN_PERMISSION, SUPPORT_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
];