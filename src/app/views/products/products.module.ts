import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from './products-routing.module';
import { BadgeComponent, CardComponent, TableDirective } from '@coreui/angular';



@NgModule({
  declarations: [
    ProductsComponent
  ],
	imports: [
		CommonModule,
		ProductsRoutingModule,
		TableDirective,
		BadgeComponent,
		CardComponent
	]
})
export class ProductsModule { }
