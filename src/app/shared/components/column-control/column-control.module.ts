import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnControlComponent } from './column-control.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ButtonDirective } from '@coreui/angular';
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
		TranslateModule,
		MatButtonModule,
		MatMenuModule,
		MatIconModule,
		MatCheckboxModule,
		MatTooltipModule,
		MatDividerModule,
		ButtonDirective,
		IconDirective
	]
})
export class ColumnControlModule { }
