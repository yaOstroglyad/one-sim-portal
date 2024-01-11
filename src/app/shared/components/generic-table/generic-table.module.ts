import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTableComponent } from './generic-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent, TableDirective } from '@coreui/angular';
import { FormatTimeModule } from '../../pipes/format-time/format-time.module';
import { NoDataModule } from '../no-data/no-data.module';
import { IconDirective } from '@coreui/icons-angular';


@NgModule({
	declarations: [
		GenericTableComponent
	],
	imports: [
		CommonModule,
		TranslateModule,
		TableDirective,
		CardComponent,
		FormatTimeModule,
		NoDataModule,
		IconDirective
	],
	exports: [
		GenericTableComponent
	]
})
export class GenericTableModule {
}
