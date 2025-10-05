import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit, Optional, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PaymentGatewayService } from '../payment-gateway.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentStrategy, PgComponentConfig } from 'src/app/shared/model/payment-strategies';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { FormCheckComponent } from '@coreui/angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentGatewayUtilsService } from '../payment-gateway.utils.service';
import { FormConfig } from 'src/app/shared';

@Component({
    selector: 'app-edit-payment-gateway',
    templateUrl: './edit-payment-gateway.component.html',
    styleUrls: ['./edit-payment-gateway.component.scss'],
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
        FormCheckComponent,
        MatTooltipModule
    ]
})
export class EditPaymentGatewayComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() paymentStrategy: PaymentStrategy | null = null;
  @Input() accountId: string | null = null;
  
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  formConfig: FormConfig;
  gatewayForm: FormGroup; // Public for parent access like region-form
  loading = false;
  isFormValid: boolean = false;
  private initialFormValues: any = null;

  constructor(
    @Optional() public dialogRef: MatDialogRef<EditPaymentGatewayComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: PaymentStrategy & { accountId?: string },
    private paymentGatewayService: PaymentGatewayService,
    private paymentGatewayUtilsService: PaymentGatewayUtilsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    // Support dialog mode
    if (this.dialogData) {
      this.paymentStrategy = this.dialogData;
      this.accountId = this.dialogData.accountId || null;
    }
  }

  ngOnInit(): void {
    if (this.paymentStrategy) {
      this.initializeForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paymentStrategy'] && !changes['paymentStrategy'].firstChange) {
      // Reinitialize form when payment strategy changes
      if (this.paymentStrategy) {
        this.initializeForm();
      }
    }
  }

  private initializeForm(): void {
    console.log('Initializing form for strategy:', this.paymentStrategy?.name);
    this.loading = true;
    
    this.paymentGatewayService.getFieldsByStrategyType(this.paymentStrategy.name).subscribe({
      next: (fields) => {
        console.log('Received fields from API:', fields);
        const paymentMethodParameters = this.paymentStrategy?.paymentMethodParameters || {};
        this.formConfig = this.paymentGatewayUtilsService.generateForm(fields, paymentMethodParameters, this.paymentStrategy);
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
    return !!this.paymentStrategy?.id;
  }

  onFormChanges(form: FormGroup): void {
    this.gatewayForm = form; // For parent access like region-form
    
    // Apply initial values if they were stored before form was ready
    if (this.initialFormValues && form) {
      form.patchValue(this.initialFormValues, { emitEvent: false });
      this.initialFormValues = null; // Clear after applying
    }
    
    this.isFormValid = form.valid;
  }

  submit(): void {
    if (!this.gatewayForm?.valid) return;

    this.loading = true;
    const formValue = this.gatewayForm.value;
    
    const gatewayData: PaymentStrategy = {
      id: this.paymentStrategy?.id,
      name: this.paymentStrategy.name,
      paymentStrategy: this.paymentStrategy?.paymentStrategy ?? this.paymentStrategy.name,
      primary: formValue.primary || false,
      paymentMethodParameters: formValue
    };

    const operation$ = this.isEditing
      ? this.paymentGatewayService.update(gatewayData)
      : this.paymentGatewayService.create(gatewayData, this.accountId);

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving payment gateway:', error);
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
