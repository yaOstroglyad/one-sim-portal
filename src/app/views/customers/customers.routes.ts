import { Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { PrivateCustomerDetailsComponent } from './private-customer-details/private-customer-details.component';
import { CorporateCustomerDetailsComponent } from './corporate-customer-details/corporate-customer-details.component';
import { provideFabButton } from '@shared/components/fab-layout';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'nav.customers'
    },
    component: CustomersComponent,
    providers: [
      // Route-specific FAB button via DI token injection
      // This button appears ONLY when on /customers route
      // Automatically removed when navigating away (thanks to Angular DI hierarchy)
      provideFabButton({
        id: 'create-customer',
        label: 'Создать',
        icon: 'plus',
        order: 20,
        roles: ['admin'],
        hasMenu: false,
        action: 'route',
        target: '/customers/create'
      })
    ]
  },
  {
    path: 'customer-details/PRIVATE/:id',
    data: {
      title: 'nav.customer-details'
    },
    component: PrivateCustomerDetailsComponent
  },
  {
    path: 'customer-details/CORPORATE',
    data: {
      title: 'nav.customer-details'
    },
    component: CorporateCustomerDetailsComponent
  }
];