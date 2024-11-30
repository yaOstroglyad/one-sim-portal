import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentGatewayTableComponent } from './payment-gateway-table.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Customers'
    },
    component: PaymentGatewayTableComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentGatewayTableRoutingModule {
}
