import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '../../shared';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {
}
