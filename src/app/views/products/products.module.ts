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
import { CreateProductComponent } from './create-product/create-product.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ItemNamesPipe } from '../../shared/pipes/item-names/item-names.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ChangeStatusDialogComponent } from './change-status-dialog/change-status-dialog.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';



@NgModule({
  declarations: [
    ProductsComponent,
		CreateProductComponent,
    EditProductComponent,
    ChangeStatusDialogComponent
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
		MatButtonModule,
		MatSelectModule,
		MatCheckboxModule,
		MatIconModule,
		ItemNamesPipe,
		MatTooltipModule,
		MatMenuModule,
		HasPermissionDirective
	],
	providers: [
		MatDatepickerModule
	]
})
export class ProductsModule { }
