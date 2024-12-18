import { FieldType, FormConfig } from '../../../shared/model/field-config';
import { Validators } from '@angular/forms';
import { ProvidersDataService } from '../../../shared/services/providers-data.service';
import { map } from 'rxjs/operators';

export function getSetupResourceFormConfig(dataService: ProvidersDataService): FormConfig {
	return {
		fields: [
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
				type: FieldType.textarea,
				name: 'orderDescription',
				label: 'Order Description',
				validators: [Validators.required]
			}
		]
	};
}
