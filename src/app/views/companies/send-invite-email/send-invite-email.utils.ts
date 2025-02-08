import { Validators } from '@angular/forms';
import { FieldType, FormConfig } from '../../../shared';

export function getInviteEmailFormConfig(): FormConfig {
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
