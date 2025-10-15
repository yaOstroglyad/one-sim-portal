import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnChanges,
	SimpleChanges,
	ChangeDetectorRef,
	AfterViewInit,
	Optional,
	Inject
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InvoicesService } from '../invoices.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { InvoicingMethod } from 'src/app/shared/model/invoicing-method';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { FormConfig } from 'src/app/shared';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoicesUtilsService } from '../invoices.utils.service';

@Component({
	standalone: true,
	selector: 'app-edit-invoices',
	templateUrl: './edit-invoices.component.html',
	styleUrls: ['./edit-invoices.component.scss'],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MatDialogModule,
		MatSnackBarModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		TranslateModule,
		FormGeneratorComponent,
		MatTooltipModule
	]
})
export class EditInvoicesComponent implements OnInit, OnChanges, AfterViewInit {
	@Input() invoicingMethod: InvoicingMethod | null = null;
	@Input() accountId: string | null = null;

	@Output() save = new EventEmitter<void>();
	@Output() cancel = new EventEmitter<void>();

	formConfig: FormConfig;
	invoiceForm: FormGroup; // Public for parent access like region-form
	loading = false;
	private initialFormValues: any = null;

	constructor(
		@Optional() public dialogRef: MatDialogRef<EditInvoicesComponent>,
		@Optional() @Inject(MAT_DIALOG_DATA) private dialogData: InvoicingMethod & { accountId?: string },
		private invoicesService: InvoicesService,
		private invoicesUtilsService: InvoicesUtilsService,
		private cdr: ChangeDetectorRef
	) {
		// Support dialog mode
		if (this.dialogData) {
			this.invoicingMethod = this.dialogData;
			this.accountId = this.dialogData.accountId || null;
		}
	}

	ngOnInit(): void {
		if (this.invoicingMethod) {
			this.initializeForm();
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['invoicingMethod'] && !changes['invoicingMethod'].firstChange) {
			// Reinitialize form when invoicing method changes
			if (this.invoicingMethod) {
				this.initializeForm();
			}
		}
	}

	private initializeForm(): void {
		console.log('Initializing form for strategy:', this.invoicingMethod?.name);
		this.loading = true;

		this.invoicesService.getFieldsByStrategyType(this.invoicingMethod.name).subscribe({
			next: (fields) => {
				console.log('Received fields from API:', fields);
				const invoicingParameters = this.invoicingMethod?.invoicingParameters || {};
				this.formConfig = this.invoicesUtilsService.generateForm(fields, invoicingParameters, this.invoicingMethod);
				console.log('Generated form config:', this.formConfig);
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading fields:', error);
				this.loading = false;
				this.cdr.markForCheck();
			}
		});
	}

	ngAfterViewInit() {
		this.cdr.detectChanges();
	}

	get isEditing(): boolean {
		return !!this.invoicingMethod?.id;
	}

	onFormChanges(form: FormGroup): void {
		this.invoiceForm = form; // For parent access like region-form

		// Apply initial values if they were stored before form was ready
		if (this.initialFormValues && form) {
			form.patchValue(this.initialFormValues, {emitEvent: false});
			this.initialFormValues = null; // Clear after applying
		}
	}

	onSubmit(): void {
		if (!this.invoiceForm?.valid) return;

		this.loading = true;
		const formValue = this.invoiceForm.value;

		const invoiceData: InvoicingMethod = {
			id: this.invoicingMethod?.id,
			name: this.invoicingMethod.name,
			invoicingStrategy: this.invoicingMethod?.invoicingStrategy ?? this.invoicingMethod.name,
			invoicingParameters: formValue
		};

		const operation$ = this.isEditing
			? this.invoicesService.update(invoiceData)
			: this.invoicesService.create(invoiceData, this.accountId);

		operation$.subscribe({
			next: () => {
				this.loading = false;
				this.save.emit();
			},
			error: (error) => {
				this.loading = false;
				console.error('Error saving invoice:', error);
			}
		});
	}

	// Legacy support for dialog mode
	public close(): void {
		if (this.dialogRef) {
			this.dialogRef.close();
		} else {
			this.cancel.emit();
		}
	}
}
