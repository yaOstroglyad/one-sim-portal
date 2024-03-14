// field-config.model.ts
import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

export enum FieldType {
	text = 'text',
	email = 'email',
	password = 'password',
	datepicker = 'datepicker',
	textarea = 'textarea',
	select = 'select',
	checkbox = 'checkbox',
}

export interface FieldConfig {
	type: FieldType;
	name: string;
	label: string;
	value?: any;
	options?: Observable<Array<{value: any; displayValue: string}>>;
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
