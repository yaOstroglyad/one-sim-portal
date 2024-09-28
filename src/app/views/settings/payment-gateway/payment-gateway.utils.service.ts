import { Injectable } from '@angular/core';
import { FormConfig, BackendFieldConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayUtilsService {

  generateForm(fields: BackendFieldConfig[], paymentMethodParameters: any): FormConfig {
    return {
      fields: fields.map(field => {
        return {
          type: field.type,
          name: field.name,
          label: field.displayName,
          value: paymentMethodParameters[field.name] || '',
          validators: field.sensitive ? [] : [Validators.required]
        };
      })
    };
  }
}
