import { FieldType, ProvidersDataService, FormConfig, Customer, CustomerType, ProductsDataService } from '../../../shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';

const typeHintMessage = 'The SIM card is automatically attached to the subscriber, ' +
	'who is created automatically at the moment of private customer creation.'

const emailHintMessage = 'Email will be sent to register the user, hence this field is mandatory.'

export function getCustomerCreateRequest(form: any) {
	return {
		customerCommand: {
			id: form?.id || null,
			accountId: form?.accountId || null,
			companyId: form?.companyId || null,
			name: form.name,
			description: form.description,
			externalId: form.externalId || null,
			tags: form?.tags || [],
			type: form?.type || ''
		},
		userCommand: form?.type === CustomerType.Private ? {
			id: form?.userId || null,
			loginName: form.loginName || '',
			password: form.password || '',
			email: form.email || null,
			phone: form.phone || null,
			firstName: form.firstName || '',
			lastName: form.lastName || ''
		} : null,
		subscriberCommand: form?.type === CustomerType.Private ? {
			serviceProviderId: form.serviceProviderId || '',
			simId: form.simId || null,
			externalId: form.subscriberExternalId || null
		} : null,
		productId: form.productId || null,
		userProfileEmail: form.email || ''
	};
}

export function getEditCustomerFormConfig(
	serviceProviderDataService: ProvidersDataService,
	productsDataService: ProductsDataService,
	data: Customer
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.uuid,
				name: 'id',
				label: 'ID',
				value: data.id,
				invisible: true
			},
			{
				type: FieldType.select,
				name: 'type',
				label: 'Type',
				value: CustomerType.Private,
				validators: [Validators.required],
				options: of([
					{ value: CustomerType.Private, displayValue: CustomerType.Private }
				]),
				invisible: true
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
			},
			{
				type: FieldType.text,
				name: 'loginName',
				label: 'Login Name',
				validators: [Validators.required]
			},
			{
				type: FieldType.password,
				name: 'password',
				label: 'Password',
				validators: [Validators.required]
			},
			{
				type: FieldType.email,
				name: 'email',
				label: 'Email',
				validators: [Validators.required, Validators.email],
				hintMessage: emailHintMessage,
				className: 'height-100px'
			},
			{
				type: FieldType.text,
				name: 'phone',
				label: 'Phone'
			},
			{
				type: FieldType.text,
				name: 'firstName',
				label: 'First Name'
			},
			{
				type: FieldType.text,
				name: 'lastName',
				label: 'Last Name'
			},
			{
				type: FieldType.select,
				name: 'productId',
				label: 'Product',
				validators: [],
				options: productsDataService.list().pipe(
					map(products => products.map(product => ({
						value: product.id,
						displayValue: `${product.name}`
					})))
				)
			}
		]
	};
}
