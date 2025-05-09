import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGeneratorComponent } from './form-generator.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChipsInputComponent } from '../chips-input/chips-input.component';
import { MatIconModule } from '@angular/material/icon';
import { FormCheckComponent, FormCheckInputDirective } from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RichTextInputComponent } from '../rich-text-input';

@NgModule({
	declarations: [
		FormGeneratorComponent
	],
	exports: [
		FormGeneratorComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatListModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSelectModule,
		MatCheckboxModule,
		FlexLayoutModule,
		ChipsInputComponent,
		MatIconModule,
		FormCheckComponent,
		FormCheckInputDirective,
		TranslateModule,
		RichTextInputComponent
	]
})
export class FormGeneratorModule { }
