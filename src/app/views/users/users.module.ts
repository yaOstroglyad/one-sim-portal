import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { UsersRoutingModule } from './users-routing.module';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { GenericTableModule, HeaderModule } from '../../shared';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateUserComponent } from './create-user/create-user.component';



@NgModule({
  declarations: [
    UsersComponent
  ],
	imports: [
		CommonModule,
		CreateUserComponent,
		UsersRoutingModule,
		ButtonDirective,
		FormControlDirective,
		GenericTableModule,
		MatSnackBarModule,
		HeaderModule,
		IconDirective,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		ReactiveFormsModule
	]
})
export class UsersModule { }
