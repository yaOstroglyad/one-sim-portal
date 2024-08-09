import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { CustomersDataService, ProvidersDataService } from '../../../shared';
import { OrdersDataService } from '../../../shared/services/orders-data.service';

export function getMoveResourceFormConfig(
	serviceProviderDataService: ProvidersDataService,
	customersDataService: CustomersDataService,
	ordersDataService: OrdersDataService
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'customerId',
				label: 'Customer',
				validators: [Validators.required],
				options: customersDataService.list().pipe(
					map(customers => customers.map(
						customer => ({
							value: customer.id,
							displayValue: customer.name
						})
					))
				)
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
				type: FieldType.select,
				name: 'parentOrderId',
				label: 'Parent Order',
				validators: [Validators.required],
				options: ordersDataService.availableOrders().pipe(
					map(availableOrders => availableOrders.map(
						order => ({
							value: order.id,
							displayValue: order.description
						})
					))
				),
				inputEvent: (event, formGenerator, field) => {
					// add "setValue"
					// formGenerator.get('orderDescription').setValue()
					console.log('event', event);
					console.log('formGenerator', formGenerator);
					console.log('field', field);
				}
			},
			{
				type: FieldType.textarea,
				name: 'orderDescription',
				label: 'Order Description',
				validators: [Validators.required]
			},
			{
				type: FieldType.number,
				name: 'simCount',
				label: 'Amount of sims',
				validators: [Validators.required]
			}
		]
	};
}
