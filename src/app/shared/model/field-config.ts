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
	richText = 'richText',
	multiselectGrid = 'multiselectGrid',
	formArray = 'formArray',
	fileUpload = 'fileUpload'
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

export interface GridSelectOption {
	value: any;
	displayValue: string;
	secondary?: string;
	tertiary?: string;
	badge?: string;
	disabled?: boolean;
}

export interface GridConfig {
	searchable?: boolean;
	searchFields?: string[];
	showBulkActions?: boolean;
	displayFields?: {
		primary: string;
		secondary?: string;
		tertiary?: string;
		badge?: string;
	};
	layout?: 'grid' | 'list';
	columns?: number | 'auto';
	searchPlaceholder?: string;
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
	hideRequiredMarker?: boolean;
	marginBottom?: number | string; // Spacing in rem (e.g., 1, 1.5, 'sm', 'md', 'lg', 'xl')
	inputEvent?: (event: any, formGenerator: FormGeneratorComponent, field: FieldConfig) => any

	//select
	options?: Observable<SelectOption[]> | ((values: Record<string, any>) => Observable<SelectOption[]>);
	
	//multiselectGrid
	gridOptions?: Observable<GridSelectOption[]> | GridSelectOption[] | ((values: Record<string, any>) => Observable<GridSelectOption[]>);
	gridConfig?: GridConfig;

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

	//formArray
	arrayConfig?: {
		itemConfig: FormConfig;
		minItems?: number;
		maxItems?: number;
		defaultItem?: any;
		addButtonText?: string;
		removeButtonText?: string;
		emptyMessage?: string;
		itemLabel?: (index: number) => string;
	};

	//fileUpload
	fileUploadConfig?: {
		acceptedFormats: string[];
		maxFileSize?: number;
		dropZoneText?: string;
		supportedFormatsText?: string;
		chooseFileButtonText?: string;
		uploadButtonText?: string;
		showUploadButton?: boolean;
		autoUpload?: boolean;
	};

	dependsOn?: string[];
	dependsOnValue?: string[];
}

export interface FormConfig {
	fields: FieldConfig[];
	formValidators?: ValidatorFn[];
}
