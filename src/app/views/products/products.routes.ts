import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '@shared';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'nav.products',
      permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
    },
    component: ProductsComponent,
    canActivate: [permissionGuard]
  }
];