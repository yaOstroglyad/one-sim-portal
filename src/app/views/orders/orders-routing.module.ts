import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '../../shared';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule {
}
