import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import {
	FormGeneratorComponent,
	ProvidersDataService,
	OrdersDataService,
	CompaniesDataService,
	FormConfig,
	FieldType,
	FieldConfig
} from '../../../shared';

export function getMoveResourceFormConfig(
	serviceProviderDataService: ProvidersDataService,
	companiesDataService: CompaniesDataService,
	ordersDataService: OrdersDataService
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'companyId',
				label: 'To Company',
				validators: [Validators.required],
				options: companiesDataService.list().pipe(
					map(companies => companies.map(
						company => ({
							value: company.id,
							displayValue: company.name
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
				inputEvent: (event: any, formGenerator: FormGeneratorComponent, field: FieldConfig) => {
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
