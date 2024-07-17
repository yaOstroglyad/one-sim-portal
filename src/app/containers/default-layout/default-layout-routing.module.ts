import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'customers'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'providers',
        loadChildren: () =>
            import('../../views/providers/providers.module').then((m) => m.ProvidersModule)
      },
      {
        path: 'products',
        loadChildren: () =>
            import('../../views/products/products.module').then((m) => m.ProductsModule)
      },
      {
        path: 'inventory',
        loadChildren: () =>
            import('../../views/inventory/inventory.module').then((m) => m.InventoryModule)
      },
      {
        path: 'customers',
        loadChildren: () =>
            import('../../views/customers/customers.module').then((m) => m.CustomersModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultLayoutRoutingModule {}
