import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormConfig, FormGeneratorModule } from '../../../shared';
import { getCreateUserFormConfig } from './create-user.utils';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-create-user',
	templateUrl: './create-user.component.html',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		FormGeneratorModule,
		MatButtonModule,
		TranslateModule
	],
	styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent {
	formConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;

	constructor(public dialogRef: MatDialogRef<CreateUserComponent>,
							private translate: TranslateService) {
		this.formConfig = getCreateUserFormConfig(this.translate);
	}

	handleFormChanges(form: FormGroup): void {
		this.form = form;
		this.isFormValid = form.valid;
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.dialogRef.close(this.form.getRawValue());
	}
}
