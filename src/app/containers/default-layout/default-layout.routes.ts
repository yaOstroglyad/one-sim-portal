import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout.component';
import { FeatureToggleGuard } from '../../shared';

export const DEFAULT_LAYOUT_ROUTES: Routes = [
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
            import('../../views/providers/providers.routes').then((m) => m.PROVIDERS_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () =>
            import('../../views/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES)
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
            import('../../views/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES)
      },
      {
        path: 'orders',
        loadChildren: () =>
            import('../../views/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
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
        path: 'settings',
        loadChildren: () => import('../../views/settings/settings-routing').then(m => m.SettingsRouting)
      },
      {
        path: 'analytics',
        data: {
          title: 'Analytics',
          featureToggle: 'dashboard'
        },
        canActivate: [FeatureToggleGuard],
        loadChildren: () => import('../../views/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES)
      },
      {
        path: 'storybook',
        data: {
          title: 'Storybook',
          featureToggle: 'storybook'
        },
        canActivate: [FeatureToggleGuard],
        loadChildren: () => import('../../views/storybook/storybook.routes').then(m => m.STORYBOOK_ROUTES)
      },
      {
        path: 'product-constructor',
        data: {
          title: 'Product Constructor',
          featureToggle: 'productConstructor'
        },
        canActivate: [FeatureToggleGuard],
        loadChildren: () => import('../../views/product-constructor/product-constructor.routes').then(m => m.PRODUCT_CONSTRUCTOR_ROUTES)
      },
      {
        path: 'company-products',
        data: {
          title: 'nav.companyProducts'
        },
        loadComponent: () =>
            import('../../views/product-constructor/components/company-products/company-product-list/company-product-list.component').then((m) => m.CompanyProductListComponent)
      },
      {
        path: 'tickets',
        data: {
          title: 'Support Tickets',
          featureToggle: 'tickets'
        },
        canActivate: [FeatureToggleGuard],
        loadChildren: () => import('../../views/tickets/tickets.routes').then(m => m.TICKETS_ROUTES)
      },
    ]
  }
];