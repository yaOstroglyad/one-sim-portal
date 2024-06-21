import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableInitializationErrorComponent } from './table-initialization-error.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    TableInitializationErrorComponent
  ],
	imports: [
		CommonModule,
		TranslateModule
	],
  exports: [
    TableInitializationErrorComponent
  ]
})
export class TableInitializationErrorModule { }
