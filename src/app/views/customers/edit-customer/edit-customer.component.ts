import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProvidersDataService, FormConfig, ProductsDataService } from '../../../shared';
import { Subject } from 'rxjs';
import { getCustomerCreateRequest, getEditCustomerFormConfig } from './edit-customer.utils';

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
		private productsDataService: ProductsDataService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}

	ngOnInit(): void {
		this.formConfig = getEditCustomerFormConfig(this.providersDataService, this.productsDataService, this.data);
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
			this.dialogRef.close(getCustomerCreateRequest(this.form.value));
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
