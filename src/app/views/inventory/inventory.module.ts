import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory.component';
import { InventoryRoutingModule } from './inventory-routing.module';
import { GenericTableModule, HeaderModule } from '../../shared';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { SetupResourceComponent } from './setup-resource/setup-resource.component';
import { FormGeneratorModule } from '../../shared/components/form-generator/form-generator.module';
import { MoveResourceComponent } from './move-resource/move-resource.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [
    InventoryComponent,
		UploadDialogComponent,
		SetupResourceComponent,
		MoveResourceComponent
  ],
	imports: [
		CommonModule,
		InventoryRoutingModule,
		HeaderModule,
		GenericTableModule,
		MatDialogModule,
		ButtonDirective,
		IconDirective,
		MatButtonModule,
		MatDatepickerModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,
		FormGeneratorModule,
		MatTooltipModule,
		MatCardModule,
		MatIconModule,
		MatMenuModule
	]
})
export class InventoryModule { }
