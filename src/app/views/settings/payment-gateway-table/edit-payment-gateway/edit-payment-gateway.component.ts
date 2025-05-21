import { Component, Inject, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { FormGeneratorModule } from 'src/app/shared/components/form-generator/form-generator.module';
import { FormCheckComponent } from '@coreui/angular';
import { FormCheckInputDirective } from '@coreui/angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentGatewayUtilsService } from '../payment-gateway.utils.service';

@Component({
  selector: 'app-edit-payment-gateway',
  templateUrl: './edit-payment-gateway.component.html',
  styleUrls: ['./edit-payment-gateway.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
    FormGeneratorModule,
    FormCheckComponent,
    FormCheckInputDirective,
    MatTooltipModule
  ]
})
export class EditPaymentGatewayComponent implements OnInit, AfterViewInit {
  public componentConfig$: Observable<PgComponentConfig>;
  public form: FormGroup;
  public isActive: boolean = false;
  public isPrimary: boolean = false;
  public strategyId: Partial<PaymentStrategy['id']> = null;
  public isFormValid: boolean = false;
  private initialValues: any;
  private accountId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditPaymentGatewayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentStrategy & { accountId?: string },
    private paymentGatewayService: PaymentGatewayService,
    private paymentGatewayUtilsService: PaymentGatewayUtilsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.isActive = this.data?.isActive ?? false;
    this.isPrimary = this.data?.primary ?? false;
    this.strategyId = this.data?.id || null;
    this.accountId = this.data?.accountId || null;
  }

  public ngOnInit(): void {
    this.componentConfig$ = this.paymentGatewayService.getFieldsByStrategyType(this.data.name).pipe(
      map(fields => {
        const paymentMethodParameters = this.data?.paymentMethodParameters || {};
        return {
          id: this.data?.id,
          isActive: this.isActive,
          type: this.data.name,
          config: this.paymentGatewayUtilsService.generateForm(fields, paymentMethodParameters, this.data)
        };
      })
    );
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  public handleFormChanges(form: FormGroup): void {
    if (!form) return;

    this.form = form;
    const primaryControl = this.form.get('primary');
    if (primaryControl) {
      this.isPrimary = primaryControl.value;
    }

    if (!this.initialValues) {
      this.initialValues = this.form.getRawValue();
    }

    this.isFormValid = form.valid;
    this.cdr.detectChanges();
  }

  public updateStatus(): void {
    this.isActive = !this.isActive;
    const status = {
      id: this.strategyId,
      active: this.isActive
    };
    this.paymentGatewayService.updateStatus(status).subscribe(() => this.notify(this.translate.instant('editPaymentGateway.statusUpdated')));
  }

  public submit(): void {
    if (this.isFormValid && !this.isFormUnchanged() && this.form) {
      const customerData: PaymentStrategy = {
        id: this.data.id,
        name: this.data.name,
        paymentStrategy: this.data?.paymentStrategy ?? this.data.name,
        primary: this.isPrimary,
        paymentMethodParameters: this.form.value
      };

      if (!this.data.id) {
        this.paymentGatewayService.create(customerData, this.accountId).subscribe(() => this.notify(this.translate.instant('editPaymentGateway.configurationCreated')));
      } else {
        this.paymentGatewayService.update(customerData).subscribe(() => this.notify(this.translate.instant('editPaymentGateway.configurationUpdated')));
      }
      this.close();
    } else {
      this.isFormValid && console.warn(this.translate.instant('editPaymentGateway.formInvalid'));
      this.close();
    }
  }

  public close(): void {
    this.dialogRef.close()
  }

  private notify(message: string, panelClass = 'app-notification-success'): void {
    this.snackBar.open(
      message,
      null,
      {
        panelClass,
        duration: 2000
      }
    )
  }

  private isFormUnchanged(): boolean {
    return JSON.stringify(this.form.getRawValue()) === JSON.stringify(this.initialValues);
  }
}
