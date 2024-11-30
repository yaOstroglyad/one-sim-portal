import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PgComponentConfig } from '../../../../shared/model/payment-strategies';
import { PaymentGatewayService } from '../../payment-gateway/payment-gateway.service';
import { map } from 'rxjs/operators';
import { PaymentGatewayUtilsService } from '../../payment-gateway/payment-gateway.utils.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-payment-gateway',
  templateUrl: './edit-payment-gateway.component.html',
  styleUrls: ['./edit-payment-gateway.component.scss']
})
export class EditPaymentGatewayComponent implements OnInit {
  public componentConfig$: Observable<PgComponentConfig>;
  public form: FormGroup;
  public isActive = false;
  public isPrimary = false;
  public strategyId = null;
  public isFormValid = false;
  private initialValues: any;

  constructor(
    public dialogRef: MatDialogRef<EditPaymentGatewayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentGatewayService: PaymentGatewayService,
    private paymentGatewayUtilsService: PaymentGatewayUtilsService,
    private snackBar: MatSnackBar
  ) {
  }

  public ngOnInit(): void {
    this.componentConfig$ = this.paymentGatewayService.getFieldsByStrategyType(this.data.name).pipe(
      map(fields => {
        const paymentMethodParameters = this.data.paymentMethodParameters || {};
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
    this.paymentGatewayService.updateStatus(status).subscribe(() => this.notify('Status updated successfully'));
  }

  public submit(): void {
    if (this.isFormValid && !this.isFormUnchanged()) {

      const customerData = {
        id: this.data.id,
        name: this.data.name,
        paymentStrategy: this.data.paymentStrategy,
        primary: this.form.get('primary').value,
        paymentMethodParameters: this.form.value
      };

      if (!this.data.id) {
        this.paymentGatewayService.create(customerData).subscribe(() => this.notify());
      } else {
        this.paymentGatewayService.update(customerData).subscribe(() => this.notify('Configuration updated successfully'));
      }
      this.close();
    } else {
      this.isFormValid && console.warn('Form is invalid');
      this.close();
    }
  }

  public close(): void {
    this.dialogRef.close()
  }

  private notify(message = 'Configuration successfully',
         panelClass = 'app-notification-success'): void {
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
