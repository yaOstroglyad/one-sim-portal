import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomersRoutingModule } from './customers-routing.module';
import { CardComponent, TableDirective } from '@coreui/angular';
import { GenericTableModule, HeaderModule } from '../../shared';



@NgModule({
  declarations: [
    CustomersComponent
  ],
	imports: [
		CommonModule,
		CustomersRoutingModule,
		TableDirective,
		CardComponent,
		GenericTableModule,
		HeaderModule
	]
})
export class CustomersModule { }
