import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormConfig, SelectOption } from '@shared/models';
import { FormGeneratorComponent } from '../form-generator/form-generator.component';
import { MatButtonModule } from '@angular/material/button';
import { getRefundFormConfig } from './refund-product.utils';
import { RefundProductService } from './refund-product.service';
import { InfoStripComponent } from '../info-strip/info-strip.component';
import { shareReplay, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderComponent } from '../loader/loader.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	standalone: true,
	selector: 'app-refund-product',
	templateUrl: './refund-product.component.html',
	imports: [
		MatDialogModule,
		FormGeneratorComponent,
		MatButtonModule,
		InfoStripComponent,
		LoaderComponent,
		TranslateModule
	],
	styleUrls: ['./refund-product.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundProductComponent {
	private readonly destroyRef = inject(DestroyRef);
	private readonly refundProductService = inject(RefundProductService);
	private readonly dialogRef = inject(MatDialogRef<RefundProductComponent>);
	private readonly snackBar = inject(MatSnackBar);
	private readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);

	readonly loading = signal(true);
	readonly hasProducts = signal(false);
	readonly formConfig: FormConfig;

	private readonly form = signal<FormGroup | null>(null);
	readonly isFormValid = computed(() => this.form()?.valid ?? false);

	constructor() {
		const products$ = this.refundProductService.list({ simId: this.data.id }).pipe(
			tap((products: SelectOption[]) => {
				this.hasProducts.set(products.length > 0);
				this.loading.set(false);
			}),
			shareReplay(1)
		);

		products$.pipe(takeUntilDestroyed()).subscribe();
		this.formConfig = getRefundFormConfig(products$);
	}

	handleFormChanges(form: FormGroup): void {
		this.form.set(form);
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		const form = this.form();
		if (!form?.valid) return;

		this.loading.set(true);
		const product = form.get('product')?.value;

		this.refundProductService.refund(product.id).pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe({
			next: (response) => {
				this.snackBar.open(`Transaction Status: ${response.transactionStatus}`, null, {
					panelClass: 'app-notification-success',
					duration: 3000
				});
			},
			error: (error) => {
				this.loading.set(false);
				const errorMessage = error?.error?.message || 'An error occurred during the refund process.';
				this.snackBar.open(errorMessage, null, {
					panelClass: 'app-notification-error',
					duration: 3000
				});
			},
			complete: () => {
				this.loading.set(false);
				this.dialogRef.close(true);
			}
		});
	}
}
