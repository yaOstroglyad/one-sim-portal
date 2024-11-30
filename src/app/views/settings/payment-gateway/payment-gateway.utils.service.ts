import { Injectable } from '@angular/core';
import { FormConfig, BackendFieldConfig, FieldType } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayUtilsService {

  generateForm(fields: BackendFieldConfig[], paymentMethodParameters: any, strategyMetadata?: any): FormConfig {

    //workaround for primary
    console.log('fields', fields);
    console.log('paymentMethodParameters', paymentMethodParameters);
    console.log('strategyMetadata', strategyMetadata);
    fields.push({
      displayName: "Is Primary",
      name: "primary",
      sensitive: false,
      type: FieldType.slide
    })

    return {
      fields: fields.map(field => {
        return {
          type: field.type,
          name: field.name,
          label: field.displayName,
          value: this.getValue(field, paymentMethodParameters, strategyMetadata),
          validators: field.sensitive ? [] : [Validators.required]
        };
      })
    };
  }

  getValue(field: BackendFieldConfig ,paymentMethodParameters,  strategyMetadata) {
    if(field.name === 'primary') {
      return strategyMetadata.primary;
    } else {
      return paymentMethodParameters[field.name] || ''
    }
  }
}
