import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormConfig } from '../../model';
import { FormGeneratorModule } from '../form-generator/form-generator.module';
import { MatButtonModule } from '@angular/material/button';
import { getRefundFormConfig } from './refund-product.utils';
import { RefundProductService } from './refund-product.service';

@Component({
	selector: 'app-refund-product',
	templateUrl: './refund-product.component.html',
	standalone: true,
	imports: [
		MatDialogModule,
		FormGeneratorModule,
		MatButtonModule
	],
	styleUrls: ['./refund-product.component.scss']
})
export class RefundProductComponent {
	formConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<RefundProductComponent>,
		private refundProductService: RefundProductService
	) {
		this.formConfig = getRefundFormConfig(
			this.refundProductService.list({simId: data.id})
		);
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
      this.refundProductService.refund(this.form.get('product').value).subscribe({
        complete: () => {
          this.dialogRef.close();
        }
      });
    } else {
      console.warn('Form is invalid. Cannot submit.');
    }
  }
}
