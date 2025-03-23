import { Company, CustomerType, FieldType, FormConfig } from '../../../shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

//TODO add type
export function getCompanyCreateRequest(form: any) {
	return {
		id: form?.id || null,
		name: form.name,
		externalId: form.externalId,
		type: form?.type || '',
		description: form.description,
		retailerDomain: form.retailerDomain || '',
		tags: form?.tags || [],
	}
}

//TODO add validator for domain name
export function getEditCompanyFormConfig(
	data: Company
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'type',
				label: 'Type',
				value: CustomerType.Corporate,
				validators: [Validators.required],
				options: of([
					{ value: CustomerType.Corporate, displayValue: CustomerType.Corporate }
				]),
				inputEvent: (event, formGeneratorComponent) => {
					console.log('formGeneratorComponent.form.value', formGeneratorComponent.form.value)
				}
			},
			{
				type: FieldType.text,
				name: 'name',
				label: 'Company Name',
				value: data.name,
				validators: [Validators.required]
			},
			{
				type: FieldType.text,
				name: 'retailerDomain',
				label: 'Retailer website domain name',
				hintMessage: 'The products displayed on the website will be based on the domain name.',
				value: data.retailerDomain
			},
			{
				type: FieldType.text,
				name: 'externalId',
				label: 'External ID',
				value: data.name
			},
			{
				type: FieldType.textarea,
				name: 'description',
				label: 'Description',
				value: data.description,
			},
			{
				type: FieldType.chips,
				name: 'tags',
				label: 'Tags',
				placeholder: 'Enter tags...',
				addOnBlur: true,
				separatorKeysCodes: [ENTER, COMMA],
				selectable: true,
				removable: true,
			},
		]
	};
}
