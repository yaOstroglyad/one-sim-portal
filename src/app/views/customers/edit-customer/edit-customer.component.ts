import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProvidersDataService } from '../../../shared';
import { Subscription } from 'rxjs';
import { Provider } from '../../../shared/model/provider';

@Component({
	selector: 'app-edit-customer',
	templateUrl: './edit-customer.component.html',
	styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit, OnDestroy {
	form: FormGroup;
	providers: Provider[] = [];
	private subscriptions: Subscription = new Subscription();

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
			})
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	ngOnInit(): void {
		const providersSubscription = this.providersDataService.list().subscribe((providers: Provider[]) => {
			this.providers = providers;
		});

		this.subscriptions.add(providersSubscription);
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
}
