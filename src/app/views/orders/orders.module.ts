import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { TableDirective } from '@coreui/angular';
import { GenericTableModule, HeaderModule } from '../../shared';
import { EditOrderDescriptionComponent } from './edit-order-description/edit-order-description.component';
import { RevertOrderComponent } from './revert-order/revert-order.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormGeneratorComponent } from '../../shared';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    OrdersComponent,
		EditOrderDescriptionComponent,
		RevertOrderComponent
  ],
	imports: [
		CommonModule,
		OrdersRoutingModule,
		TableDirective,
		GenericTableModule,
		HeaderModule,
		MatDialogModule,
		FormGeneratorComponent,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		TranslateModule
	]
})
export class OrdersModule { }
