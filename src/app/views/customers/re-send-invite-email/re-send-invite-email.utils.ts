import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';

export function getResendInviteEmailFormConfig(): FormConfig {
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
