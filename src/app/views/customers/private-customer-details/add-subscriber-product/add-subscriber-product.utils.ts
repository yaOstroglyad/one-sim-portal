import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { FieldType, FormConfig } from '@shared';
import { AddSubscriberProductService } from './add-subscriber-product.service';

export function getSubscriberProductsFormConfig(
	addSubscriberProductService: AddSubscriberProductService,
	subscriberId: string
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.searchableSelect,
				name: 'productId',
				label: 'add-subscriber-product.product',
				validators: [Validators.required],
				searchableSelectConfig: {
					entityKey: 'common.entities.product',
					clearable: false,
					options$: addSubscriberProductService.list(subscriberId).pipe(
						map(options => options.map(option => ({
							value: option.value?.id,
							label: option.displayValue
						})))
					)
				}
			}
		]
	};
}
