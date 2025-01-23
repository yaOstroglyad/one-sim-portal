import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FieldType, FormConfig, SelectOption } from '../../../../shared';

export function getSubscriberProductsFormConfig(products: Observable<SelectOption[]>): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'product',
				label: 'Product',
				placeholder: 'Select product',
				options: products,
				validators: [Validators.required]
			}
		]
	};
}
