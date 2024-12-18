import { Validators } from '@angular/forms';
import { FieldType, FormConfig } from 'src/app/shared/model/field-config';

export function getEditPaymentGatewayFormConfig(): FormConfig {
	return {
		fields: [
			{
				type: FieldType.email,
				name: 'email',
				label: 'Email',
				placeholder: 'Enter the recipient\'s email',
				validators: [Validators.required]
			}
		]
	};
}
