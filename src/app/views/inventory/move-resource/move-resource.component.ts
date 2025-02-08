import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getMoveResourceFormConfig } from './move-resource.utils';
import { MoveResourceService } from './move-resource.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProvidersDataService, OrdersDataService, CompaniesDataService, FormConfig } from '../../../shared';

@Component({
	selector: 'app-move-resource',
	templateUrl: './move-resource.component.html',
	styleUrls: ['./move-resource.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveResourceComponent implements OnDestroy {
	public unsubscribe$: Subject<void> = new Subject<void>();
	moveResourceFormConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<MoveResourceComponent>,
		private providersDataService: ProvidersDataService,
		private companiesDataService: CompaniesDataService,
		private moveResourceService: MoveResourceService,
		private ordersDataService: OrdersDataService
	) {
		this.moveResourceFormConfig = getMoveResourceFormConfig(
			this.providersDataService,
			this.companiesDataService,
			this.ordersDataService
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
		this.moveResourceService.moveResource(this.form.value)
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
