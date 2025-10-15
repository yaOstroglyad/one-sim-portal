import { Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { PrivateCustomerDetailsComponent } from './private-customer-details/private-customer-details.component';
import { CorporateCustomerDetailsComponent } from './corporate-customer-details/corporate-customer-details.component';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'nav.customers'
    },
    component: CustomersComponent
  },
  {
    path: 'customer-details/private/:id',
    data: {
      title: 'nav.customer-details'
    },
    component: PrivateCustomerDetailsComponent
  },
  {
    path: 'customer-details/corporate',
    data: {
      title: 'nav.customer-details'
    },
    component: CorporateCustomerDetailsComponent
  }
];