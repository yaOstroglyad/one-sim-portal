import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		LoginPageRoutingModule,
		ReactiveFormsModule,
		TranslateModule
	],
  declarations: [LoginComponent]
})
export class LoginPageModule {}
