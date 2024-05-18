import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';
import { ProvidersDataService } from '../../../shared/services/providers-data.service';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

export function getMoveResourceFormConfig(dataService: ProvidersDataService): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'customerId',
				label: 'Customer',
				validators: [Validators.required],
				options: of([
					{ value: '02599516-3f9f-45cd-9cae-137a5487294e', displayValue: 'Anex' }
				])
			},
			{
				type: FieldType.select,
				name: 'serviceProviderId',
				label: 'Service Provider',
				validators: [Validators.required],
				options: dataService.list().pipe(
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
