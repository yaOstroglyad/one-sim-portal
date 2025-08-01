import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout.component';
import { FeatureToggleGuard } from '../../shared/auth/feature-toggle.guard';
import { PRODUCT_CONSTRUCTOR_ROUTES } from '../../views/product-constructor/product-constructor.routes';

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
          title: 'Dashboard',
          featureToggle: 'dashboard'
        },
        canActivate: [FeatureToggleGuard],
        loadComponent: () => import('../../views/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'storybook',
        data: {
          title: 'Storybook',
          featureToggle: 'storybook'
        },
        canActivate: [FeatureToggleGuard],
        loadChildren: () => import('../../views/storybook/storybook.module').then(m => m.StorybookModule)
      },
      {
        path: 'product-constructor',
        data: {
          title: 'Product Constructor',
          featureToggle: 'productConstructor'
        },
        canActivate: [FeatureToggleGuard],
        children: PRODUCT_CONSTRUCTOR_ROUTES
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultLayoutRoutingModule {}
