import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { TableDirective } from '@coreui/angular';
import { GenericTableModule, HeaderModule } from '../../shared';
import { EditOrderDescriptionComponent } from './edit-order-description/edit-order-description.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormGeneratorModule } from '../../shared/components/form-generator/form-generator.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [
    OrdersComponent,
		EditOrderDescriptionComponent
  ],
	imports: [
		CommonModule,
		OrdersRoutingModule,
		TableDirective,
		GenericTableModule,
		HeaderModule,
		MatDialogModule,
		FormGeneratorModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule
	]
})
export class OrdersModule { }
