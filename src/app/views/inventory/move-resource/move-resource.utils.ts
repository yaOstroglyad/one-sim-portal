import { FieldType, FormConfig } from '../../../shared/model/field-config';
import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { CustomersDataService, ProvidersDataService, OrdersDataService } from '../../../shared';

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
				label: 'To Customer',
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
				label: 'Select Service Provider',
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
				label: 'Select Parent Order',
				validators: [Validators.required],
				options: ordersDataService.availableOrders().pipe(
					map(availableOrders => availableOrders.map(
						order => ({
							value: order.id,
							displayValue: order.description
						})
					))
				),
				inputEvent: () => {
					// set description by default
					// add "setValue"
					// formGenerator.get('orderDescription').setValue()
				}
			},
			{
				type: FieldType.textarea,
				name: 'orderDescription',
				label: 'Set Order Description',
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
