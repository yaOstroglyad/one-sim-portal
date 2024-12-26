import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentStrategy, PgComponentConfig } from '../../../../shared/model/payment-strategies';
import { PaymentGatewayService } from '../payment-gateway.service';
import { map } from 'rxjs/operators';
import { PaymentGatewayUtilsService } from '../payment-gateway.utils.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-payment-gateway',
  templateUrl: './edit-payment-gateway.component.html',
  styleUrls: ['./edit-payment-gateway.component.scss']
})
export class EditPaymentGatewayComponent implements OnInit {
  public componentConfig$: Observable<PgComponentConfig>;
  public form: FormGroup;
  public isActive: boolean = false;
  public isPrimary: boolean = false;
  public strategyId: Partial<PaymentStrategy['id']> = null;
  public isFormValid: boolean = false;
  private initialValues: any;

  constructor(
    public dialogRef: MatDialogRef<EditPaymentGatewayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentStrategy,
    private paymentGatewayService: PaymentGatewayService,
    private paymentGatewayUtilsService: PaymentGatewayUtilsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
  }

  public ngOnInit(): void {
    this.componentConfig$ = this.paymentGatewayService.getFieldsByStrategyType(this.data.name).pipe(
      map(fields => {
        const paymentMethodParameters = this.data?.paymentMethodParameters || {};
        this.isActive = this.data?.isActive;
        this.isPrimary = this.data?.primary;
        this.strategyId = this.data?.id || null;
        return {
          id: this.data?.id,
          isActive: this.data?.isActive,
          type: this.data.name,
          config: this.paymentGatewayUtilsService.generateForm(fields, paymentMethodParameters, this.data)
        };
      })
    );
  }

  public handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isPrimary = this.form.get('primary').value;
    this.initialValues = !this.initialValues ? this.form.getRawValue() : null;
    this.isFormValid = form.valid;
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
    if (this.isFormValid && !this.isFormUnchanged()) {

      const customerData = {
        id: this.data.id,
        name: this.data.name,
        paymentStrategy: this.data?.paymentStrategy ?? this.data.name,
        primary: this.form.get('primary').value,
        paymentMethodParameters: this.form.value
      };

      if (!this.data.id) {
        this.paymentGatewayService.create(customerData).subscribe(() => this.notify(this.translate.instant('editPaymentGateway.configurationCreated')));
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
