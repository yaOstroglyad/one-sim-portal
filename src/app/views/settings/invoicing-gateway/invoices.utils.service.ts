import { Injectable } from '@angular/core';
import { FormConfig, BackendFieldConfig, FieldType } from '../../../shared';
import { InvoicingMethod, InvoicingParameters } from '../../../shared/model/invoicing-method';

@Injectable({
	providedIn: 'root'
})
export class InvoicesUtilsService {

	generateForm(fields: any[],
               invoicingParameters: InvoicingParameters,
               strategyMetadata?: InvoicingMethod): FormConfig {

		console.log('Generating form with fields:', fields);

		return {
			fields: fields.map(field => {
				const fieldType = this.mapFieldType(field.type);
				console.log(`Mapping field ${field.name}: ${field.type} -> ${fieldType}`);
				
				return {
					type: fieldType,
					name: field.name,
					label: field.displayName || field.name,
					value: this.getValue(field, invoicingParameters, strategyMetadata),
					placeholder: field.sensitive ? '••••••••' : `Enter ${field.displayName || field.name}`
				};
			})
		};
	}

	private mapFieldType(apiType: string): FieldType {
		// Map API field types to internal FieldType enum
		switch (apiType?.toLowerCase()) {
			case 'text':
			case 'string':
				return FieldType.text;
			case 'number':
			case 'integer':
				return FieldType.number;
			case 'email':
				return FieldType.email;
			case 'password':
				return FieldType.password;
			case 'boolean':
			case 'checkbox':
				return FieldType.checkbox;
			case 'textarea':
				return FieldType.textarea;
			case 'select':
				return FieldType.select;
			default:
				console.warn('Unknown field type:', apiType, 'defaulting to text');
				return FieldType.text;
		}
	}

	getValue(field: any,
           invoicingParameters: InvoicingParameters,
           strategyMetadata: InvoicingMethod): boolean | string | number {
		return invoicingParameters[field.name] || '';
	}
}