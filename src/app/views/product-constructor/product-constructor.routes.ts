import { Routes } from '@angular/router';

export const PRODUCT_CONSTRUCTOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./components/overview/overview.component').then(
            (m) => m.OverviewComponent
          ),
        data: {
          title: 'Overview'
        }
      },
      {
        path: 'regions',
        loadComponent: () =>
          import('./components/regions/region-list/region-list.component').then(
            (m) => m.RegionListComponent
          ),
        data: {
          title: 'Regions'
        }
      },
      {
        path: 'bundles',
        loadComponent: () =>
          import('./components/bundles/bundle-list/bundle-list.component').then(
            (m) => m.BundleListComponent
          ),
        data: {
          title: 'Mobile Bundles'
        }
      },
      {
        path: 'provider-products',
        loadComponent: () =>
          import('./components/provider-products/provider-product-list/provider-product-list.component').then(
            (m) => m.ProviderProductListComponent
          ),
        data: {
          title: 'Provider Products'
        }
      },
      {
        path: 'company-products',
        loadComponent: () =>
          import('./components/company-products/company-product-list/company-product-list.component').then(
            (m) => m.CompanyProductListComponent
          ),
        data: {
          title: 'Company Products'
        }
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/products/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
        data: {
          title: 'Products'
        }
      },
      {
        path: 'tariff-offers',
        loadComponent: () =>
          import('./components/tariff-offers/tariff-offer-list/tariff-offer-list.component').then(
            (m) => m.TariffOfferListComponent
          ),
        data: {
          title: 'Tariff Offers'
        }
      }
    ]
  }
];
