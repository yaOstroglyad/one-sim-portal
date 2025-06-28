import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout.component';
import { FeatureToggleGuard } from '../../shared/auth/feature-toggle.guard';

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'customers'
      },
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
        path: 'companies',
        data: {
          title: 'nav.companies'
        },
        loadComponent: () =>
            import('../../views/companies/companies.component').then((m) => m.CompaniesComponent)
      },
      {
        path: 'customers',
        loadChildren: () =>
            import('../../views/customers/customers.module').then((m) => m.CustomersModule)
      },
      {
        path: 'orders',
        loadChildren: () =>
            import('../../views/orders/orders.module').then((m) => m.OrdersModule)
      },
      {
        path: 'email-logs',
        data: {
          title: 'nav.emailLogs'
        },
        loadComponent: () =>
            import('../../views/email-logs/email-logs.component').then((m) => m.EmailLogsComponent)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../../views/users/users.module').then((m) => m.UsersModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../../views/settings/settings-routing').then(m => m.SettingsRouting)
      },
      {
        path: 'dashboard',
        data: {
          title: 'nav.dashboard',
          featureToggle: 'dashboard'
        },
        canActivate: [FeatureToggleGuard],
        loadChildren: () => import('../../views/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultLayoutRoutingModule {}
