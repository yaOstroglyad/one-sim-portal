import { Injectable } from '@angular/core';
import { FormConfig, BackendFieldConfig, FieldType, PaymentMethodParameters, PaymentStrategy } from '../../../shared';

@Injectable({
	providedIn: 'root'
})
export class PaymentGatewayUtilsService {

	generateForm(fields: BackendFieldConfig[],
               paymentMethodParameters: PaymentMethodParameters,
               strategyMetadata?: PaymentStrategy): FormConfig {

		//workaround for primary
		fields.push({
			displayName: "Is Primary",
			name: "primary",
			sensitive: false,
			type: FieldType.slide
		});

		return {
			fields: fields.map(field => {
				return {
					type: field.type,
					name: field.name,
					label: field.displayName,
					value: this.getValue(field, paymentMethodParameters, strategyMetadata)
				};
			})
		};
	}

	getValue(field: BackendFieldConfig,
           paymentMethodParameters: PaymentMethodParameters,
           strategyMetadata: PaymentStrategy): boolean | string | number {
		if (field.name === 'primary') {
			return strategyMetadata.primary;
		} else {
			return paymentMethodParameters[field.name] || '';
		}
	}
}
