import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { FormGeneratorModule } from '../../../shared/components/form-generator/form-generator.module';
import { RegisterRoutingModule } from './register-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    RegisterComponent
  ],
	imports: [
		CommonModule,
		FormGeneratorModule,
		RegisterRoutingModule,
		ReactiveFormsModule,
		MatButtonModule
	]
})
export class RegisterModule { }
