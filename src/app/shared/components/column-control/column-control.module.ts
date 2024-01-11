import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnControlComponent } from './column-control.component';
import {
	ButtonDirective,
	DropdownComponent,
	DropdownItemDirective,
	DropdownMenuDirective,
	DropdownToggleDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective } from '@coreui/icons-angular';



@NgModule({
	declarations: [
		ColumnControlComponent
	],
	exports: [
		ColumnControlComponent
	],
	imports: [
		CommonModule,
		DropdownComponent,
		ButtonDirective,
		DropdownToggleDirective,
		DropdownItemDirective,
		DropdownMenuDirective,
		FormCheckComponent,
		FormCheckLabelDirective,
		FormCheckInputDirective,
		TranslateModule,
		IconDirective
	]
})
export class ColumnControlModule { }
