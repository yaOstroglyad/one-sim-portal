import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AddSubscriberProductService } from './add-subscriber-product.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { NgIf } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { getSubscriberProductsFormConfig } from './add-subscriber-product.utils';
import { FormConfig, FormGeneratorModule } from '../../../../shared';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
	selector: 'app-add-subscriber-product',
	templateUrl: './add-subscriber-product.component.html',
	standalone: true,
	imports: [
		MatDialogModule,
		FormGeneratorModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		NgIf,
		LoaderComponent,
		TranslateModule
	],
	styleUrls: ['./add-subscriber-product.component.scss']
})
export class AddSubscriberProductComponent implements OnInit {
	addSubscriberProductService = inject(AddSubscriberProductService);
	formConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;
	subscriberProducts: any;
	loading = true;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<AddSubscriberProductComponent>,
		private snackBar: MatSnackBar
	) {
	}

	ngOnInit(): void {
		const subscriberProducts$: Observable<any> = this.addSubscriberProductService.list(this.data.id);
		subscriberProducts$.subscribe(data => {
			this.subscriberProducts = data;
			this.loading = false;
		});
		this.formConfig = getSubscriberProductsFormConfig(subscriberProducts$);
	}

	handleFormChanges(form: FormGroup): void {
		this.form = form;
		this.isFormValid = form.valid;
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		if (this.isFormValid) {
			this.loading = true;
			const product = this.form.get('product').value;
			const payload = {
				subscriberId: this.data.id,
				productId: product.id
			}
			this.addSubscriberProductService.addProduct(payload).subscribe({
				next: (response: {code: number, message: string}) => {
					this.snackBar.open(`Transaction Status: ${response.message}`, null, {
						panelClass: 'app-notification-success',
						duration: 3000
					});
				},
				error: (error) => {
					const errorMessage = error?.error?.message || 'An error occurred during the process.';
					this.snackBar.open(errorMessage, null, {
						panelClass: 'app-notification-error',
						duration: 3000
					});
				},
				complete: () => {
					this.loading = false;
					this.dialogRef.close();
				}
			});
		} else {
			console.warn('Form is invalid. Cannot submit.');
		}
	}
}
