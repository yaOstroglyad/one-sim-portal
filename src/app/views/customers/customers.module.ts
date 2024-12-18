import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomersRoutingModule } from './customers-routing.module';
import { CardComponent, TableDirective } from '@coreui/angular';
import { GenericTableModule, HeaderModule } from '../../shared';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ChipsInputComponent } from '../../shared/components/chips-input/chips-input.component';
import { FormGeneratorModule } from '../../shared/components/form-generator/form-generator.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReSendInviteEmailComponent } from './re-send-invite-email/re-send-invite-email.component';


@NgModule({
  declarations: [
    CustomersComponent,
		EditCustomerComponent,
		ReSendInviteEmailComponent,
  ],
	imports: [
		CommonModule,
		CustomersRoutingModule,
		TableDirective,
		CardComponent,
		GenericTableModule,
		HeaderModule,
		MatDialogModule,
		MatInputModule,
		ReactiveFormsModule,
		MatSelectModule,
		MatButtonModule,
		MatMenuModule,
		MatIconModule,
		ChipsInputComponent,
		MatSnackBarModule,
		FormGeneratorModule
	]
})
export class CustomersModule { }
