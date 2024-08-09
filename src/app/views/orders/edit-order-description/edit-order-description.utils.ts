import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';

export function getEditOrderFormConfig(data: any): FormConfig {
	return {
		fields: [
			{
				type: FieldType.textarea,
				value: data.description,
				name: 'orderDescription',
				label: 'Order Description',
				validators: [Validators.required]
			}
		]
	};
}
