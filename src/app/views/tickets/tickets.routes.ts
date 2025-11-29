import { Routes } from '@angular/router';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION, permissionGuard } from 'src/app/shared';

export const TICKETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/tickets/ticket-list/ticket-list.component').then(
        (m) => m.TicketListComponent
      ),
    data: {
      title: 'nav.tickets',
      permissions: [ADMIN_PERMISSION, SUPPORT_PERMISSION, CUSTOMER_PERMISSION]
    },
    canActivate: [permissionGuard]
  },
];