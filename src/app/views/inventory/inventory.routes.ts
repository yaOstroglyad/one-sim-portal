import { Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '../../shared';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'nav.inventory',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    component: InventoryComponent,
    canActivate: [permissionGuard]
  }
];