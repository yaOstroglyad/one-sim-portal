import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';

export const SetupResourceFormConfig: FormConfig = {
	fields: [
		{
			type: FieldType.text,
			name: 'name',
			label: 'Resource name',
			value: '',
			validators: [
				Validators.required
			],
			disabled: false,
			displayOptions: {
				newLine: true
			}
		},
		{
			type: FieldType.text,
			name: 'resourceType',
			label: 'Resource type',
			value: '',
			validators: [
				Validators.required
			],
			disabled: false,
			displayOptions: {
				newLine: true
			}
		}
	]
};
