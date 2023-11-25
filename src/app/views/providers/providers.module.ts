import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersComponent } from './providers.component';
import { ProvidersRoutingModule } from './providers-routing.module';
import { CardComponent, TableDirective } from '@coreui/angular';



@NgModule({
  declarations: [
    ProvidersComponent
  ],
	imports: [
		CommonModule,
		ProvidersRoutingModule,
		TableDirective,
		CardComponent
	]
})
export class ProvidersModule { }
