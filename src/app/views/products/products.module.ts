import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from './products-routing.module';
import {
	BadgeComponent,
	ButtonCloseDirective,
	ButtonDirective,
	CardComponent,
	ColComponent,
	FormControlDirective,
	FormDirective,
	FormLabelDirective,
	FormSelectDirective,
	InputGroupComponent,
	ModalBodyComponent,
	ModalComponent,
	ModalFooterComponent,
	ModalHeaderComponent,
	ModalTitleDirective,
	RowComponent,
	TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { GenericTableModule, HeaderModule } from '../../shared';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    ProductsComponent,
    EditProductComponent
  ],
	imports: [
		CommonModule,
		ProductsRoutingModule,
		TableDirective,
		BadgeComponent,
		CardComponent,
		IconDirective,
		ModalComponent,
		ModalHeaderComponent,
		ModalBodyComponent,
		ModalFooterComponent,
		ModalTitleDirective,
		ButtonCloseDirective,
		ButtonDirective,
		ReactiveFormsModule,
		FormDirective,
		FormLabelDirective,
		FormControlDirective,
		RowComponent,
		ColComponent,
		FormSelectDirective,
		MatFormFieldModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatInputModule,
		InputGroupComponent,
		GenericTableModule,
		HeaderModule,
		MatDialogModule,
		MatButtonModule
	],
	providers: [
		MatDatepickerModule
	]
})
export class ProductsModule { }
