import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProvidersDataService } from '../../../shared';
import { Subject } from 'rxjs';
import { getEditCustomerFormConfig } from './edit-customer.utils';
import { FormConfig } from '../../../shared/components/form-generator/field-config';

@Component({
	selector: 'app-edit-customer',
	templateUrl: './edit-customer.component.html',
	styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	public formConfig: FormConfig;
	public form: FormGroup;
	public isFormValid: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<EditCustomerComponent>,
		private providersDataService: ProvidersDataService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}

	ngOnInit(): void {
		this.formConfig = getEditCustomerFormConfig(this.providersDataService, this.data);
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
			this.dialogRef.close(this.form.value);
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
