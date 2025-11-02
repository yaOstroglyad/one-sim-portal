import { Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '@shared';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'nav.orders',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    component: OrdersComponent,
    canActivate: [permissionGuard]
  }
];