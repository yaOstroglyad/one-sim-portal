import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
	const password = formGroup.get('password')?.value;
	const confirmPassword = formGroup.get('confirmPassword')?.value;
	return password && confirmPassword && password === confirmPassword ? null : { 'passwordMismatch': true };
};

export const RegistrationConfig: FormConfig = {
	fields: [
		{
			type: FieldType.text,
			name: 'username',
			label: 'Username',
			value: '',
			validators: [Validators.required, Validators.minLength(4)], // Пример валидаторов
			disabled: false,
			displayOptions: {
				newLine: true
			}
		},
		{
			type: FieldType.password,
			name: 'password',
			label: 'Password',
			value: '',
			validators: [Validators.required, Validators.minLength(8)],
			disabled: false,
			displayOptions: {
				newLine: true
			}
		},
		{
			type: FieldType.password,
			name: 'confirmPassword',
			label: 'Confirm Password',
			value: '',
			validators: [Validators.required],
			disabled: false,
			displayOptions: {
				newLine: true
			}
		}
	],
	formValidators: [passwordMatchValidator]
};
