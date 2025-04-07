// field-config.model.ts
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

export enum FieldType {
	text = 'text',
	number = 'number',
	email = 'email',
	password = 'password',
	datepicker = 'datepicker',
	textarea = 'textarea',
	select = 'select',
	chips = 'chips',
	checkbox = 'checkbox',
	slide = 'slide',
	color = 'color'
}

export interface BackendFieldConfig {
	name: string,
	displayName: string,
	type: FieldType,
	sensitive: boolean
}

export interface SelectOption {
	value: any,
	displayValue: string;
}

export interface FieldConfig {
	type: FieldType;
	name: string;
	label: string;
	placeholder?: string;
	className?: string;
	hintClassName?: string;
	hintMessage?: string;
	value?: any;
	disabled?: boolean;
	inputEvent?: (event: any, formGenerator: any, field: FieldConfig) => any

	//select
	options?: Observable<Array<SelectOption>>;
	validators?: ValidatorFn | ValidatorFn[];
	asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
	displayOptions?: {
		newLine?: boolean;
	},
	multiple?: boolean;

	//chips
	addOnBlur?: boolean;
	selectable?: boolean;
	removable?: boolean;
	separatorKeysCodes?: Array<any>;
}

export interface FormConfig {
	fields: FieldConfig[];
	formValidators?: ValidatorFn[];
}
