import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTableComponent } from './generic-table.component';
import { TranslateModule } from '@ngx-translate/core';
import {
	CardComponent,
	TableDirective
} from '@coreui/angular';
import { FormatTimeModule } from '../../pipes/format-time/format-time.module';
import { IconDirective } from '@coreui/icons-angular';
import { DisplayValueByKeyPipe } from '../../pipes/display-value-by-key/display-value-by-key.pipe';
import { PaginationComponent } from '../pagination';


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
		IconDirective,
		DisplayValueByKeyPipe,
		PaginationComponent
	],
	exports: [
		GenericTableComponent
	]
})
export class GenericTableModule {
}
