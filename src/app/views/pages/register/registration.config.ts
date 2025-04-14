import { FieldType, FormConfig } from '../../../shared';
import { FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
	const password = formGroup.get('password')?.value;
	const confirmPassword = formGroup.get('confirmPassword')?.value;
	return password && confirmPassword && password === confirmPassword ? null : { 'passwordMismatch': true };
};

export const RegistrationConfig: FormConfig = {
	fields: [
		{
			type: FieldType.email,
			name: 'email',
			label: 'register.emailLabel',
			value: '',
			validators: [
				Validators.required,
				Validators.email
			],
			disabled: false
		},
		{
			type: FieldType.password,
			name: 'password',
			label: 'register.passwordLabel',
			value: '',
			validators: [Validators.required, Validators.minLength(8)],
			disabled: false
		},
		{
			type: FieldType.password,
			name: 'confirmPassword',
			label: 'register.confirmPasswordLabel',
			value: '',
			validators: [Validators.required],
			disabled: false
		}
	],
	formValidators: [passwordMatchValidator]
};
