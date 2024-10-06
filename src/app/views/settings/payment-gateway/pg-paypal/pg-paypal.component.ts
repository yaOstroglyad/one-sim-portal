import { Component, Input } from '@angular/core';
import { PaymentGatewayService } from '../payment-gateway.service';
import { PgComponentConfig } from '../../../../shared/model/payment-strategies';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pg-paypal',
  templateUrl: './pg-paypal.component.html',
  styleUrls: ['./pg-paypal.component.scss']
})
export class PgPaypalComponent {
  @Input() componentConfig: PgComponentConfig;
  @Input() isActive!: boolean;
  form: FormGroup;
  isFormValid = false;

  constructor(private paymentGatewayService: PaymentGatewayService) {}

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }

  updateStatus() {
    this.isActive = !this.isActive;
    const status = {
      id: this.componentConfig.id,
      active: this.isActive
    }
    this.paymentGatewayService.updateStatus(status).subscribe()
  }

  submit(): void {
    if (this.isFormValid) {

      const customerData = {
        id: this.componentConfig.id,
        name: this.componentConfig.type,
        paymentStrategy: this.componentConfig.type,
        paymentMethodParameters: this.form.value
      };

      if (!this.componentConfig.id) {
        this.paymentGatewayService.create(customerData).subscribe()
      } else {
        this.paymentGatewayService.update(customerData).subscribe()
      }
    } else {
      console.log('Form is invalid');
    }
  }
}

