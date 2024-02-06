import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersComponent } from './providers.component';
import { ProvidersRoutingModule } from './providers-routing.module';
import { CardComponent, TableDirective } from '@coreui/angular';
import { GenericTableModule, HeaderModule, TableFilterModule } from '../../shared';



@NgModule({
  declarations: [
    ProvidersComponent
  ],
	imports: [
		CommonModule,
		ProvidersRoutingModule,
		TableDirective,
		CardComponent,
		TableFilterModule,
		GenericTableModule,
		HeaderModule
	]
})
export class ProvidersModule { }
