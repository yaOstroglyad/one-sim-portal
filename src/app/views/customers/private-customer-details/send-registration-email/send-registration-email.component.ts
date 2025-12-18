import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormConfig } from '@shared/models';
import { FormGeneratorComponent } from '@shared/components/form-generator/form-generator.component';
import { MatButtonModule } from '@angular/material/button';
import { getRegistrationEmailFormConfig } from './send-registration-email.utils';
import { SendRegistrationEmailService } from './send-registration-email.service';
import { InfoStripComponent } from '@shared/components/info-strip/info-strip.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	standalone: true,
	selector: 'app-send-registration-email',
	templateUrl: './send-registration-email.component.html',
	imports: [
		MatDialogModule,
		FormGeneratorComponent,
		MatButtonModule,
		InfoStripComponent,
		LoaderComponent,
		TranslateModule
	],
	styleUrls: ['./send-registration-email.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SendRegistrationEmailComponent {
	private readonly destroyRef = inject(DestroyRef);
	private readonly sendRegistrationEmailService = inject(SendRegistrationEmailService);
	private readonly dialogRef = inject(MatDialogRef<SendRegistrationEmailComponent>);
	private readonly snackBar = inject(MatSnackBar);
	private readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);

	readonly loading = signal(true);
	readonly hasActiveProducts = signal(false);
	readonly formConfig: FormConfig;

	private form: FormGroup | null = null;
	readonly isFormValid = signal(false);

	constructor() {
		this.formConfig = getRegistrationEmailFormConfig(this.data.id);
		this.checkActiveProducts();
	}

	private checkActiveProducts(): void {
		this.sendRegistrationEmailService.checkActiveProducts(this.data.id).pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe({
			next: (hasProducts: boolean) => {
				this.hasActiveProducts.set(hasProducts);
				this.loading.set(false);
			},
			error: () => {
				this.hasActiveProducts.set(false);
				this.loading.set(false);
			}
		});
	}

	handleFormChanges(form: FormGroup): void {
		this.form = form;
		this.isFormValid.set(form.valid);
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		if (!this.form?.valid) return;

		this.loading.set(true);
		const email = this.form.get('email')?.value;

		this.sendRegistrationEmailService.sendEmail({
			subscriberId: this.data.id,
			email
		}).pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe({
			next: () => {
				this.snackBar.open('Registration email sent successfully', null, {
					panelClass: 'app-notification-success',
					duration: 3000
				});
			},
			error: (error) => {
				this.loading.set(false);
				const errorMessage = error?.error?.message || 'An error occurred while sending registration email.';
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
