import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective, DropdownToggleDirective, FormControlDirective, FormSelectDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ColumnControlModule } from '../column-control/column-control.module';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './header.component';



@NgModule({
  declarations: [
    HeaderComponent
  ],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonDirective,
		IconDirective,
		FormControlDirective,
		FormSelectDirective,
		ColumnControlModule,
		MatIconModule,
		DropdownToggleDirective
	],
  exports: [
		HeaderComponent
  ]
})
export class HeaderModule { }
