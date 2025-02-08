import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormConfig, FormGeneratorModule } from '../../../shared';
import { Subject } from 'rxjs';
import { getCompanyCreateRequest, getEditCompanyFormConfig } from './edit-company.utils';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-edit-company',
	templateUrl: './edit-company.component.html',
	standalone: true,
	imports: [
		MatDialogModule,
		TranslateModule,
		FormGeneratorModule,
		MatButtonModule
	],
	styleUrls: ['./edit-company.component.scss']
})
export class EditCompanyComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	public formConfig: FormConfig;
	public form: FormGroup;
	public isFormValid: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<EditCompanyComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}

	ngOnInit(): void {
		this.formConfig = getEditCompanyFormConfig(this.data);
	}

	handleFormChanges(form: FormGroup): void {
		this.form = form;
		this.isFormValid = form.valid;
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		if (this.form.valid) {
			this.dialogRef.close(getCompanyCreateRequest(this.form.value));
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
