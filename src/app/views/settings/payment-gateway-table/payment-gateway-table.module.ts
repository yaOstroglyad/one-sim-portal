import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentGatewayTableComponent } from './payment-gateway-table.component';
import { PaymentGatewayTableRoutingModule } from './payment-gateway-table-routing.module';
import {
	BadgeComponent,
	ButtonDirective,
	CardComponent,
	DropdownComponent, DropdownItemDirective, DropdownMenuDirective,
	DropdownToggleDirective, FormCheckComponent, FormCheckInputDirective,
	TableDirective
} from '@coreui/angular';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditPaymentGatewayComponent } from './edit-payment-gateway/edit-payment-gateway.component';
import { GenericTableModule, HeaderModule } from '../../../shared';
import { ChipsInputComponent } from 'src/app/shared/components/chips-input/chips-input.component';
import { FormGeneratorModule } from 'src/app/shared/components/form-generator/form-generator.module';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
	declarations: [
		PaymentGatewayTableComponent,
		EditPaymentGatewayComponent
	],
	exports: [
		PaymentGatewayTableComponent
	],
	imports: [
		CommonModule,
		PaymentGatewayTableRoutingModule,
		TableDirective,
		CardComponent,
		GenericTableModule,
		HeaderModule,
		MatDialogModule,
		MatInputModule,
		ReactiveFormsModule,
		MatSelectModule,
		MatButtonModule,
		MatMenuModule,
		MatIconModule,
		ChipsInputComponent,
		MatSnackBarModule,
		FormGeneratorModule,
		BadgeComponent,
		DropdownComponent,
		ButtonDirective,
		DropdownToggleDirective,
		DropdownMenuDirective,
		DropdownItemDirective,
		FormCheckComponent,
		FormCheckInputDirective,
		MatTooltipModule
	]
})
export class PaymentGatewayTableModule { }
