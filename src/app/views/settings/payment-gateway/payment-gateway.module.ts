import { NgModule } from '@angular/core';
import { PgFormComponent } from './pg-form/pg-form.component';
import { PaymentGatewayComponent } from './payment-gateway.component';
import { JsonPipe, NgComponentOutlet, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormGeneratorModule } from '../../../shared/components/form-generator/form-generator.module';
import { ButtonDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    PaymentGatewayComponent,
    PgFormComponent,
  ],
  exports: [
    PaymentGatewayComponent
  ],
  imports: [
    NgIf,
    FormGeneratorModule,
    NgForOf,
    NgComponentOutlet,
    JsonPipe,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    ButtonDirective,
    IconDirective,
    MatInputModule,
    MatIconModule,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective
  ]
})
export class PaymentGatewayModule { }
