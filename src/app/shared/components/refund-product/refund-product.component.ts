import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormConfig } from '../../model';
import { FormGeneratorModule } from '../form-generator/form-generator.module';
import { MatButtonModule } from '@angular/material/button';
import { getRefundFormConfig } from './refund-product.utils';
import { RefundProductService } from './refund-product.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { NgIf } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderComponent } from '../loader/loader.component';

@Component({
	selector: 'app-refund-product',
	templateUrl: './refund-product.component.html',
	standalone: true,
	imports: [
		MatDialogModule,
		FormGeneratorModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		NgIf,
		LoaderComponent
	],
	styleUrls: ['./refund-product.component.scss']
})
export class RefundProductComponent implements OnInit {
	refundProductService = inject(RefundProductService);
	formConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;
	refundData: any;
	loading = true;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<RefundProductComponent>,
		private snackBar: MatSnackBar
	) {
	}

	ngOnInit(): void {
		const refundData$: Observable<any> = this.refundProductService.list({simId: this.data.id});
		refundData$.subscribe(data => {
			this.refundData = data;
			this.loading = false;
		});
		this.formConfig = getRefundFormConfig(refundData$);
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
			this.refundProductService.refund(product.id).subscribe({
				next: (response) => {
					this.snackBar.open(`Transaction Status: ${response.transactionStatus}`, null, {
						panelClass: 'app-notification-success',
						duration: 3000
					});
				},
				error: (error) => {
					const errorMessage = error?.error?.message || 'An error occurred during the refund process.';
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
