import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProvidersDataService } from '../../../shared';
import { Subject } from 'rxjs';
import { Provider } from '../../../shared/model/provider';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-edit-customer',
	templateUrl: './edit-customer.component.html',
	styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	form: FormGroup;
	providers: Provider[] = [];

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<EditCustomerComponent>,
		private providersDataService: ProvidersDataService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.form = this.fb.group({
			customerCommand: this.fb.group({
				id: [data?.customerCommand?.id || null],
				name: [data?.customerCommand?.name || '', Validators.required],
				description: [data?.customerCommand?.description || ''],
				externalId: [data?.customerCommand?.externalId || ''],
				tags: [data?.customerCommand?.tags || []],
				type: [data?.customerCommand?.type || '', Validators.required]
			}),
			subscriberCommand: this.fb.group({
				serviceProviderId: [data?.subscriberCommand?.serviceProviderId || '', Validators.required],
				externalId: [data?.subscriberCommand?.externalId || '']
			}),
			registrationEmail: [data?.registrationEmail || '', Validators.email],
		});

		// Set initial validators based on type
		this.setValidators(this.form.get('customerCommand.type').value);
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.providersDataService.list()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((providers: Provider[]) => {
			this.providers = providers;
		});
	}

	updateTags(tags: string[]): void {
		this.form.get('customerCommand.tags').setValue(tags);
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		if (this.form.valid) {
			this.dialogRef.close(this.form.value);
		}
	}

	onTypeChange(type: string): void {
		this.setValidators(type);
	}

	private setValidators(type: string): void {
		const registrationEmailControl = this.form.get('registrationEmail');
		const serviceProviderIdControl = this.form.get('subscriberCommand.serviceProviderId');

		if (type === 'Private') {
			registrationEmailControl.setValidators([Validators.required, Validators.email]);
			serviceProviderIdControl.setValidators([Validators.required]);
		} else if (type === 'Corporate') {
			registrationEmailControl.setValidators([Validators.email]);
			serviceProviderIdControl.setValidators(null);
		}

		registrationEmailControl.updateValueAndValidity();
		serviceProviderIdControl.updateValueAndValidity();
	}

	isFieldRequired(fieldName: string): boolean {
		const control = this.form.get(fieldName);
		if (control) {
			const validators = control.validator ? control.validator({} as AbstractControl) : null;
			if (validators && validators.required) {
				return true;
			}
		}
		return false;
	}
}
