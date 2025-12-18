import { FieldType, FormConfig } from '@shared/models/ui';
import { Validators } from '@angular/forms';

export function getRegistrationEmailFormConfig(subscriberId: string): FormConfig {
	return {
		fields: [
			{
				type: FieldType.uuid,
				name: 'subscriberId',
				label: 'ID',
				value: subscriberId,
				invisible: true
			},
			{
				type: FieldType.email,
				name: 'email',
				label: 'Email',
				validators: [Validators.required, Validators.email],
				placeholder: 'Enter email'
			}
		]
	};
}
