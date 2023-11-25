import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'providers'
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultLayoutRoutingModule {}
