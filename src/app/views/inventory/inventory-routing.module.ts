import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '../../shared';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule {
}
