import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getRevertOrderFormConfig } from './revert-order.utils';
import { RevertOrderService } from './revert-order.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormConfig } from '../../../shared';
import { Order } from '../../../shared/model/order';

@Component({
    selector: 'app-revert-order',
    templateUrl: './revert-order.component.html',
    styleUrls: ['./revert-order.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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