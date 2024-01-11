import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from './table-filter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective, FormControlDirective, FormSelectDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ColumnControlModule } from '../column-control/column-control.module';



@NgModule({
  declarations: [
    TableFilterComponent
  ],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonDirective,
		IconDirective,
		FormControlDirective,
		FormSelectDirective,
		ColumnControlModule
	],
  exports: [
    TableFilterComponent
  ]
})
export class TableFilterModule { }
