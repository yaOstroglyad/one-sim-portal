import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTableComponent } from './generic-table.component';
import { TranslateModule } from '@ngx-translate/core';
import {
	CardComponent,
	PageItemDirective,
	PageLinkDirective,
	PaginationComponent,
	TableDirective
} from '@coreui/angular';
import { FormatTimeModule } from '../../pipes/format-time/format-time.module';
import { NoDataModule } from '../no-data/no-data.module';
import { IconDirective } from '@coreui/icons-angular';
import { DisplayValueByKeyPipe } from '../../pipes/display-value-by-key/display-value-by-key.pipe';


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
		IconDirective,
		PaginationComponent,
		PageItemDirective,
		PageLinkDirective,
		DisplayValueByKeyPipe
	],
	exports: [
		GenericTableComponent
	]
})
export class GenericTableModule {
}
