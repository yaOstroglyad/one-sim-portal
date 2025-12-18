import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AddSubscriberProductService } from './add-subscriber-product.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';
import { getSubscriberProductsFormConfig } from './add-subscriber-product.utils';
import { FormConfig, FormGeneratorComponent } from '@shared';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { NotificationService } from '@shared/services/ui/notification.service';

@Component({
    standalone: true,
    selector: 'app-add-subscriber-product',
    templateUrl: './add-subscriber-product.component.html',
    imports: [
    MatDialogModule,
    FormGeneratorComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    LoaderComponent,
    TranslateModule
],
    styleUrls: ['./add-subscriber-product.component.scss']
})
export class AddSubscriberProductComponent implements OnInit {
	private readonly addSubscriberProductService = inject(AddSubscriberProductService);
	private readonly dialogRef = inject(MatDialogRef<AddSubscriberProductComponent>);
	private readonly notification = inject(NotificationService);
	readonly data = inject<any>(MAT_DIALOG_DATA);

	formConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;
	subscriberProducts: any;
	loading = true;

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
				next: () => {
					this.notification.success('notifications.productAdded');
					this.loading = false;
					this.dialogRef.close(true);
				},
				error: () => {
					this.loading = false;
					this.notification.error('errors.productAddFailed');
				}
			});
		}
	}
}
