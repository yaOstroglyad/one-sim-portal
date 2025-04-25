// field-config.model.ts
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormGeneratorComponent } from '../components/form-generator/form-generator.component';

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
	color = 'color',
	uuid = 'uuid',
	richText = 'richText'
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
	invisible?: boolean;
	inputEvent?: (event: any, formGenerator: FormGeneratorComponent, field: FieldConfig) => any

	//select
	options?: Observable<SelectOption[]> | ((values: Record<string, any>) => Observable<SelectOption[]>);

	validators?: ValidatorFn | ValidatorFn[];
	asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
	multiple?: boolean;

	//chips
	addOnBlur?: boolean;
	selectable?: boolean;
	removable?: boolean;
	separatorKeysCodes?: Array<any>;

	//richText
	maxLength?: number;

	dependsOn?: string[];
	dependsOnValue?: string[];
}

export interface FormConfig {
	fields: FieldConfig[];
	formValidators?: ValidatorFn[];
}
