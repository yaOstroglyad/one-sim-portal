import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { getRevertOrderFormConfig } from './revert-order.utils';
import { RevertOrderService } from './revert-order.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormConfig, FormGeneratorComponent } from '@shared';
import { Order } from '@shared/models/payment';

@Component({
    standalone: true,
    selector: 'app-revert-order',
    imports: [
        MatDialogModule,
        MatButtonModule,
        TranslateModule,
        FormGeneratorComponent
    ],
    templateUrl: './revert-order.component.html',
    styleUrls: ['./revert-order.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevertOrderComponent implements OnDestroy {
	public unsubscribe$: Subject<void> = new Subject<void>();
	revertOrderFormConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: Order,
		public dialogRef: MatDialogRef<RevertOrderComponent>,
		private revertOrderService: RevertOrderService
	) {
		this.revertOrderFormConfig = getRevertOrderFormConfig(this.data);
	}

	handleFormChanges(form: FormGroup): void {
		this.form = form;
		this.isFormValid = form.valid;
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.revertOrderService.revertOrder(this.form.value)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(result => {
				this.dialogRef.close(result);
			});
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}