import { FieldType, FormConfig } from '../../../shared/model/field-config';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ProvidersDataService } from '../../../shared';
import { map } from 'rxjs/operators';
import { Customer, CustomerType } from '../../../shared/model/customer';

const typeHintMessage = 'The SIM card is automatically attached to the subscriber, ' +
	'who is created automatically at the moment of private customer creation.'

const emailHintMessage = 'Email will be sent to register the user, hence this field is mandatory.'

export function getCustomerCreateRequest(form: any) {
	return {
		customerCommand: {
			id: form?.id || null,
			name: form.name,
			description: form.description,
			externalId: form.externalId || '',
			tags: form?.tags || [],
			type: form?.type || ''
		},
		subscriberCommand: {
			serviceProviderId: form.serviceProviderId || '',
			externalId: form.externalId || ''
		},
		registrationEmail: form.registrationEmail
	}
}

export function getEditCustomerFormConfig(
	serviceProviderDataService: ProvidersDataService,
	data: Customer
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'type',
				label: 'Type',
				value: data.type,
				validators: [Validators.required],
				options: of([
					{ value: CustomerType.Private, displayValue: CustomerType.Private },
					{ value: CustomerType.Corporate, displayValue: CustomerType.Corporate }
				]),
				inputEvent: (event, formGeneratorComponent) => {
					const isPrivate = event.value === CustomerType.Private;

					// Update validators for fields

					formGeneratorComponent.updateFieldValidators('registrationEmail',
						isPrivate ? [Validators.required, Validators.email] : [Validators.email]);
					formGeneratorComponent.updateFieldValidators('serviceProviderId',
						isPrivate ? [Validators.required] : []);

					// Define hints and class names based on the customer type
					const typeHint = isPrivate ? typeHintMessage : null;
					const typeClassName = isPrivate ? 'height-100px' : null;
					const emailHint = isPrivate ? emailHintMessage : null;
					const emailClassName = isPrivate ? 'height-100px' : null;

					// Toggle field hints
					formGeneratorComponent.toggleFieldHint('type', typeHint, typeClassName);
					formGeneratorComponent.toggleFieldHint('registrationEmail', emailHint, emailClassName);
				}
			},
			{
				type: FieldType.text,
				name: 'name',
				label: 'Customer Name',
				value: data.name,
				validators: [Validators.required]
			},
			{
				type: FieldType.textarea,
				name: 'description',
				label: 'Description',
				value: data.description,
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
