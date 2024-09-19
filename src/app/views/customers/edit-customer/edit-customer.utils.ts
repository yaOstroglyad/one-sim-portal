import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ProvidersDataService } from '../../../shared';
import { map } from 'rxjs/operators';

export function getEditCustomerFormConfig(
	serviceProviderDataService: ProvidersDataService,
	data: any
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'type',
				label: 'Type',
				validators: [Validators.required],
				options: of([
					{ value: 'Private', displayValue: 'Private' },
					{ value: 'Corporate', displayValue: 'Corporate' }
				]),
				inputEvent: (event, formGenerator, field) => {
					formGenerator.updateFieldValidators('registrationEmail', event === 'Private' ? [Validators.required, Validators.email] : [Validators.email]);
					formGenerator.updateFieldValidators('serviceProviderId', event === 'Private' ? [Validators.required] : []);
				}
			},
			{
				type: FieldType.text,
				name: 'name',
				label: 'Customer Name',
				validators: [Validators.required]
			},
			{
				type: FieldType.textarea,
				name: 'description',
				label: 'Description',
			},
			{
				type: FieldType.text,
				name: 'externalId',
				label: 'Customer External ID',
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
				validators: [Validators.required]
			},
			{
				type: FieldType.email,
				name: 'registrationEmail',
				label: 'Registration email',
				validators: [Validators.email]
			},
			{
				type: FieldType.select,
				name: 'serviceProviderId',
				label: 'Service Provider',
				validators: [Validators.required],
				options: serviceProviderDataService.list().pipe(
					map(providers => providers.map(
						provider => ({
							value: provider.id,
							displayValue: provider.name
						})
					))
				)
			},
			{
				type: FieldType.text,
				name: 'subscriberExternalId',
				label: 'Subscriber External ID'
			}
		]
	};
}
