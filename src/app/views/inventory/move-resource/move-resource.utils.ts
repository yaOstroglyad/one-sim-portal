import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { CustomersDataService, ProvidersDataService } from '../../../shared';

export function getMoveResourceFormConfig(serviceProviderDataService: ProvidersDataService,
																					customersDataService: CustomersDataService): FormConfig {
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
							value: customer.id, displayValue: customer.name
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
							value: provider.id, displayValue: provider.name
						})
					))
				)
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
