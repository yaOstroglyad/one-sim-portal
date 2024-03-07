// field-config.model.ts
import { ValidatorFn } from '@angular/forms';

export enum FieldType {
	text = 'text',
	email = 'email',
	password = 'password',
}

export interface FieldConfig {
	type: FieldType;
	name: string;
	label: string;
	value?: any;
	validators?: ValidatorFn | ValidatorFn[];
	disabled?: boolean;
	displayOptions?: {
		newLine?: boolean;
	}
}

export interface FormConfig {
	fields: FieldConfig[];
	formValidators?: ValidatorFn[]
}
